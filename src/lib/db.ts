import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type {
  ArchiveRecord,
  Asset,
  Case,
  Consumable,
  ContrastAgent,
  Remark,
  Room,
  Surgeon,
  Verification,
} from "@/types";

interface ArchiveDB extends DBSchema {
  rooms: { key: string; value: Room };
  surgeons: { key: string; value: Surgeon };
  cases: {
    key: string;
    value: Case;
    indexes: { "by-room": string; "by-archived": string };
  };
  assets: {
    key: string;
    value: Asset;
    indexes: { "by-case": string };
  };
  consumables: {
    key: string;
    value: Consumable;
    indexes: { "by-case": string };
  };
  contrast: { key: string; value: ContrastAgent };
  remarks: {
    key: string;
    value: Remark;
    indexes: { "by-case": string };
  };
  verifications: { key: string; value: Verification };
  archiveRecords: { key: string; value: ArchiveRecord };
  blobs: { key: string; value: Blob };
}

const DB_NAME = "intraop-archive";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ArchiveDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<ArchiveDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ArchiveDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("rooms")) {
          db.createObjectStore("rooms", { keyPath: "roomId" });
        }
        if (!db.objectStoreNames.contains("surgeons")) {
          db.createObjectStore("surgeons", { keyPath: "surgeonId" });
        }
        if (!db.objectStoreNames.contains("cases")) {
          const s = db.createObjectStore("cases", { keyPath: "caseId" });
          s.createIndex("by-room", "roomId");
          s.createIndex("by-archived", "archived");
        }
        if (!db.objectStoreNames.contains("assets")) {
          const s = db.createObjectStore("assets", { keyPath: "assetId" });
          s.createIndex("by-case", "caseId");
        }
        if (!db.objectStoreNames.contains("consumables")) {
          const s = db.createObjectStore("consumables", {
            keyPath: "consumableId",
          });
          s.createIndex("by-case", "caseId");
        }
        if (!db.objectStoreNames.contains("contrast")) {
          db.createObjectStore("contrast", { keyPath: "caseId" });
        }
        if (!db.objectStoreNames.contains("remarks")) {
          const s = db.createObjectStore("remarks", { keyPath: "remarkId" });
          s.createIndex("by-case", "caseId");
        }
        if (!db.objectStoreNames.contains("verifications")) {
          db.createObjectStore("verifications", { keyPath: "caseId" });
        }
        if (!db.objectStoreNames.contains("archiveRecords")) {
          db.createObjectStore("archiveRecords", { keyPath: "recordId" });
        }
        if (!db.objectStoreNames.contains("blobs")) {
          db.createObjectStore("blobs");
        }
      },
    });
  }
  return dbPromise;
}

type AnyDB = {
  transaction(
    storeName: string,
    mode?: IDBTransactionMode,
  ): { store: { put(value: unknown): Promise<unknown> }; done: Promise<void> };
  put(storeName: string, value: unknown): Promise<unknown>;
  get(storeName: string, key: IDBValidKey): Promise<unknown>;
  getAll(storeName: string): Promise<unknown[]>;
  getAllFromIndex(
    storeName: string,
    indexName: string,
    query?: IDBValidKey | IDBKeyRange | null,
  ): Promise<unknown[]>;
  delete(storeName: string, key: IDBValidKey): Promise<void>;
  clear(storeName: string): Promise<void>;
};

async function loose(): Promise<AnyDB> {
  return (await getDB()) as unknown as AnyDB;
}

export async function putAll<T>(store: string, items: T[]) {
  const db = await loose();
  const tx = db.transaction(store, "readwrite");
  await Promise.all(items.map((i) => tx.store.put(i)));
  await tx.done;
}

export async function putItem<T>(store: string, item: T) {
  const db = await loose();
  await db.put(store, item);
}

export async function getAll<T>(store: string): Promise<T[]> {
  const db = await loose();
  return (await db.getAll(store)) as unknown as T[];
}

export async function getItem<T>(store: string, key: string): Promise<T | undefined> {
  const db = await loose();
  return (await db.get(store, key)) as unknown as T | undefined;
}

export async function getByIndex<T>(
  store: string,
  index: string,
  value: string,
): Promise<T[]> {
  const db = await loose();
  return (await db.getAllFromIndex(store, index, value)) as unknown as T[];
}

export async function deleteItem(store: string, key: string) {
  const db = await loose();
  await db.delete(store, key);
}

export async function clearStore(store: string) {
  const db = await loose();
  await db.clear(store);
}
