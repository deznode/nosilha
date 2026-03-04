/**
 * TanStack Query mutation hook for updating EXIF metadata on gallery media.
 * Automatically invalidates related queries on success.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "./keys";
import { updateExif } from "@/lib/api";
import type { UpdateExifRequest } from "@/types/gallery";

interface UpdateExifParams {
  mediaId: string;
  data: UpdateExifRequest;
}

/**
 * Mutation hook for updating EXIF metadata on user-uploaded gallery media.
 * Invalidates all gallery queries and stats on success.
 */
export function useUpdateExif() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mediaId, data }: UpdateExifParams) =>
      updateExif(mediaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.gallery.all() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}
