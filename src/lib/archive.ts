import type {
  ArchiveRecord,
  Asset,
  Case,
  Consumable,
  ContrastAgent,
  Remark,
  Stage,
  Surgeon,
  ValidationIssue,
  ValidationResult,
  Verification,
} from "@/types";
import { stageCoverage, uid } from "@/lib/format";
import { STAGES } from "@/lib/constants";

function hash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return (h >>> 0).toString(36).toUpperCase().padStart(7, "0").slice(0, 7);
}

export function generateTraceCode(caseId: string, archivedAt: string): string {
  const d = new Date(archivedAt);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const date = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const short = caseId.replace(/[^A-Za-z0-9]/g, "").slice(-4).toUpperCase();
  return `IVA-${date}-${hash(caseId + archivedAt).slice(0, 4)}${short}`;
}

export function runValidation(params: {
  caseData: Case;
  assets: Asset[];
  verification: Verification | null;
  activeCases: Case[];
  existingRecord?: ArchiveRecord;
}): ValidationResult {
  const { caseData, assets, verification, activeCases, existingRecord } = params;
  const issues: ValidationIssue[] = [];

  const required: { field: keyof Case; label: string }[] = [
    { field: "patientName", label: "患者姓名" },
    { field: "hospitalizationNo", label: "住院号" },
    { field: "surgeryName", label: "手术名称" },
    { field: "surgeonId", label: "术者" },
    { field: "startTime", label: "手术开始时间" },
  ];
  const missing = required.filter((r) => !String(caseData[r.field] ?? "").trim());
  if (missing.length) {
    issues.push({
      id: "missing-info",
      level: "block",
      category: "missing-info",
      message: "患者信息缺失",
      detail: missing.map((m) => m.label).join("、"),
    });
  }

  const verified =
    verification &&
    verification.technicianAt &&
    verification.nurseAt &&
    verification.locked;
  if (!verified) {
    issues.push({
      id: "verification",
      level: "block",
      category: "verification",
      message: "双人核对未完成",
      detail: "需技师与巡回护士双签字并锁定",
    });
  }

  const unmarked = assets.filter((a) => !a.stage);
  if (unmarked.length) {
    issues.push({
      id: "unmarked-stage",
      level: "block",
      category: "unmarked-stage",
      message: `${unmarked.length} 项影像未标记阶段`,
      detail: "请为每项影像标注 术前/穿刺/造影/支架释放/术后复查",
    });
  }

  if (existingRecord) {
    issues.push({
      id: "duplicate-archive",
      level: "warn",
      category: "duplicate",
      message: "该病例已存在归档记录",
      detail: `追溯码 ${existingRecord.traceCode}，继续将生成新记录`,
    });
  }

  const dup = activeCases.find(
    (c) =>
      c.caseId !== caseData.caseId &&
      c.hospitalizationNo &&
      c.hospitalizationNo === caseData.hospitalizationNo,
  );
  if (dup) {
    issues.push({
      id: "duplicate-case",
      level: "warn",
      category: "duplicate",
      message: "疑似重复病例",
      detail: `住院号 ${caseData.hospitalizationNo} 同时出现在其他在台病例`,
    });
  }

  const { covered, coverage } = stageCoverage(assets);
  const blockCount = issues.filter((i) => i.level === "block").length;
  const warnCount = issues.filter((i) => i.level === "warn").length;

  return {
    passed: blockCount === 0,
    issues,
    stageCoverage: coverage,
    stagesCovered: covered,
    blockCount,
    warnCount,
  };
}

export function buildArchiveRecord(params: {
  caseData: Case;
  assets: Asset[];
  consumables: Consumable[];
  contrast: ContrastAgent | null;
  remarks: Remark[];
  verification: Verification | null;
  surgeon?: Surgeon;
  archivedBy: string;
  existingRecords?: ArchiveRecord[];
}): ArchiveRecord {
  const { caseData, assets, consumables, contrast, remarks, verification, surgeon, archivedBy, existingRecords } =
    params;
  const archivedAt = new Date().toISOString();
  const { covered, coverage } = stageCoverage(assets);
  const version = (existingRecords?.length ?? 0) + 1;
  return {
    recordId: uid("REC"),
    caseId: caseData.caseId,
    traceCode: generateTraceCode(caseData.caseId, archivedAt),
    version,
    archivedAt,
    archivedBy,
    assetCount: assets.length,
    stageCoverage: coverage,
    stagesCovered: covered,
    patientName: caseData.patientName,
    hospitalizationNo: caseData.hospitalizationNo,
    surgeryName: caseData.surgeryName,
    surgeonId: caseData.surgeonId,
    surgeonName: surgeon?.name ?? "—",
    department: caseData.department,
    roomId: caseData.roomId,
    startTime: caseData.startTime,
    snapshot: {
      caseInfo: {
        patientName: caseData.patientName,
        hospitalizationNo: caseData.hospitalizationNo,
        surgeryName: caseData.surgeryName,
        surgeonId: caseData.surgeonId,
        department: caseData.department,
        roomId: caseData.roomId,
        deviceType: caseData.deviceType,
        startTime: caseData.startTime,
      },
      assets: assets.map((a) => ({
        assetId: a.assetId,
        filename: a.filename,
        type: a.type,
        stage: a.stage,
        sizeBytes: a.sizeBytes,
        durationMs: a.durationMs,
        importedAt: a.importedAt,
        blobKey: a.blobKey,
      })),
      consumables,
      contrast,
      remarks,
      verification,
    },
  };
}

export function allStagesPresent(covered: Stage[]): boolean {
  return STAGES.every((s) => covered.includes(s));
}
