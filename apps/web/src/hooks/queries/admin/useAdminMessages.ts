/**
 * TanStack Query hook for fetching admin contact messages.
 * Provides automatic caching, refetching, and loading states with status filtering.
 */

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { adminKeys } from "./keys";
import { getContactMessages } from "@/lib/api";
import {
  adminQueueResponseSchema,
  contactMessageSchema,
} from "@/schemas/adminSchemas";
import type {
  AdminQueueResponse,
  ContactMessage,
  ContactMessageStatus,
} from "@/types/admin";

/**
 * Hook for fetching admin contact messages.
 * @param page Page number (default: 0)
 * @param size Page size (default: 20)
 * @param status Filter by message status (optional)
 * @param options Additional TanStack Query options
 * @returns Query result with data, loading, error states
 */
export function useAdminMessages(
  page = 0,
  size = 20,
  status?: ContactMessageStatus,
  options?: Omit<
    UseQueryOptions<AdminQueueResponse<ContactMessage>, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<AdminQueueResponse<ContactMessage>, Error>({
    queryKey: adminKeys.messages.list(page, size, status),
    queryFn: async () => {
      const result = await getContactMessages(status, page, size);

      // Runtime validation with Zod (safeParse - doesn't throw)
      const validated =
        adminQueueResponseSchema(contactMessageSchema).safeParse(result);
      if (!validated.success) {
        console.error(
          "Admin messages validation failed:",
          validated.error.format()
        );
        return result; // Return unvalidated if validation fails
      }
      return validated.data as AdminQueueResponse<ContactMessage>;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}
