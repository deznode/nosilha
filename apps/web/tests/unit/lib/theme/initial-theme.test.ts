import { describe, expect, it } from "vitest";

import {
  THEME_STORAGE_KEY,
  buildThemeInitScript,
  resolveInitialTheme,
} from "@/lib/theme/initial-theme";

/**
 * Spec 034 T-42 / FR-001 — light is the default, and dark is the `.dark` class.
 *
 * This is the one place the rule lives. The pre-hydration script in `app/layout.tsx`
 * inlines this function's own source, so what it decides at first paint and what
 * `useResolvedTheme` decides after hydration cannot drift apart.
 */

/** A persisted `ui-storage` payload, as zustand's persist middleware writes it. */
function stored(theme: string): string {
  return JSON.stringify({
    state: { theme, sidebarCollapsed: false },
    version: 0,
  });
}

describe("resolveInitialTheme", () => {
  describe("with nothing usable in storage", () => {
    it.each([
      ["no stored value", null],
      ["malformed JSON", "{not json"],
      ["valid JSON with no state", JSON.stringify({ version: 0 })],
      ["valid JSON with no theme", JSON.stringify({ state: {}, version: 0 })],
      ["an unrecognised theme", stored("sepia")],
    ])("renders light for %s, even when the OS prefers dark", (_label, raw) => {
      expect(resolveInitialTheme(raw, true)).toBe("light");
      expect(resolveInitialTheme(raw, false)).toBe("light");
    });
  });

  describe("with a stored choice", () => {
    it("honours a stored dark choice whatever the OS prefers", () => {
      expect(resolveInitialTheme(stored("dark"), false)).toBe("dark");
      expect(resolveInitialTheme(stored("dark"), true)).toBe("dark");
    });

    it("honours a stored light choice whatever the OS prefers", () => {
      expect(resolveInitialTheme(stored("light"), true)).toBe("light");
      expect(resolveInitialTheme(stored("light"), false)).toBe("light");
    });

    it("follows the OS only for a stored system choice", () => {
      expect(resolveInitialTheme(stored("system"), true)).toBe("dark");
      expect(resolveInitialTheme(stored("system"), false)).toBe("light");
    });
  });

  it("reads the key zustand's persist middleware actually writes", () => {
    expect(THEME_STORAGE_KEY).toBe("ui-storage");
  });

  it("is self-contained, so its source can be inlined in the document head", () => {
    const source = resolveInitialTheme.toString();

    // A reference to anything outside the function body would be undefined in the
    // inline script, which is exactly the bug this task removes.
    expect(source).not.toMatch(/\bTHEME_STORAGE_KEY\b/);
    expect(source).not.toMatch(/\brequire\(|\bimport\(/);
  });

  it("is self-contained, so its source can be inlined in the document head", () => {
    const source = resolveInitialTheme.toString();

    // A reference to anything outside the function body would be undefined in the
    // inline script, which is exactly the bug this task removes.
    expect(source).not.toMatch(/\bTHEME_STORAGE_KEY\b/);
    expect(source).not.toMatch(/\brequire\(|\bimport\(/);
  });
});

/**
 * The script is executed here rather than inspected, because the bug it once carried
 * was invisible to any assertion about its text: it called the injected function by
 * name, and SWC renamed that function in production builds only.
 */
describe("buildThemeInitScript", () => {
  /** Runs the script against a fake document and returns whether `.dark` was set. */
  function run(
    script: string,
    { stored, prefersDark }: { stored: string | null; prefersDark: boolean }
  ): boolean {
    const classes = new Set<string>();
    const fakeWindow = {
      localStorage: { getItem: () => stored },
      matchMedia: () => ({ matches: prefersDark }),
    };
    const fakeDocument = {
      documentElement: { classList: { add: (c: string) => classes.add(c) } },
    };

    new Function("window", "document", script)(fakeWindow, fakeDocument);
    return classes.has("dark");
  }

  const persisted = (theme: string) => JSON.stringify({ state: { theme } });

  it.each([
    ["nothing stored on a dark OS", null, true, false],
    ["nothing stored on a light OS", null, false, false],
    ["a stored dark choice on a light OS", persisted("dark"), false, true],
    ["a stored light choice on a dark OS", persisted("light"), true, false],
    ["a stored system choice on a dark OS", persisted("system"), true, true],
    ["a stored system choice on a light OS", persisted("system"), false, false],
    ["malformed JSON on a dark OS", "{not json", true, false],
  ])("sets dark=%s → %s", (_label, stored, prefersDark, expected) => {
    expect(run(buildThemeInitScript(), { stored, prefersDark })).toBe(expected);
  });

  it("survives the function being renamed, as a minifier renames it", () => {
    // SWC rewrites the injected declaration to `function j(a,b)`. The script must
    // not depend on the name, so renaming every occurrence must change nothing.
    const renamed = buildThemeInitScript().replace(/resolveInitialTheme/g, "j");

    expect(
      run(renamed, { stored: persisted("dark"), prefersDark: false })
    ).toBe(true);
    expect(run(renamed, { stored: null, prefersDark: true })).toBe(false);
  });

  it("reads storage through a guard, so blocked site data still renders light", () => {
    const classes = new Set<string>();
    const throwingWindow = {
      localStorage: {
        getItem: () => {
          throw new Error("The operation is insecure.");
        },
      },
      matchMedia: () => ({ matches: true }),
    };
    const fakeDocument = {
      documentElement: { classList: { add: (c: string) => classes.add(c) } },
    };

    expect(() =>
      new Function("window", "document", buildThemeInitScript())(
        throwingWindow,
        fakeDocument
      )
    ).not.toThrow();
    expect(classes.has("dark")).toBe(false);
  });
});
