"use client";

import { useState, useMemo, useCallback } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { isUserUploadMedia } from "@/types/gallery";
import { Button } from "@/components/catalyst-ui/button";
import { Checkbox } from "@/components/catalyst-ui/checkbox";
import { AiMediaItem } from "./ai-media-item";
import { AiReviewDetailModal } from "@/components/admin/ai-review-detail-modal";
import {
  useAdminGallery,
  useAiStatus,
  useAiReviewQueue,
  useTriggerAnalysis,
  useTriggerBatchAnalysis,
} from "@/hooks/queries/admin";
import { useToast } from "@/hooks/use-toast";

export function AiReviewQueue() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingAnalysisIds, setPendingAnalysisIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedAiRunId, setSelectedAiRunId] = useState<string | null>(null);
  const [isAiReviewModalOpen, setIsAiReviewModalOpen] = useState(false);

  const galleryQuery = useAdminGallery();
  const aiReviewQuery = useAiReviewQueue();
  const triggerAnalysis = useTriggerAnalysis();
  const triggerBatchAnalysis = useTriggerBatchAnalysis();
  const toast = useToast();

  const items = useMemo(
    () => galleryQuery.data?.items ?? [],
    [galleryQuery.data]
  );
  const isLoading = galleryQuery.isLoading;
  const aiReviewItems = aiReviewQuery.data?.items ?? [];

  const galleryMediaIds = useMemo(() => items.map((item) => item.id), [items]);
  const aiStatusQuery = useAiStatus(galleryMediaIds);
  const aiStatuses = useMemo(
    () => new Map((aiStatusQuery.data ?? []).map((s) => [s.mediaId, s])),
    [aiStatusQuery.data]
  );

  const handleTriggerAnalysis = (mediaId: string) => {
    setPendingAnalysisIds((prev) => new Set(prev).add(mediaId));
    triggerAnalysis.mutate(mediaId, {
      onSuccess: () => {
        toast.success("AI analysis triggered").show();
      },
      onError: () => {
        toast.error("Failed to trigger AI analysis. Please try again.").show();
      },
      onSettled: () => {
        setPendingAnalysisIds((prev) => {
          const next = new Set(prev);
          next.delete(mediaId);
          return next;
        });
      },
    });
  };

  const handleTriggerBatchAnalysis = async (mediaIds: string[]) => {
    const data = await triggerBatchAnalysis.mutateAsync({ mediaIds });
    const rejected = data.rejected > 0 ? ` (${data.rejected} rejected)` : "";
    toast
      .success(`AI analysis triggered for ${data.accepted} items${rejected}`)
      .show();
  };

  const handleViewAiReview = (mediaId: string) => {
    const run = aiReviewItems.find((item) => item.mediaId === mediaId);
    if (run) {
      setSelectedAiRunId(run.id);
      setIsAiReviewModalOpen(true);
    } else {
      toast.error("Unable to load review details. Please refresh.").show();
    }
  };

  const handleAiReviewClose = () => {
    setIsAiReviewModalOpen(false);
    setSelectedAiRunId(null);
  };

  const eligibleIds = useMemo(
    () =>
      items
        .filter(
          (item) =>
            isUserUploadMedia(item) &&
            (item.status === "ACTIVE" || item.status === "PENDING_REVIEW") &&
            !!item.publicUrl &&
            aiStatuses?.get(item.id)?.lastRunStatus !== "PROCESSING"
        )
        .map((item) => item.id),
    [items, aiStatuses]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allSelected = eligibleIds.every((id) => prev.has(id));
      if (allSelected) {
        return new Set();
      }
      return new Set(eligibleIds);
    });
  }, [eligibleIds]);

  const handleBatchTrigger = async () => {
    if (selectedIds.size === 0) return;
    try {
      await handleTriggerBatchAnalysis(Array.from(selectedIds));
      setSelectedIds(new Set());
    } catch {
      toast
        .error("Failed to trigger batch AI analysis. Please try again.")
        .show();
    }
  };

  const allEligibleSelected =
    eligibleIds.length > 0 && eligibleIds.every((id) => selectedIds.has(id));

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-alt rounded-card h-32 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border-hairline bg-canvas rounded-card flex min-h-[400px] items-center justify-center border-2 border-dashed">
        <div className="text-center">
          <p className="text-muted text-lg font-medium">
            No gallery items available
          </p>
          <p className="text-muted mt-2 text-sm">
            Upload media to get started with AI analysis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-muted text-sm">
          {items.length} {items.length === 1 ? "item" : "items"}
        </p>
      </div>

      {selectedIds.size > 0 && (
        <div className="border-hairline bg-surface rounded-card shadow-subtle flex items-center gap-4 border p-3">
          <span className="text-body text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <label className="text-muted flex items-center gap-2 text-sm">
            <Checkbox
              checked={allEligibleSelected}
              onChange={toggleSelectAll}
              color="blue"
            />
            Select All Eligible ({eligibleIds.length})
          </label>
          <Button
            color="dark"
            onClick={handleBatchTrigger}
            disabled={triggerBatchAnalysis.isPending}
          >
            {triggerBatchAnalysis.isPending ? (
              <Loader2 data-slot="icon" className="animate-spin" />
            ) : (
              <Sparkles data-slot="icon" />
            )}
            Analyze Selected
          </Button>
        </div>
      )}

      {items.map((item) => {
        const isEligible = eligibleIds.includes(item.id);
        return (
          <AiMediaItem
            key={item.id}
            item={item}
            aiStatus={aiStatuses.get(item.id)}
            onTriggerAnalysis={handleTriggerAnalysis}
            onViewAiReview={handleViewAiReview}
            isSelected={selectedIds.has(item.id)}
            onToggleSelect={isEligible ? toggleSelect : undefined}
            isEligibleForAi={isEligible}
            isTriggerPending={pendingAnalysisIds.has(item.id)}
          />
        );
      })}

      <AiReviewDetailModal
        runId={selectedAiRunId}
        isOpen={isAiReviewModalOpen}
        onClose={handleAiReviewClose}
      />
    </div>
  );
}
