import { useState } from "react";
import { Beaker, MessageSquarePlus, Plus, Syringe, Trash2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { CURRENT_USER } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

export function SupplementPanel() {
  const consumables = useStore((s) => s.consumables);
  const addConsumable = useStore((s) => s.addConsumable);
  const updateConsumable = useStore((s) => s.updateConsumable);
  const removeConsumable = useStore((s) => s.removeConsumable);
  const contrast = useStore((s) => s.contrast);
  const updateContrast = useStore((s) => s.updateContrast);
  const remarks = useStore((s) => s.remarks);
  const addRemark = useStore((s) => s.addRemark);
  const [remarkDraft, setRemarkDraft] = useState("");

  return (
    <section className="rounded-md border border-line-soft bg-ink-875/60">
      <div className="border-b border-line-soft px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-sterile" />
          <h3 className="text-xs font-semibold tracking-wide text-chalk">
            补录信息
          </h3>
          <span className="font-mono text-[10px] text-chalk-mute">
            耗材 · 造影剂 · 备注
          </span>
        </div>
      </div>

      <div className="divide-y divide-line-soft">
        {/* Consumables */}
        <div className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-chalk-dim">
              <Syringe className="h-3.5 w-3.5 text-sterile" />
              耗材批号
            </div>
            <button
              onClick={() => addConsumable()}
              className="flex items-center gap-1 rounded-xs border border-line-soft px-2 py-1 text-[11px] text-chalk-dim hover:border-teal/40 hover:text-teal"
            >
              <Plus className="h-3 w-3" /> 添加
            </button>
          </div>
          {consumables.length === 0 ? (
            <div className="rounded-xs border border-dashed border-line py-3 text-center font-mono text-[11px] text-chalk-mute">
              未登记耗材
            </div>
          ) : (
            <div className="space-y-1.5">
              {consumables.map((c) => (
                <div key={c.consumableId} className="flex items-center gap-2">
                  <input
                    value={c.name}
                    onChange={(e) =>
                      updateConsumable(c.consumableId, { name: e.target.value })
                    }
                    placeholder="耗材名称"
                    className="h-8 min-w-0 flex-1 rounded-xs border border-line-soft bg-ink-850 px-2 text-xs text-chalk outline-none focus:border-teal/50"
                  />
                  <input
                    value={c.batchNo}
                    onChange={(e) =>
                      updateConsumable(c.consumableId, { batchNo: e.target.value })
                    }
                    placeholder="批号"
                    className="h-8 w-28 rounded-xs border border-line-soft bg-ink-850 px-2 font-mono text-xs text-chalk outline-none focus:border-teal/50"
                  />
                  <input
                    type="number"
                    min={1}
                    value={c.quantity}
                    onChange={(e) =>
                      updateConsumable(c.consumableId, {
                        quantity: Number(e.target.value) || 0,
                      })
                    }
                    className="h-8 w-14 rounded-xs border border-line-soft bg-ink-850 px-2 text-right font-mono text-xs text-chalk outline-none focus:border-teal/50"
                  />
                  <button
                    onClick={() => removeConsumable(c.consumableId)}
                    className="flex h-8 w-7 items-center justify-center rounded-xs text-chalk-mute hover:bg-bad/10 hover:text-bad"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contrast */}
        <div className="p-4">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-chalk-dim">
            <Beaker className="h-3.5 w-3.5 text-sterile" />
            造影剂用量
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <input
                value={contrast?.name ?? ""}
                onChange={(e) => updateContrast({ name: e.target.value })}
                placeholder="造影剂名称（如 碘海醇 350）"
                className="h-8 w-full rounded-xs border border-line-soft bg-ink-850 px-2 text-xs text-chalk outline-none focus:border-teal/50"
              />
            </div>
            <div className="relative">
              <input
                type="number"
                min={0}
                value={contrast?.dosageMl ?? ""}
                onChange={(e) =>
                  updateContrast({ dosageMl: Number(e.target.value) || 0 })
                }
                placeholder="用量"
                className="h-8 w-full rounded-xs border border-line-soft bg-ink-850 px-2 pr-8 text-right font-mono text-xs text-chalk outline-none focus:border-teal/50"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-chalk-mute">
                mL
              </span>
            </div>
            <input
              value={contrast?.concentration ?? ""}
              onChange={(e) => updateContrast({ concentration: e.target.value })}
              placeholder="浓度"
              className="h-8 w-full rounded-xs border border-line-soft bg-ink-850 px-2 font-mono text-xs text-chalk outline-none focus:border-teal/50"
            />
          </div>
        </div>

        {/* Remarks */}
        <div className="p-4">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-chalk-dim">
            <MessageSquarePlus className="h-3.5 w-3.5 text-sterile" />
            关键备注
          </div>
          {remarks.length > 0 && (
            <div className="mb-2 space-y-1.5">
              {remarks.map((r) => (
                <div
                  key={r.remarkId}
                  className="rounded-xs border border-line-soft bg-ink-850 p-2"
                >
                  <div className="mb-0.5 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-chalk">
                      {r.author}
                    </span>
                    <span className="font-mono text-[10px] text-chalk-mute">
                      {formatDateTime(r.timestamp).slice(5, 16)}
                    </span>
                  </div>
                  <div className="text-xs leading-relaxed text-chalk-dim">
                    {r.content}
                  </div>
                </div>
              ))}
            </div>
          )}
          <textarea
            value={remarkDraft}
            onChange={(e) => setRemarkDraft(e.target.value)}
            rows={2}
            placeholder="记录术中关键发现、突发情况、特殊处理…"
            className="w-full resize-none rounded-xs border border-line-soft bg-ink-850 p-2 text-xs text-chalk outline-none focus:border-teal/50"
          />
          <div className="mt-1.5 flex justify-end">
            <button
              onClick={() => {
                if (remarkDraft.trim()) {
                  void addRemark(remarkDraft);
                  setRemarkDraft("");
                }
              }}
              disabled={!remarkDraft.trim()}
              className="rounded-xs border border-teal/40 bg-teal/10 px-3 py-1 text-[11px] text-teal transition-colors hover:bg-teal/20 disabled:opacity-40"
            >
              添加备注 · {CURRENT_USER.technician.name}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
