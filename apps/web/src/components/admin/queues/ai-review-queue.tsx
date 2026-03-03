"use client";

import { useState } from "react";
import { AiReviewQueueItem } from "./ai-review-queue-item";
import { AiReviewDetailModal } from "@/components/admin/ai-review-detail-modal";
import { useAiReviewQueue } from "@/hooks/queries/admin";

export function AiReviewQueue() {
  const [selectedAiRunId, setSelectedAiRunId] = useState<string | null>(null);
  const [isAiReviewModalOpen, setIsAiReviewModalOpen] = useState(false);

  const aiReviewQuery = useAiReviewQueue();
  const items = aiReviewQuery.data?.items ?? [];
  const isLoading = aiReviewQuery.isLoading;

  const handleReview = (runId: string) => {
    setSelectedAiRunId(runId);
    setIsAiReviewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAiReviewModalOpen(false);
    setSelectedAiRunId(null);
  };

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
            No AI results to review
          </p>
          <p className="text-muted mt-2 text-sm">
            All caught up! Check back later for new AI analysis results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-muted text-sm">
          {items.length} {items.length === 1 ? "result" : "results"} to review
        </p>
      </div>
      {items.map((item) => (
        <AiReviewQueueItem key={item.id} item={item} onReview={handleReview} />
      ))}

      <AiReviewDetailModal
        runId={selectedAiRunId}
        isOpen={isAiReviewModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
