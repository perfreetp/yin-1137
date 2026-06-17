import { Check, Lock, ShieldCheck, X } from "lucide-react";
import { useStore } from "@/store/useStore";
import { CURRENT_USER } from "@/lib/constants";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { VerifierRole } from "@/types";

function VerifyBadge({
  role,
  label,
  done,
  name,
  id,
  time,
  locked,
  onVerify,
}: {
  role: VerifierRole;
  label: string;
  done: boolean;
  name: string;
  id: string;
  time: string | null;
  locked: boolean;
  onVerify: () => void;
}) {
  const tone = role === "technician" ? "teal" : "sterile";
  return (
    <button
      onClick={onVerify}
      disabled={done || locked}
      className={cn(
        "group flex flex-1 items-center gap-3 rounded-md border p-3 text-left transition-all",
        done
          ? tone === "teal"
            ? "border-teal/30 bg-teal/8"
            : "border-sterile/30 bg-sterile/8"
          : "border-line-soft bg-ink-850 hover:border-ink-500",
        locked && !done && "cursor-not-allowed opacity-50",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          done
            ? tone === "teal"
              ? "border-teal bg-teal/15 text-teal"
              : "border-sterile bg-sterile/15 text-sterile"
            : "border-line text-chalk-mute group-hover:border-ink-400",
        )}
      >
        {done ? (
          <Check className="h-5 w-5" strokeWidth={2.5} />
        ) : (
          <X className="h-5 w-5" strokeWidth={2} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-chalk">{label}</span>
          {locked && <Lock className="h-3 w-3 text-chalk-mute" />}
        </div>
        {done ? (
          <div className="truncate text-[11px] text-chalk-dim">
            {name} · <span className="font-mono">{id}</span>
          </div>
        ) : (
          <div className="text-[11px] text-chalk-mute">
            点击确认签字 · {role === "technician" ? "技师" : "护士"}
          </div>
        )}
        {done && time && (
          <div className="font-mono text-[10px] text-chalk-mute">
            {formatTime(time)}
          </div>
        )}
      </div>
    </button>
  );
}

export function VerifyBadges() {
  const verification = useStore((s) => s.verification);
  const verify = useStore((s) => s.verify);

  const techDone = Boolean(verification?.technicianAt);
  const nurseDone = Boolean(verification?.nurseAt);
  const locked = verification?.locked ?? false;

  return (
    <section className="rounded-md border border-line-soft bg-ink-875/60 p-3">
      <div className="mb-2.5 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-teal" />
          <h3 className="text-xs font-semibold tracking-wide text-chalk">
            双人核对
          </h3>
        </div>
        <span
          className={cn(
            "rounded-xs border px-1.5 py-0.5 text-[10px]",
            locked
              ? "border-ok/30 bg-ok/10 text-ok"
              : "border-warn/30 bg-warn/10 text-warn",
          )}
        >
          {locked ? "已锁定" : "待完成"}
        </span>
      </div>
      <div className="flex gap-2.5">
        <VerifyBadge
          role="technician"
          label="技师确认"
          done={techDone}
          name={verification?.technicianName || CURRENT_USER.technician.name}
          id={verification?.technicianId || CURRENT_USER.technician.id}
          time={verification?.technicianAt ?? null}
          locked={locked}
          onVerify={() => verify("technician")}
        />
        <VerifyBadge
          role="nurse"
          label="巡回护士确认"
          done={nurseDone}
          name={verification?.nurseName || CURRENT_USER.nurse.name}
          id={verification?.nurseId || CURRENT_USER.nurse.id}
          time={verification?.nurseAt ?? null}
          locked={locked}
          onVerify={() => verify("nurse")}
        />
      </div>
    </section>
  );
}
