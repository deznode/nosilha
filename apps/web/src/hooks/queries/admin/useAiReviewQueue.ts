/**
 * Admin AI Review Queue Query Hook
 *
 * TanStack Query hook for fetching AI analysis runs pending admin review.
 *
 * @see docs/STATE_MANAGEMENT.md for TanStack Query patterns
 */

import { useQuery } from "@tanstack/react-query";
import { getAiReviewQueue } from "@/lib/api";
import { adminKeys } from "./keys";

interface UseAiReviewQueueOptions {
  page?: number;
  size?: number;
}

/**
 * Hook for fetching the admin AI review queue.
 *
 * Returns paginated analysis run summaries with AI-generated content
 * pending moderator review.
 *
 * @param options Query parameters (page, size)
 * @returns TanStack Query result with AdminQueueResponse<AnalysisRunSummary>
 */
export function useAiReviewQueue({
  page = 0,
  size = 20,
}: UseAiReviewQueueOptions = {}) {
  return useQuery({
    queryKey: adminKeys.aiReview.list(page, size),
    queryFn: () => getAiReviewQueue(page, size),
    staleTime: 30000, // 30 seconds - admin data changes frequently
  });
}
