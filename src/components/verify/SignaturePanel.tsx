import { CheckCircle2, Lock, ShieldCheck, UserCheck } from "lucide-react";
import { useStore } from "@/store/useStore";
import { CURRENT_USER } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

function SignatureCard({
  role,
  label,
  name,
  id,
  done,
  at,
  locked,
  onConfirm,
}: {
  role: "technician" | "nurse";
  label: string;
  name: string;
  id: string;
  done: boolean;
  at: string | null;
  locked: boolean;
  onConfirm: () => void;
}) {
  const tone = role === "technician" ? "teal" : "sterile";
  return (
    <div
      className={cn(
        "flex flex-col rounded-md border p-4 transition-all",
        done
          ? tone === "teal"
            ? "border-teal/30 bg-teal/8"
            : "border-sterile/30 bg-sterile/8"
          : "border-line-soft bg-ink-850",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck
            className={cn(
              "h-4 w-4",
              done ? (tone === "teal" ? "text-teal" : "text-sterile") : "text-chalk-mute",
            )}
          />
          <span className="text-sm font-medium text-chalk">{label}</span>
        </div>
        {done ? (
          <CheckCircle2
            className={cn(
              "h-5 w-5",
              tone === "teal" ? "text-teal" : "text-sterile",
            )}
          />
        ) : (
          <span className="font-mono text-[10px] text-chalk-mute">未签字</span>
        )}
      </div>

      <div className="mt-3 flex-1">
        {done ? (
          <>
            <div className="text-lg font-semibold text-chalk">{name}</div>
            <div className="font-mono text-xs text-chalk-dim">工号 {id}</div>
            {at && (
              <div className="mt-1 font-mono text-[11px] text-chalk-mute">
                签字时间 {formatDateTime(at)}
              </div>
            )}
          </>
        ) : (
          <div className="text-xs text-chalk-mute">
            默认操作人 {name} · {id}
          </div>
        )}
      </div>

      <button
        onClick={onConfirm}
        disabled={done || locked}
        className={cn(
          "mt-3 h-9 rounded-xs border text-xs font-medium transition-all",
          done
            ? "cursor-default border-transparent text-chalk-mute"
            : tone === "teal"
              ? "border-teal/40 bg-teal/15 text-teal hover:bg-teal/25"
              : "border-sterile/40 bg-sterile/15 text-sterile hover:bg-sterile/25",
          locked && !done && "cursor-not-allowed opacity-40",
        )}
      >
        {done ? "已确认" : `确认签字 · ${label}`}
      </button>
    </div>
  );
}

export function SignaturePanel() {
  const verification = useStore((s) => s.verification);
  const verify = useStore((s) => s.verify);

  const techDone = Boolean(verification?.technicianAt);
  const nurseDone = Boolean(verification?.nurseAt);
  const locked = verification?.locked ?? false;

  return (
    <section className="rounded-lg border border-line-soft bg-ink-875/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-teal" />
          <h3 className="text-sm font-semibold text-chalk">双人核对签字</h3>
        </div>
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-xs border px-2 py-0.5 text-[11px]",
            locked
              ? "border-ok/30 bg-ok/10 text-ok"
              : "border-warn/30 bg-warn/10 text-warn",
          )}
        >
          {locked && <Lock className="h-3 w-3" />}
          {locked ? "已锁定 · 信息不可改" : "待双签字"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SignatureCard
          role="technician"
          label="技师"
          name={verification?.technicianName || CURRENT_USER.technician.name}
          id={verification?.technicianId || CURRENT_USER.technician.id}
          done={techDone}
          at={verification?.technicianAt ?? null}
          locked={locked}
          onConfirm={() => verify("technician")}
        />
        <SignatureCard
          role="nurse"
          label="巡回护士"
          name={verification?.nurseName || CURRENT_USER.nurse.name}
          id={verification?.nurseId || CURRENT_USER.nurse.id}
          done={nurseDone}
          at={verification?.nurseAt ?? null}
          locked={locked}
          onConfirm={() => verify("nurse")}
        />
      </div>

      <p className="mt-3 text-center font-mono text-[10px] text-chalk-mute">
        双方签字后病例信息自动锁定 · 影像与耗材补录仍可继续
      </p>
    </section>
  );
}
