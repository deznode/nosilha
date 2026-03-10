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
import type { QueryKey } from "@tanstack/react-query";
import type {
  AiStatusResponse,
  AnalysisTriggerResponse,
  AnalyzeBatchRequest,
  BatchAnalysisTriggerResponse,
} from "@/types/ai";

type AiStatusSnapshot = {
  snapshot: [QueryKey, AiStatusResponse[] | undefined][];
};

/**
 * Hook for triggering AI analysis on a single media item.
 *
 * Invalidates AI review, gallery, and system caches on success.
 */
export function useTriggerAnalysis() {
  const queryClient = useQueryClient();

  const queryFilter = {
    queryKey: adminKeys.aiReview.all(),
    predicate: (query: { queryKey: readonly unknown[] }) =>
      query.queryKey.includes("status"),
  };

  return useMutation<AnalysisTriggerResponse, Error, string, AiStatusSnapshot>({
    mutationFn: (mediaId: string) => triggerAnalysis(mediaId),
    onMutate: async (mediaId) => {
      await queryClient.cancelQueries(queryFilter);
      const snapshot =
        queryClient.getQueriesData<AiStatusResponse[]>(queryFilter);
      queryClient.setQueriesData<AiStatusResponse[]>(queryFilter, (old) =>
        old?.map((s) =>
          s.mediaId === mediaId ? { ...s, lastRunStatus: "PROCESSING" } : s
        )
      );
      return { snapshot };
    },
    onError: (_err, _mediaId, context) => {
      context?.snapshot?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
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

  const queryFilter = {
    queryKey: adminKeys.aiReview.all(),
    predicate: (query: { queryKey: readonly unknown[] }) =>
      query.queryKey.includes("status"),
  };

  return useMutation<
    BatchAnalysisTriggerResponse,
    Error,
    AnalyzeBatchRequest,
    AiStatusSnapshot
  >({
    mutationFn: (request: AnalyzeBatchRequest) => triggerBatchAnalysis(request),
    onMutate: async (request) => {
      await queryClient.cancelQueries(queryFilter);
      const snapshot =
        queryClient.getQueriesData<AiStatusResponse[]>(queryFilter);
      const mediaIdSet = new Set(request.mediaIds);
      queryClient.setQueriesData<AiStatusResponse[]>(queryFilter, (old) =>
        old?.map((s) =>
          mediaIdSet.has(s.mediaId) ? { ...s, lastRunStatus: "PROCESSING" } : s
        )
      );
      return { snapshot };
    },
    onError: (_err, _request, context) => {
      context?.snapshot?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
    },
    onSuccess: () => invalidateAiCaches(queryClient),
  });
}
