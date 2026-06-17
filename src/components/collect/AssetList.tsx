import { Download, Trash2, Sparkles } from "lucide-react";
import { useStore } from "@/store/useStore";
import { AssetThumb } from "@/components/AssetThumb";
import { StageChip } from "@/components/ui/StageChip";
import { StageSelect } from "@/components/ui/StageSelect";
import { STAGES, STAGE_META } from "@/lib/constants";
import { formatBytes, formatDuration, stageCoverage } from "@/lib/format";
import { cn } from "@/lib/utils";
import { downloadAssetBlob } from "@/lib/blobUtils";

export function AssetList() {
  const assets = useStore((s) => s.assets);
  const setAssetStage = useStore((s) => s.setAssetStage);
  const deleteAsset = useStore((s) => s.deleteAsset);

  const { covered, coverage } = stageCoverage(assets);
  const unmarked = assets.filter((a) => !a.stage).length;

  return (
    <section className="rounded-md border border-line-soft bg-ink-875/60">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-teal" />
          <h3 className="text-xs font-semibold tracking-wide text-chalk">
            影像资料
          </h3>
          <span className="font-mono text-[10px] text-chalk-mute">
            {assets.length} 项
          </span>
          {unmarked > 0 && (
            <span className="rounded-xs border border-bad/30 bg-bad/10 px-1.5 py-0.5 text-[10px] text-bad">
              {unmarked} 项未标记
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-chalk-mute">
            阶段覆盖 {coverage}
          </span>
          <div className="flex gap-0.5">
            {STAGES.map((s) => {
              const on = covered.includes(s);
              return (
                <span
                  key={s}
                  title={STAGE_META[s].label}
                  className={cn(
                    "h-1.5 w-5 rounded-xs transition-colors",
                    on ? STAGE_META[s].bar : "bg-ink-700",
                  )}
                />
              );
            })}
          </div>
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <div className="font-mono text-xs text-chalk-mute">
            尚未导入影像 · 使用上方拖放区或导入按钮
          </div>
        </div>
      ) : (
        <div className="divide-y divide-line-soft">
          {assets.map((a) => (
            <div
              key={a.assetId}
              className="group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-ink-850/60"
            >
              <AssetThumb asset={a} className="h-12 w-12 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {a.stageSuggested && a.stage && (
                    <span
                      className="flex items-center gap-0.5 rounded-xs bg-sterile/15 px-1 py-0.5 text-[9px] font-medium text-sterile"
                      title="系统建议阶段，可调整"
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      建议
                    </span>
                  )}
                  <div className="min-w-0 flex-1 truncate font-mono text-xs text-chalk">
                    {a.filename}
                  </div>
                </div>
                <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-chalk-mute">
                  <span className="rounded-xs bg-ink-800 px-1.5 py-0.5">
                    {a.type === "image"
                      ? "图像"
                      : a.type === "video"
                        ? "视频"
                        : "序列"}
                  </span>
                  <span className="tnum">{formatBytes(a.sizeBytes)}</span>
                  {a.durationMs ? (
                    <span className="tnum">{formatDuration(a.durationMs)}</span>
                  ) : null}
                </div>
              </div>
              <div className="hidden sm:block">
                <StageChip stage={a.stage} />
              </div>
              <div className="w-32 shrink-0">
                <StageSelect
                  value={a.stage}
                  onChange={(stage) => setAssetStage(a.assetId, stage)}
                />
              </div>
              <button
                onClick={() => downloadAssetBlob(a)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xs text-chalk-mute opacity-0 transition-all hover:bg-ink-800 hover:text-chalk group-hover:opacity-100"
                title="下载原文件"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => deleteAsset(a.assetId)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xs text-chalk-mute opacity-0 transition-all hover:bg-bad/10 hover:text-bad group-hover:opacity-100"
                title="移除"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
