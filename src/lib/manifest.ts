import type {
  ArchiveRecord,
  Asset,
  Case,
  Consumable,
  ContrastAgent,
  Remark,
  Stage,
  Surgeon,
  Verification,
} from "@/types";
import { STAGES, STAGE_META, ASSET_TYPE_META } from "@/lib/constants";
import { formatBytes, formatDateTime, formatDuration } from "@/lib/format";

export interface ArchiveManifest {
  version: "1.0";
  generatedAt: string;
  traceCode: string;
  archiveRecordId: string;
  caseId: string;
  patient: {
    name: string;
    hospitalizationNo: string;
    department: string;
    surgeryName: string;
    surgeonName: string;
    surgeonId: string;
    roomId: string;
    startTime: string;
    archivedAt: string;
    archivedBy: string;
  };
  stages: {
    stage: Stage;
    label: string;
    assetCount: number;
    assets: {
      assetId: string;
      filename: string;
      type: string;
      sizeBytes: number;
      durationMs?: number;
      importedAt: string;
      blobKey: string;
    }[];
  }[];
  unassignedAssets: {
    assetId: string;
    filename: string;
    type: string;
    sizeBytes: number;
  }[];
  consumables: Consumable[];
  contrast: ContrastAgent | null;
  remarks: Remark[];
  verification: {
    technicianName: string;
    technicianId: string;
    technicianAt: string | null;
    nurseName: string;
    nurseId: string;
    nurseAt: string | null;
    locked: boolean;
  } | null;
  summary: {
    totalAssets: number;
    totalSizeBytes: number;
    stagesCovered: number;
    stagesTotal: number;
    consumablesCount: number;
    remarksCount: number;
  };
}

export function buildManifest(params: {
  record: ArchiveRecord;
  surgeon?: Surgeon;
}): ArchiveManifest {
  const { record, surgeon } = params;
  const snap = record.snapshot;
  const assets = snap.assets;
  const caseInfo = snap.caseInfo;

  const stageGroups: Record<Stage, typeof assets> = {} as Record<Stage, typeof assets>;
  const unassigned: typeof assets = [];

  for (const s of STAGES) stageGroups[s] = [];
  for (const a of assets) {
    if (a.stage) stageGroups[a.stage].push(a);
    else unassigned.push(a);
  }

  const stages = STAGES.map((s) => ({
    stage: s,
    label: STAGE_META[s].label,
    assetCount: stageGroups[s].length,
    assets: stageGroups[s]
      .sort((a, b) => a.importedAt.localeCompare(b.importedAt))
      .map((a) => ({
        assetId: a.assetId,
        filename: a.filename,
        type: a.type,
        sizeBytes: a.sizeBytes,
        durationMs: a.durationMs,
        importedAt: a.importedAt,
        blobKey: a.blobKey,
      })),
  }));

  const totalSize = assets.reduce((sum, a) => sum + a.sizeBytes, 0);
  const coveredCount = stages.filter((s) => s.assetCount > 0).length;

  return {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    traceCode: record.traceCode,
    archiveRecordId: record.recordId,
    caseId: record.caseId,
    patient: {
      name: caseInfo.patientName,
      hospitalizationNo: caseInfo.hospitalizationNo,
      department: caseInfo.department,
      surgeryName: caseInfo.surgeryName,
      surgeonName: surgeon?.name ?? record.surgeonName,
      surgeonId: caseInfo.surgeonId,
      roomId: caseInfo.roomId,
      startTime: caseInfo.startTime,
      archivedAt: record.archivedAt,
      archivedBy: record.archivedBy,
    },
    stages,
    unassignedAssets: unassigned.map((a) => ({
      assetId: a.assetId,
      filename: a.filename,
      type: a.type,
      sizeBytes: a.sizeBytes,
    })),
    consumables: snap.consumables,
    contrast: snap.contrast,
    remarks: snap.remarks,
    verification: snap.verification
      ? {
          technicianName: snap.verification.technicianName,
          technicianId: snap.verification.technicianId,
          technicianAt: snap.verification.technicianAt,
          nurseName: snap.verification.nurseName,
          nurseId: snap.verification.nurseId,
          nurseAt: snap.verification.nurseAt,
          locked: snap.verification.locked,
        }
      : null,
    summary: {
      totalAssets: assets.length,
      totalSizeBytes: totalSize,
      stagesCovered: coveredCount,
      stagesTotal: STAGES.length,
      consumablesCount: snap.consumables.length,
      remarksCount: snap.remarks.length,
    },
  };
}

export function manifestToText(manifest: ArchiveManifest): string {
  const lines: string[] = [];
  const sep = "━".repeat(60);
  const sub = "─".repeat(60);

  lines.push(sep);
  lines.push("  术中影像归档清单  /  ARCHIVE MANIFEST");
  lines.push(sep);
  lines.push("");
  lines.push(`追溯码        ${manifest.traceCode}`);
  lines.push(`记录编号      ${manifest.archiveRecordId}`);
  lines.push(`生成时间      ${formatDateTime(manifest.generatedAt)}`);
  lines.push("");
  lines.push(sub);
  lines.push("  患者与手术");
  lines.push(sub);
  lines.push(`患者姓名      ${manifest.patient.name || "—"}`);
  lines.push(`住院号        ${manifest.patient.hospitalizationNo || "—"}`);
  lines.push(`科室          ${manifest.patient.department || "—"}`);
  lines.push(`手术名称      ${manifest.patient.surgeryName || "—"}`);
  lines.push(`术者          ${manifest.patient.surgeonName || "—"}`);
  lines.push(`手术间        ${manifest.patient.roomId || "—"}`);
  lines.push(`手术开始      ${manifest.patient.startTime ? formatDateTime(manifest.patient.startTime) : "—"}`);
  lines.push(`归档时间      ${formatDateTime(manifest.patient.archivedAt)}`);
  lines.push(`归档操作人    ${manifest.patient.archivedBy}`);
  lines.push("");
  lines.push(sub);
  lines.push("  阶段与影像");
  lines.push(sub);
  for (const s of manifest.stages) {
    lines.push("");
    lines.push(`◆ ${s.label}  (${s.assetCount} 项)`);
    if (s.assetCount === 0) {
      lines.push(`    ── 未采集 ──`);
    } else {
      s.assets.forEach((a, i) => {
        const typeLabel = ASSET_TYPE_META[a.type as keyof typeof ASSET_TYPE_META]?.label ?? a.type.toUpperCase();
        const dur = a.durationMs ? ` · ${formatDuration(a.durationMs)}` : "";
        lines.push(
          `  ${String(i + 1).padStart(2, "0")}. ${a.filename}`,
        );
        lines.push(
          `      [${typeLabel}] ${formatBytes(a.sizeBytes)}${dur} · 导入 ${formatDateTime(a.importedAt)}`,
        );
      });
    }
  }
  if (manifest.unassignedAssets.length > 0) {
    lines.push("");
    lines.push(`◆ 未归类  (${manifest.unassignedAssets.length} 项)`);
    manifest.unassignedAssets.forEach((a, i) => {
      lines.push(`  ${String(i + 1).padStart(2, "0")}. ${a.filename}  [${a.type}] ${formatBytes(a.sizeBytes)}`);
    });
  }
  lines.push("");
  lines.push(sub);
  lines.push("  耗材与造影剂");
  lines.push(sub);
  if (manifest.consumables.length === 0) {
    lines.push("耗材：未登记");
  } else {
    lines.push(`耗材 (${manifest.consumables.length} 项)：`);
    manifest.consumables.forEach((c, i) => {
      lines.push(`  ${String(i + 1).padStart(2, "0")}. ${c.name || "—"}  批号 ${c.batchNo || "—"}  ×${c.quantity}`);
    });
  }
  lines.push("");
  if (manifest.contrast) {
    lines.push(
      `造影剂：${manifest.contrast.name}  ${manifest.contrast.dosageMl} mL${manifest.contrast.concentration ? `  (${manifest.contrast.concentration})` : ""}`,
    );
  } else {
    lines.push("造影剂：未记录");
  }
  lines.push("");
  lines.push(sub);
  lines.push("  备注");
  lines.push(sub);
  if (manifest.remarks.length === 0) {
    lines.push("无备注");
  } else {
    manifest.remarks.forEach((r, i) => {
      lines.push(`  ${String(i + 1).padStart(2, "0")}. [${r.author}] ${formatDateTime(r.timestamp)}`);
      lines.push(`      ${r.content}`);
    });
  }
  lines.push("");
  lines.push(sub);
  lines.push("  双人核对");
  lines.push(sub);
  if (manifest.verification) {
    lines.push(
      `技师   ${manifest.verification.technicianName} (${manifest.verification.technicianId})   ${manifest.verification.technicianAt ? formatDateTime(manifest.verification.technicianAt) : "未签字"}`,
    );
    lines.push(
      `护士   ${manifest.verification.nurseName} (${manifest.verification.nurseId})   ${manifest.verification.nurseAt ? formatDateTime(manifest.verification.nurseAt) : "未签字"}`,
    );
    lines.push(`状态   ${manifest.verification.locked ? "已锁定" : "未锁定"}`);
  } else {
    lines.push("未保留核对记录");
  }
  lines.push("");
  lines.push(sub);
  lines.push("  汇总");
  lines.push(sub);
  lines.push(`影像总数    ${manifest.summary.totalAssets} 项`);
  lines.push(`总大小      ${formatBytes(manifest.summary.totalSizeBytes)}`);
  lines.push(`阶段覆盖    ${manifest.summary.stagesCovered} / ${manifest.summary.stagesTotal}`);
  lines.push(`耗材数量    ${manifest.summary.consumablesCount} 项`);
  lines.push(`备注数量    ${manifest.summary.remarksCount} 条`);
  lines.push("");
  lines.push(sep);
  lines.push("  本清单由术中影像归档系统自动生成 · 可追溯");
  lines.push(sep);

  return lines.join("\n");
}

export function downloadManifest(manifest: ArchiveManifest, format: "json" | "text") {
  let content: string;
  let filename: string;
  let mimeType: string;

  if (format === "json") {
    content = JSON.stringify(manifest, null, 2);
    filename = `${manifest.traceCode}_manifest.json`;
    mimeType = "application/json";
  } else {
    content = manifestToText(manifest);
    filename = `${manifest.traceCode}_manifest.txt`;
    mimeType = "text/plain;charset=utf-8";
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
