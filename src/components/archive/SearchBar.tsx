import { CalendarDays, Filter, Search, X } from "lucide-react";
import { useStore } from "@/store/useStore";
import { DEPARTMENTS } from "@/lib/constants";
import type { ArchiveQuery } from "@/types";

interface SearchBarProps {
  query: ArchiveQuery;
  onChange: (q: ArchiveQuery) => void;
  resultCount: number;
}

export function SearchBar({ query, onChange, resultCount }: SearchBarProps) {
  const surgeons = useStore((s) => s.surgeons);

  const set = (patch: Partial<ArchiveQuery>) => onChange({ ...query, ...patch });

  return (
    <div className="rounded-md border border-line-soft bg-ink-875/60 p-3">
      <div className="flex items-center gap-2 px-1 pb-2.5">
        <Filter className="h-3.5 w-3.5 text-teal" />
        <span className="text-xs font-semibold tracking-wide text-chalk">
          检索已归档资料
        </span>
        <span className="ml-auto font-mono text-[11px] text-chalk-mute">
          命中 <span className="tnum text-teal">{resultCount}</span> 条
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
            归档日期 起
          </span>
          <input
            type="date"
            value={query.dateFrom}
            onChange={(e) => set({ dateFrom: e.target.value })}
            className="h-9 rounded-xs border border-line-soft bg-ink-850 px-2 font-mono text-xs text-chalk outline-none focus:border-teal/50"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
            归档日期 止
          </span>
          <input
            type="date"
            value={query.dateTo}
            onChange={(e) => set({ dateTo: e.target.value })}
            className="h-9 rounded-xs border border-line-soft bg-ink-850 px-2 font-mono text-xs text-chalk outline-none focus:border-teal/50"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
            科室
          </span>
          <select
            value={query.department}
            onChange={(e) => set({ department: e.target.value })}
            className="h-9 rounded-xs border border-line-soft bg-ink-850 px-2 text-xs text-chalk outline-none focus:border-teal/50"
          >
            <option value="">全部科室</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
            术者
          </span>
          <select
            value={query.surgeonId}
            onChange={(e) => set({ surgeonId: e.target.value })}
            className="h-9 rounded-xs border border-line-soft bg-ink-850 px-2 text-xs text-chalk outline-none focus:border-teal/50"
          >
            <option value="">全部术者</option>
            {surgeons.map((s) => (
              <option key={s.surgeonId} value={s.surgeonId}>
                {s.name} · {s.department}
              </option>
            ))}
          </select>
        </label>
        <label className="col-span-2 flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-chalk-mute">
            关键字（姓名/住院号/追溯码）
          </span>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-chalk-mute" />
            <input
              value={query.keyword}
              onChange={(e) => set({ keyword: e.target.value })}
              placeholder="输入关键字检索…"
              className="h-9 w-full rounded-xs border border-line-soft bg-ink-850 pl-8 pr-7 text-xs text-chalk outline-none focus:border-teal/50"
            />
            {query.keyword && (
              <button
                onClick={() => set({ keyword: "" })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-chalk-mute hover:text-chalk"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </label>
      </div>

      <div className="mt-2 flex items-center gap-1.5 px-1 pt-1">
        <CalendarDays className="h-3 w-3 text-chalk-mute" />
        <span className="font-mono text-[10px] text-chalk-mute">
          支持按日期 · 科室 · 术者组合检索，追溯码可复制追溯
        </span>
      </div>
    </div>
  );
}
