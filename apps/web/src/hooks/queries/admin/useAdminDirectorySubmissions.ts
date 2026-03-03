/**
 * TanStack Query hook for fetching admin directory submissions.
 * Provides automatic caching, refetching, and loading states with status filtering.
 */

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { adminKeys } from "./keys";
import { getDirectorySubmissions } from "@/lib/api";
import {
  adminQueueResponseSchema,
  directorySubmissionSchema,
} from "@/schemas/adminSchemas";
import type { AdminQueueResponse, DirectorySubmission } from "@/types/admin";
import type { SubmissionStatus } from "@/types/story";

/**
 * Hook for fetching admin directory submissions.
 * @param page Page number (default: 0)
 * @param size Page size (default: 20)
 * @param status Filter by submission status (optional)
 * @param options Additional TanStack Query options
 * @returns Query result with data, loading, error states
 */
export function useAdminDirectorySubmissions(
  page = 0,
  size = 20,
  status?: SubmissionStatus | "ALL",
  options?: Omit<
    UseQueryOptions<AdminQueueResponse<DirectorySubmission>, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<AdminQueueResponse<DirectorySubmission>, Error>({
    queryKey: adminKeys.directory.list(page, size, status),
    queryFn: async () => {
      const result = await getDirectorySubmissions(status, page, size);

      // Runtime validation with Zod (safeParse - doesn't throw)
      const validated = adminQueueResponseSchema(
        directorySubmissionSchema
      ).safeParse(result);
      if (!validated.success) {
        console.error(
          "Admin directory submissions validation failed:",
          validated.error.format()
        );
        return result; // Return unvalidated if validation fails
      }
      return validated.data as AdminQueueResponse<DirectorySubmission>;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}
