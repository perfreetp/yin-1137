import { useStore } from "@/store/useStore";
import { fromDateTimeLocal, toDateTimeLocal } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Case } from "@/types";
import { FileCheck } from "lucide-react";

const FIELDS: {
  key: keyof Case;
  label: string;
  span: string;
}[] = [
  { key: "patientName", label: "患者姓名", span: "md:col-span-1" },
  { key: "hospitalizationNo", label: "住院号", span: "md:col-span-1" },
  { key: "surgeryName", label: "手术名称", span: "md:col-span-2" },
  { key: "surgeonId", label: "术者", span: "md:col-span-1" },
  { key: "startTime", label: "手术开始时间", span: "md:col-span-1" },
];

export function PatientCard() {
  const caseData = useStore((s) =>
    s.cases.find((c) => c.caseId === s.selectedCaseId),
  );
  const surgeons = useStore((s) => s.surgeons);
  const updateCaseField = useStore((s) => s.updateCaseField);
  const verification = useStore((s) => s.verification);
  const locked = verification?.locked ?? false;

  if (!caseData) return null;

  return (
    <section className="rounded-md border border-line-soft bg-ink-875/60">
      {caseData.archived && (
        <div className="flex items-center gap-2 border-b border-sterile/30 bg-sterile/5 px-4 py-2 text-[11px] text-sterile">
          <FileCheck className="h-3.5 w-3.5" />
          <span className="font-medium">归档病例补录模式</span>
          <span className="font-mono text-sterile/70">
            补录完成后将生成新的归档追溯记录
          </span>
        </div>
      )}
      <div className="flex items-center justify-between border-b border-line-soft px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-teal" />
          <h3 className="text-xs font-semibold tracking-wide text-chalk">
            患者信息
          </h3>
          <span className="font-mono text-[10px] text-chalk-mute">
            {caseData.caseId}
          </span>
        </div>
        {locked && (
          <span className="rounded-xs border border-ok/30 bg-ok/10 px-1.5 py-0.5 text-[10px] text-ok">
            已核对锁定 · 仅可补录耗材与影像
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-px bg-line-soft md:grid-cols-2">
        {FIELDS.map((f) => {
          const value = String(caseData[f.key] ?? "");
          const missing = !value.trim();
          return (
            <div
              key={f.key}
              className={cn("bg-ink-875 p-3", f.span)}
            >
              <label className="mb-1 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
                  {f.label}
                </span>
                {missing && (
                  <span className="text-[10px] text-bad/80">缺失 · 待补录</span>
                )}
              </label>
              {f.key === "surgeonId" ? (
                <select
                  disabled={locked}
                  value={value}
                  onChange={(e) => {
                    const sg = surgeons.find((s) => s.surgeonId === e.target.value);
                    void updateCaseField("surgeonId", e.target.value);
                    if (sg) void updateCaseField("department", sg.department);
                  }}
                  className={cn(
                    "h-9 w-full rounded-xs border bg-ink-850 px-2.5 text-sm text-chalk outline-none transition-colors focus:border-teal/50",
                    missing
                      ? "border-dashed border-bad/40"
                      : "border-line-soft focus:border-teal/50",
                    locked && "opacity-60",
                  )}
                >
                  <option value="">— 选择术者 —</option>
                  {surgeons.map((s) => (
                    <option key={s.surgeonId} value={s.surgeonId}>
                      {s.name} · {s.department}
                    </option>
                  ))}
                </select>
              ) : f.key === "startTime" ? (
                <input
                  type="datetime-local"
                  disabled={locked}
                  value={toDateTimeLocal(value)}
                  onChange={(e) =>
                    void updateCaseField(
                      "startTime",
                      fromDateTimeLocal(e.target.value),
                    )
                  }
                  className={cn(
                    "h-9 w-full rounded-xs border bg-ink-850 px-2.5 font-mono text-sm text-chalk outline-none transition-colors focus:border-teal/50",
                    missing ? "border-dashed border-bad/40" : "border-line-soft",
                    locked && "opacity-60",
                  )}
                />
              ) : (
                <input
                  type="text"
                  disabled={locked}
                  value={value}
                  onChange={(e) => void updateCaseField(f.key, e.target.value)}
                  placeholder={`请输入${f.label}`}
                  className={cn(
                    "h-9 w-full rounded-xs border bg-ink-850 px-2.5 text-sm text-chalk outline-none transition-colors placeholder:text-chalk-mute focus:border-teal/50",
                    f.key === "hospitalizationNo" && "font-mono tnum",
                    missing ? "border-dashed border-bad/40" : "border-line-soft",
                    locked && "opacity-60",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
