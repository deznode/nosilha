/**
 * AI Analysis Trigger Mutation Hooks
 *
 * TanStack Query mutation hooks for triggering single and batch AI analysis
 * on gallery media items.
 *
 * @see docs/STATE_MANAGEMENT.md for TanStack Query patterns
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { triggerAnalysis, triggerBatchAnalysis } from "@/lib/api";
import { adminKeys } from "./keys";
import type {
  AnalysisTriggerResponse,
  AnalyzeBatchRequest,
  BatchAnalysisTriggerResponse,
} from "@/types/ai";

/**
 * Invalidates AI review, gallery, and system caches after a trigger action.
 */
function invalidateAfterTrigger(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: adminKeys.aiReview.all() });
  queryClient.invalidateQueries({ queryKey: adminKeys.gallery.all() });
  queryClient.invalidateQueries({ queryKey: adminKeys.system.all() });
}

/**
 * Hook for triggering AI analysis on a single media item.
 *
 * Invalidates AI review, gallery, and system caches on success.
 */
export function useTriggerAnalysis() {
  const queryClient = useQueryClient();

  return useMutation<AnalysisTriggerResponse, Error, string>({
    mutationFn: (mediaId: string) => triggerAnalysis(mediaId),
    onSuccess: () => invalidateAfterTrigger(queryClient),
  });
}

/**
 * Hook for triggering AI analysis on multiple media items in batch.
 *
 * Invalidates AI review, gallery, and system caches on success.
 */
export function useTriggerBatchAnalysis() {
  const queryClient = useQueryClient();

  return useMutation<BatchAnalysisTriggerResponse, Error, AnalyzeBatchRequest>({
    mutationFn: (request: AnalyzeBatchRequest) => triggerBatchAnalysis(request),
    onSuccess: () => invalidateAfterTrigger(queryClient),
  });
}
