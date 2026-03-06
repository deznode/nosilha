import React from "react";
import { Card } from "@/components/ui/card";
import { DirectoryEntry } from "@/types/directory";
import { BookmarkButton } from "@/components/directory/bookmark-button";
import { getEntryUrl } from "@/lib/directory-utils";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";

interface DirectoryCardProps {
  entry: DirectoryEntry;
  /** Whether to show the bookmark button (default: true) */
  showBookmark?: boolean;
  /** Whether this card's image should be loaded with priority (LCP optimization) */
  isPriority?: boolean;
}

/**
 * A project-specific card component for displaying a directory entry.
 * It composes the base Catalyst Card component and is wrapped in a Next.js Link.
 *
 * Features restored from ideate prototype:
 * - Bookmark button overlay on image
 * - Category badge overlay on image
 * - Description text with line-clamp
 * - Tags as hashtag pills
 * - Price level display (if available)
 *
 * @param {DirectoryCardProps} props The props for the component.
 * @param {DirectoryEntry} props.entry The directory entry data to display.
 * @param {boolean} props.showBookmark Whether to show the bookmark button (default: true).
 */
export function DirectoryCard({
  entry,
  showBookmark = true,
  isPriority = false,
}: DirectoryCardProps) {
  return (
    <Link
      href={getEntryUrl(entry.slug, entry.category)}
      aria-label={`View details for ${entry.name}`}
      className="group block h-full"
    >
      <Card hoverable className="h-full overflow-hidden">
        {/* Image Section */}
        <div className="relative h-48 w-full overflow-hidden">
          {entry.imageUrl ? (
            <Image
              src={entry.imageUrl}
              alt={`Photo of ${entry.name}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority={isPriority}
            />
          ) : (
            <div className="bg-surface-alt flex h-full w-full flex-col items-center justify-center gap-2 transition-transform duration-500 group-hover:scale-105">
              {React.createElement(getCategoryIcon(entry.category), {
                className: "text-muted h-10 w-10",
                "aria-hidden": true,
              })}
              <span className="text-muted text-xs">{entry.category}</span>
            </div>
          )}

          {/* Category Badge - Top Left */}
          <div className="absolute top-2 left-2">
            <span className="bg-basalt-900/80 rounded px-2 py-1 text-xs text-white backdrop-blur-sm">
              {entry.category}
            </span>
          </div>

          {/* Bookmark Button - Top Right */}
          {showBookmark && (
            <div className="absolute top-2 right-2">
              <BookmarkButton entryId={entry.id} />
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-5">
          {/* Header with name and rating */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-body group-hover:text-ocean-blue text-lg font-semibold transition-colors">
              {entry.name}
            </h3>
            {/* Compact rating badge */}
            {entry.rating != null && (
              <div className="border-edge bg-surface text-body flex shrink-0 items-center rounded border px-1.5 py-0.5 text-xs font-medium">
                <Star
                  size={12}
                  className="text-sunny-yellow mr-1 fill-current"
                />
                {entry.rating.toFixed(1)}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="text-muted mt-1 flex items-center text-sm">
            <MapPin size={14} className="mr-1 shrink-0" />
            <span>{entry.town}</span>
          </div>

          {/* Description */}
          {entry.description && (
            <p className="text-muted mt-2 line-clamp-3 text-sm leading-relaxed">
              {entry.description}
            </p>
          )}

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {entry.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-surface-alt text-muted rounded-full px-2 py-0.5 text-xs"
                >
                  #{tag}
                </span>
              ))}
              {entry.tags.length > 3 && (
                <span className="text-muted text-xs">
                  +{entry.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Review count */}
          <div className="mt-auto pt-3">
            <p className="text-muted text-xs">
              {entry.reviewCount}{" "}
              {entry.reviewCount === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
