import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import type { Stage } from "@/types";
import { STAGES, STAGE_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StageSelectProps {
  value: Stage | null;
  onChange: (stage: Stage | null) => void;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
}

export function StageSelect({
  value,
  onChange,
  disabled,
  allowClear = true,
  className,
}: StageSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-8 w-full items-center justify-between gap-2 rounded-xs border px-2.5 text-xs transition-colors",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          value
            ? cn(STAGE_META[value].chip, "border")
            : "border-dashed border-bad/40 bg-bad/5 text-bad/90",
        )}
      >
        <span className="flex items-center gap-1.5">
          {value ? (
            <>
              <span className={cn("h-1.5 w-1.5 rounded-full", STAGE_META[value].dot)} />
              {STAGE_META[value].label}
            </>
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-bad/70 animate-pulse-dot" />
              未标记
            </>
          )}
        </span>
        <ChevronDown className="h-3.5 w-3.5 opacity-50" />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 w-44 animate-fade-up overflow-hidden rounded-sm border border-line bg-ink-850 shadow-float">
          <div className="px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-chalk-mute">
            标记阶段
          </div>
          {STAGES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-2 px-2.5 py-2 text-xs transition-colors hover:bg-ink-750",
                value === s ? "text-chalk" : "text-chalk-dim",
              )}
            >
              <span className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", STAGE_META[s].dot)} />
                {STAGE_META[s].label}
              </span>
              {value === s && <Check className="h-3.5 w-3.5 text-teal" />}
            </button>
          ))}
          {allowClear && (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 border-t border-line-soft px-2.5 py-2 text-xs text-bad/80 transition-colors hover:bg-bad/10"
            >
              <X className="h-3.5 w-3.5" />
              清除标记
            </button>
          )}
        </div>
      )}
    </div>
  );
}
