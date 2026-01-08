import { Card } from "@/components/ui/card";
import { DirectoryEntry } from "@/types/directory";
import { BookmarkButton } from "@/components/directory/bookmark-button";
import { getEntryUrl } from "@/lib/directory-utils";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";

interface DirectoryCardProps {
  entry: DirectoryEntry;
  /** Whether to show the bookmark button (default: true) */
  showBookmark?: boolean;
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
}: DirectoryCardProps) {
  return (
    <Link
      href={getEntryUrl(entry.slug, entry.category)}
      aria-label={`View details for ${entry.name}`}
      className="group block h-full"
    >
      <Card className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        {/* Image Section */}
        <div className="relative h-48 w-full overflow-hidden">
          {entry.imageUrl ? (
            <Image
              src={entry.imageUrl}
              alt={`Photo of ${entry.name}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="bg-background-tertiary flex h-full w-full items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <span className="text-text-tertiary">No image available</span>
            </div>
          )}

          {/* Category Badge - Top Left */}
          <div className="absolute top-2 left-2">
            <span className="rounded bg-slate-900/80 px-2 py-1 text-xs text-white backdrop-blur-sm">
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
            <h3 className="text-text-primary text-lg font-semibold transition-colors group-hover:text-[var(--color-ocean-blue)]">
              {entry.name}
            </h3>
            {/* Compact rating badge */}
            {entry.rating != null && (
              <div className="flex shrink-0 items-center rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs font-medium text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                <Star
                  size={12}
                  className="mr-1 fill-current text-[var(--color-sunny)]"
                />
                {entry.rating.toFixed(1)}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="text-text-secondary mt-1 flex items-center text-sm">
            <MapPin size={14} className="mr-1 shrink-0" />
            <span>{entry.town}</span>
          </div>

          {/* Description */}
          {entry.description && (
            <p className="text-text-secondary mt-2 line-clamp-3 text-sm leading-relaxed">
              {entry.description}
            </p>
          )}

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {entry.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                >
                  #{tag}
                </span>
              ))}
              {entry.tags.length > 3 && (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  +{entry.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Review count */}
          <div className="mt-auto pt-3">
            <p className="text-text-tertiary text-xs">
              {entry.reviewCount}{" "}
              {entry.reviewCount === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
