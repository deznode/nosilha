/**
 * TanStack Query mutation hook for updating gallery media metadata.
 * Automatically invalidates related queries on success.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "./keys";
import { updateGalleryMedia } from "@/lib/api";
import type { UpdateGalleryMediaRequest } from "@/types/gallery";

interface UpdateGalleryMediaParams {
  id: string;
  data: UpdateGalleryMediaRequest;
}

/**
 * Mutation hook for updating gallery media metadata.
 * Invalidates all gallery queries and stats on success.
 */
export function useUpdateGalleryMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateGalleryMediaParams) =>
      updateGalleryMedia(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.gallery.all() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}
