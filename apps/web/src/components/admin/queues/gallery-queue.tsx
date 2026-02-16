"use client";

import { useState, useMemo, useCallback } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import type { GalleryMedia, GalleryModerationAction } from "@/types/gallery";
import { isUserUploadMedia } from "@/types/gallery";
import { Button } from "@/components/catalyst-ui/button";
import { Checkbox } from "@/components/catalyst-ui/checkbox";
import { GalleryQueueItem } from "./gallery-queue-item";
import { GalleryEditModal } from "./gallery-edit-modal";
import { AiReviewDetailModal } from "@/components/admin/ai-review-detail-modal";
import {
  useAdminGallery,
  useAiStatus,
  useUpdateGalleryStatus,
  usePromoteToHeroImage,
  useTriggerAnalysis,
  useTriggerBatchAnalysis,
  useAiReviewQueue,
} from "@/hooks/queries/admin";
import { useToast } from "@/hooks/use-toast";

export function GalleryQueue() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [selectedAiRunId, setSelectedAiRunId] = useState<string | null>(null);
  const [isAiReviewModalOpen, setIsAiReviewModalOpen] = useState(false);
  const [mediaToEdit, setMediaToEdit] = useState<GalleryMedia | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const galleryQuery = useAdminGallery();
  const aiReviewQuery = useAiReviewQueue();
  const updateGallery = useUpdateGalleryStatus();
  const promoteToHero = usePromoteToHeroImage();
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

  const handleStatusChange = (
    id: string,
    action: GalleryModerationAction,
    reason?: string,
    notes?: string
  ) => {
    updateGallery.mutate({
      id,
      request: { action, reason, adminNotes: notes },
    });
  };

  const handlePromoteToHero = (mediaId: string) => {
    promoteToHero.mutate(mediaId);
  };

  const handleTriggerAnalysis = (mediaId: string) => {
    triggerAnalysis.mutate(mediaId, {
      onSuccess: () => {
        toast.success("AI analysis triggered").show();
      },
      onError: () => {
        toast.error("Failed to trigger AI analysis. Please try again.").show();
      },
    });
  };

  const handleTriggerBatchAnalysis = async (mediaIds: string[]) => {
    const data = await triggerBatchAnalysis.mutateAsync({ mediaIds });
    const parts = [`AI analysis triggered for ${data.accepted} items`];
    if (data.rejected > 0) {
      parts.push(`(${data.rejected} rejected)`);
    }
    toast.success(parts.join(" ")).show();
  };

  const handleViewAiReview = (mediaId: string) => {
    const run = aiReviewItems.find((item) => item.mediaId === mediaId);
    if (run) {
      setSelectedAiRunId(run.id);
      setIsAiReviewModalOpen(true);
    }
  };

  const handleAiReviewClose = () => {
    setIsAiReviewModalOpen(false);
    setSelectedAiRunId(null);
  };

  const handleEdit = (item: GalleryMedia) => {
    setMediaToEdit(item);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setMediaToEdit(null);
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
            className="bg-surface-alt h-32 animate-pulse rounded-xl"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border-hairline bg-canvas flex min-h-[400px] items-center justify-center rounded-xl border-2 border-dashed">
        <div className="text-center">
          <p className="text-muted text-lg font-medium">
            No gallery items to review
          </p>
          <p className="text-muted mt-2 text-sm">
            All caught up! Check back later for new submissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-muted text-sm">
          {items.length} {items.length === 1 ? "item" : "items"} to review
        </p>
      </div>

      {selectedIds.size > 0 && (
        <div className="border-hairline bg-surface flex items-center gap-4 rounded-xl border p-3 shadow-sm">
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
          <GalleryQueueItem
            key={item.id}
            item={item}
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            onPromoteToHero={handlePromoteToHero}
            aiStatus={aiStatuses.get(item.id)}
            onViewAiReview={handleViewAiReview}
            onTriggerAnalysis={handleTriggerAnalysis}
            isTriggerPending={triggerAnalysis.isPending}
            triggeringMediaId={triggerAnalysis.variables}
            isEligibleForAi={isEligible}
            isSelected={selectedIds.has(item.id)}
            onToggleSelect={isEligible ? toggleSelect : undefined}
          />
        );
      })}

      <GalleryEditModal
        isOpen={isEditModalOpen}
        item={mediaToEdit}
        onClose={handleEditClose}
      />

      <AiReviewDetailModal
        runId={selectedAiRunId}
        isOpen={isAiReviewModalOpen}
        onClose={handleAiReviewClose}
      />
    </div>
  );
}
