import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getEntryBySlug } from "@/lib/api";
import { directoryEntrySchema } from "@/schemas/directoryEntrySchema";
import type { DirectoryEntry } from "@/types/directory";

/**
 * TanStack Query hook for fetching a single directory entry by slug.
 * Provides automatic caching, refetching, and loading states.
 *
 * @param slug - The unique slug identifier for the entry
 * @param options - Additional TanStack Query options
 * @returns Query result with data, loading, error states
 */
export function useDirectoryEntry(
  slug: string,
  options?: Omit<
    UseQueryOptions<DirectoryEntry | undefined, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<DirectoryEntry | undefined, Error>({
    queryKey: ["directory", "entry", slug],
    queryFn: async () => {
      const data = await getEntryBySlug(slug);

      if (!data) {
        return undefined;
      }

      // Runtime validation with Zod
      const validated = directoryEntrySchema.safeParse(data);

      if (!validated.success) {
        console.error(
          "Directory entry validation failed:",
          validated.error.format()
        );
        // Return data even if validation fails (graceful degradation)
        return data;
      }

      return validated.data as DirectoryEntry;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (individual entries change less frequently)
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled: !!slug, // Only run query if slug is provided
    ...options,
  });
}

/**
 * Prefetch a directory entry for improved perceived performance.
 * Useful for pre-loading data on hover or navigation hints.
 */
export function usePrefetchDirectoryEntry(queryClient: unknown, slug: string) {
  return () =>
    queryClient.prefetchQuery({
      queryKey: ["directory", "entry", slug],
      queryFn: () => getEntryBySlug(slug),
      staleTime: 10 * 60 * 1000,
    });
}
