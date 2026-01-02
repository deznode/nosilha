/**
 * TanStack Query hook for fetching admin media queue.
 * Gracefully handles unimplemented backend endpoint by returning empty data.
 */

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { adminKeys } from "./keys";
import { getAdminMedia } from "@/lib/api";
import type {
  AdminQueueResponse,
  AdminMediaListItem,
  MediaStatus,
} from "@/types/admin";

/**
 * Hook for fetching admin media queue.
 * Note: Backend endpoint not yet implemented - returns empty data gracefully.
 *
 * @param page Page number (default: 0)
 * @param size Page size (default: 20)
 * @param status Filter by media status (optional)
 * @param options Additional TanStack Query options
 * @returns Query result with data, loading, error states
 */
export function useAdminMedia(
  page = 0,
  size = 20,
  status?: MediaStatus | "ALL",
  options?: Omit<
    UseQueryOptions<AdminQueueResponse<AdminMediaListItem>, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<AdminQueueResponse<AdminMediaListItem>, Error>({
    queryKey: adminKeys.media.list(page, size, status),
    queryFn: async () => {
      try {
        return await getAdminMedia(status, page, size);
      } catch (_error) {
        // Backend not implemented - return empty result matching AdminQueueResponse
        console.warn(
          "Admin media endpoint not implemented, returning empty data"
        );
        return {
          items: [],
          total: 0,
          page,
          pageSize: size,
          hasMore: false,
        };
      }
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if backend not implemented
    ...options,
  });
}
