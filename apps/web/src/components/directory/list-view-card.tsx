"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { BookmarkButton } from "./bookmark-button";
import { getEntryUrl } from "@/lib/directory-utils";
import type { DirectoryEntry } from "@/types/directory";

interface ListViewCardProps {
  entry: DirectoryEntry;
  /** Whether to show the bookmark button (default: true) */
  showBookmark?: boolean;
}

export function ListViewCard({
  entry,
  showBookmark = true,
}: ListViewCardProps) {
  return (
    <Link
      href={getEntryUrl(entry.slug, entry.category)}
      className="group block"
    >
      <div className="border-hairline bg-surface rounded-card shadow-subtle ease-calm hover:shadow-medium flex h-48 flex-row overflow-hidden border transition-shadow duration-200">
        {/* Image */}
        <div className="relative w-1/3 overflow-hidden">
          {entry.imageUrl ? (
            <Image
              src={entry.imageUrl}
              alt={entry.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="bg-surface-alt flex h-full w-full items-center justify-center">
              <span className="text-muted">No image</span>
            </div>
          )}
          {showBookmark && (
            <div className="absolute top-2 right-2">
              <BookmarkButton entryId={entry.id} />
            </div>
          )}
          <div className="absolute top-2 left-2">
            <span className="bg-basalt-900/80 rounded px-2 py-1 text-xs text-white backdrop-blur-sm">
              {entry.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex w-2/3 flex-col justify-between p-5">
          <div>
            <div className="mb-1 flex items-start justify-between">
              <h3 className="text-body group-hover:text-ocean-blue text-lg font-bold transition-colors">
                {entry.name}
              </h3>
              <div className="border-hairline bg-surface text-body flex items-center rounded border px-1.5 py-0.5 text-xs font-medium">
                <Star
                  size={12}
                  className="text-sunny-yellow mr-1 fill-current"
                />
                {entry.rating}
              </div>
            </div>

            <div className="text-muted mb-3 flex items-center text-sm">
              <MapPin size={14} className="mr-1" />
              {entry.town}
            </div>

            <p className="text-muted line-clamp-2 text-sm leading-relaxed">
              {entry.description}
            </p>
          </div>

          {entry.tags && entry.tags.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-2">
              {entry.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="border-hairline bg-surface-alt text-muted rounded-full border px-2 py-1 text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
