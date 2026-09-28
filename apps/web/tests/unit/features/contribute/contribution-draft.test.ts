import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createIndexedDbDraftStore } from "@/features/contribute/lib/contribution-draft";

let dbCounter = 0;
function uniqueDbName(): string {
  dbCounter += 1;
  return `test-contribution-draft-${dbCounter}`;
}

describe("createIndexedDbDraftStore", () => {
  describe("probe", () => {
    it("writes, reads back and deletes a small ArrayBuffer, resolving true", async () => {
      const store = createIndexedDbDraftStore({ dbName: uniqueDbName() });

      await expect(store.probe()).resolves.toBe(true);
    });

    it("resolves false when indexedDB is missing", async () => {
      const original = globalThis.indexedDB;
      // @ts-expect-error - simulating SSR / an environment with no IndexedDB
      delete globalThis.indexedDB;

      try {
        const store = createIndexedDbDraftStore({ dbName: uniqueDbName() });
        await expect(store.probe()).resolves.toBe(false);
      } finally {
        globalThis.indexedDB = original;
      }
    });

    it("resolves false when opening the database throws", async () => {
      const openSpy = vi
        .spyOn(globalThis.indexedDB, "open")
        .mockImplementation(() => {
          throw new Error("boom");
        });

      try {
        const store = createIndexedDbDraftStore({ dbName: uniqueDbName() });
        await expect(store.probe()).resolves.toBe(false);
      } finally {
        openSpy.mockRestore();
      }
    });
  });

  describe("save / load", () => {
    it("round-trips a draft, rebuilding the File from its bytes", async () => {
      const store = createIndexedDbDraftStore({ dbName: uniqueDbName() });
      const file = new File(["hello brava"], "photo.jpg", {
        type: "image/jpeg",
        lastModified: 1700000000000,
      });
      const form = { caption: "A sunset over Furna" };

      await store.save({ kind: "photo", form, file });
      const loaded = await store.load();

      expect(loaded).not.toBeNull();
      expect(loaded?.kind).toBe("photo");
      expect(loaded?.form).toEqual(form);
      expect(loaded?.file).toBeInstanceOf(File);
      expect(loaded?.file?.name).toBe("photo.jpg");
      expect(loaded?.file?.type).toBe("image/jpeg");
      expect(loaded?.file?.lastModified).toBe(1700000000000);
      await expect(loaded?.file?.text()).resolves.toBe("hello brava");
    });

    it("round-trips a draft with no file", async () => {
      const store = createIndexedDbDraftStore({ dbName: uniqueDbName() });

      await store.save({
        kind: "film",
        form: { title: "Festa de Nhô São" },
        file: null,
      });
      const loaded = await store.load();

      expect(loaded?.kind).toBe("film");
      expect(loaded?.form).toEqual({ title: "Festa de Nhô São" });
      expect(loaded?.file).toBeNull();
    });

    it("resolves null when nothing has been saved", async () => {
      const store = createIndexedDbDraftStore({ dbName: uniqueDbName() });

      await expect(store.load()).resolves.toBeNull();
    });

    it("rejects with a clear Error when indexedDB is missing", async () => {
      const original = globalThis.indexedDB;
      // @ts-expect-error - simulating SSR / an environment with no IndexedDB
      delete globalThis.indexedDB;

      try {
        const store = createIndexedDbDraftStore({ dbName: uniqueDbName() });
        await expect(
          store.save({ kind: "photo", form: {}, file: null })
        ).rejects.toThrow(/IndexedDB/i);
      } finally {
        globalThis.indexedDB = original;
      }
    });
  });

  describe("expiry", () => {
    // Only Date is faked: fake-indexeddb schedules its internal request
    // callbacks via setImmediate, so faking timers wholesale would deadlock
    // every await below.
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["Date"] });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("treats a draft older than 24h as absent and deletes it", async () => {
      vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
      const store = createIndexedDbDraftStore({ dbName: uniqueDbName() });
      await store.save({ kind: "photo", form: { note: "old" }, file: null });

      vi.setSystemTime(new Date("2026-01-02T00:00:01.000Z")); // 24h + 1s later

      await expect(store.load()).resolves.toBeNull();
      // The expired record was deleted as a side effect.
      await expect(store.load()).resolves.toBeNull();
    });

    it("still returns a draft saved just under 24h ago", async () => {
      vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
      const store = createIndexedDbDraftStore({ dbName: uniqueDbName() });
      await store.save({ kind: "photo", form: { note: "fresh" }, file: null });

      vi.setSystemTime(new Date("2026-01-01T23:59:59.000Z"));

      await expect(store.load()).resolves.toMatchObject({
        kind: "photo",
        form: { note: "fresh" },
      });
    });
  });

  describe("clear", () => {
    it("removes a saved draft", async () => {
      const store = createIndexedDbDraftStore({ dbName: uniqueDbName() });
      await store.save({ kind: "photo", form: {}, file: null });

      await store.clear();

      await expect(store.load()).resolves.toBeNull();
    });

    it("is idempotent when there is nothing to clear", async () => {
      const store = createIndexedDbDraftStore({ dbName: uniqueDbName() });

      await expect(store.clear()).resolves.toBeUndefined();
      await expect(store.clear()).resolves.toBeUndefined();
    });

    it("never throws when indexedDB is missing", async () => {
      const original = globalThis.indexedDB;
      // @ts-expect-error - simulating SSR / an environment with no IndexedDB
      delete globalThis.indexedDB;

      try {
        const store = createIndexedDbDraftStore({ dbName: uniqueDbName() });
        await expect(store.clear()).resolves.toBeUndefined();
      } finally {
        globalThis.indexedDB = original;
      }
    });
  });
});
