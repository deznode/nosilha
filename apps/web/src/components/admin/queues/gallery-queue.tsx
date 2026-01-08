"use client";

import type { GalleryMedia, GalleryModerationAction } from "@/types/gallery";
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
}

export function GalleryQueue({
  items,
  isLoading,
  onStatusChange,
}: GalleryQueueProps) {
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
      {items.map((item) => (
        <GalleryQueueItem
          key={item.id}
          item={item}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
