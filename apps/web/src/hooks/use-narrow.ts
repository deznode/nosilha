"use client";

import { useMediaQuery } from "@/lib/hooks/use-media-query";

/** The handoff's single breakpoint. Spec 034 FR-012. */
export const NARROW_QUERY = "(max-width: 860px)";

/**
 * Whether the narrow layout applies.
 *
 * The map's bottom sheet, the lifted legend and the stacked photo detail change
 * structure, not just styling, so the breakpoint drives rendering from a `matchMedia`
 * listener rather than CSS. False on the server.
 */
export function useNarrow(query: string = NARROW_QUERY): boolean {
  return useMediaQuery(query);
}
