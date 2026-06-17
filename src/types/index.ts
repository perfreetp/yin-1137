export type DeviceType = "DSA" | "超声" | "内镜" | "透视";
export type Stage = "术前" | "穿刺" | "造影" | "支架释放" | "术后复查";
export type AssetType = "image" | "video" | "sequence";
export type VerifierRole = "technician" | "nurse";

export interface Room {
  roomId: string;
  name: string;
  code: string;
  devices: DeviceType[];
}

export interface Surgeon {
  surgeonId: string;
  name: string;
  department: string;
}

export interface Case {
  caseId: string;
  patientName: string;
  hospitalizationNo: string;
  surgeryName: string;
  surgeonId: string;
  department: string;
  roomId: string;
  deviceType: DeviceType;
  startTime: string;
  archived: boolean;
}

export interface Asset {
  assetId: string;
  caseId: string;
  type: AssetType;
  stage: Stage | null;
  filename: string;
  sizeBytes: number;
  durationMs?: number;
  importedAt: string;
  blobKey: string;
  placeholder: boolean;
  stageSuggested?: boolean;
}

export interface Consumable {
  consumableId: string;
  caseId: string;
  name: string;
  batchNo: string;
  quantity: number;
}

export interface ContrastAgent {
  caseId: string;
  name: string;
  dosageMl: number;
  concentration: string;
}

export interface Remark {
  remarkId: string;
  caseId: string;
  content: string;
  author: string;
  timestamp: string;
}

export interface Verification {
  caseId: string;
  technicianId: string;
  technicianName: string;
  technicianAt: string | null;
  nurseId: string;
  nurseName: string;
  nurseAt: string | null;
  locked: boolean;
}

export interface ArchiveAssetSnapshot {
  assetId: string;
  filename: string;
  type: AssetType;
  stage: Stage | null;
  sizeBytes: number;
  durationMs?: number;
  importedAt: string;
  blobKey: string;
}

export interface ArchiveCaseSnapshot {
  patientName: string;
  hospitalizationNo: string;
  surgeryName: string;
  surgeonId: string;
  department: string;
  roomId: string;
  deviceType: string;
  startTime: string;
}

export interface ArchiveRecord {
  recordId: string;
  caseId: string;
  traceCode: string;
  version: number;
  archivedAt: string;
  archivedBy: string;
  assetCount: number;
  stageCoverage: string;
  stagesCovered: Stage[];
  patientName: string;
  hospitalizationNo: string;
  surgeryName: string;
  surgeonId: string;
  surgeonName: string;
  department: string;
  roomId: string;
  startTime: string;
  snapshot: {
    caseInfo: ArchiveCaseSnapshot;
    assets: ArchiveAssetSnapshot[];
    consumables: Consumable[];
    contrast: ContrastAgent | null;
    remarks: Remark[];
    verification: Verification | null;
  };
}

export interface ValidationIssue {
  id: string;
  level: "block" | "warn";
  category: "missing-info" | "duplicate" | "unmarked-stage" | "verification";
  message: string;
  detail?: string;
}

export interface ValidationResult {
  passed: boolean;
  issues: ValidationIssue[];
  stageCoverage: string;
  stagesCovered: Stage[];
  blockCount: number;
  warnCount: number;
}

export interface ArchiveQuery {
  dateFrom: string;
  dateTo: string;
  department: string;
  surgeonId: string;
  keyword: string;
}
