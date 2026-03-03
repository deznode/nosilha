/**
 * Admin AI Review Action Mutation Hooks
 *
 * TanStack Query mutation hooks for approve, reject, and approve-with-edits
 * actions on AI analysis runs.
 *
 * @see docs/STATE_MANAGEMENT.md for TanStack Query patterns
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveAiRun, rejectAiRun, approveEditedAiRun } from "@/lib/api";
import { invalidateAiCaches } from "./keys";
import type { ApproveEditedRequest, RejectRequest } from "@/types/ai";

/**
 * Hook for approving AI analysis results as-is.
 *
 * Invalidates AI review, gallery, and system caches on success.
 */
export function useApproveAiRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (runId: string) => approveAiRun(runId),
    onSuccess: () => invalidateAiCaches(queryClient),
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
    onSuccess: () => invalidateAiCaches(queryClient),
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
    onSuccess: () => invalidateAiCaches(queryClient),
  });
}
