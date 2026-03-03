/**
 * TanStack Query mutation hook for deleting directory entries.
 * Automatically invalidates related queries on success.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "./keys";
import { deleteDirectoryEntry } from "@/lib/api";

/**
 * Mutation hook for deleting a directory entry.
 * Invalidates all directory submissions queries and stats on success.
 */
export function useDeleteDirectoryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDirectoryEntry(id),
    onSuccess: () => {
      // Invalidate ALL directory queries (any page/size/status)
      queryClient.invalidateQueries({ queryKey: adminKeys.directory.all() });
      // Also refresh stats since counts change
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}
