import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getMediaByEntry } from "@/lib/api";
import type { MediaMetadataDto } from "@/types/api";

/**
 * TanStack Query hook for fetching media metadata for a directory entry.
 * Provides automatic caching, refetching, and loading states.
 *
 * @param entryId - The directory entry's unique identifier
 * @param options - Additional TanStack Query options
 * @returns Query result with data, loading, error states
 */
export function useMediaMetadata(
  entryId: string | undefined,
  options?: Omit<
    UseQueryOptions<MediaMetadataDto[], Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<MediaMetadataDto[], Error>({
    queryKey: ["media", "metadata", entryId],
    queryFn: async () => {
      if (!entryId) return [];
      return getMediaByEntry(entryId);
    },
    staleTime: 15 * 60 * 1000, // 15 minutes (media metadata changes infrequently)
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled: !!entryId, // Only run query if entryId is provided
    ...options,
  });
}
