import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, PackageCheck, XCircle } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/Button";
import { STAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ArchivePanel() {
  const selectedCaseId = useStore((s) => s.selectedCaseId);
  const assets = useStore((s) => s.assets);
  const verification = useStore((s) => s.verification);
  const cases = useStore((s) => s.cases);
  const archiveRecords = useStore((s) => s.archiveRecords);
  const computeValidation = useStore((s) => s.computeValidation);
  const archive = useStore((s) => s.archive);

  const result = useMemo(
    () => computeValidation(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCaseId, assets, verification, cases, archiveRecords],
  );

  const caseData = cases.find((c) => c.caseId === selectedCaseId);

  if (!caseData) return null;

  const stageSet = new Set(assets.filter((a) => a.stage).map((a) => a.stage));

  return (
    <div className="sticky top-0 flex flex-col gap-3">
      <section className="overflow-hidden rounded-md border border-line-soft bg-ink-875/80 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-line-soft px-4 py-3">
          <div className="flex items-center gap-2">
            <PackageCheck className="h-4 w-4 text-teal" />
            <h3 className="text-sm font-semibold text-chalk">归档校验</h3>
          </div>
          <span
            className={cn(
              "rounded-xs border px-2 py-0.5 text-[11px] font-medium",
              result.passed
                ? "border-ok/30 bg-ok/10 text-ok"
                : "border-bad/30 bg-bad/10 text-bad",
            )}
          >
            {result.passed ? "可归档" : `${result.blockCount} 项阻断`}
          </span>
        </div>

        {/* Stage coverage */}
        <div className="border-b border-line-soft px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
              阶段完整性
            </span>
            <span className="tnum font-mono text-xs text-chalk">
              {result.stageCoverage}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {STAGES.map((s) => {
              const on = stageSet.has(s);
              return (
                <div key={s} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-xs",
                      on
                        ? "bg-ok/15 text-ok"
                        : "bg-ink-800 text-chalk-mute",
                    )}
                  >
                    {on ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <span className="h-1 w-1 rounded-full bg-chalk-mute" />
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-[11px]",
                      on ? "text-chalk" : "text-chalk-mute",
                    )}
                  >
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Issues */}
        <div className="px-4 py-3">
          {result.issues.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xs border border-ok/20 bg-ok/5 px-3 py-2 text-xs text-ok">
              <CheckCircle2 className="h-4 w-4" />
              所有检查项通过，可生成归档记录
            </div>
          ) : (
            <div className="space-y-1.5">
              {result.issues.map((issue) => (
                <div
                  key={issue.id}
                  className={cn(
                    "flex items-start gap-2 rounded-xs border px-3 py-2",
                    issue.level === "block"
                      ? "border-bad/20 bg-bad/5"
                      : "border-warn/20 bg-warn/5",
                  )}
                >
                  {issue.level === "block" ? (
                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bad" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-chalk">
                      {issue.message}
                    </div>
                    {issue.detail && (
                      <div className="mt-0.5 text-[11px] text-chalk-mute">
                        {issue.detail}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-line-soft p-3">
          <Button
            variant="primary"
            size="lg"
            block
            dot={result.passed ? "teal" : "bad"}
            disabled={!result.passed}
            onClick={() => archive()}
            icon={<PackageCheck className="h-4 w-4" />}
          >
            {result.passed ? "生成可追溯归档记录" : `请先处理 ${result.blockCount} 项阻断`}
          </Button>
          <p className="mt-2 text-center font-mono text-[10px] text-chalk-mute">
            归档后将生成追溯码 · 记录操作人与时间戳
          </p>
        </div>
      </section>
    </div>
  );
}
