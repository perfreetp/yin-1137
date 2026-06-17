import { useNavigate } from "react-router-dom";
import { CheckCircle2, FileCheck2, FolderSearch } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/format";
import { CURRENT_USER } from "@/lib/constants";

export function ArchiveSuccess() {
  const navigate = useNavigate();
  const result = useStore((s) => s.lastArchiveResult);
  const cases = useStore((s) => s.cases);
  const clearArchiveResult = useStore((s) => s.clearArchiveResult);
  const assets = useStore((s) => s.assets);
  const computeValidation = useStore((s) => s.computeValidation);

  if (!result) return null;
  const validation = computeValidation();
  const caseData = cases.length; // just to know if cases remain

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
                {assets.length}
              </div>
              <div className="font-mono text-[10px] text-chalk-mute">影像项</div>
            </div>
            <div className="rounded-xs border border-line-soft bg-ink-850 p-2.5">
              <div className="tnum text-lg font-semibold text-chalk">
                {validation.stageCoverage}
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

          <div className="mt-2 flex items-center justify-center gap-1.5 font-mono text-[10px] text-chalk-mute">
            <FileCheck2 className="h-3 w-3" />
            归档时间 {formatDateTime(new Date().toISOString())}
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
        {caseData === 0 && (
          <div className="px-4 pb-4 text-center font-mono text-[10px] text-chalk-mute">
            当日全部病例已归档完成
          </div>
        )}
      </div>
    </div>
  );
}
