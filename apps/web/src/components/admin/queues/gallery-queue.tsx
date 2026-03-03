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
            className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        <div className="text-center">
          <p className="text-lg font-medium text-slate-500 dark:text-slate-400">
            No gallery items to review
          </p>
          <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
            All caught up! Check back later for new submissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">
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
