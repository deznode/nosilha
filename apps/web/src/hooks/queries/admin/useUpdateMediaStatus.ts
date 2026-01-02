/**
 * TanStack Query mutation hook for updating media status.
 * Automatically invalidates related queries on success.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "./keys";
import { updateMediaStatus } from "@/lib/api";
import type { UpdateMediaStatusRequest } from "@/types/admin";

interface UpdateMediaParams {
  id: string;
  request: UpdateMediaStatusRequest;
}

/**
 * Mutation hook for updating media moderation status.
 * Invalidates all media queries and stats on success.
 */
export function useUpdateMediaStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: UpdateMediaParams) =>
      updateMediaStatus(id, request),
    onSuccess: () => {
      // Invalidate ALL media queries (any page/size/status)
      queryClient.invalidateQueries({ queryKey: adminKeys.media.all() });
      // Also refresh stats since counts change
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}
