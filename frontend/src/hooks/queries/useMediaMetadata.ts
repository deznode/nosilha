import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import {
  mediaMetadataListSchema,
  type MediaMetadata,
} from "@/schemas/mediaMetadataSchema";

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
    UseQueryOptions<MediaMetadata[], Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<MediaMetadata[], Error>({
    queryKey: ["media", "metadata", entryId],
    queryFn: async () => {
      // TODO: Replace with actual API call when media metadata endpoint is available
      // For now, this is a placeholder implementation
      const response = await fetch(`/api/media/${entryId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch media metadata");
      }

      const data = await response.json();

      // Runtime validation with Zod
      const validated = mediaMetadataListSchema.safeParse(data);

      if (!validated.success) {
        console.error(
          "Media metadata validation failed:",
          validated.error.format()
        );
        // Return empty array if validation fails
        return [];
      }

      return validated.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes (media metadata changes infrequently)
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled: !!entryId, // Only run query if entryId is provided
    ...options,
  });
}
