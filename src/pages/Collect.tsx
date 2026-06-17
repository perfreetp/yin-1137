import { useStore } from "@/store/useStore";
import { RoomDeviceSelector } from "@/components/collect/RoomDeviceSelector";
import { PatientCard } from "@/components/collect/PatientCard";
import { VerifyBadges } from "@/components/collect/VerifyBadges";
import { ImportZone } from "@/components/collect/ImportZone";
import { AssetList } from "@/components/collect/AssetList";
import { SupplementPanel } from "@/components/collect/SupplementPanel";
import { ArchivePanel } from "@/components/collect/ArchivePanel";
import { ArchiveSuccess } from "@/components/collect/ArchiveSuccess";

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-line">
        <span className="font-mono text-2xl text-chalk-mute">OR</span>
      </div>
      <div>
        <div className="text-sm font-medium text-chalk-dim">
          请选择手术间与设备，定位当台病例
        </div>
        <div className="mt-1 font-mono text-[11px] text-chalk-mute">
          按 手术间 + 设备 快速切换并选择当台病例
        </div>
      </div>
    </div>
  );
}

export default function Collect() {
  const ready = useStore((s) => s.ready);
  const selectedCaseId = useStore((s) => s.selectedCaseId);
  const cases = useStore((s) => s.cases);
  const lastArchiveResult = useStore((s) => s.lastArchiveResult);

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center font-mono text-xs text-chalk-mute">
        正在加载手术间数据…
      </div>
    );
  }

  const caseExists = cases.some((c) => c.caseId === selectedCaseId);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line-soft px-5 py-3">
        <RoomDeviceSelector />
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
        {lastArchiveResult && !caseExists ? (
          <ArchiveSuccess />
        ) : caseExists ? (
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
            <div className="flex flex-col gap-4">
              <PatientCard />
              <VerifyBadges />
              <ImportZone />
              <AssetList />
              <SupplementPanel />
            </div>
            <ArchivePanel />
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
