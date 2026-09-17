/**
 * Where a place record lives. Spec 034 FR-015.
 *
 * A record's address is `/<town-slug>/<entry-slug>`, and the record page 404s when
 * the settlement in the URL does not own the record. Every link, the sitemap and the
 * legacy redirect build that address here, from the same ownership test the page
 * applies, so a link can never point at an address that answers 404.
 */

/** The fields of a record that decide its settlement. */
export interface SettlementOwned {
  townId?: string | null;
  town?: string | null;
}

/** The fields of a settlement a record address needs. */
export interface SettlementRef {
  id: string | null;
  slug: string;
  name: string;
}

/**
 * Whether this record belongs to this settlement.
 *
 * `townId` is the canonical answer; the name comparison is the fallback for records
 * whose settlement has not resolved yet, and it fails closed — a differently spelled
 * name owns nothing rather than giving the record an address that is not its own.
 */
export function belongsToSettlement(
  entry: SettlementOwned,
  town: SettlementRef
): boolean {
  if (entry.townId) return entry.townId === town.id;

  const name = entry.town?.trim().toLowerCase();
  return !!name && name === town.name.trim().toLowerCase();
}

/** The record's address, or null when no settlement in `towns` owns it. */
export function placeRecordPath(
  entry: SettlementOwned & { slug: string },
  towns: readonly SettlementRef[]
): string | null {
  const town = towns.find((candidate) => belongsToSettlement(entry, candidate));
  return town ? `/${town.slug}/${entry.slug}` : null;
}

/** Settlement id → slug, for screens that hold records with a `townId`. */
export function townSlugsById(
  towns: readonly SettlementRef[]
): Record<string, string> {
  return Object.fromEntries(
    towns.flatMap((town) => (town.id ? [[town.id, town.slug]] : []))
  );
}
