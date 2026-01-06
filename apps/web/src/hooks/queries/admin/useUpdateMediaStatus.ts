/**
 * TanStack Query mutation hook for updating gallery media status.
 * Automatically invalidates related queries on success.
 * Replaces old admin media status updates with unified gallery moderation.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "./keys";
import { updateGalleryStatus } from "@/lib/api";
import type { UpdateGalleryStatusRequest } from "@/types/gallery";

interface UpdateGalleryMediaParams {
  id: string;
  request: UpdateGalleryStatusRequest;
}

/**
 * Mutation hook for updating gallery media moderation status.
 * Works with both user uploads and external media.
 * Invalidates all media queries and stats on success.
 */
export function useUpdateMediaStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: UpdateGalleryMediaParams) =>
      updateGalleryStatus(id, request),
    onSuccess: () => {
      // Invalidate ALL gallery queries (any page/size/status)
      queryClient.invalidateQueries({ queryKey: adminKeys.gallery.all() });
      // Also refresh stats since counts change
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}
