import { Image as ImageIcon, Film, Layers } from "lucide-react";
import type { Asset } from "@/types";
import { ASSET_TYPE_META } from "@/lib/constants";
import { getThumb } from "@/lib/thumbnails";
import { cn } from "@/lib/utils";

interface AssetThumbProps {
  asset: Asset;
  className?: string;
}

const typeGradient: Record<Asset["type"], string> = {
  image: "from-teal-deep/40 via-ink-800 to-ink-900",
  video: "from-sky-900/40 via-ink-800 to-ink-900",
  sequence: "from-violet-900/40 via-ink-800 to-ink-900",
};

const typeIcon = {
  image: ImageIcon,
  video: Film,
  sequence: Layers,
};

export function AssetThumb({ asset, className }: AssetThumbProps) {
  const url = !asset.placeholder ? getThumb(asset.assetId) : undefined;
  const Icon = typeIcon[asset.type];

  if (url) {
    return (
      <div
        className={cn(
          "relative aspect-square overflow-hidden rounded-xs border border-line-soft bg-ink-900",
          className,
        )}
      >
        <img
          src={url}
          alt={asset.filename}
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
        <span className="absolute bottom-1 left-1 rounded-xs bg-ink-950/80 px-1.5 py-0.5 text-[9px] font-medium text-teal backdrop-blur-sm">
          {ASSET_TYPE_META[asset.type].label}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-xs border border-line-soft bg-gradient-to-br",
        typeGradient[asset.type],
        className,
      )}
    >
      <div className="scanlines absolute inset-0 opacity-40" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2">
        <Icon
          className={cn("h-6 w-6", ASSET_TYPE_META[asset.type].tone)}
          strokeWidth={1.5}
        />
        <span className="max-w-full truncate font-mono text-[9px] text-chalk-mute">
          {asset.type.toUpperCase()}
        </span>
      </div>
      {asset.type === "sequence" && (
        <div className="absolute left-0 right-0 top-1/3 h-px bg-teal/40 animate-scan" />
      )}
    </div>
  );
}
