/**
 * TanStack Query hook for fetching admin stories queue.
 * Provides automatic caching, refetching, and loading states with status filtering.
 */

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { adminKeys } from "./keys";
import { getStoriesForAdmin } from "@/lib/api";
import type { AdminQueueResponse } from "@/types/admin";
import type { StorySubmission, SubmissionStatus } from "@/types/story";

/**
 * Hook for fetching admin stories queue.
 * @param page Page number (default: 0)
 * @param size Page size (default: 20)
 * @param status Filter by submission status (optional)
 * @param options Additional TanStack Query options
 * @returns Query result with data, loading, error states
 */
export function useAdminStories(
  page = 0,
  size = 20,
  status?: SubmissionStatus | "ALL",
  options?: Omit<
    UseQueryOptions<AdminQueueResponse<StorySubmission>, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<AdminQueueResponse<StorySubmission>, Error>({
    queryKey: adminKeys.stories.list(page, size, status),
    queryFn: () => getStoriesForAdmin(status, page, size),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}
