import { create } from "zustand";
import type {
  ArchiveQuery,
  ArchiveRecord,
  Asset,
  AssetType,
  Case,
  Consumable,
  ContrastAgent,
  DeviceType,
  Remark,
  Room,
  Stage,
  Surgeon,
  ValidationResult,
  Verification,
  VerifierRole,
} from "@/types";
import {
  clearStore,
  deleteItem,
  getByIndex,
  getDB,
  getItem,
  getAll,
  putAll,
  putItem,
} from "@/lib/db";
import { isSeeded, seedDatabase } from "@/lib/seed";
import { buildArchiveRecord, runValidation } from "@/lib/archive";
import { CURRENT_USER, DEPARTMENTS, STAGES } from "@/lib/constants";
import { uid } from "@/lib/format";
import { suggestStage } from "@/lib/stageSuggest";
import { clearThumbs, setThumb } from "@/lib/thumbnails";
import { loadAllBlobsThumbnails } from "@/lib/blobUtils";

interface StoreState {
  ready: boolean;
  rooms: Room[];
  surgeons: Surgeon[];
  cases: Case[];
  archiveRecords: ArchiveRecord[];

  selectedRoomId: string;
  selectedDevice: DeviceType;
  selectedCaseId: string | null;

  assets: Asset[];
  consumables: Consumable[];
  contrast: ContrastAgent | null;
  remarks: Remark[];
  verification: Verification | null;

  lastValidation: ValidationResult | null;
  lastArchiveResult: ArchiveRecord | null;
  loadingCase: boolean;

  init: () => Promise<void>;
  resetAll: () => Promise<void>;
  selectRoom: (roomId: string) => void;
  selectDevice: (device: DeviceType) => void;
  selectCase: (caseId: string | null) => Promise<void>;
  refreshWorkingData: () => Promise<void>;
  updateCaseField: (field: keyof Case, value: string) => Promise<void>;
  importAssets: (files: File[], type: AssetType | "auto") => Promise<void>;
  setAssetStage: (assetId: string, stage: Stage | null) => Promise<void>;
  deleteAsset: (assetId: string) => Promise<void>;
  addConsumable: () => Promise<void>;
  updateConsumable: (
    id: string,
    patch: Partial<Consumable>,
  ) => Promise<void>;
  removeConsumable: (id: string) => Promise<void>;
  updateContrast: (patch: Partial<ContrastAgent>) => Promise<void>;
  addRemark: (content: string) => Promise<void>;
  verify: (role: VerifierRole) => Promise<void>;
  computeValidation: () => ValidationResult;
  archive: () => Promise<boolean>;
  searchArchives: (query: ArchiveQuery) => ArchiveRecord[];
  getSurgeon: (id: string) => Surgeon | undefined;
  getCaseById: (id: string) => Promise<Case | undefined>;
  clearArchiveResult: () => void;
  fetchArchivedAssets: (caseId: string) => Promise<Asset[]>;
}

async function loadBlobsThumbnails(assets: Asset[]) {
  await loadAllBlobsThumbnails(assets);
}

export const useStore = create<StoreState>((set, get) => ({
  ready: false,
  rooms: [],
  surgeons: [],
  cases: [],
  archiveRecords: [],

  selectedRoomId: "",
  selectedDevice: "DSA",
  selectedCaseId: null,

  assets: [],
  consumables: [],
  contrast: null,
  remarks: [],
  verification: null,

  lastValidation: null,
  lastArchiveResult: null,
  loadingCase: false,

  init: async () => {
    const seeded = await isSeeded();
    if (!seeded) await seedDatabase();
    const [rooms, surgeons, cases, archiveRecords] = await Promise.all([
      getAll<Room>("rooms"),
      getAll<Surgeon>("surgeons"),
      getAll<Case>("cases"),
      getAll<ArchiveRecord>("archiveRecords"),
    ]);
    const active = cases.filter((c) => !c.archived);
    const firstRoom = rooms[0];
    set({
      ready: true,
      rooms,
      surgeons,
      cases: active,
      archiveRecords: archiveRecords.sort((a, b) =>
        b.archivedAt.localeCompare(a.archivedAt),
      ),
      selectedRoomId: firstRoom?.roomId ?? "",
      selectedDevice: firstRoom?.devices[0] ?? "DSA",
    });
  },

  resetAll: async () => {
    await Promise.all(
      [
        "rooms",
        "surgeons",
        "cases",
        "assets",
        "consumables",
        "contrast",
        "remarks",
        "verifications",
        "archiveRecords",
        "blobs",
      ].map((s) => clearStore(s)),
    );
    clearThumbs();
    await seedDatabase();
    await get().init();
    set({ selectedCaseId: null, assets: [], consumables: [], contrast: null, remarks: [], verification: null });
  },

  selectRoom: (roomId) => {
    const room = get().rooms.find((r) => r.roomId === roomId);
    set({
      selectedRoomId: roomId,
      selectedDevice: room?.devices[0] ?? "DSA",
    });
  },

  selectDevice: (device) => set({ selectedDevice: device }),

  selectCase: async (caseId) => {
    set({ selectedCaseId: caseId, loadingCase: true, lastArchiveResult: null });
    if (!caseId) {
      set({
        assets: [],
        consumables: [],
        contrast: null,
        remarks: [],
        verification: null,
        loadingCase: false,
      });
      return;
    }
    await get().refreshWorkingData();
    set({ loadingCase: false });
  },

  refreshWorkingData: async () => {
    const caseId = get().selectedCaseId;
    if (!caseId) return;
    const [assets, consumables, contrast, remarks, verification] =
      await Promise.all([
        getByIndex<Asset>("assets", "by-case", caseId),
        getByIndex<Consumable>("consumables", "by-case", caseId),
        getItem<ContrastAgent>("contrast", caseId),
        getByIndex<Remark>("remarks", "by-case", caseId),
        getItem<Verification>("verifications", caseId),
      ]);
    await loadBlobsThumbnails(assets);
    set({
      assets: assets.sort((a, b) => a.importedAt.localeCompare(b.importedAt)),
      consumables,
      contrast: contrast ?? null,
      remarks: remarks.sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
      verification: verification ?? null,
    });
  },

  updateCaseField: async (field, value) => {
    const caseId = get().selectedCaseId;
    if (!caseId) return;
    const cases = get().cases;
    const target = cases.find((c) => c.caseId === caseId);
    if (!target) return;
    const updated = { ...target, [field]: value };
    await putItem<Case>("cases", updated);
    set({
      cases: cases.map((c) => (c.caseId === caseId ? updated : c)),
    });
  },

  importAssets: async (files, type) => {
    const caseId = get().selectedCaseId;
    if (!caseId) return;
    const db = await getDB();
    const device = get().selectedDevice;
    const newAssets: Asset[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const assetId = uid("A");
      let resolvedType = type;
      let placeholder = true;
      let blobKey = "";
      let durationMs: number | undefined;
      if (!resolvedType || resolvedType === "auto") {
        if (file.type.startsWith("image/")) resolvedType = "image";
        else if (file.type.startsWith("video/")) resolvedType = "video";
        else resolvedType = "sequence";
      }
      await db.put("blobs", file, assetId);
      blobKey = assetId;
      placeholder = false;
      if (resolvedType === "image") {
        setThumb(assetId, URL.createObjectURL(file));
      } else if (resolvedType === "video") {
        durationMs = await new Promise<number>((resolve) => {
          const v = document.createElement("video");
          v.preload = "metadata";
          v.onloadedmetadata = () => resolve(v.duration ? v.duration * 1000 : 0);
          v.onerror = () => resolve(0);
          v.src = URL.createObjectURL(file);
        });
      }
      const suggestedStage = suggestStage(file.name, resolvedType, device, i, files.length);
      const asset: Asset = {
        assetId,
        caseId,
        type: resolvedType,
        stage: suggestedStage,
        stageSuggested: suggestedStage !== null,
        filename: file.name,
        sizeBytes: file.size,
        durationMs,
        importedAt: new Date().toISOString(),
        blobKey,
        placeholder,
      };
      newAssets.push(asset);
    }
    await putAll<Asset>("assets", newAssets);
    set({ assets: [...get().assets, ...newAssets] });
  },

  setAssetStage: async (assetId, stage) => {
    const assets = get().assets;
    const target = assets.find((a) => a.assetId === assetId);
    if (!target) return;
    const updated = { ...target, stage, stageSuggested: false };
    await putItem<Asset>("assets", updated);
    set({
      assets: assets.map((a) => (a.assetId === assetId ? updated : a)),
    });
  },

  deleteAsset: async (assetId) => {
    const target = get().assets.find((a) => a.assetId === assetId);
    if (target && !target.placeholder && target.blobKey) {
      await deleteItem("blobs", target.blobKey);
    }
    await deleteItem("assets", assetId);
    set({ assets: get().assets.filter((a) => a.assetId !== assetId) });
  },

  addConsumable: async () => {
    const caseId = get().selectedCaseId;
    if (!caseId) return;
    const item: Consumable = {
      consumableId: uid("CS"),
      caseId,
      name: "",
      batchNo: "",
      quantity: 1,
    };
    await putItem<Consumable>("consumables", item);
    set({ consumables: [...get().consumables, item] });
  },

  updateConsumable: async (id, patch) => {
    const consumables = get().consumables;
    const target = consumables.find((c) => c.consumableId === id);
    if (!target) return;
    const updated = { ...target, ...patch };
    await putItem<Consumable>("consumables", updated);
    set({
      consumables: consumables.map((c) => (c.consumableId === id ? updated : c)),
    });
  },

  removeConsumable: async (id) => {
    await deleteItem("consumables", id);
    set({ consumables: get().consumables.filter((c) => c.consumableId !== id) });
  },

  updateContrast: async (patch) => {
    const caseId = get().selectedCaseId;
    if (!caseId) return;
    const current = get().contrast;
    const updated: ContrastAgent = { caseId, name: "", dosageMl: 0, concentration: "", ...current, ...patch };
    await putItem<ContrastAgent>("contrast", updated);
    set({ contrast: updated });
  },

  addRemark: async (content) => {
    const caseId = get().selectedCaseId;
    if (!caseId || !content.trim()) return;
    const remark: Remark = {
      remarkId: uid("RM"),
      caseId,
      content: content.trim(),
      author: CURRENT_USER.technician.name,
      timestamp: new Date().toISOString(),
    };
    await putItem<Remark>("remarks", remark);
    set({ remarks: [...get().remarks, remark] });
  },

  verify: async (role) => {
    const caseId = get().selectedCaseId;
    if (!caseId) return;
    const existing =
      get().verification ??
      ({
        caseId,
        technicianId: "",
        technicianName: "",
        technicianAt: null,
        nurseId: "",
        nurseName: "",
        nurseAt: null,
        locked: false,
      } as Verification);
    const now = new Date().toISOString();
    let updated: Verification = { ...existing };
    if (role === "technician") {
      updated.technicianId = CURRENT_USER.technician.id;
      updated.technicianName = CURRENT_USER.technician.name;
      updated.technicianAt = now;
    } else {
      updated.nurseId = CURRENT_USER.nurse.id;
      updated.nurseName = CURRENT_USER.nurse.name;
      updated.nurseAt = now;
    }
    updated.locked = Boolean(updated.technicianAt && updated.nurseAt);
    await putItem<Verification>("verifications", updated);
    set({ verification: updated });
  },

  computeValidation: () => {
    const state = get();
    const caseData = state.cases.find((c) => c.caseId === state.selectedCaseId);
    const existingRecord = state.archiveRecords.find(
      (r) => r.caseId === state.selectedCaseId,
    );
    if (!caseData) {
      return {
        passed: false,
        issues: [],
        stageCoverage: "0/5",
        stagesCovered: [],
        blockCount: 1,
        warnCount: 0,
      };
    }
    return runValidation({
      caseData,
      assets: state.assets,
      verification: state.verification,
      activeCases: state.cases,
      existingRecord,
    });
  },

  archive: async () => {
    const state = get();
    const caseData = state.cases.find((c) => c.caseId === state.selectedCaseId);
    if (!caseData) return false;
    const result = state.computeValidation();
    set({ lastValidation: result });
    if (!result.passed) return false;
    const surgeon = state.getSurgeon(caseData.surgeonId);
    const record = buildArchiveRecord({
      caseData,
      assets: state.assets,
      consumables: state.consumables,
      contrast: state.contrast,
      remarks: state.remarks,
      verification: state.verification,
      surgeon,
      archivedBy: CURRENT_USER.technician.name,
    });
    await putItem<ArchiveRecord>("archiveRecords", record);
    const archivedCase = { ...caseData, archived: true };
    await putItem<Case>("cases", archivedCase);
    set({
      archiveRecords: [record, ...state.archiveRecords],
      cases: state.cases.map((c) =>
        c.caseId === caseData.caseId ? archivedCase : c,
      ),
      lastArchiveResult: record,
    });
    return true;
  },

  searchArchives: (query) => {
    const records = get().archiveRecords;
    return records.filter((r) => {
      if (query.dateFrom && r.archivedAt < query.dateFrom) return false;
      if (query.dateTo && r.archivedAt > query.dateTo + "T23:59:59") return false;
      if (query.department && r.department !== query.department) return false;
      if (query.surgeonId && r.surgeonId !== query.surgeonId) return false;
      if (query.keyword) {
        const kw = query.keyword.toLowerCase();
        const hay = `${r.patientName} ${r.hospitalizationNo} ${r.surgeryName} ${r.traceCode} ${r.surgeonName}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  },

  getSurgeon: (id) => get().surgeons.find((s) => s.surgeonId === id),

  getCaseById: async (id) => {
    const inMemory = get().cases.find((c) => c.caseId === id);
    if (inMemory) return inMemory;
    return await getItem<Case>("cases", id);
  },

  clearArchiveResult: () => {
    set({ lastArchiveResult: null });
    get().selectCase(null);
  },

  fetchArchivedAssets: async (caseId) => {
    const assets = await getByIndex<Asset>("assets", "by-case", caseId);
    await loadBlobsThumbnails(assets);
    return assets.sort((a, b) => a.importedAt.localeCompare(b.importedAt));
  },
}));

export { DEPARTMENTS, STAGES };
