/**
 * Admin AI Status Query Hook
 *
 * TanStack Query hook for batch-fetching AI processing status
 * for gallery media items.
 *
 * @see docs/STATE_MANAGEMENT.md for TanStack Query patterns
 */

import { useQuery } from "@tanstack/react-query";
import { getAiStatus } from "@/lib/api";
import { adminKeys } from "./keys";

/**
 * Hook for batch-fetching AI processing status for multiple media items.
 *
 * Only fetches when mediaIds is non-empty (enabled guard).
 * Uses sorted mediaIds in query key for stable caching regardless
 * of input order.
 *
 * @param mediaIds Array of gallery media IDs to check
 * @returns TanStack Query result with AiStatusResponse[]
 */
export function useAiStatus(mediaIds: string[]) {
  return useQuery({
    queryKey: adminKeys.aiReview.status(mediaIds),
    queryFn: () => getAiStatus(mediaIds),
    enabled: mediaIds.length > 0,
    staleTime: 30000, // 30 seconds
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const hasActiveRuns = data.some(
        (s) => s.lastRunStatus === "PROCESSING" || s.lastRunStatus === "PENDING"
      );
      return hasActiveRuns ? 3000 : false;
    },
  });
}
