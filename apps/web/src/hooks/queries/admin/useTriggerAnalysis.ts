/**
 * AI Analysis Trigger Mutation Hooks
 *
 * TanStack Query mutation hooks for triggering single and batch AI analysis
 * on gallery media items.
 *
 * @see docs/STATE_MANAGEMENT.md for TanStack Query patterns
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { triggerAnalysis, triggerBatchAnalysis } from "@/lib/api";
import { invalidateAiCaches } from "./keys";
import type {
  AnalysisTriggerResponse,
  AnalyzeBatchRequest,
  BatchAnalysisTriggerResponse,
} from "@/types/ai";

/**
 * Hook for triggering AI analysis on a single media item.
 *
 * Invalidates AI review, gallery, and system caches on success.
 */
export function useTriggerAnalysis() {
  const queryClient = useQueryClient();

  return useMutation<AnalysisTriggerResponse, Error, string>({
    mutationFn: (mediaId: string) => triggerAnalysis(mediaId),
    onSuccess: () => invalidateAiCaches(queryClient),
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
    onSuccess: () => invalidateAiCaches(queryClient),
  });
}
