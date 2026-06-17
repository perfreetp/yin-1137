import { ChevronRight, FileCheck2, Layers } from "lucide-react";
import type { ArchiveRecord } from "@/types";
import { STAGES, STAGE_META } from "@/lib/constants";
import { formatDateTime, formatDuration, relativeDay } from "@/lib/format";
import { cn } from "@/lib/utils";

interface RecordsTableProps {
  records: ArchiveRecord[];
  onSelect: (record: ArchiveRecord) => void;
}

export function RecordsTable({ records, onSelect }: RecordsTableProps) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-line py-16">
        <FileCheck2 className="h-8 w-8 text-chalk-mute" strokeWidth={1.5} />
        <div className="text-sm text-chalk-dim">未找到符合条件的归档记录</div>
        <div className="font-mono text-[11px] text-chalk-mute">
          调整检索条件或前往「术中采集」归档新病例
        </div>
      </div>
    );
  }

  const caseVersionCounts = new Map<string, number>();
  records.forEach((r) => {
    caseVersionCounts.set(r.caseId, (caseVersionCounts.get(r.caseId) ?? 0) + 1);
  });

  const firstRecordByCase = new Map<string, string>();
  const sortedRecords = [...records].sort((a, b) => a.archivedAt.localeCompare(b.archivedAt));
  for (const r of sortedRecords) {
    if (!firstRecordByCase.has(r.caseId)) {
      firstRecordByCase.set(r.caseId, r.archivedAt);
    }
  }

  return (
    <div className="overflow-hidden rounded-md border border-line-soft">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line-soft bg-ink-875">
            <th className="px-3 py-2.5 font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
              追溯码 / 版本
            </th>
            <th className="px-3 py-2.5 font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
              患者 / 手术
            </th>
            <th className="px-3 py-2.5 font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
              术者 / 科室
            </th>
            <th className="px-3 py-2.5 font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
              归档时间
            </th>
            <th className="px-3 py-2.5 text-right font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
              影像
            </th>
            <th className="px-3 py-2.5 font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
              阶段完整性
            </th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {records.map((r) => {
            const covered = new Set(r.stagesCovered);
            const hasMultiple = (caseVersionCounts.get(r.caseId) ?? 0) > 1;
            const firstAt = firstRecordByCase.get(r.caseId);
            const deltaMs = firstAt && r.version > 1
              ? new Date(r.archivedAt).getTime() - new Date(firstAt).getTime()
              : 0;

            return (
              <tr
                key={r.recordId}
                onClick={() => onSelect(r)}
                className={cn(
                  "group cursor-pointer border-b border-line-soft/60 transition-colors last:border-0 hover:bg-ink-850/70",
                  hasMultiple && "bg-ink-875/40",
                )}
              >
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-xs font-medium text-teal">
                      {r.traceCode}
                    </div>
                    <span className={cn(
                      "rounded-xs px-1.5 py-0.5 font-mono text-[9px]",
                      r.version === 1
                        ? "bg-ink-700 text-chalk-dim"
                        : "bg-violet/15 text-violet ring-1 ring-violet/30",
                    )}>
                      V{r.version}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-chalk-mute">
                    {r.hospitalizationNo || "—"}
                    {hasMultiple && (
                      <span className="inline-flex items-center gap-0.5 rounded-xs bg-sterile/10 px-1 text-sterile">
                        <Layers className="h-2.5 w-2.5" />
                        {caseVersionCounts.get(r.caseId)} 次归档
                      </span>
                    )}
                    {deltaMs > 0 && (
                      <span className="text-chalk-mute/70">
                        +{formatDuration(deltaMs)} 补录
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="text-xs font-medium text-chalk">
                    {r.patientName}
                  </div>
                  <div className="mt-0.5 max-w-[220px] truncate text-[11px] text-chalk-dim">
                    {r.surgeryName}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="text-xs text-chalk">{r.surgeonName}</div>
                  <div className="text-[11px] text-chalk-mute">{r.department}</div>
                </td>
                <td className="px-3 py-3">
                  <div className="font-mono text-xs text-chalk">
                    {formatDateTime(r.archivedAt)}
                  </div>
                  <div className="font-mono text-[10px] text-chalk-mute">
                    {relativeDay(r.archivedAt)}
                  </div>
                </td>
                <td className="px-3 py-3 text-right">
                  <span className="inline-flex h-6 min-w-[2rem] items-center justify-center rounded-xs border border-line-soft bg-ink-850 px-2 font-mono text-xs text-chalk">
                    {r.assetCount}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {STAGES.map((s) => (
                        <span
                          key={s}
                          title={STAGE_META[s].label}
                          className={cn(
                            "h-3 w-4 rounded-xs",
                            covered.has(s) ? STAGE_META[s].bar : "bg-ink-700",
                          )}
                        />
                      ))}
                    </div>
                    <span
                      className={cn(
                        "font-mono text-[10px]",
                        r.stageCoverage === "5/5" ? "text-ok" : "text-chalk-mute",
                      )}
                    >
                      {r.stageCoverage}
                    </span>
                  </div>
                </td>
                <td className="px-2">
                  <ChevronRight className="h-4 w-4 text-chalk-mute transition-transform group-hover:translate-x-0.5 group-hover:text-teal" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
