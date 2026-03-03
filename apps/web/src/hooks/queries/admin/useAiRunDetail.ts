/**
 * Admin AI Run Detail Query Hook
 *
 * TanStack Query hook for fetching detailed AI analysis run data.
 *
 * @see docs/STATE_MANAGEMENT.md for TanStack Query patterns
 */

import { useQuery } from "@tanstack/react-query";
import { getAiRunDetail } from "@/lib/api";
import { adminKeys } from "./keys";

/**
 * Hook for fetching detailed AI analysis run data for moderator review.
 *
 * Only fetches when runId is provided (enabled guard).
 *
 * @param runId Analysis run ID (null/undefined disables the query)
 * @returns TanStack Query result with AnalysisRunDetail
 */
export function useAiRunDetail(runId: string | null | undefined) {
  return useQuery({
    queryKey: adminKeys.aiReview.detail(runId!),
    queryFn: () => getAiRunDetail(runId!),
    enabled: !!runId,
  });
}
