/**
 * TanStack Query mutation hook for updating story status.
 * Automatically invalidates related queries on success.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "./keys";
import { updateStoryStatus } from "@/lib/api";

interface UpdateStoryParams {
  id: string;
  action: "APPROVE" | "REJECT" | "FLAG";
  notes?: string;
}

/**
 * Mutation hook for updating story status.
 * Invalidates all stories queries and stats on success.
 */
export function useUpdateStoryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action, notes }: UpdateStoryParams) =>
      updateStoryStatus(id, action, notes),
    onSuccess: () => {
      // Invalidate ALL stories queries (any page/size/status)
      queryClient.invalidateQueries({ queryKey: adminKeys.stories.all() });
      // Also refresh stats since counts change
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}
