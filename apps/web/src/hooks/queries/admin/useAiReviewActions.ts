/**
 * Admin AI Review Action Mutation Hooks
 *
 * TanStack Query mutation hooks for approve, reject, and approve-with-edits
 * actions on AI analysis runs.
 *
 * @see docs/STATE_MANAGEMENT.md for TanStack Query patterns
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { approveAiRun, rejectAiRun, approveEditedAiRun } from "@/lib/api";
import { adminKeys } from "./keys";
import type { ApproveEditedRequest, RejectRequest } from "@/types/ai";

/**
 * Invalidates AI review, gallery, and system caches after a moderation action.
 */
function invalidateAiReviewCaches(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: adminKeys.aiReview.all() });
  queryClient.invalidateQueries({ queryKey: adminKeys.gallery.all() });
  queryClient.invalidateQueries({ queryKey: adminKeys.system.all() });
}

/**
 * Hook for approving AI analysis results as-is.
 *
 * Invalidates AI review, gallery, and system caches on success.
 */
export function useApproveAiRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (runId: string) => approveAiRun(runId),
    onSuccess: () => invalidateAiReviewCaches(queryClient),
  });
}

interface RejectAiRunVariables {
  runId: string;
  request?: RejectRequest;
}

/**
 * Hook for rejecting AI analysis results.
 *
 * Invalidates AI review, gallery, and system caches on success.
 */
export function useRejectAiRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ runId, request }: RejectAiRunVariables) =>
      rejectAiRun(runId, request),
    onSuccess: () => invalidateAiReviewCaches(queryClient),
  });
}

interface ApproveEditedAiRunVariables {
  runId: string;
  request: ApproveEditedRequest;
}

/**
 * Hook for approving AI analysis results with admin edits.
 *
 * Invalidates AI review, gallery, and system caches on success.
 */
export function useApproveEditedAiRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ runId, request }: ApproveEditedAiRunVariables) =>
      approveEditedAiRun(runId, request),
    onSuccess: () => invalidateAiReviewCaches(queryClient),
  });
}
