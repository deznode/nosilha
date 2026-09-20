/**
 * The one theme-resolution rule, shared by first paint and the hydrated render.
 *
 * Spec 034 FR-001: light is the default, and dark is the `.dark` class on the root.
 * Before this, the pre-hydration script read a `theme` localStorage key that nothing
 * wrote — `uiStore` persists to `ui-storage` as JSON — so a stored choice was ignored
 * at first paint and the OS preference won instead.
 *
 * `resolveInitialTheme` is deliberately self-contained: `app/layout.tsx` inlines its
 * own source with `.toString()`, so the rule cannot be duplicated into a string and
 * then drift from the hook that reads it after hydration.
 */

/** The localStorage key zustand's persist middleware writes `uiStore` to. */
export const THEME_STORAGE_KEY = "ui-storage";

/** A stored theme choice, or anything else, which counts as no choice. */
export type StoredTheme = string | null | undefined;

/**
 * The resolution rule, for callers that already hold the stored choice:
 * `useResolvedTheme` after hydration, and `ThemeSync` when it applies the class.
 *
 * `resolveInitialTheme` below repeats this rather than calling it, because an inline
 * script cannot import a module and its source is injected verbatim. The two are
 * pinned together by the agreement table in `use-resolved-theme.test.ts`.
 */
export function resolveTheme(
  theme: StoredTheme,
  prefersDark: boolean
): "light" | "dark" {
  if (theme === "dark") return "dark";
  if (theme === "system") return prefersDark ? "dark" : "light";
  return "light";
}

/**
 * Decides whether the first paint is light or dark.
 *
 * @param rawStoredState The raw `ui-storage` string, or null when there is none
 * @param prefersDark Whether the OS asks for a dark colour scheme
 * @returns `"dark"` only for a stored dark choice, or a stored system choice on a
 *   dark OS. Everything else — no value, unreadable JSON, an unrecognised theme —
 *   is light. The OS preference never decides on its own, because light is the
 *   default rather than a fallback.
 */
export function resolveInitialTheme(
  rawStoredState: string | null,
  prefersDark: boolean
): "light" | "dark" {
  let theme = null;

  try {
    if (rawStoredState) {
      const parsed = JSON.parse(rawStoredState);
      theme = parsed && parsed.state ? parsed.state.theme : null;
    }
  } catch {
    theme = null;
  }

  if (theme === "dark") return "dark";
  if (theme === "system") return prefersDark ? "dark" : "light";
  return "light";
}

/**
 * The pre-hydration script, as a string for `app/layout.tsx` to inline.
 *
 * It invokes {@link resolveInitialTheme} as a **function expression** rather than by
 * name. Calling it by name worked in development and threw
 * `ReferenceError: resolveInitialTheme is not defined` in every production build: SWC
 * minifies the injected declaration to `function j(a,b)`, while a call site written
 * inside this template literal is opaque to the minifier and kept the old name. The
 * result was a white flash on every page load for anyone who had chosen dark — the
 * exact thing the script exists to prevent.
 */
export function buildThemeInitScript(): string {
  return `(function () {
  var raw = null;
  try {
    raw = window.localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
  } catch (e) {
    // Storage unavailable (private mode, blocked site data) — light
    raw = null;
  }
  var prefersDark = false;
  try {
    prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (e) {
    prefersDark = false;
  }
  if ((${resolveInitialTheme.toString()})(raw, prefersDark) === 'dark') {
    document.documentElement.classList.add('dark');
  }
})();`;
}
