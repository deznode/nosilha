/**
 * TanStack Query hook for fetching admin suggestions queue.
 * Provides automatic caching, refetching, and loading states with status filtering.
 */

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { adminKeys } from "./keys";
import { getSuggestionsForAdmin } from "@/lib/api";
import {
  adminQueueResponseSchema,
  suggestionSchema,
} from "@/schemas/adminSchemas";
import type { AdminQueueResponse, Suggestion } from "@/types/admin";
import type { SubmissionStatus } from "@/types/story";

/**
 * Hook for fetching admin suggestions queue.
 * @param page Page number (default: 0)
 * @param size Page size (default: 20)
 * @param status Filter by submission status (optional)
 * @param options Additional TanStack Query options
 * @returns Query result with data, loading, error states
 */
export function useAdminSuggestions(
  page = 0,
  size = 20,
  status?: SubmissionStatus | "ALL",
  options?: Omit<
    UseQueryOptions<AdminQueueResponse<Suggestion>, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<AdminQueueResponse<Suggestion>, Error>({
    queryKey: adminKeys.suggestions.list(page, size, status),
    queryFn: async () => {
      const result = await getSuggestionsForAdmin(status, page, size);

      // Runtime validation with Zod (safeParse - doesn't throw)
      const validated =
        adminQueueResponseSchema(suggestionSchema).safeParse(result);
      if (!validated.success) {
        console.error(
          "Admin suggestions validation failed:",
          validated.error.format()
        );
        return result; // Return unvalidated if validation fails
      }
      return validated.data as AdminQueueResponse<Suggestion>;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}
