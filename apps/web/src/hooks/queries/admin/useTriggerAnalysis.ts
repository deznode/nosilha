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
import { adminKeys, invalidateAiCaches } from "./keys";
import type {
  AiStatusResponse,
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
    onMutate: async (mediaId) => {
      await queryClient.cancelQueries({
        queryKey: adminKeys.aiReview.all(),
        predicate: (query) => query.queryKey.includes("status"),
      });
      queryClient.setQueriesData<AiStatusResponse[]>(
        {
          queryKey: adminKeys.aiReview.all(),
          predicate: (query) => query.queryKey.includes("status"),
        },
        (old) =>
          old?.map((s) =>
            s.mediaId === mediaId ? { ...s, lastRunStatus: "PROCESSING" } : s
          )
      );
    },
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
    onMutate: async (request) => {
      await queryClient.cancelQueries({
        queryKey: adminKeys.aiReview.all(),
        predicate: (query) => query.queryKey.includes("status"),
      });
      const mediaIdSet = new Set(request.mediaIds);
      queryClient.setQueriesData<AiStatusResponse[]>(
        {
          queryKey: adminKeys.aiReview.all(),
          predicate: (query) => query.queryKey.includes("status"),
        },
        (old) =>
          old?.map((s) =>
            mediaIdSet.has(s.mediaId)
              ? { ...s, lastRunStatus: "PROCESSING" }
              : s
          )
      );
    },
    onSuccess: () => invalidateAiCaches(queryClient),
  });
}
