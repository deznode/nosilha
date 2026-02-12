"use client";

import Image from "next/image";
import { Sparkles, Clock } from "lucide-react";
import type { AnalysisRunSummary } from "@/types/ai";
import { Button } from "@/components/catalyst-ui/button";
import { useGalleryMediaById } from "@/hooks/queries/admin";

interface AiReviewQueueItemProps {
  item: AnalysisRunSummary;
  onReview: (runId: string) => void;
}

export function AiReviewQueueItem({ item, onReview }: AiReviewQueueItemProps) {
  const maxTags = 5;
  const visibleTags = item.resultTags.slice(0, maxTags);
  const overflowCount = item.resultTags.length - maxTags;
  const { imageUrl, isLoading: isMediaLoading } = useGalleryMediaById(
    item.mediaId
  );

  return (
    <div className="border-hairline bg-surface flex items-start gap-4 rounded-xl border p-4 transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg">
        {isMediaLoading ? (
          <div className="bg-surface-alt h-full w-full animate-pulse" />
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.resultAltText ?? "Media preview"}
            fill
            className="object-cover"
            sizes="80px"
            unoptimized
          />
        ) : (
          <div className="bg-surface-alt flex h-full w-full items-center justify-center">
            <Sparkles size={24} className="text-muted" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {/* Alt Text Preview */}
            {item.resultAltText && (
              <p className="text-body line-clamp-2 text-sm font-medium">
                {item.resultAltText}
              </p>
            )}
            {/* Description Preview */}
            {item.resultDescription && (
              <p className="text-muted mt-1 line-clamp-1 text-sm">
                {item.resultDescription}
              </p>
            )}
            {!item.resultAltText && !item.resultDescription && (
              <p className="text-muted text-sm italic">
                No AI-generated text available
              </p>
            )}
          </div>
        </div>

        {/* Tags */}
        {visibleTags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="bg-surface-alt text-muted rounded-full px-2 py-0.5 text-xs"
              >
                {tag}
              </span>
            ))}
            {overflowCount > 0 && (
              <span className="text-muted px-1 py-0.5 text-xs">
                +{overflowCount} more
              </span>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="text-muted mb-3 flex flex-wrap items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1">
            Providers: {item.providersUsed.join(", ")}
          </span>
          {item.completedAt && (
            <span className="inline-flex items-center gap-1">
              <Clock size={10} />
              {new Date(item.completedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button color="blue" onClick={() => onReview(item.id)}>
            <Sparkles data-slot="icon" />
            Review
          </Button>
        </div>
      </div>
    </div>
  );
}
