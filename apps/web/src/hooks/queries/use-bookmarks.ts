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
    { previousBookmarks?: PaginatedResult<BookmarkWithEntryDto> }
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

      // Snapshot previous value for rollback on error
      const previousBookmarks = queryClient.getQueryData<
        PaginatedResult<BookmarkWithEntryDto>
      >(["bookmarks", "list", 0, 20]);

      // Optimistically update bookmark list
      if (isBookmarked && previousBookmarks) {
        // Remove bookmark from list
        queryClient.setQueryData<PaginatedResult<BookmarkWithEntryDto>>(
          ["bookmarks", "list", 0, 20],
          {
            ...previousBookmarks,
            items: previousBookmarks.items.filter(
              (bookmark) => bookmark.entry.id !== entryId
            ),
            pagination: previousBookmarks.pagination
              ? {
                  ...previousBookmarks.pagination,
                  totalElements: previousBookmarks.pagination.totalElements - 1,
                }
              : null,
          }
        );
      }

      return { previousBookmarks };
    },
    onError: (_error, _variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousBookmarks) {
        queryClient.setQueryData(
          ["bookmarks", "list", 0, 20],
          context.previousBookmarks
        );
      }
    },
    onSettled: () => {
      // Refetch bookmark list to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
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

  // Check all cached bookmark queries
  const bookmarkQueries = queryClient.getQueriesData<
    PaginatedResult<BookmarkWithEntryDto>
  >({
    queryKey: ["bookmarks", "list"],
  });

  for (const [, data] of bookmarkQueries) {
    if (data?.items) {
      const isBookmarked = data.items.some(
        (bookmark) => bookmark.entry.id === entryId
      );
      if (isBookmarked) {
        return true;
      }
    }
  }

  // If we have any bookmark data cached, and the entry wasn't found, it's not bookmarked
  if (bookmarkQueries.length > 0) {
    return false;
  }

  // No data cached yet - return undefined to indicate unknown state
  return undefined;
}
