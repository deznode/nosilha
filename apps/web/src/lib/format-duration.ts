/**
 * Converts a duration in seconds to a human-readable string.
 *
 * - Under an hour: "M:SS" (e.g., "4:32")
 * - An hour or more: "H:MM:SS" (e.g., "1:02:15")
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}
