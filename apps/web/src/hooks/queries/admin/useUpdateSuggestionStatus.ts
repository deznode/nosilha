/**
 * TanStack Query mutation hook for updating suggestion status.
 * Automatically invalidates related queries on success.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "./keys";
import { updateSuggestionStatus } from "@/lib/api";

interface UpdateSuggestionParams {
  id: string;
  action: "APPROVE" | "REJECT";
}

/**
 * Mutation hook for updating suggestion status.
 * Invalidates all suggestions queries and stats on success.
 */
export function useUpdateSuggestionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: UpdateSuggestionParams) =>
      updateSuggestionStatus(id, action),
    onSuccess: () => {
      // Invalidate ALL suggestions queries (any page/size/status)
      queryClient.invalidateQueries({ queryKey: adminKeys.suggestions.all() });
      // Also refresh stats since counts change
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}
