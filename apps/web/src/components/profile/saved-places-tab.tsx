"use client";

import { MapPin, Trash2, Bookmark, AlertCircle, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getEntryUrl } from "@/lib/directory-utils";
import { useBookmarks, useToggleBookmark } from "@/hooks/queries/use-bookmarks";

function SavedPlaceSkeleton() {
  return (
    <div className="border-hairline flex animate-pulse items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-4">
        <div className="bg-surface-alt h-16 w-16 rounded" />
        <div>
          <div className="bg-surface-alt mb-2 h-5 w-32 rounded" />
          <div className="bg-surface-alt h-4 w-48 rounded" />
        </div>
      </div>
      <div className="bg-surface-alt h-8 w-8 rounded-full" />
    </div>
  );
}

export function SavedPlacesTab() {
  const { data: bookmarksData, isLoading, error } = useBookmarks(0, 20);
  const toggleBookmark = useToggleBookmark();

  const handleRemoveBookmark = (entryId: string) => {
    toggleBookmark.mutate({
      entryId,
      isBookmarked: true, // true = remove the bookmark
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-body mb-4 text-lg font-bold">Saved Places</h3>
        {Array.from({ length: 3 }).map((_, i) => (
          <SavedPlaceSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <AlertCircle className="text-accent-error mx-auto h-12 w-12" />
        <h3 className="text-body mt-2 text-sm font-medium">
          Failed to load saved places
        </h3>
        <p className="text-muted mt-1 text-sm">
          {error.message || "Please try again later."}
        </p>
      </div>
    );
  }

  const bookmarks = bookmarksData?.items || [];

  if (bookmarks.length === 0) {
    return (
      <div className="py-12 text-center">
        <Bookmark className="text-muted mx-auto h-12 w-12" />
        <h3 className="text-body mt-2 text-sm font-medium">
          No saved places yet
        </h3>
        <p className="text-muted mt-1 text-sm">
          Start exploring and bookmark places you want to visit or remember.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-body mb-4 text-lg font-bold">
        Saved Places ({bookmarks.length})
      </h3>
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="group border-hairline bg-surface flex items-center justify-between rounded-lg border p-4 transition-colors hover:border-[var(--color-ocean-blue)]"
        >
          <Link
            href={getEntryUrl(bookmark.entry.slug, bookmark.entry.category)}
            className="flex flex-1 items-center gap-4"
          >
            {bookmark.entry.thumbnailUrl ? (
              <div className="relative h-16 w-16 overflow-hidden rounded">
                <Image
                  src={bookmark.entry.thumbnailUrl}
                  alt={bookmark.entry.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="bg-surface-alt flex h-16 w-16 items-center justify-center rounded">
                <MapPin className="text-muted" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <h4 className="text-body truncate font-bold transition-colors group-hover:text-[var(--color-ocean-blue)]">
                  {bookmark.entry.name}
                </h4>
                {bookmark.entry.averageRating != null && (
                  <div className="border-hairline bg-surface text-body flex shrink-0 items-center rounded border px-1.5 py-0.5 text-xs font-medium">
                    <Star
                      size={12}
                      className="mr-1 fill-current text-[var(--color-sunny)]"
                    />
                    {bookmark.entry.averageRating.toFixed(1)}
                  </div>
                )}
              </div>
              <div className="text-muted flex items-center text-sm">
                <MapPin size={14} className="mr-1 shrink-0" />{" "}
                {bookmark.entry.town || "Brava Island"} &bull;{" "}
                {bookmark.entry.category}
              </div>
              {bookmark.entry.description && (
                <p className="text-muted mt-1 line-clamp-2 text-xs">
                  {bookmark.entry.description}
                </p>
              )}
            </div>
          </Link>
          <button
            onClick={() => handleRemoveBookmark(bookmark.entry.id)}
            disabled={toggleBookmark.isPending}
            className="text-muted hover:bg-accent-error/10 hover:text-accent-error ml-2 rounded-full p-2 transition-colors disabled:opacity-50"
            title="Remove bookmark"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
