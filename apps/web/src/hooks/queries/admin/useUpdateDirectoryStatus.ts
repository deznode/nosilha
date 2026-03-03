/**
 * TanStack Query mutation hook for updating directory submission status.
 * Automatically invalidates related queries on success.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "./keys";
import { updateDirectorySubmissionStatus } from "@/lib/api";
import type { SubmissionStatus } from "@/types/story";

interface UpdateDirectoryParams {
  id: string;
  status: SubmissionStatus;
  notes?: string;
}

/**
 * Mutation hook for updating directory submission status.
 * Invalidates all directory submissions queries and stats on success.
 */
export function useUpdateDirectoryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, notes }: UpdateDirectoryParams) =>
      updateDirectorySubmissionStatus(id, status, notes),
    onSuccess: () => {
      // Invalidate ALL directory queries (any page/size/status)
      queryClient.invalidateQueries({ queryKey: adminKeys.directory.all() });
      // Also refresh stats since counts change
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}
