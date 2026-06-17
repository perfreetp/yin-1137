import { useEffect } from "react";
import { Clock, User2, FileCheck } from "lucide-react";
import { useStore } from "@/store/useStore";
import { DEVICE_META } from "@/lib/constants";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DeviceType } from "@/types";

export function RoomDeviceSelector() {
  const rooms = useStore((s) => s.rooms);
  const cases = useStore((s) => s.cases);
  const selectedRoomId = useStore((s) => s.selectedRoomId);
  const selectedDevice = useStore((s) => s.selectedDevice);
  const selectedCaseId = useStore((s) => s.selectedCaseId);
  const selectRoom = useStore((s) => s.selectRoom);
  const selectDevice = useStore((s) => s.selectDevice);
  const selectCase = useStore((s) => s.selectCase);

  const room = rooms.find((r) => r.roomId === selectedRoomId);
  const deviceType = selectedDevice as DeviceType;
  const matching = cases.filter(
    (c) => c.roomId === selectedRoomId && c.deviceType === deviceType && !c.archived,
  );

  const selectedCase = cases.find((c) => c.caseId === selectedCaseId);
  const selectedMatchesRoomDevice =
    selectedCase &&
    selectedCase.roomId === selectedRoomId &&
    selectedCase.deviceType === deviceType;

  useEffect(() => {
    if (selectedMatchesRoomDevice) return;
    const first = matching[0];
    if (first && first.caseId !== selectedCaseId) {
      void selectCase(first.caseId);
    } else if (matching.length === 0 && selectedCaseId && !selectedMatchesRoomDevice) {
      void selectCase(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoomId, selectedDevice, cases.length]);

  return (
    <div className="rounded-md border border-line-soft bg-ink-875/60 p-3">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <div className="mb-1.5 px-1 font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
            手术间
          </div>
          <div className="flex gap-1.5">
            {rooms.map((r) => (
              <button
                key={r.roomId}
                onClick={() => selectRoom(r.roomId)}
                className={cn(
                  "rounded-xs border px-3 py-1.5 text-xs transition-all",
                  r.roomId === selectedRoomId
                    ? "border-teal/40 bg-teal/10 text-teal"
                    : "border-line bg-ink-800 text-chalk-dim hover:border-ink-500 hover:text-chalk",
                )}
              >
                <span className="font-mono">{r.code}</span>
                <span className="ml-1.5">{r.name.replace(/\d+号/, "")}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1.5 px-1 font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
            设备
          </div>
          <div className="flex gap-1.5">
            {(room?.devices ?? []).map((d) => {
              const meta = DEVICE_META[d as DeviceType];
              return (
                <button
                  key={d}
                  onClick={() => selectDevice(d as DeviceType)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xs border px-2.5 py-1.5 text-xs transition-all",
                    d === selectedDevice
                      ? cn("font-medium", meta.tone)
                      : "border-line bg-ink-800 text-chalk-dim hover:text-chalk",
                  )}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-[200px] flex-1">
          <div className="mb-1.5 flex items-center justify-between px-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
              当台病例 ({matching.length})
            </span>
            {selectedCase?.archived && selectedMatchesRoomDevice && (
              <span className="flex items-center gap-1 rounded-xs border border-sterile/30 bg-sterile/5 px-1.5 py-0.5 font-mono text-[9px] text-sterile">
                <FileCheck className="h-2.5 w-2.5" />
                已定位至历史病例补录
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedCase?.archived && selectedMatchesRoomDevice && (
              <button
                key={selectedCase.caseId}
                onClick={() => selectCase(selectedCase.caseId)}
                className={cn(
                  "flex items-center gap-2 rounded-xs border px-3 py-1.5 text-left transition-all",
                  "border-sterile/50 bg-sterile/10 shadow-glow",
                )}
              >
                <FileCheck
                  className={cn("h-3.5 w-3.5 text-sterile")}
                />
                <div className="leading-tight">
                  <div className="text-xs font-medium text-chalk">
                    {selectedCase.patientName || "（姓名待补）"}
                    <span className="ml-1 rounded-xs bg-sterile/20 px-1 font-mono text-[9px] text-sterile">
                      补录
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-chalk-mute">
                    <Clock className="h-2.5 w-2.5" />
                    {formatTime(selectedCase.startTime)}
                  </div>
                </div>
              </button>
            )}
            {matching.length === 0 && (!selectedCase?.archived || !selectedMatchesRoomDevice) && (
              <div className="rounded-xs border border-dashed border-line px-3 py-1.5 text-xs text-chalk-mute">
                该手术间 {DEVICE_META[deviceType].label} 暂无在台病例
              </div>
            )}
            {matching.map((c) => {
              const active = c.caseId === selectedCaseId;
              return (
                <button
                  key={c.caseId}
                  onClick={() => selectCase(c.caseId)}
                  className={cn(
                    "flex items-center gap-2 rounded-xs border px-3 py-1.5 text-left transition-all",
                    active
                      ? "border-teal/50 bg-teal/10 shadow-glow"
                      : "border-line bg-ink-800 hover:border-ink-500",
                  )}
                >
                  <User2
                    className={cn("h-3.5 w-3.5", active ? "text-teal" : "text-chalk-mute")}
                  />
                  <div className="leading-tight">
                    <div className="text-xs font-medium text-chalk">
                      {c.patientName || "（姓名待补）"}
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[10px] text-chalk-mute">
                      <Clock className="h-2.5 w-2.5" />
                      {formatTime(c.startTime)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
