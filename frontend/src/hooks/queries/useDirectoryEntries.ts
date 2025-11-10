import { useQuery, UseQueryOptions, QueryClient } from "@tanstack/react-query";
import { getEntriesByCategory } from "@/lib/api";
import { directoryEntriesSchema } from "@/schemas/directoryEntrySchema";
import type { DirectoryEntry } from "@/types/directory";

/**
 * TanStack Query hook for fetching directory entries with runtime validation.
 * Provides automatic caching, refetching, and loading states.
 *
 * @param category - The category to fetch ('all', 'Restaurant', 'Hotel', 'Beach', 'Landmark')
 * @param page - Page number (default: 0)
 * @param size - Page size (default: 20)
 * @param options - Additional TanStack Query options
 * @returns Query result with data, loading, error states
 */
export function useDirectoryEntries(
  category: string = "all",
  page: number = 0,
  size: number = 20,
  options?: Omit<
    UseQueryOptions<DirectoryEntry[], Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<DirectoryEntry[], Error>({
    queryKey: ["directory", "entries", category, page, size],
    queryFn: async () => {
      const data = await getEntriesByCategory(category, page, size);

      // Runtime validation with Zod
      const validated = directoryEntriesSchema.safeParse(data);

      if (!validated.success) {
        console.error(
          "Directory entries validation failed:",
          validated.error.format()
        );
        // Return data even if validation fails (graceful degradation)
        // In production, you might want to throw or handle differently
        return data;
      }

      return validated.data as DirectoryEntry[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    ...options,
  });
}

/**
 * Prefetch directory entries for improved perceived performance.
 * Useful for pre-loading data on hover or navigation hints.
 */
export function usePrefetchDirectoryEntries(
  queryClient: QueryClient,
  category: string = "all",
  page: number = 0,
  size: number = 20
) {
  return () =>
    queryClient.prefetchQuery({
      queryKey: ["directory", "entries", category, page, size],
      queryFn: () => getEntriesByCategory(category, page, size),
      staleTime: 5 * 60 * 1000,
    });
}
