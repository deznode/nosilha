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
import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type {
  AiStatusResponse,
  AnalysisTriggerResponse,
  AnalyzeBatchRequest,
  BatchAnalysisTriggerResponse,
} from "@/types/ai";

type AiStatusSnapshot = {
  snapshot: [QueryKey, AiStatusResponse[] | undefined][];
};

const AI_STATUS_QUERY_FILTER = {
  queryKey: adminKeys.aiReview.all(),
  predicate: (query: { queryKey: readonly unknown[] }) =>
    query.queryKey.includes("status"),
};

/**
 * Saves a snapshot of AI status queries and optimistically marks
 * the given media IDs as PROCESSING.
 */
async function optimisticProcessing(
  queryClient: QueryClient,
  shouldMark: (mediaId: string) => boolean
): Promise<AiStatusSnapshot> {
  await queryClient.cancelQueries(AI_STATUS_QUERY_FILTER);
  const snapshot = queryClient.getQueriesData<AiStatusResponse[]>(
    AI_STATUS_QUERY_FILTER
  );
  queryClient.setQueriesData<AiStatusResponse[]>(
    AI_STATUS_QUERY_FILTER,
    (old) =>
      old?.map((s) =>
        shouldMark(s.mediaId) ? { ...s, lastRunStatus: "PROCESSING" } : s
      )
  );
  return { snapshot };
}

function rollbackSnapshot(
  queryClient: QueryClient,
  context?: AiStatusSnapshot
): void {
  context?.snapshot?.forEach(([key, data]) =>
    queryClient.setQueryData(key, data)
  );
}

/**
 * Hook for triggering AI analysis on a single media item.
 *
 * Invalidates AI review, gallery, and system caches on success.
 */
export function useTriggerAnalysis() {
  const queryClient = useQueryClient();

  return useMutation<AnalysisTriggerResponse, Error, string, AiStatusSnapshot>({
    mutationFn: (mediaId: string) => triggerAnalysis(mediaId),
    onMutate: (mediaId) =>
      optimisticProcessing(queryClient, (id) => id === mediaId),
    onError: (_err, _mediaId, context) =>
      rollbackSnapshot(queryClient, context),
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

  return useMutation<
    BatchAnalysisTriggerResponse,
    Error,
    AnalyzeBatchRequest,
    AiStatusSnapshot
  >({
    mutationFn: (request: AnalyzeBatchRequest) => triggerBatchAnalysis(request),
    onMutate: (request) => {
      const mediaIdSet = new Set(request.mediaIds);
      return optimisticProcessing(queryClient, (id) => mediaIdSet.has(id));
    },
    onError: (_err, _request, context) =>
      rollbackSnapshot(queryClient, context),
    onSuccess: () => invalidateAiCaches(queryClient),
  });
}
