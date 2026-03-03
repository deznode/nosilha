/**
 * Admin Gallery Query Hook
 *
 * TanStack Query hook for fetching the unified gallery moderation queue
 * (user uploads + external media).
 *
 * @see docs/STATE_MANAGEMENT.md for TanStack Query patterns
 */

import { useQuery } from "@tanstack/react-query";
import { getAdminGallery } from "@/lib/api";
import { adminKeys } from "./keys";
import type { GalleryMediaStatus } from "@/types/gallery";

interface UseAdminGalleryOptions {
  status?: GalleryMediaStatus | "ALL";
  page?: number;
  size?: number;
}

/**
 * Hook for fetching the admin gallery moderation queue.
 *
 * Returns both user-uploaded media and admin-curated external content
 * in a unified, type-safe response.
 *
 * @param options Query parameters (status, page, size)
 * @returns TanStack Query result with AdminQueueResponse<GalleryMedia>
 */
export function useAdminGallery({
  status = "ALL",
  page = 0,
  size = 20,
}: UseAdminGalleryOptions = {}) {
  return useQuery({
    queryKey: adminKeys.gallery.list(page, size, status),
    queryFn: () => getAdminGallery(status, page, size),
    staleTime: 30000, // 30 seconds - admin data changes frequently
  });
}
