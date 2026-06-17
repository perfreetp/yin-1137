import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";
type DotColor = "ok" | "warn" | "bad" | "teal" | "sterile";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  dot?: DotColor;
  block?: boolean;
}

const dotMap: Record<DotColor, string> = {
  ok: "bg-ok",
  warn: "bg-warn",
  bad: "bg-bad",
  teal: "bg-teal",
  sterile: "bg-sterile",
};

const variantMap: Record<Variant, string> = {
  primary:
    "bg-teal/15 text-teal border border-teal/40 hover:bg-teal/25 hover:border-teal/60 shadow-[inset_0_0_22px_rgba(45,212,191,0.10)]",
  secondary:
    "bg-ink-750 text-chalk border border-line hover:bg-ink-700 hover:border-ink-500",
  ghost:
    "bg-transparent text-chalk-dim border border-transparent hover:bg-ink-800 hover:text-chalk",
  danger:
    "bg-bad/10 text-bad border border-bad/40 hover:bg-bad/20 hover:border-bad/70",
};

const sizeMap: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-sm gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      icon,
      iconRight,
      dot,
      block,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-sm font-medium tracking-wide transition-all duration-150 select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-0",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-inherit",
          variantMap[variant],
          sizeMap[size],
          block && "w-full",
          className,
        )}
        {...props}
      >
        {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotMap[dot])} />}
        {icon}
        {children}
        {iconRight}
      </button>
    );
  },
);
Button.displayName = "Button";
