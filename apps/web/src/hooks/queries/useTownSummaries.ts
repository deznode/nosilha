import { useQuery } from "@tanstack/react-query";

import { getTownStatusSummary } from "@/lib/api";
import { placeRecordPath, type SettlementOwned } from "@/lib/place-path";
import type { TownStatusSummary } from "@/types/town";

/**
 * The settlements, for client components that link to place records.
 *
 * A record's address is `/<town-slug>/<entry-slug>` (spec 034 FR-015), and a record
 * carries only its settlement's id, so a link needs this list to be built. Settlements
 * change rarely; one cached copy serves every link on the page.
 */
export function useTownSummaries({
  enabled = true,
}: { enabled?: boolean } = {}) {
  return useQuery<TownStatusSummary[], Error>({
    queryKey: ["towns", "status-summary"],
    queryFn: getTownStatusSummary,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled,
  });
}

/** Where a link goes when a record has no address of its own. */
export const UNADDRESSED_RECORD_HREF = "/settlements";

/**
 * A record's address for a link. Until the settlements load, and for a record no
 * settlement owns, the link goes to the settlements rather than to an address that
 * would answer 404.
 */
export function usePlaceRecordHref(entry: SettlementOwned & { slug: string }) {
  const { data: towns = [] } = useTownSummaries();
  return placeRecordPath(entry, towns) ?? UNADDRESSED_RECORD_HREF;
}
