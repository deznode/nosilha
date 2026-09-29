/**
 * IndexedDB-backed draft store for the contribution flow.
 *
 * Used only on the Google sign-in path: before redirecting away, we save the
 * in-progress form (and the selected file) so it can be restored on return.
 * `localStorage` can't hold a `File`, and we store the file's bytes as an
 * `ArrayBuffer` rather than a `Blob` because of Safari's WebKitBlobResource
 * bug, which can make a persisted Blob unreadable after a redirect.
 */

export type ContributionKind = "photo" | "film";

export interface ContributionDraft {
  kind: ContributionKind;
  form: Record<string, unknown>;
  file: File | null;
  savedAt: number;
}

export interface DraftStore {
  /**
   * Verifies IndexedDB actually works by writing, reading back and deleting
   * a small ArrayBuffer under a dedicated key. Never throws — resolves
   * `false` when IndexedDB is missing, blocked or otherwise unusable (SSR,
   * private browsing, etc.).
   */
  probe(): Promise<boolean>;
  /**
   * Persists the draft. Callers are expected to have called `probe()` first;
   * `save` rejects with a clear Error if IndexedDB is unavailable or the
   * write fails.
   */
  save(draft: Omit<ContributionDraft, "savedAt">): Promise<void>;
  /**
   * Loads the saved draft, or `null` if there isn't one, it has expired, or
   * IndexedDB is unavailable. An expired draft is deleted as a side effect.
   * Never throws.
   */
  load(): Promise<ContributionDraft | null>;
  /** Deletes the saved draft, if any. Idempotent, never throws. */
  clear(): Promise<void>;
}

interface StoredFile {
  buffer: ArrayBuffer;
  name: string;
  type: string;
  lastModified: number;
}

interface StoredDraft {
  kind: ContributionKind;
  form: Record<string, unknown>;
  file: StoredFile | null;
  savedAt: number;
}

const DEFAULT_DB_NAME = "nosilha-contribute";
const DB_VERSION = 1;
const STORE_NAME = "drafts";
const DRAFT_KEY = "contribution-draft";
const PROBE_KEY = "contribution-draft-probe";
const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function hasIndexedDb(): boolean {
  return typeof indexedDB !== "undefined" && indexedDB !== null;
}

function toError(value: unknown, fallbackMessage: string): Error {
  if (value instanceof Error) return value;
  return new Error(fallbackMessage);
}

function openDatabase(dbName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDb()) {
      reject(new Error("IndexedDB is not available in this environment"));
      return;
    }

    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(dbName, DB_VERSION);
    } catch (error) {
      reject(toError(error, "Failed to open IndexedDB"));
      return;
    }

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onblocked = () => {
      reject(new Error("IndexedDB open request is blocked"));
    };
    request.onerror = () => {
      reject(toError(request.error, "Failed to open IndexedDB"));
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

/** Runs one request against the drafts store inside its own transaction. */
function runRequest<T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    let result: T;
    tx.onerror = () =>
      reject(toError(tx.error, "IndexedDB transaction failed"));
    tx.onabort = () =>
      reject(toError(tx.error, "IndexedDB transaction aborted"));
    tx.oncomplete = () => resolve(result);
    const request = run(tx.objectStore(STORE_NAME));
    request.onsuccess = () => {
      result = request.result;
    };
    // Request errors abort the transaction, which is handled above.
  });
}

// `instanceof ArrayBuffer` can fail here: IndexedDB's structured-clone step
// may hand back an ArrayBuffer created in a different realm than this
// module's (notably under jsdom), and instanceof checks the prototype
// chain, not the underlying type. Object.prototype.toString.call is
// realm-agnostic.
function isArrayBuffer(value: unknown): value is ArrayBuffer {
  return Object.prototype.toString.call(value) === "[object ArrayBuffer]";
}

function arrayBuffersEqual(a: ArrayBuffer, b: ArrayBuffer): boolean {
  if (a.byteLength !== b.byteLength) return false;
  const left = new Uint8Array(a);
  const right = new Uint8Array(b);
  for (let i = 0; i < left.length; i += 1) {
    if (left[i] !== right[i]) return false;
  }
  return true;
}

async function probeIndexedDb(dbName: string): Promise<boolean> {
  if (!hasIndexedDb()) return false;

  let db: IDBDatabase | undefined;
  try {
    db = await openDatabase(dbName);
    const probeBytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer;

    await runRequest(db, "readwrite", (store) =>
      store.put(probeBytes, PROBE_KEY)
    );
    const readBack = await runRequest<ArrayBuffer | undefined>(
      db,
      "readonly",
      (store) => store.get(PROBE_KEY)
    );
    await runRequest(db, "readwrite", (store) => store.delete(PROBE_KEY));

    return isArrayBuffer(readBack) && arrayBuffersEqual(readBack, probeBytes);
  } catch {
    return false;
  } finally {
    db?.close();
  }
}

async function saveDraft(
  dbName: string,
  now: () => number,
  draft: Omit<ContributionDraft, "savedAt">
): Promise<void> {
  if (!hasIndexedDb()) {
    throw new Error(
      "IndexedDB is not available; probe() should have been called before save()"
    );
  }

  let db: IDBDatabase | undefined;
  try {
    const storedFile: StoredFile | null = draft.file
      ? {
          buffer: await draft.file.arrayBuffer(),
          name: draft.file.name,
          type: draft.file.type,
          lastModified: draft.file.lastModified,
        }
      : null;

    const record: StoredDraft = {
      kind: draft.kind,
      form: draft.form as Record<string, unknown>,
      file: storedFile,
      savedAt: now(),
    };

    db = await openDatabase(dbName);
    await runRequest(db, "readwrite", (store) => store.put(record, DRAFT_KEY));
  } catch (error) {
    throw toError(error, "Failed to save contribution draft");
  } finally {
    db?.close();
  }
}

async function deleteDraftKey(db: IDBDatabase): Promise<void> {
  await runRequest(db, "readwrite", (store) => store.delete(DRAFT_KEY));
}

function storedFileToFile(stored: StoredFile): File {
  return new File([stored.buffer], stored.name, {
    type: stored.type,
    lastModified: stored.lastModified,
  });
}

async function loadDraft(
  dbName: string,
  maxAgeMs: number,
  now: () => number
): Promise<ContributionDraft | null> {
  if (!hasIndexedDb()) return null;

  let db: IDBDatabase | undefined;
  try {
    db = await openDatabase(dbName);
    const stored = await runRequest<StoredDraft | undefined>(
      db,
      "readonly",
      (store) => store.get(DRAFT_KEY)
    );
    if (!stored) return null;

    if (now() - stored.savedAt > maxAgeMs) {
      await deleteDraftKey(db);
      return null;
    }

    return {
      kind: stored.kind,
      form: stored.form,
      file: stored.file ? storedFileToFile(stored.file) : null,
      savedAt: stored.savedAt,
    };
  } catch {
    return null;
  } finally {
    db?.close();
  }
}

async function clearDraft(dbName: string): Promise<void> {
  if (!hasIndexedDb()) return;

  let db: IDBDatabase | undefined;
  try {
    db = await openDatabase(dbName);
    await deleteDraftKey(db);
  } catch {
    // clear() is best-effort and never throws.
  } finally {
    db?.close();
  }
}

export function createIndexedDbDraftStore(opts?: {
  dbName?: string;
  now?: () => number;
  maxAgeMs?: number;
}): DraftStore {
  const dbName = opts?.dbName ?? DEFAULT_DB_NAME;
  const now = opts?.now ?? (() => Date.now());
  const maxAgeMs = opts?.maxAgeMs ?? DEFAULT_MAX_AGE_MS;

  return {
    probe: () => probeIndexedDb(dbName),
    save: (draft) => saveDraft(dbName, now, draft),
    load: () => loadDraft(dbName, maxAgeMs, now),
    clear: () => clearDraft(dbName),
  };
}

export const contributionDraftStore: DraftStore = createIndexedDbDraftStore();
