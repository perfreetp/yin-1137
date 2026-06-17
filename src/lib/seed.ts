import type {
  ArchiveRecord,
  Asset,
  Case,
  Consumable,
  ContrastAgent,
  Remark,
  Room,
  Surgeon,
  Verification,
} from "@/types";
import { CURRENT_USER } from "@/lib/constants";
import { generateTraceCode } from "@/lib/archive";
import { uid } from "@/lib/format";

export const SEED_ROOMS: Room[] = [
  { roomId: "R1", name: "1号介入手术间", code: "OR-1", devices: ["DSA", "超声", "透视"] },
  { roomId: "R2", name: "2号复合手术间", code: "OR-2", devices: ["DSA", "内镜", "透视"] },
  { roomId: "R3", name: "3号介入手术间", code: "OR-3", devices: ["DSA", "超声"] },
];

export const SEED_SURGEONS: Surgeon[] = [
  { surgeonId: "SG01", name: "张明远", department: "心血管内科" },
  { surgeonId: "SG02", name: "李婉清", department: "神经内科" },
  { surgeonId: "SG03", name: "王建国", department: "血管外科" },
  { surgeonId: "SG04", name: "赵雪梅", department: "介入放射科" },
  { surgeonId: "SG05", name: "陈志强", department: "消化内科" },
];

function todayAt(h: number, m: number): string {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function daysAgo(days: number, h = 9, m = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export const SEED_CASES: Case[] = [
  {
    caseId: "C-2026061701",
    patientName: "张伟",
    hospitalizationNo: "2600418",
    surgeryName: "冠状动脉造影+支架植入术",
    surgeonId: "SG01",
    department: "心血管内科",
    roomId: "R1",
    deviceType: "DSA",
    startTime: todayAt(8, 30),
    archived: false,
  },
  {
    caseId: "C-2026061702",
    patientName: "王芳",
    hospitalizationNo: "2600432",
    surgeryName: "下肢动脉造影术",
    surgeonId: "SG03",
    department: "血管外科",
    roomId: "R1",
    deviceType: "透视",
    startTime: todayAt(9, 45),
    archived: false,
  },
  {
    caseId: "C-2026061703",
    patientName: "李强",
    hospitalizationNo: "",
    surgeryName: "脑动脉瘤栓塞术",
    surgeonId: "SG02",
    department: "神经内科",
    roomId: "R2",
    deviceType: "DSA",
    startTime: todayAt(10, 15),
    archived: false,
  },
  {
    caseId: "C-2026061704",
    patientName: "刘洋",
    hospitalizationNo: "2600477",
    surgeryName: "消化道出血内镜止血术",
    surgeonId: "SG05",
    department: "消化内科",
    roomId: "R2",
    deviceType: "内镜",
    startTime: todayAt(11, 0),
    archived: false,
  },
  {
    caseId: "C-2026061705",
    patientName: "孙丽",
    hospitalizationNo: "2600432",
    surgeryName: "颈动脉支架植入术",
    surgeonId: "SG03",
    department: "血管外科",
    roomId: "R3",
    deviceType: "DSA",
    startTime: todayAt(13, 20),
    archived: false,
  },
  {
    caseId: "C-2026061706",
    patientName: "周磊",
    hospitalizationNo: "2600491",
    surgeryName: "",
    surgeonId: "SG04",
    department: "介入放射科",
    roomId: "R3",
    deviceType: "超声",
    startTime: todayAt(14, 5),
    archived: false,
  },
];

export const SEED_VERIFICATIONS: Verification[] = [
  {
    caseId: "C-2026061701",
    technicianId: CURRENT_USER.technician.id,
    technicianName: CURRENT_USER.technician.name,
    technicianAt: todayAt(8, 32),
    nurseId: "",
    nurseName: "",
    nurseAt: null,
    locked: false,
  },
  {
    caseId: "C-2026061702",
    technicianId: CURRENT_USER.technician.id,
    technicianName: CURRENT_USER.technician.name,
    technicianAt: todayAt(9, 47),
    nurseId: CURRENT_USER.nurse.id,
    nurseName: CURRENT_USER.nurse.name,
    nurseAt: todayAt(9, 50),
    locked: true,
  },
  {
    caseId: "C-2026061703",
    technicianId: "",
    technicianName: "",
    technicianAt: null,
    nurseId: "",
    nurseName: "",
    nurseAt: null,
    locked: false,
  },
  {
    caseId: "C-2026061704",
    technicianId: CURRENT_USER.technician.id,
    technicianName: CURRENT_USER.technician.name,
    technicianAt: todayAt(11, 3),
    nurseId: "",
    nurseName: "",
    nurseAt: null,
    locked: false,
  },
  {
    caseId: "C-2026061705",
    technicianId: "",
    technicianName: "",
    technicianAt: null,
    nurseId: "",
    nurseName: "",
    nurseAt: null,
    locked: false,
  },
  {
    caseId: "C-2026061706",
    technicianId: "",
    technicianName: "",
    technicianAt: null,
    nurseId: "",
    nurseName: "",
    nurseAt: null,
    locked: false,
  },
];

export const SEED_ASSETS: Asset[] = [
  {
    assetId: "A-1001",
    caseId: "C-2026061702",
    type: "image",
    stage: "术前",
    filename: "pre_aorto_001.jpg",
    sizeBytes: 2_340_112,
    importedAt: todayAt(9, 51),
    blobKey: "",
    placeholder: true,
  },
  {
    assetId: "A-1002",
    caseId: "C-2026061702",
    type: "sequence",
    stage: "造影",
    filename: "femoral_runoff.dcm",
    sizeBytes: 18_902_443,
    durationMs: 12000,
    importedAt: todayAt(10, 4),
    blobKey: "",
    placeholder: true,
  },
  {
    assetId: "A-1003",
    caseId: "C-2026061702",
    type: "image",
    stage: "术前",
    filename: "puncture_site_002.jpg",
    sizeBytes: 1_870_500,
    importedAt: todayAt(9, 53),
    blobKey: "",
    placeholder: true,
  },
  {
    assetId: "A-1004",
    caseId: "C-2026061702",
    type: "video",
    stage: null,
    filename: "balloon_inflate.mp4",
    sizeBytes: 24_550_991,
    durationMs: 8500,
    importedAt: todayAt(10, 12),
    blobKey: "",
    placeholder: true,
  },
];

export const SEED_CONSUMABLES: Consumable[] = [
  {
    consumableId: uid("CS"),
    caseId: "C-2026061702",
    name: "球囊扩张导管 4.0×20mm",
    batchNo: "BX2026-0418",
    quantity: 1,
  },
  {
    consumableId: uid("CS"),
    caseId: "C-2026061702",
    name: "自膨式镍钛支架 6×80mm",
    batchNo: "ST2026-0731",
    quantity: 1,
  },
];

export const SEED_CONTRAST: ContrastAgent = {
  caseId: "C-2026061702",
  name: "碘海醇 350",
  dosageMl: 60,
  concentration: "350 mgI/mL",
};

export const SEED_REMARKS: Remark[] = [
  {
    remarkId: uid("RM"),
    caseId: "C-2026061702",
    content: "右股动脉穿刺顺利，术毕压迫止血后加压包扎。",
    author: CURRENT_USER.technician.name,
    timestamp: todayAt(10, 20),
  },
];

interface SeedArchiveDef {
  caseId: string;
  patientName: string;
  hospitalizationNo: string;
  surgeryName: string;
  surgeonId: string;
  surgeonName: string;
  department: string;
  roomId: string;
  daysAgoVal: number;
  hour: number;
  assetCount: number;
  stagesCovered: string[];
}

const ARCHIVE_DEFS: SeedArchiveDef[] = [
  {
    caseId: "C-2026061001",
    patientName: "陈国华",
    hospitalizationNo: "2600188",
    surgeryName: "冠状动脉造影+支架植入术",
    surgeonId: "SG01",
    surgeonName: "张明远",
    department: "心血管内科",
    roomId: "R1",
    daysAgoVal: 7,
    hour: 10,
    assetCount: 24,
    stagesCovered: ["术前", "穿刺", "造影", "支架释放", "术后复查"],
  },
  {
    caseId: "C-2026061002",
    patientName: "吴美玲",
    hospitalizationNo: "2600201",
    surgeryName: "脑动脉瘤栓塞术",
    surgeonId: "SG02",
    surgeonName: "李婉清",
    department: "神经内科",
    roomId: "R2",
    daysAgoVal: 9,
    hour: 11,
    assetCount: 31,
    stagesCovered: ["术前", "穿刺", "造影", "支架释放", "术后复查"],
  },
  {
    caseId: "C-2026060801",
    patientName: "黄志坚",
    hospitalizationNo: "2600155",
    surgeryName: "颈动脉支架植入术",
    surgeonId: "SG03",
    surgeonName: "王建国",
    department: "血管外科",
    roomId: "R3",
    daysAgoVal: 11,
    hour: 9,
    assetCount: 18,
    stagesCovered: ["术前", "穿刺", "造影", "术后复查"],
  },
  {
    caseId: "C-2026060401",
    patientName: "赵小琴",
    hospitalizationNo: "2600098",
    surgeryName: "经皮肝穿刺胆道引流术",
    surgeonId: "SG04",
    surgeonName: "赵雪梅",
    department: "介入放射科",
    roomId: "R1",
    daysAgoVal: 14,
    hour: 14,
    assetCount: 15,
    stagesCovered: ["术前", "穿刺", "造影", "支架释放"],
  },
  {
    caseId: "C-2026052801",
    patientName: "林伯远",
    hospitalizationNo: "2600072",
    surgeryName: "冠状动脉造影+支架植入术",
    surgeonId: "SG01",
    surgeonName: "张明远",
    department: "心血管内科",
    roomId: "R1",
    daysAgoVal: 20,
    hour: 10,
    assetCount: 27,
    stagesCovered: ["术前", "穿刺", "造影", "支架释放", "术后复查"],
  },
  {
    caseId: "C-2026052501",
    patientName: "邓慧",
    hospitalizationNo: "2600060",
    surgeryName: "下肢动脉造影术",
    surgeonId: "SG03",
    surgeonName: "王建国",
    department: "血管外科",
    roomId: "R3",
    daysAgoVal: 23,
    hour: 9,
    assetCount: 12,
    stagesCovered: ["术前", "造影", "术后复查"],
  },
  {
    caseId: "C-2026052001",
    patientName: "韩雪",
    hospitalizationNo: "2600041",
    surgeryName: "消化道出血内镜止血术",
    surgeonId: "SG05",
    surgeonName: "陈志强",
    department: "消化内科",
    roomId: "R2",
    daysAgoVal: 28,
    hour: 15,
    assetCount: 9,
    stagesCovered: ["术前", "穿刺", "术后复查"],
  },
];

export const SEED_ARCHIVE_RECORDS: ArchiveRecord[] = ARCHIVE_DEFS.map((d) => {
  const archivedAt = daysAgo(d.daysAgoVal, d.hour + 1, 30);
  return {
    recordId: uid("REC"),
    caseId: d.caseId,
    traceCode: generateTraceCode(d.caseId, archivedAt),
    archivedAt,
    archivedBy: CURRENT_USER.technician.name,
    assetCount: d.assetCount,
    stageCoverage: `${d.stagesCovered.length}/5`,
    stagesCovered: d.stagesCovered as ArchiveRecord["stagesCovered"],
    patientName: d.patientName,
    hospitalizationNo: d.hospitalizationNo,
    surgeryName: d.surgeryName,
    surgeonId: d.surgeonId,
    surgeonName: d.surgeonName,
    department: d.department,
    roomId: d.roomId,
    startTime: daysAgo(d.daysAgoVal, d.hour, 0),
    snapshot: {
      consumables: [],
      contrast: null,
      remarks: [],
      verification: null,
    },
  };
});

export async function isSeeded(): Promise<boolean> {
  const { getAll } = await import("@/lib/db");
  const rooms = await getAll<Room>("rooms");
  return rooms.length > 0;
}

export async function seedDatabase() {
  const { putAll } = await import("@/lib/db");
  await Promise.all([
    putAll("rooms", SEED_ROOMS),
    putAll("surgeons", SEED_SURGEONS),
    putAll("cases", SEED_CASES),
    putAll("verifications", SEED_VERIFICATIONS),
    putAll("assets", SEED_ASSETS),
    putAll("consumables", SEED_CONSUMABLES),
    putAll("archiveRecords", SEED_ARCHIVE_RECORDS),
  ]);
  await putAll("contrast", [SEED_CONTRAST]);
  await putAll("remarks", SEED_REMARKS);
}
