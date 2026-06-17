import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Beaker,
  ClipboardList,
  Copy,
  Download,
  FileJson,
  FileText,
  Layers,
  ScrollText,
  SearchX,
  X,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import type { ArchiveRecord, Asset } from "@/types";
import { AssetThumb } from "@/components/AssetThumb";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { STAGES, STAGE_META } from "@/lib/constants";
import { formatBytes, formatDateTime, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import { downloadAssetBlob } from "@/lib/blobUtils";
import { buildManifest, downloadManifest } from "@/lib/manifest";
import { useStore } from "@/store/useStore";

interface DetailDrawerProps {
  record: ArchiveRecord;
  assets: Asset[];
  onClose: () => void;
}

type Tab = "overview" | "stages" | "review" | "supplement" | "log";

const TABS: { key: Tab; label: string; icon: typeof Layers }[] = [
  { key: "overview", label: "概览", icon: Layers },
  { key: "stages", label: "阶段与影像", icon: ScrollText },
  { key: "review", label: "复核视角", icon: SearchX },
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
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState<"json" | "text" | null>(null);
  const cases = useStore((s) => s.cases);
  const getSurgeon = useStore((s) => s.getSurgeon);
  const getCaseById = useStore((s) => s.getCaseById);
  const surgeon = getSurgeon(record.surgeonId);
  const snap = record.snapshot;
  const covered = new Set(record.stagesCovered);

  const copyTrace = () => {
    navigator.clipboard?.writeText(record.traceCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const handleDownloadManifest = async (format: "json" | "text") => {
    setDownloading(format);
    try {
      let caseData = cases.find((c) => c.caseId === record.caseId);
      if (!caseData) {
        caseData = await getCaseById(record.caseId);
      }
      if (!caseData) return;
      const manifest = buildManifest({
        record,
        caseData,
        assets,
        consumables: snap.consumables,
        contrast: snap.contrast,
        remarks: snap.remarks,
        verification: snap.verification,
        surgeon,
      });
      downloadManifest(manifest, format);
    } finally {
      setDownloading(null);
    }
  };

  const handleJumpToEdit = async () => {
    let target = cases.find((c) => c.caseId === record.caseId);
    if (!target) {
      target = await getCaseById(record.caseId);
    }
    if (target) {
      navigate("/collect");
      const state = useStore.getState();
      state.clearArchiveResult();
      state.selectRoom(target.roomId);
      state.selectDevice(target.deviceType);
      state.selectCase(target.caseId);
    }
    onClose();
  };

  const missingStages = STAGES.filter((s) => !covered.has(s));

  const assetsByStage: Record<string, Asset[]> = {};
  for (const s of STAGES) assetsByStage[s] = [];
  for (const a of assets) {
    if (a.stage) assetsByStage[a.stage].push(a);
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex h-full w-full max-w-[520px] animate-slide-in flex-col border-l border-line bg-ink-900 shadow-float">
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

        {/* manifest download bar */}
        <div className="flex items-center gap-2 border-b border-line-soft bg-ink-850/50 px-4 py-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
            归档清单
          </span>
          <div className="ml-auto flex gap-1.5">
            <button
              onClick={() => handleDownloadManifest("text")}
              disabled={downloading !== null}
              className="flex items-center gap-1 rounded-xs border border-line-soft bg-ink-800 px-2 py-1 text-[10px] text-chalk-dim transition-colors hover:bg-ink-700 hover:text-chalk disabled:opacity-50"
            >
              {downloading === "text" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <FileText className="h-3 w-3" />
              )}
              TXT
            </button>
            <button
              onClick={() => handleDownloadManifest("json")}
              disabled={downloading !== null}
              className="flex items-center gap-1 rounded-xs border border-line-soft bg-ink-800 px-2 py-1 text-[10px] text-chalk-dim transition-colors hover:bg-ink-700 hover:text-chalk disabled:opacity-50"
            >
              {downloading === "json" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <FileJson className="h-3 w-3" />
              )}
              JSON
            </button>
          </div>
        </div>

        {/* tabs */}
        <div className="flex border-b border-line-soft">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 py-2 text-[10px] font-medium transition-colors",
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
              <div className="mt-4">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
                  快速操作
                </div>
                <Button
                  variant="secondary"
                  block
                  size="sm"
                  icon={<ArrowLeft className="h-3.5 w-3.5" />}
                  onClick={handleJumpToEdit}
                >
                  跳转至采集页继续补录
                </Button>
                <p className="mt-2 font-mono text-[10px] text-chalk-mute">
                  如发现缺项，可返回该病例继续补充资料
                </p>
              </div>
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
                          {on ? `已采集 (${assetsByStage[s].length} 项)` : "缺失"}
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
                      <div key={a.assetId} className="group">
                        <div className="relative">
                          <AssetThumb asset={a} />
                          <button
                            onClick={() => downloadAssetBlob(a)}
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-xs bg-ink-950/70 text-chalk opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-ink-900"
                            title="下载原文件"
                          >
                            <Download className="h-3 w-3" />
                          </button>
                        </div>
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

          {tab === "review" && (
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
                    复核摘要
                  </div>
                  {missingStages.length > 0 && (
                    <Badge tone="warn" dot>
                      {missingStages.length} 项缺失
                    </Badge>
                  )}
                </div>
                <div className="rounded-xs border border-line-soft bg-ink-850/50 p-3">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-chalk-mute">影像总数</span>
                      <span className="font-mono text-chalk">{assets.length} 项</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-chalk-mute">阶段完整</span>
                      <span className="font-mono text-chalk">{record.stageCoverage}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-chalk-mute">耗材登记</span>
                      <span className="font-mono text-chalk">{snap.consumables.length} 项</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-chalk-mute">备注记录</span>
                      <span className="font-mono text-chalk">{snap.remarks.length} 条</span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                    {snap.verification?.locked ? (
                      <Badge tone="ok" dot>双人核对已完成</Badge>
                    ) : (
                      <Badge tone="bad" dot>双人核对未完成</Badge>
                    )}
                    {snap.contrast ? (
                      <Badge tone="neutral">造影剂已记录</Badge>
                    ) : (
                      <Badge tone="warn" dot>造影剂未记录</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
                  按阶段复核
                </div>
                <div className="space-y-2.5">
                  {STAGES.map((s) => {
                    const stageAssets = assetsByStage[s];
                    const hasAssets = stageAssets.length > 0;
                    return (
                      <div
                        key={s}
                        className={cn(
                          "rounded-xs border",
                          hasAssets
                            ? "border-line-soft bg-ink-850/60"
                            : "border-dashed border-bad/30 bg-bad/5",
                        )}
                      >
                        <div className="flex items-center justify-between px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                hasAssets ? STAGE_META[s].dot : "bg-bad",
                              )}
                            />
                            <span className="text-xs font-medium text-chalk">
                              {STAGE_META[s].label}
                            </span>
                          </div>
                          {hasAssets ? (
                            <span className="font-mono text-[10px] text-chalk-mute">
                              {stageAssets.length} 项影像
                            </span>
                          ) : (
                            <Badge tone="bad" dot>
                              缺失
                            </Badge>
                          )}
                        </div>
                        {hasAssets && (
                          <div className="space-y-1.5 border-t border-line-soft/50 px-3 py-2">
                            {stageAssets.map((a) => (
                              <div
                                key={a.assetId}
                                className="flex items-center gap-2 group"
                              >
                                <AssetThumb
                                  asset={a}
                                  className="h-8 w-8 shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="truncate font-mono text-[10px] text-chalk">
                                    {a.filename}
                                  </div>
                                  <div className="font-mono text-[9px] text-chalk-mute">
                                    {a.type === "image"
                                      ? "图像"
                                      : a.type === "video"
                                        ? "视频"
                                        : "序列"}{" "}
                                    · {formatBytes(a.sizeBytes)}
                                    {a.durationMs
                                      ? ` · ${formatDuration(a.durationMs)}`
                                      : ""}
                                  </div>
                                </div>
                                <button
                                  onClick={() => downloadAssetBlob(a)}
                                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xs text-chalk-mute opacity-0 transition-opacity hover:bg-ink-800 hover:text-chalk group-hover:opacity-100"
                                  title="下载"
                                >
                                  <Download className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xs border border-sterile/30 bg-sterile/5 p-3">
                <div className="mb-1.5 text-[11px] font-medium text-sterile">
                  复核建议
                </div>
                {missingStages.length > 0 && (
                  <p className="text-[10px] text-chalk-dim">
                    以下阶段资料缺失：
                    {missingStages.map((s) => STAGE_META[s].label).join("、")}
                    。建议返回采集页补充。
                  </p>
                )}
                {!snap.verification?.locked && (
                  <p className="mt-1 text-[10px] text-chalk-dim">
                    双人核对未完成，请确认技师与护士均已签字。
                  </p>
                )}
                {missingStages.length === 0 && snap.verification?.locked && (
                  <p className="text-[10px] text-chalk-dim">
                    阶段齐全、核对完成，可提交病案归档。
                  </p>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  block
                  className="mt-3"
                  icon={<ArrowLeft className="h-3.5 w-3.5" />}
                  onClick={handleJumpToEdit}
                >
                  返回病例继续补录
                </Button>
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
