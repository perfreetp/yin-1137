import { useState } from "react";
import {
  Beaker,
  ClipboardList,
  Copy,
  Layers,
  ScrollText,
  X,
} from "lucide-react";
import type { ArchiveRecord, Asset } from "@/types";
import { AssetThumb } from "@/components/AssetThumb";
import { STAGES, STAGE_META } from "@/lib/constants";
import { formatBytes, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DetailDrawerProps {
  record: ArchiveRecord;
  assets: Asset[];
  onClose: () => void;
}

type Tab = "overview" | "stages" | "supplement" | "log";

const TABS: { key: Tab; label: string; icon: typeof Layers }[] = [
  { key: "overview", label: "概览", icon: Layers },
  { key: "stages", label: "阶段与影像", icon: ScrollText },
  { key: "supplement", label: "耗材造影剂", icon: Beaker },
  { key: "log", label: "核对日志", icon: ClipboardList },
];

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line-soft/60 py-2">
      <span className="font-mono text-[11px] text-chalk-mute">{label}</span>
      <span
        className={cn(
          "text-right text-xs text-chalk",
          mono && "font-mono",
        )}
      >
        {value || "—"}
      </span>
    </div>
  );
}

export function DetailDrawer({ record, assets, onClose }: DetailDrawerProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const [copied, setCopied] = useState(false);
  const covered = new Set(record.stagesCovered);
  const snap = record.snapshot;

  const copyTrace = () => {
    navigator.clipboard?.writeText(record.traceCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex h-full w-full max-w-[480px] animate-slide-in flex-col border-l border-line bg-ink-900 shadow-float">
        {/* header */}
        <div className="flex items-start justify-between gap-3 border-b border-line-soft p-4">
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
              归档追溯码
            </div>
            <button
              onClick={copyTrace}
              className="mt-1 flex items-center gap-2 font-mono text-lg font-semibold text-teal"
              title="点击复制"
            >
              {record.traceCode}
              <Copy className="h-3.5 w-3.5 opacity-50" />
              {copied && (
                <span className="font-sans text-[10px] text-ok">已复制</span>
              )}
            </button>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-medium text-chalk">
                {record.patientName}
              </span>
              <span className="font-mono text-[11px] text-chalk-mute">
                {record.hospitalizationNo}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xs text-chalk-mute hover:bg-ink-800 hover:text-chalk"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* tabs */}
        <div className="flex border-b border-line-soft">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition-colors",
                tab === t.key
                  ? "border-b-2 border-teal text-teal"
                  : "border-b-2 border-transparent text-chalk-mute hover:text-chalk",
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {tab === "overview" && (
            <div>
              <Row label="手术名称" value={record.surgeryName} />
              <Row label="术者" value={`${record.surgeonName}`} />
              <Row label="科室" value={record.department} />
              <Row label="手术开始" value={formatDateTime(record.startTime)} mono />
              <Row label="归档时间" value={formatDateTime(record.archivedAt)} mono />
              <Row label="归档操作人" value={record.archivedBy} />
              <Row label="影像数量" value={`${record.assetCount} 项`} mono />
              <Row label="阶段完整度" value={`${record.stageCoverage} 阶段`} mono />
              <Row label="病例编号" value={record.caseId} mono />
            </div>
          )}

          {tab === "stages" && (
            <div className="space-y-4">
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
                  阶段覆盖
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {STAGES.map((s) => {
                    const on = covered.has(s);
                    return (
                      <div
                        key={s}
                        className={cn(
                          "flex items-center justify-between rounded-xs border px-3 py-2",
                          on
                            ? STAGE_META[s].chip
                            : "border-line-soft bg-ink-850 text-chalk-mute",
                        )}
                      >
                        <span className="flex items-center gap-2 text-xs">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              on ? STAGE_META[s].dot : "bg-chalk-mute",
                            )}
                          />
                          {STAGE_META[s].label}
                        </span>
                        <span className="font-mono text-[10px]">
                          {on ? "已采集" : "缺失"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
                  影像资料 ({assets.length})
                </div>
                {assets.length === 0 ? (
                  <div className="rounded-xs border border-dashed border-line py-6 text-center font-mono text-[11px] text-chalk-mute">
                    该归档记录未保留影像快照
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {assets.map((a) => (
                      <div key={a.assetId}>
                        <AssetThumb asset={a} />
                        <div className="mt-1 truncate font-mono text-[9px] text-chalk-mute">
                          {a.filename}
                        </div>
                        <div className="font-mono text-[9px] text-chalk-mute">
                          {formatBytes(a.sizeBytes)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "supplement" && (
            <div className="space-y-4">
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
                  造影剂
                </div>
                {snap.contrast ? (
                  <div className="rounded-xs border border-line-soft bg-ink-850 p-3 text-xs text-chalk">
                    {snap.contrast.name} ·{" "}
                    <span className="font-mono">{snap.contrast.dosageMl} mL</span>
                    {snap.contrast.concentration && (
                      <span className="font-mono text-chalk-mute">
                        {" "}
                        · {snap.contrast.concentration}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xs border border-dashed border-line py-3 text-center font-mono text-[11px] text-chalk-mute">
                    未记录造影剂
                  </div>
                )}
              </div>
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
                  耗材批号 ({snap.consumables.length})
                </div>
                {snap.consumables.length === 0 ? (
                  <div className="rounded-xs border border-dashed border-line py-3 text-center font-mono text-[11px] text-chalk-mute">
                    未登记耗材
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {snap.consumables.map((c) => (
                      <div
                        key={c.consumableId}
                        className="flex items-center justify-between rounded-xs border border-line-soft bg-ink-850 px-3 py-2"
                      >
                        <span className="text-xs text-chalk">{c.name}</span>
                        <span className="font-mono text-[11px] text-chalk-dim">
                          {c.batchNo} ×{c.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "log" && (
            <div className="space-y-4">
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
                  双人核对
                </div>
                {snap.verification ? (
                  <div className="space-y-1.5 rounded-xs border border-line-soft bg-ink-850 p-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-chalk-mute">技师</span>
                      <span className="text-chalk">
                        {snap.verification.technicianName || "—"}
                        {snap.verification.technicianAt && (
                          <span className="ml-1 font-mono text-[10px] text-chalk-mute">
                            {formatDateTime(snap.verification.technicianAt)}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-chalk-mute">巡回护士</span>
                      <span className="text-chalk">
                        {snap.verification.nurseName || "—"}
                        {snap.verification.nurseAt && (
                          <span className="ml-1 font-mono text-[10px] text-chalk-mute">
                            {formatDateTime(snap.verification.nurseAt)}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xs border border-dashed border-line py-3 text-center font-mono text-[11px] text-chalk-mute">
                    未保留核对记录
                  </div>
                )}
              </div>
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
                  关键备注 ({snap.remarks.length})
                </div>
                {snap.remarks.length === 0 ? (
                  <div className="rounded-xs border border-dashed border-line py-3 text-center font-mono text-[11px] text-chalk-mute">
                    无备注
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {snap.remarks.map((r) => (
                      <div
                        key={r.remarkId}
                        className="rounded-xs border border-line-soft bg-ink-850 p-3"
                      >
                        <div className="mb-1 flex justify-between text-[11px]">
                          <span className="font-medium text-chalk">{r.author}</span>
                          <span className="font-mono text-[10px] text-chalk-mute">
                            {formatDateTime(r.timestamp)}
                          </span>
                        </div>
                        <div className="text-xs leading-relaxed text-chalk-dim">
                          {r.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
