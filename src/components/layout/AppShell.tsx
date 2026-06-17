import { Outlet } from "react-router-dom";
import { ChevronRight, Cpu, Radio } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useStore } from "@/store/useStore";
import { useClock } from "@/hooks/useClock";
import { DEVICE_META } from "@/lib/constants";
import { formatDateTime, formatTime } from "@/lib/format";

function Header() {
  const now = useClock();
  const rooms = useStore((s) => s.rooms);
  const cases = useStore((s) => s.cases);
  const selectedRoomId = useStore((s) => s.selectedRoomId);
  const selectedDevice = useStore((s) => s.selectedDevice);
  const selectedCaseId = useStore((s) => s.selectedCaseId);
  const ready = useStore((s) => s.ready);

  const room = rooms.find((r) => r.roomId === selectedRoomId);
  const caseData = cases.find((c) => c.caseId === selectedCaseId);
  const deviceMeta = DEVICE_META[selectedDevice];

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-line-soft bg-ink-900/60 px-5 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-2.5 text-xs">
        <span className="flex items-center gap-1.5 rounded-xs border border-line bg-ink-800 px-2 py-1">
          <Radio className="h-3 w-3 text-teal" strokeWidth={2} />
          <span className="font-mono text-[11px] text-chalk-dim">
            {room?.code ?? "OR-?"}
          </span>
        </span>
        <span className="truncate text-chalk-dim">{room?.name ?? "未选择手术间"}</span>
        <ChevronRight className="h-3 w-3 text-chalk-mute" />
        <span
          className={`rounded-xs border px-1.5 py-0.5 text-[11px] font-medium ${deviceMeta.tone}`}
        >
          {deviceMeta.label}
        </span>
        {caseData && (
          <>
            <ChevronRight className="h-3 w-3 text-chalk-mute" />
            <span className="truncate font-medium text-chalk">
              {caseData.patientName}
            </span>
            <span className="truncate text-chalk-mute">· {caseData.surgeryName || "手术待补"}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-1.5 text-[11px] text-chalk-mute md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse-dot" />
          <span className="font-mono">{ready ? "系统就绪" : "加载中"}</span>
        </div>
        <div className="flex items-center gap-2 border-l border-line-soft pl-4">
          <Cpu className="h-3.5 w-3.5 text-chalk-mute" strokeWidth={1.75} />
          <div className="text-right leading-tight">
            <div className="tnum font-mono text-sm font-medium text-chalk">
              {formatTime(now.toISOString())}
            </div>
            <div className="tnum font-mono text-[10px] text-chalk-mute">
              {formatDateTime(now.toISOString()).slice(0, 10)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="min-h-0 flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
