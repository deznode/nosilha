/**
 * TanStack Query mutation hooks for managing contact messages.
 * Automatically invalidates related queries on success.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "./keys";
import { updateContactMessageStatus, deleteContactMessage } from "@/lib/api";
import type { ContactMessageStatus } from "@/types/admin";

interface UpdateMessageParams {
  id: string;
  status: ContactMessageStatus;
}

/**
 * Mutation hook for updating contact message status.
 * Invalidates all messages queries and stats on success.
 */
export function useUpdateMessageStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: UpdateMessageParams) =>
      updateContactMessageStatus(id, status),
    onSuccess: () => {
      // Invalidate ALL messages queries (any page/size/status)
      queryClient.invalidateQueries({ queryKey: adminKeys.messages.all() });
      // Also refresh stats since counts change
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}

/**
 * Mutation hook for deleting a contact message.
 * Invalidates all messages queries and stats on success.
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteContactMessage(id),
    onSuccess: () => {
      // Invalidate ALL messages queries (any page/size/status)
      queryClient.invalidateQueries({ queryKey: adminKeys.messages.all() });
      // Also refresh stats since counts change
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}
