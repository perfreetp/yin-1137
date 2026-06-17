import { NavLink } from "react-router-dom";
import {
  Archive,
  ClipboardCheck,
  RotateCcw,
  ScanLine,
  Stethoscope,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { CURRENT_USER } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV = [
  {
    to: "/collect",
    label: "术中采集",
    desc: "导入 · 标记 · 归档",
    icon: ScanLine,
  },
  {
    to: "/verify",
    label: "病例核对",
    desc: "双人核对 · 锁定",
    icon: ClipboardCheck,
  },
  {
    to: "/archive",
    label: "归档列表",
    desc: "检索 · 追溯",
    icon: Archive,
  },
];

export function Sidebar() {
  const resetAll = useStore((s) => s.resetAll);
  const ready = useStore((s) => s.ready);
  const archiveCount = useStore((s) => s.archiveRecords.length);
  const activeCount = useStore((s) => s.cases.length);

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-line-soft bg-ink-900/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-line-soft px-4 py-4">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-sm bg-teal/10 ring-1 ring-teal/30">
          <Stethoscope className="h-5 w-5 text-teal" strokeWidth={2} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-teal animate-pulse-dot" />
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold tracking-wide text-chalk">
            介入影像归档
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-chalk-mute">
            Intra-Op Archive
          </div>
        </div>
      </div>

      <div className="px-3 pt-4">
        <div className="px-2 pb-2 text-[10px] uppercase tracking-widest text-chalk-mute">
          工作窗口
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-start gap-3 rounded-sm border px-3 py-2.5 transition-all",
                  isActive
                    ? "border-teal/40 bg-teal/8 text-chalk shadow-glow"
                    : "border-transparent text-chalk-dim hover:border-line hover:bg-ink-800",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-teal" />
                  )}
                  <item.icon
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-teal" : "text-chalk-mute group-hover:text-chalk-dim",
                    )}
                    strokeWidth={1.75}
                  />
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium">{item.label}</div>
                    <div className="font-mono text-[10px] text-chalk-mute">
                      {item.desc}
                    </div>
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto px-3 pb-3">
        <div className="mb-2 grid grid-cols-2 gap-2">
          <div className="rounded-xs border border-line-soft bg-ink-850 px-2.5 py-2">
            <div className="font-mono text-[9px] uppercase tracking-widest text-chalk-mute">
              在台
            </div>
            <div className="tnum text-lg font-semibold leading-none text-chalk">
              {ready ? activeCount : "—"}
            </div>
          </div>
          <div className="rounded-xs border border-line-soft bg-ink-850 px-2.5 py-2">
            <div className="font-mono text-[9px] uppercase tracking-widest text-chalk-mute">
              已归档
            </div>
            <div className="tnum text-lg font-semibold leading-none text-teal">
              {ready ? archiveCount : "—"}
            </div>
          </div>
        </div>

        <div className="mb-2 rounded-xs border border-line-soft bg-ink-850 p-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xs bg-teal/10 text-[11px] font-semibold text-teal ring-1 ring-teal/20">
              {CURRENT_USER.technician.name.slice(-1)}
            </span>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-xs font-medium text-chalk">
                {CURRENT_USER.technician.name}
              </div>
              <div className="font-mono text-[10px] text-chalk-mute">
                技师 · {CURRENT_USER.technician.id}
              </div>
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-2 border-t border-line-soft pt-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-xs bg-sterile/10 text-[11px] font-semibold text-sterile ring-1 ring-sterile/20">
              {CURRENT_USER.nurse.name.slice(-1)}
            </span>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-xs font-medium text-chalk">
                {CURRENT_USER.nurse.name}
              </div>
              <div className="font-mono text-[10px] text-chalk-mute">
                巡回护士 · {CURRENT_USER.nurse.id}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm("确定重置全部演示数据？将清空并重新生成病例与归档。")) {
              void resetAll();
            }
          }}
          className="flex w-full items-center justify-center gap-1.5 rounded-xs border border-line-soft px-2 py-1.5 text-[11px] text-chalk-mute transition-colors hover:border-bad/30 hover:bg-bad/5 hover:text-bad/80"
        >
          <RotateCcw className="h-3 w-3" />
          重置演示数据
        </button>
      </div>
    </aside>
  );
}
