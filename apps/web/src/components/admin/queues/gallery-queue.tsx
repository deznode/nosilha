"use client";

import { useState, useMemo, useCallback } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import type { GalleryMedia, GalleryModerationAction } from "@/types/gallery";
import { isUserUploadMedia } from "@/types/gallery";
import type { AiStatusResponse } from "@/types/ai";
import { Button } from "@/components/catalyst-ui/button";
import { Checkbox } from "@/components/catalyst-ui/checkbox";
import { GalleryQueueItem } from "./gallery-queue-item";

interface GalleryQueueProps {
  items: GalleryMedia[];
  isLoading: boolean;
  onStatusChange: (
    id: string,
    action: GalleryModerationAction,
    reason?: string,
    notes?: string
  ) => void;
  onPromoteToHero?: (id: string) => void;
  aiStatuses?: Map<string, AiStatusResponse>;
  onViewAiReview?: (mediaId: string) => void;
  onTriggerAnalysis?: (mediaId: string) => void;
  isTriggerPending?: boolean;
  triggeringMediaId?: string;
  onTriggerBatchAnalysis?: (mediaIds: string[]) => Promise<void> | void;
  isBatchTriggerPending?: boolean;
}

export function GalleryQueue({
  items,
  isLoading,
  onStatusChange,
  onPromoteToHero,
  aiStatuses,
  onViewAiReview,
  onTriggerAnalysis,
  isTriggerPending,
  triggeringMediaId,
  onTriggerBatchAnalysis,
  isBatchTriggerPending,
}: GalleryQueueProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Compute eligible IDs for "Select All Eligible"
  const eligibleIds = useMemo(
    () =>
      items
        .filter(
          (item) =>
            isUserUploadMedia(item) &&
            item.status === "ACTIVE" &&
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

  const handleBatchTrigger = useCallback(async () => {
    if (onTriggerBatchAnalysis && selectedIds.size > 0) {
      await onTriggerBatchAnalysis(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  }, [onTriggerBatchAnalysis, selectedIds]);

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

      {/* Batch Action Bar */}
      {selectedIds.size > 0 && onTriggerBatchAnalysis && (
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
            disabled={isBatchTriggerPending}
          >
            {isBatchTriggerPending ? (
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
            onStatusChange={onStatusChange}
            onPromoteToHero={onPromoteToHero}
            aiStatus={aiStatuses?.get(item.id)}
            onViewAiReview={onViewAiReview}
            onTriggerAnalysis={onTriggerAnalysis}
            isTriggerPending={isTriggerPending}
            triggeringMediaId={triggeringMediaId}
            isEligibleForAi={isEligible}
            isSelected={selectedIds.has(item.id)}
            onToggleSelect={isEligible ? toggleSelect : undefined}
          />
        );
      })}
    </div>
  );
}
