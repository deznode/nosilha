/**
 * TanStack Query hook for fetching admin gallery queue (unified media moderation).
 * Replaces the old admin media queue with unified gallery moderation.
 */

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { adminKeys } from "./keys";
import { getAdminGallery } from "@/lib/api";
import type { AdminQueueResponse } from "@/types/admin";
import type { GalleryMedia, GalleryMediaStatus } from "@/types/gallery";

/**
 * Hook for fetching admin gallery queue (unified media moderation).
 * Includes both user uploads and external media in a single queue.
 *
 * @param page Page number (default: 0)
 * @param size Page size (default: 20)
 * @param status Filter by gallery media status (optional)
 * @param options Additional TanStack Query options
 * @returns Query result with data, loading, error states
 */
export function useAdminMedia(
  page = 0,
  size = 20,
  status?: GalleryMediaStatus | "ALL",
  options?: Omit<
    UseQueryOptions<AdminQueueResponse<GalleryMedia>, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<AdminQueueResponse<GalleryMedia>, Error>({
    queryKey: adminKeys.gallery.list(page, size, status),
    queryFn: () => getAdminGallery(status, page, size),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    ...options,
  });
}
