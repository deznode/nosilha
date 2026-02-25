import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { getApiClient } from "@/lib/api-factory";
import type { BookmarkDto, BookmarkWithEntryDto } from "@/types/bookmark";
import type { PaginatedResult } from "@/lib/api-contracts";

/**
 * TanStack Query hook for fetching user's bookmarked entries.
 * Only fetches when user is authenticated.
 *
 * **Authentication Required**: Uses JWT token from Supabase session.
 *
 * @param page - Page number (0-indexed, default: 0)
 * @param size - Page size (default: 20)
 * @param options - Additional TanStack Query options
 * @returns Query result with paginated bookmarks, loading, and error states
 */
export function useBookmarks(
  page: number = 0,
  size: number = 20,
  options?: Omit<
    UseQueryOptions<PaginatedResult<BookmarkWithEntryDto>, Error>,
    "queryKey" | "queryFn"
  >
) {
  const { session } = useAuth();
  const apiClient = getApiClient();

  return useQuery<PaginatedResult<BookmarkWithEntryDto>, Error>({
    queryKey: ["bookmarks", "list", page, size],
    queryFn: async () => {
      return apiClient.getBookmarks(page, size);
    },
    staleTime: 1 * 60 * 1000, // 1 minute - user's own data should be relatively fresh
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!session, // Only fetch when user is authenticated
    ...options,
  });
}

/**
 * TanStack Query mutation hook for toggling bookmark state.
 * Handles both creating and deleting bookmarks based on current state.
 * Implements optimistic updates for instant UI feedback.
 *
 * **Authentication Required**: Uses JWT token from Supabase session.
 *
 * **Usage**:
 * ```tsx
 * const toggleBookmark = useToggleBookmark();
 * toggleBookmark.mutate({
 *   entryId: "entry-uuid",
 *   isBookmarked: false, // Will create bookmark
 * });
 * ```
 *
 * @returns Mutation result with mutate function and loading/error states
 */
export function useToggleBookmark() {
  const queryClient = useQueryClient();
  const apiClient = getApiClient();

  return useMutation<
    BookmarkDto | void,
    Error,
    { entryId: string; isBookmarked: boolean },
    {
      previousQueries?: [
        queryKey: readonly unknown[],
        data: PaginatedResult<BookmarkWithEntryDto> | undefined,
      ][];
    }
  >({
    mutationFn: async ({ entryId, isBookmarked }) => {
      if (isBookmarked) {
        // Remove bookmark
        await apiClient.deleteBookmark(entryId);
      } else {
        // Create bookmark
        return apiClient.createBookmark(entryId);
      }
    },
    onMutate: async ({ entryId, isBookmarked }) => {
      // Cancel outgoing refetches to prevent optimistic update from being overwritten
      await queryClient.cancelQueries({ queryKey: ["bookmarks"] });

      // Snapshot all bookmark query caches for rollback on error
      const previousQueries = queryClient.getQueriesData<
        PaginatedResult<BookmarkWithEntryDto>
      >({ queryKey: ["bookmarks", "list"] });

      // Optimistically update all cached bookmark pages
      if (isBookmarked) {
        for (const [queryKey, data] of previousQueries) {
          if (data) {
            queryClient.setQueryData<PaginatedResult<BookmarkWithEntryDto>>(
              queryKey,
              {
                ...data,
                items: data.items.filter(
                  (bookmark) => bookmark.entry.id !== entryId
                ),
                pagination: data.pagination
                  ? {
                      ...data.pagination,
                      totalElements: data.pagination.totalElements - 1,
                    }
                  : null,
              }
            );
          }
        }
      }

      return { previousQueries };
    },
    onError: (_error, _variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      // Refetch bookmark list to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}

/**
 * Prefetches all user bookmarks to populate the TanStack Query cache.
 * This ensures `useIsBookmarked()` works correctly on pages that display
 * multiple directory entries (like the directory listing page).
 *
 * **Usage**: Call this hook at the top level of any page that displays
 * directory cards with bookmark buttons.
 *
 * @example
 * ```tsx
 * function DirectoryPage() {
 *   useBookmarksPrefetch(); // Prefetch bookmarks for authenticated users
 *   return <DirectoryList entries={entries} />;
 * }
 * ```
 */
export function useBookmarksPrefetch() {
  const { session } = useAuth();

  // Fetch all bookmarks to populate cache (max 100 per user)
  // Uses longer staleTime since bookmarks don't change frequently
  useBookmarks(0, 100, {
    enabled: !!session,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to check if a specific entry is bookmarked.
 * Checks the cached bookmark list without making an API call.
 *
 * @param entryId - UUID of the directory entry to check
 * @returns Boolean indicating if the entry is bookmarked (undefined if not loaded)
 */
export function useIsBookmarked(entryId: string): boolean | undefined {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  if (!session) {
    return false;
  }

  const bookmarkQueries = queryClient.getQueriesData<
    PaginatedResult<BookmarkWithEntryDto>
  >({
    queryKey: ["bookmarks", "list"],
  });

  // No data cached yet - return undefined to indicate unknown state
  if (bookmarkQueries.length === 0) {
    return undefined;
  }

  // Check if entry exists in any cached bookmark query
  return bookmarkQueries.some(([, data]) =>
    data?.items?.some((bookmark) => bookmark.entry.id === entryId)
  );
}
