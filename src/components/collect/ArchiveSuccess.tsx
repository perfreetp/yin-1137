import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  FileCheck2,
  FolderSearch,
  FileJson,
  FileText,
  Loader2,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/format";
import { CURRENT_USER } from "@/lib/constants";
import { buildManifest, downloadManifest } from "@/lib/manifest";

export function ArchiveSuccess() {
  const navigate = useNavigate();
  const result = useStore((s) => s.lastArchiveResult);
  const clearArchiveResult = useStore((s) => s.clearArchiveResult);
  const cases = useStore((s) => s.cases);
  const assets = useStore((s) => s.assets);
  const consumables = useStore((s) => s.consumables);
  const contrast = useStore((s) => s.contrast);
  const remarks = useStore((s) => s.remarks);
  const verification = useStore((s) => s.verification);
  const selectedCaseId = useStore((s) => s.selectedCaseId);
  const getSurgeon = useStore((s) => s.getSurgeon);
  const getCaseById = useStore((s) => s.getCaseById);
  const fetchArchivedAssets = useStore((s) => s.fetchArchivedAssets);

  const [downloading, setDownloading] = useState<"json" | "text" | null>(null);

  if (!result) return null;

  const surgeon = getSurgeon(result.surgeonId);
  const activeCasesCount = cases.filter((c) => !c.archived).length;

  const handleDownload = async (format: "json" | "text") => {
    if (!result) return;
    setDownloading(format);
    try {
      let caseData = cases.find((c) => c.caseId === result.caseId);
      if (!caseData) {
        caseData = await getCaseById(result.caseId);
      }
      let resolvedAssets = assets;
      let resolvedConsumables = consumables;
      let resolvedContrast = contrast;
      let resolvedRemarks = remarks;
      let resolvedVerification = verification;

      if (!caseData) return;

      if (selectedCaseId !== caseData.caseId || resolvedAssets.length === 0) {
        resolvedAssets = await fetchArchivedAssets(caseData.caseId);
        resolvedConsumables = result.snapshot.consumables;
        resolvedContrast = result.snapshot.contrast;
        resolvedRemarks = result.snapshot.remarks;
        resolvedVerification = result.snapshot.verification;
      }

      const manifest = buildManifest({
        record: result,
        caseData,
        assets: resolvedAssets,
        consumables: resolvedConsumables,
        contrast: resolvedContrast,
        remarks: resolvedRemarks,
        verification: resolvedVerification,
        surgeon,
      });
      downloadManifest(manifest, format);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-lg animate-fade-up overflow-hidden rounded-lg border border-teal/30 bg-ink-875 shadow-float">
        <div className="relative border-b border-line-soft bg-gradient-to-br from-teal/10 via-transparent to-transparent px-6 py-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-teal/40 bg-teal/10">
            <CheckCircle2 className="h-7 w-7 text-teal" strokeWidth={2} />
          </div>
          <h2 className="text-lg font-semibold text-chalk">归档记录已生成</h2>
          <p className="mt-1 text-xs text-chalk-dim">
            术中影像资料已可追溯地归档，可术后随时检索调阅
          </p>
        </div>

        <div className="px-6 py-5">
          <div className="mb-4 rounded-md border border-teal/20 bg-ink-900 p-4 text-center">
            <div className="font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
              追溯码 / Trace Code
            </div>
            <div className="mt-1 font-mono text-2xl font-semibold tracking-wider text-teal">
              {result.traceCode}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xs border border-line-soft bg-ink-850 p-2.5">
              <div className="tnum text-lg font-semibold text-chalk">
                {result.assetCount}
              </div>
              <div className="font-mono text-[10px] text-chalk-mute">影像项</div>
            </div>
            <div className="rounded-xs border border-line-soft bg-ink-850 p-2.5">
              <div className="tnum text-lg font-semibold text-chalk">
                {result.stageCoverage}
              </div>
              <div className="font-mono text-[10px] text-chalk-mute">阶段</div>
            </div>
            <div className="rounded-xs border border-line-soft bg-ink-850 p-2.5">
              <div className="truncate text-xs font-medium text-chalk">
                {CURRENT_USER.technician.name}
              </div>
              <div className="font-mono text-[10px] text-chalk-mute">操作人</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
              归档包清单
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={
                  downloading === "text" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileText className="h-3.5 w-3.5" />
                  )
                }
                onClick={() => handleDownload("text")}
                disabled={downloading !== null}
              >
                下载 TXT
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={
                  downloading === "json" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileJson className="h-3.5 w-3.5" />
                  )
                }
                onClick={() => handleDownload("json")}
                disabled={downloading !== null}
              >
                下载 JSON
              </Button>
            </div>
            <p className="mt-2 font-mono text-[10px] text-chalk-mute">
              清单含追溯码、患者信息、阶段影像、耗材、造影剂与备注，可交病案室复核
            </p>
          </div>

          <div className="mt-3 flex items-center justify-center gap-1.5 font-mono text-[10px] text-chalk-mute">
            <FileCheck2 className="h-3 w-3" />
            归档时间 {formatDateTime(result.archivedAt)}
          </div>
        </div>

        <div className="flex gap-2 border-t border-line-soft p-4">
          <Button
            variant="secondary"
            block
            icon={<FolderSearch className="h-4 w-4" />}
            onClick={() => navigate("/archive")}
          >
            查看归档列表
          </Button>
          <Button
            variant="primary"
            block
            onClick={() => clearArchiveResult()}
          >
            归档下一例
          </Button>
        </div>
        {activeCasesCount === 0 && (
          <div className="px-4 pb-4 text-center font-mono text-[10px] text-chalk-mute">
            当日全部病例已归档完成
          </div>
        )}
      </div>
    </div>
  );
}
