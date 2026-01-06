/**
 * Admin Gallery Moderation Mutation Hook
 *
 * TanStack Query mutation hook for updating gallery media moderation status.
 *
 * @see docs/STATE_MANAGEMENT.md for TanStack Query patterns
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGalleryStatus } from "@/lib/api";
import { adminKeys } from "./keys";
import type { UpdateGalleryStatusRequest } from "@/types/gallery";

interface UpdateGalleryStatusVariables {
  id: string;
  request: UpdateGalleryStatusRequest;
}

/**
 * Hook for updating gallery media moderation status.
 *
 * Supports APPROVE, FLAG, and REJECT actions for both user uploads
 * and external media.
 *
 * Automatically invalidates the gallery query cache on success.
 *
 * @returns TanStack Query mutation result
 */
export function useUpdateGalleryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: UpdateGalleryStatusVariables) =>
      updateGalleryStatus(id, request),
    onSuccess: () => {
      // Invalidate all gallery queries to refresh the list
      queryClient.invalidateQueries({ queryKey: adminKeys.gallery.all() });
      // Also invalidate stats to update pending counts
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}
