/**
 * TanStack Query mutation hook for updating directory entries.
 * Automatically invalidates related queries on success.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "./keys";
import { updateDirectoryEntry } from "@/lib/api";
import type { UpdateDirectoryEntryRequest } from "@/lib/api-contracts";

interface UpdateDirectoryEntryParams {
  id: string;
  data: UpdateDirectoryEntryRequest;
}

/**
 * Mutation hook for updating a directory entry.
 * Invalidates all directory submissions queries and stats on success.
 */
export function useUpdateDirectoryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateDirectoryEntryParams) =>
      updateDirectoryEntry(id, data),
    onSuccess: () => {
      // Invalidate ALL directory queries (any page/size/status)
      queryClient.invalidateQueries({ queryKey: adminKeys.directory.all() });
      // Also refresh stats since directory data changed
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}
