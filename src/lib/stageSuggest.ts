import type { AssetType, DeviceType, Stage } from "@/types";
import { STAGES } from "@/lib/constants";

const KEYWORD_MAP: Array<{ keywords: string[]; stage: Stage }> = [
  { keywords: ["术前", "pre", "PRE", "术前"], stage: "术前" },
  { keywords: ["穿刺", "puncture", "穿刺", "needle"], stage: "穿刺" },
  { keywords: ["造影", "angiogram", "angio", "DSA", "dsa", "路图", "roadmap", "造影剂"], stage: "造影" },
  { keywords: ["支架", "stent", "释放", "deploy", "支架释放"], stage: "支架释放" },
  { keywords: ["术后", "post", "复查", "final", "FINAL", "术后复查"], stage: "术后复查" },
];

export function suggestStage(
  filename: string,
  type: AssetType,
  device: DeviceType | string,
  index: number,
  total: number,
): Stage | null {
  const name = filename.toLowerCase();

  for (const entry of KEYWORD_MAP) {
    for (const kw of entry.keywords) {
      if (name.includes(kw.toLowerCase())) {
        return entry.stage;
      }
    }
  }

  if (device === "DSA") {
    if (type === "sequence") return "造影";
  } else if (device === "超声") {
    if (type === "image" || type === "video") return "造影";
  } else if (device === "内镜") {
    if (type === "image") return "穿刺";
  } else if (device === "透视") {
    if (type === "video" || type === "sequence") return "支架释放";
  }

  if (total > 1) {
    const ratio = index / Math.max(total - 1, 1);
    if (ratio < 0.15) return "术前";
    if (ratio < 0.35) return "穿刺";
    if (ratio < 0.65) return "造影";
    if (ratio < 0.85) return "支架释放";
    return "术后复查";
  }

  return null;
}

export function stageConfidence(
  filename: string,
  type: AssetType,
  device: DeviceType | string,
): "high" | "medium" | "low" {
  const name = filename.toLowerCase();
  for (const entry of KEYWORD_MAP) {
    for (const kw of entry.keywords) {
      if (name.includes(kw.toLowerCase())) return "high";
    }
  }
  if (device === "DSA" && type === "sequence") return "medium";
  if (device === "超声" && (type === "image" || type === "video")) return "medium";
  return "low";
}
