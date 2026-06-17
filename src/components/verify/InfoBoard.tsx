import { AlertTriangle, Bed, Clock, Stethoscope } from "lucide-react";
import { useStore } from "@/store/useStore";
import { DEVICE_META } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

function Field({
  label,
  value,
  mono,
  missing,
}: {
  label: string;
  value: string;
  mono?: boolean;
  missing?: boolean;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 truncate text-sm",
          mono && "font-mono tnum",
          missing ? "text-bad/80" : "text-chalk",
        )}
      >
        {value || "—"}
      </div>
    </div>
  );
}

export function InfoBoard() {
  const caseData = useStore((s) =>
    s.cases.find((c) => c.caseId === s.selectedCaseId),
  );
  const surgeons = useStore((s) => s.surgeons);
  const rooms = useStore((s) => s.rooms);

  if (!caseData) return null;

  const surgeon = surgeons.find((s) => s.surgeonId === caseData.surgeonId);
  const room = rooms.find((r) => r.roomId === caseData.roomId);
  const missing = [
    !caseData.patientName && "姓名",
    !caseData.hospitalizationNo && "住院号",
    !caseData.surgeryName && "手术名称",
    !caseData.surgeonId && "术者",
  ].filter(Boolean);

  return (
    <section className="relative overflow-hidden rounded-lg border border-line-soft bg-ink-875/60">
      <div className="scanlines pointer-events-none absolute inset-0 opacity-30" />
      {missing.length > 0 && (
        <div className="flex items-center gap-2 border-b border-bad/20 bg-bad/5 px-5 py-2 text-xs text-bad">
          <AlertTriangle className="h-4 w-4" />
          患者信息不完整：缺少 {missing.join("、")}，核对前请在「术中采集」补录
        </div>
      )}

      <div className="relative px-6 py-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line-soft pb-5">
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
              患者姓名
            </div>
            <div className="mt-1 text-4xl font-semibold leading-tight text-chalk">
              {caseData.patientName || "（待补录）"}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
              住院号
            </div>
            <div className="mt-1 font-mono text-2xl tracking-wider text-teal">
              {caseData.hospitalizationNo || "—"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 py-5 md:grid-cols-4">
          <div className="col-span-2">
            <div className="font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
              手术名称
            </div>
            <div className="mt-1 text-lg font-medium text-chalk">
              {caseData.surgeryName || "—"}
            </div>
          </div>
          <Field
            label="术者"
            value={surgeon ? `${surgeon.name} · ${surgeon.department}` : ""}
            missing={!surgeon}
          />
          <Field label="科室" value={caseData.department} />
        </div>

        <div className="grid grid-cols-2 gap-5 border-t border-line-soft pt-5 md:grid-cols-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-chalk-mute" />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
                开始时间
              </div>
              <div className="mt-0.5 font-mono text-sm text-chalk">
                {formatDateTime(caseData.startTime)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-chalk-mute" />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
                手术间
              </div>
              <div className="mt-0.5 text-sm text-chalk">
                {room?.name ?? "—"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-chalk-mute" />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
                设备
              </div>
              <div className="mt-0.5 text-sm text-chalk">
                {DEVICE_META[caseData.deviceType].label}
              </div>
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
              病例编号
            </div>
            <div className="mt-0.5 font-mono text-sm text-chalk-dim">
              {caseData.caseId}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
