import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "teal" | "ok" | "warn" | "bad" | "sterile" | "violet";

const toneMap: Record<Tone, string> = {
  neutral: "bg-ink-700/60 text-chalk-dim border-ink-500",
  teal: "bg-teal/10 text-teal border-teal/30",
  ok: "bg-ok/10 text-ok border-ok/30",
  warn: "bg-warn/10 text-warn border-warn/30",
  bad: "bg-bad/10 text-bad border-bad/30",
  sterile: "bg-sterile/10 text-sterile border-sterile/30",
  violet: "bg-violet-400/10 text-violet-300 border-violet-400/30",
};

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
  mono?: boolean;
}

export function Badge({
  tone = "neutral",
  children,
  className,
  dot,
  mono,
}: BadgeProps) {
  const dotColor: Record<Tone, string> = {
    neutral: "bg-chalk-mute",
    teal: "bg-teal",
    ok: "bg-ok",
    warn: "bg-warn",
    bad: "bg-bad",
    sterile: "bg-sterile",
    violet: "bg-violet-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xs border px-2 py-0.5 text-[11px] font-medium leading-none",
        mono && "font-mono tnum",
        toneMap[tone],
        className,
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotColor[tone])} />}
      {children}
    </span>
  );
}
