import { useEffect, useMemo, useState } from "react";
import { Archive as ArchiveIcon } from "lucide-react";
import { useStore } from "@/store/useStore";
import { SearchBar } from "@/components/archive/SearchBar";
import { RecordsTable } from "@/components/archive/RecordsTable";
import { DetailDrawer } from "@/components/archive/DetailDrawer";
import type { ArchiveQuery, ArchiveRecord, Asset } from "@/types";

const EMPTY_QUERY: ArchiveQuery = {
  dateFrom: "",
  dateTo: "",
  department: "",
  surgeonId: "",
  keyword: "",
};

export default function Archive() {
  const ready = useStore((s) => s.ready);
  const archiveRecords = useStore((s) => s.archiveRecords);
  const searchArchives = useStore((s) => s.searchArchives);
  const fetchArchivedAssets = useStore((s) => s.fetchArchivedAssets);

  const [query, setQuery] = useState<ArchiveQuery>(EMPTY_QUERY);
  const [selected, setSelected] = useState<ArchiveRecord | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);

  const filtered = useMemo(
    () => searchArchives(query),
    [query, archiveRecords, searchArchives],
  );

  useEffect(() => {
    if (!selected) {
      setAssets([]);
      return;
    }
    let active = true;
    void fetchArchivedAssets(selected.caseId).then((a) => {
      if (active) setAssets(a);
    });
    return () => {
      active = false;
    };
  }, [selected, fetchArchivedAssets]);

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center font-mono text-xs text-chalk-mute">
        正在加载归档数据…
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-line-soft px-5 py-3">
        <ArchiveIcon className="h-4 w-4 text-teal" />
        <h2 className="text-sm font-semibold text-chalk">归档列表</h2>
        <span className="font-mono text-[11px] text-chalk-mute">
          共 {archiveRecords.length} 条可追溯记录
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4">
          <SearchBar
            query={query}
            onChange={setQuery}
            resultCount={filtered.length}
          />
          <RecordsTable records={filtered} onSelect={setSelected} />
        </div>
      </div>

      {selected && (
        <DetailDrawer
          record={selected}
          assets={assets}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
