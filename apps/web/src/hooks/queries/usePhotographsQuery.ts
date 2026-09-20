import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  photographQuery,
  type PhotographFilterKey,
  type ResolvedRegion,
} from "@/components/photographs/photographs-copy";
import { getGalleryMedia } from "@/lib/api";
import type { PublicGalleryMediaPageResponse } from "@/types/gallery";

/**
 * The photographs list. Spec 034 T-30.
 *
 * One page is deliberately large enough to hold the whole archive: it is 26 records,
 * and a masonry grid that pages would reflow every time a row arrived. The size is a
 * ceiling, not a pagination scheme; when the archive outgrows it this becomes an
 * infinite query.
 */
export const PHOTOGRAPHS_PAGE_SIZE = 60;

export function photographsQueryKey(
  filter: PhotographFilterKey,
  region: ResolvedRegion | null
) {
  return ["photographs", filter, region?.slug ?? null] as const;
}

export function photographsQueryFn(
  filter: PhotographFilterKey,
  region: ResolvedRegion | null
) {
  return () =>
    getGalleryMedia(photographQuery(filter, region, PHOTOGRAPHS_PAGE_SIZE));
}

export function usePhotographsQuery(
  filter: PhotographFilterKey,
  region: ResolvedRegion | null
) {
  const query = useQuery<PublicGalleryMediaPageResponse>({
    queryKey: photographsQueryKey(filter, region),
    queryFn: photographsQueryFn(filter, region),
    // Keeps the previous grid on screen while the next filter loads, so the page
    // does not collapse to an empty state and back.
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return {
    items: query.data?.items ?? [],
    totalItems: query.data?.totalItems ?? 0,
    isLoading: query.isLoading,
    isPlaceholderData: query.isPlaceholderData,
  };
}
