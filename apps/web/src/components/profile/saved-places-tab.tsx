"use client";

import { MapPin, Trash2, Bookmark, AlertCircle, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getEntryUrl } from "@/lib/directory-utils";
import { useBookmarks, useToggleBookmark } from "@/hooks/queries/use-bookmarks";

function SavedPlaceSkeleton() {
  return (
    <div className="flex animate-pulse items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded bg-slate-200 dark:bg-slate-700" />
        <div>
          <div className="mb-2 h-5 w-32 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
      <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
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
        <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
          Saved Places
        </h3>
        {Array.from({ length: 3 }).map((_, i) => (
          <SavedPlaceSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400 dark:text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
          Failed to load saved places
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {error.message || "Please try again later."}
        </p>
      </div>
    );
  }

  const bookmarks = bookmarksData?.items || [];

  if (bookmarks.length === 0) {
    return (
      <div className="py-12 text-center">
        <Bookmark className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
          No saved places yet
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Start exploring and bookmark places you want to visit or remember.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
        Saved Places ({bookmarks.length})
      </h3>
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-[var(--color-ocean-blue)] dark:border-slate-700 dark:bg-slate-800"
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
              <div className="flex h-16 w-16 items-center justify-center rounded bg-slate-200 dark:bg-slate-700">
                <MapPin className="text-slate-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <h4 className="truncate font-bold text-slate-900 transition-colors group-hover:text-[var(--color-ocean-blue)] dark:text-white">
                  {bookmark.entry.name}
                </h4>
                {bookmark.entry.averageRating != null && (
                  <div className="flex shrink-0 items-center rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs font-medium text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                    <Star
                      size={12}
                      className="mr-1 fill-current text-[var(--color-sunny)]"
                    />
                    {bookmark.entry.averageRating.toFixed(1)}
                  </div>
                )}
              </div>
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                <MapPin size={14} className="mr-1 shrink-0" />{" "}
                {bookmark.entry.town || "Brava Island"} &bull;{" "}
                {bookmark.entry.category}
              </div>
              {bookmark.entry.description && (
                <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                  {bookmark.entry.description}
                </p>
              )}
            </div>
          </Link>
          <button
            onClick={() => handleRemoveBookmark(bookmark.entry.id)}
            disabled={toggleBookmark.isPending}
            className="ml-2 rounded-full p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/30"
            title="Remove bookmark"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
