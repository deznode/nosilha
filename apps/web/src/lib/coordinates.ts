/**
 * Coordinates as the archive prints them. Spec 034 FR-008, FR-010, FR-013.
 *
 * Four decimal places — about eleven metres, which is the honest precision for a
 * point read off a phone — and a true minus sign (U+2212) rather than a hyphen, so
 * the pair reads as a number in the mono face the design sets it in.
 */

const MINUS = "−";

export function formatCoordinate(value: number): string {
  const fixed = Math.abs(value).toFixed(4);
  return value < 0 ? `${MINUS}${fixed}` : fixed;
}

/** "14.8632, −24.7183", or null when either half is missing. */
export function formatCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined
): string | null {
  if (latitude == null || longitude == null) return null;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`;
}
