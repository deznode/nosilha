/**
 * What the photograph screens remember between visits. Spec 038 FR-026 and the index
 * scroll restore.
 *
 * Storage can be missing or throw (private windows, blocked site data), so every read
 * and write is guarded and falls back to the default.
 */

export const PANEL_KEY = "nosilha.viewer.panel";
const SCROLL_KEY_PREFIX = "nosilha.photographs.scroll:";
/** A position older than this belongs to an earlier visit, not a trip to one photo. */
export const SCROLL_MAX_AGE_MS = 30 * 60 * 1000;

/** Whether the viewer's details panel is open. Defaults to open. */
export function readPanelOpen(): boolean {
  try {
    const value = window.localStorage.getItem(PANEL_KEY);
    return value === null ? true : value === "1";
  } catch {
    return true;
  }
}

export function writePanelOpen(open: boolean): void {
  try {
    window.localStorage.setItem(PANEL_KEY, open ? "1" : "0");
  } catch {
    // Remembering is a convenience; the panel still toggles.
  }
}

/** The index's scroll position for a place filter, saved before opening a photo. */
export function saveIndexScroll(place: string, y: number): void {
  try {
    window.sessionStorage.setItem(
      SCROLL_KEY_PREFIX + place,
      JSON.stringify({ y: Math.round(y), at: Date.now() })
    );
  } catch {
    // Returning to the top is the fallback.
  }
}

/**
 * The saved position for a place filter, read once: it is cleared as it is read, and
 * ignored once it is older than {@link SCROLL_MAX_AGE_MS}.
 */
export function takeIndexScroll(place: string): number | null {
  try {
    const key = SCROLL_KEY_PREFIX + place;
    const value = window.sessionStorage.getItem(key);
    if (value === null) return null;
    window.sessionStorage.removeItem(key);
    const { y, at } = JSON.parse(value) as { y?: unknown; at?: unknown };
    if (typeof y !== "number" || typeof at !== "number") return null;
    if (Date.now() - at > SCROLL_MAX_AGE_MS) return null;
    return y;
  } catch {
    return null;
  }
}
