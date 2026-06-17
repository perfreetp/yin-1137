import { useStore } from "@/store/useStore";
import { RoomDeviceSelector } from "@/components/collect/RoomDeviceSelector";
import { InfoBoard } from "@/components/verify/InfoBoard";
import { SignaturePanel } from "@/components/verify/SignaturePanel";

export default function Verify() {
  const ready = useStore((s) => s.ready);
  const selectedCaseId = useStore((s) => s.selectedCaseId);
  const caseExists = useStore((s) =>
    s.cases.some((c) => c.caseId === s.selectedCaseId),
  );

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center font-mono text-xs text-chalk-mute">
        正在加载手术间数据…
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line-soft px-5 py-3">
        <RoomDeviceSelector />
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-5 py-5">
        {caseExists && selectedCaseId ? (
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            <InfoBoard />
            <SignaturePanel />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-line">
              <span className="font-mono text-xl text-chalk-mute">核对</span>
            </div>
            <div>
              <div className="text-sm font-medium text-chalk-dim">
                请先选择待核对的当台病例
              </div>
              <div className="mt-1 font-mono text-[11px] text-chalk-mute">
                巡回护士与技师双人核对 · 签字后锁定患者信息
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
