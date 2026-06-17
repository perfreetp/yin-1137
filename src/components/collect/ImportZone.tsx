import { useRef, useState } from "react";
import { FileImage, Film, Layers, UploadCloud } from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import type { AssetType } from "@/types";

const IMPORT_OPTIONS: {
  type: AssetType;
  label: string;
  icon: typeof FileImage;
  accept: string;
}[] = [
  { type: "image", label: "导入图像", icon: FileImage, accept: "image/*" },
  { type: "video", label: "导入短视频", icon: Film, accept: "video/*" },
  { type: "sequence", label: "导入造影序列", icon: Layers, accept: ".dcm,.dicom" },
];

function inferType(file: File): AssetType {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "sequence";
}

export function ImportZone() {
  const importAssets = useStore((s) => s.importAssets);
  const selectedCaseId = useStore((s) => s.selectedCaseId);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingType, setPendingType] = useState<AssetType>("image");

  const handleFiles = (files: FileList | null, type?: AssetType) => {
    if (!files || !files.length || !selectedCaseId) return;
    const arr = Array.from(files);
    const resolvedType = type ?? inferType(arr[0]);
    void importAssets(arr, resolvedType);
  };

  const openPicker = (type: AssetType) => {
    setPendingType(type);
    const opt = IMPORT_OPTIONS.find((o) => o.type === type);
    if (inputRef.current) {
      inputRef.current.accept = opt?.accept ?? "*/*";
      inputRef.current.multiple = true;
      inputRef.current.click();
    }
  };

  return (
    <section className="rounded-md border border-line-soft bg-ink-875/60 p-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-md border border-dashed py-7 transition-all",
          dragging
            ? "border-teal bg-teal/10 shadow-glow"
            : "border-line bg-ink-850/50",
        )}
      >
        <div className="relative">
          <UploadCloud
            className={cn(
              "h-9 w-9 transition-colors",
              dragging ? "text-teal" : "text-chalk-mute",
            )}
            strokeWidth={1.5}
          />
          {dragging && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-teal animate-pulse-dot" />
          )}
        </div>
        <div className="mt-2 text-sm font-medium text-chalk">
          拖入术中影像 / 造影序列
        </div>
        <div className="mt-0.5 font-mono text-[11px] text-chalk-mute">
          支持 DSA · 超声 · 内镜截图 · 透视片段
        </div>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files, pendingType)}
        />
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-2">
        {IMPORT_OPTIONS.map((opt) => (
          <button
            key={opt.type}
            onClick={() => openPicker(opt.type)}
            className="flex items-center justify-center gap-1.5 rounded-xs border border-line-soft bg-ink-850 py-2 text-xs text-chalk-dim transition-all hover:border-teal/40 hover:bg-teal/8 hover:text-teal"
          >
            <opt.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            {opt.label}
          </button>
        ))}
      </div>
    </section>
  );
}
