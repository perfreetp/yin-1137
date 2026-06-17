import type { DeviceType, Stage } from "@/types";

export const STAGES: Stage[] = [
  "术前",
  "穿刺",
  "造影",
  "支架释放",
  "术后复查",
];

export const STAGE_META: Record<
  Stage,
  { label: string; dot: string; chip: string; bar: string }
> = {
  术前: {
    label: "术前",
    dot: "bg-chalk-mute",
    chip: "border-ink-500 text-chalk-dim bg-ink-700/50",
    bar: "bg-slate-400",
  },
  穿刺: {
    label: "穿刺",
    dot: "bg-warn",
    chip: "border-warn/40 text-warn bg-warn/10",
    bar: "bg-warn",
  },
  造影: {
    label: "造影",
    dot: "bg-violet-400",
    chip: "border-violet-400/40 text-violet-300 bg-violet-400/10",
    bar: "bg-violet-400",
  },
  支架释放: {
    label: "支架释放",
    dot: "bg-teal",
    chip: "border-teal/40 text-teal bg-teal/10",
    bar: "bg-teal",
  },
  术后复查: {
    label: "术后复查",
    dot: "bg-sterile",
    chip: "border-sterile/40 text-sterile bg-sterile/10",
    bar: "bg-sterile",
  },
};

export const DEVICE_META: Record<
  DeviceType,
  { label: string; code: string; tone: string }
> = {
  DSA: {
    label: "DSA",
    code: "DSA",
    tone: "text-teal border-teal/30 bg-teal/10",
  },
  超声: {
    label: "超声",
    code: "US",
    tone: "text-sterile border-sterile/30 bg-sterile/10",
  },
  内镜: {
    label: "内镜",
    code: "ENDO",
    tone: "text-amber-300 border-amber-300/30 bg-amber-300/10",
  },
  透视: {
    label: "透视",
    code: "FL",
    tone: "text-violet-300 border-violet-300/30 bg-violet-300/10",
  },
};

export const ASSET_TYPE_META: Record<
  "image" | "video" | "sequence",
  { label: string; tone: string }
> = {
  image: { label: "图像", tone: "text-sterile" },
  video: { label: "视频", tone: "text-teal" },
  sequence: { label: "造影序列", tone: "text-violet-300" },
};

export const DEPARTMENTS = [
  "心血管内科",
  "神经内科",
  "血管外科",
  "介入放射科",
  "消化内科",
];

export const CURRENT_USER = {
  technician: { id: "T-2041", name: "周霖" },
  nurse: { id: "N-1187", name: "林晚" },
};
