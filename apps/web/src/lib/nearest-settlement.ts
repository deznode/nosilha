/**
 * The settlement a photograph was taken near. Spec 038 FR-003.
 *
 * Distance is Euclidean in degrees, exactly as the handoff's prototype measures it:
 * at Brava's latitude a degree of longitude is ~3% shorter than a degree of latitude,
 * which is well inside the threshold's own imprecision. 0.02° is about 2 km.
 *
 * Computed in the browser-facing data layer from the public photo coordinates and the
 * public settlement list, so the gallery module never has to depend on places.
 */

export const NEAREST_SETTLEMENT_THRESHOLD = 0.02;

export interface SettlementPoint {
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
}

/**
 * The closest settlement strictly within `threshold` degrees, or null. A tie keeps
 * the settlement listed first, so the answer is stable for a given list.
 */
export function nearestSettlement<S extends SettlementPoint>(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
  settlements: readonly S[],
  threshold: number = NEAREST_SETTLEMENT_THRESHOLD
): S | null {
  if (latitude == null || longitude == null) return null;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  let best: S | null = null;
  let bestDistance = Infinity;
  for (const settlement of settlements) {
    const distance = Math.hypot(
      settlement.latitude - latitude,
      settlement.longitude - longitude
    );
    if (distance < bestDistance) {
      best = settlement;
      bestDistance = distance;
    }
  }

  return best && bestDistance < threshold ? best : null;
}
