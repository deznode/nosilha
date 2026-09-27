import { afterEach, describe, expect, it, vi } from "vitest";

import {
  PANEL_KEY,
  SCROLL_MAX_AGE_MS,
  readPanelOpen,
  saveIndexScroll,
  takeIndexScroll,
  writePanelOpen,
} from "@/lib/viewer-storage";

/** Spec 038 FR-026 — panel memory and index scroll, tolerant of storage errors. */
describe("viewer-storage", () => {
  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("defaults the panel to open and round-trips the flag", () => {
    expect(readPanelOpen()).toBe(true);
    writePanelOpen(false);
    expect(window.localStorage.getItem(PANEL_KEY)).toBe("0");
    expect(readPanelOpen()).toBe(false);
    writePanelOpen(true);
    expect(readPanelOpen()).toBe(true);
  });

  it("reads and clears the scroll position per place", () => {
    saveIndexScroll("nova-sintra", 812.4);
    expect(takeIndexScroll("all")).toBeNull();
    expect(takeIndexScroll("nova-sintra")).toBe(812);
    expect(takeIndexScroll("nova-sintra")).toBeNull();
  });

  it("ignores a position from an earlier visit", () => {
    const now = Date.now();
    const spy = vi.spyOn(Date, "now").mockReturnValue(now);
    saveIndexScroll("all", 400);
    spy.mockReturnValue(now + SCROLL_MAX_AGE_MS + 1);
    expect(takeIndexScroll("all")).toBeNull();
    spy.mockRestore();
  });

  it("tolerates storage that throws", () => {
    const throwing = () => {
      throw new Error("blocked");
    };
    const blocked = {
      getItem: throwing,
      setItem: throwing,
      removeItem: throwing,
    };
    // The storage globals are own properties here; spying on Storage.prototype
    // does not reach them.
    const local = Object.getOwnPropertyDescriptor(window, "localStorage");
    const session = Object.getOwnPropertyDescriptor(window, "sessionStorage");
    Object.defineProperty(window, "localStorage", {
      value: blocked,
      configurable: true,
    });
    Object.defineProperty(window, "sessionStorage", {
      value: blocked,
      configurable: true,
    });
    try {
      expect(readPanelOpen()).toBe(true);
      expect(() => writePanelOpen(false)).not.toThrow();
      expect(() => saveIndexScroll("all", 10)).not.toThrow();
      expect(takeIndexScroll("all")).toBeNull();
    } finally {
      if (local) Object.defineProperty(window, "localStorage", local);
      if (session) Object.defineProperty(window, "sessionStorage", session);
    }
  });
});
