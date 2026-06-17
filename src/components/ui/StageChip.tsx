import type { Stage } from "@/types";
import { STAGE_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StageChipProps {
  stage: Stage | null;
  className?: string;
  size?: "sm" | "md";
}

export function StageChip({ stage, className, size = "sm" }: StageChipProps) {
  if (!stage) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-xs border border-dashed border-bad/40 bg-bad/5 px-2 py-0.5 text-[11px] font-medium text-bad/90 leading-none",
          className,
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-bad/70 animate-pulse-dot" />
        未标记
      </span>
    );
  }
  const meta = STAGE_META[stage];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xs border px-2 leading-none font-medium",
        size === "sm" ? "py-0.5 text-[11px]" : "py-1 text-xs",
        meta.chip,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}
