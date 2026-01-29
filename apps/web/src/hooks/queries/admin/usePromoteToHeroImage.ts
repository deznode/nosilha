/**
 * Admin Hero Image Promotion Mutation Hook
 *
 * TanStack Query mutation hook for promoting a gallery image to hero image.
 *
 * @see docs/STATE_MANAGEMENT.md for TanStack Query patterns
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { promoteToHeroImage } from "@/lib/api";
import { adminKeys } from "./keys";

/**
 * Hook for promoting a gallery image to become the hero image for a directory entry.
 *
 * This action publishes an event that updates the directory entry's imageUrl
 * to the gallery media's publicUrl.
 *
 * Prerequisites:
 * - Media must be a user upload (not external media)
 * - Media must have ACTIVE status (already approved)
 * - Media must be linked to a directory entry (entryId not null)
 * - Media must have a public URL
 *
 * Automatically invalidates the gallery query cache on success.
 *
 * @returns TanStack Query mutation result
 */
export function usePromoteToHeroImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mediaId: string) => promoteToHeroImage(mediaId),
    onSuccess: () => {
      // Invalidate gallery queries to refresh the list
      queryClient.invalidateQueries({ queryKey: adminKeys.gallery.all() });
      // Invalidate directory entries since the hero image may have changed
      queryClient.invalidateQueries({ queryKey: ["directory"] });
    },
  });
}
