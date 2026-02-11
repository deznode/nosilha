"use client";

import type { AnalysisRunSummary } from "@/types/ai";
import { AiReviewQueueItem } from "./ai-review-queue-item";

interface AiReviewQueueProps {
  items: AnalysisRunSummary[];
  isLoading: boolean;
  onReview: (runId: string) => void;
}

export function AiReviewQueue({
  items,
  isLoading,
  onReview,
}: AiReviewQueueProps) {
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
        <AiReviewQueueItem key={item.id} item={item} onReview={onReview} />
      ))}
    </div>
  );
}
