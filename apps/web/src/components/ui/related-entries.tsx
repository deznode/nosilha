"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DirectoryEntry } from "@/types/directory";
import { getRelatedContent } from "@/lib/api";
import { getEntryUrl } from "@/lib/directory-utils";

interface RelatedEntriesProps {
  /**
   * UUID of the current heritage page
   */
  contentId: string;

  /**
   * Number of related items to display (3-5, default: 5)
   */
  limit?: number;

  /**
   * Custom heading for the section (default: "Explore Related Content")
   */
  heading?: string;

  /**
   * Optional CSS class name for styling
   */
  className?: string;

  /**
   * Optional prefetched entries for tests to avoid live API calls
   */
  relatedEntries?: DirectoryEntry[];
}

/**
 * Related Content Component for Cultural Heritage Pages
 *
 * Displays 3-5 related content items based on category, town, and cuisine matching.
 * Uses the backend discovery algorithm to prioritize relevance.
 *
 * **Phase 9 - User Story 5**: Discovering Related Cultural Content
 *
 * **Responsive Design**:
 * - Mobile: Vertical stack with horizontal scroll
 * - Tablet: 2-column grid
 * - Desktop: 3-column grid
 *
 * **Algorithm Priority** (backend):
 * 1. Same category + same town (highest relevance)
 * 2. Same category + same cuisine (for restaurants)
 * 3. Same category only (fallback)
 */
export function RelatedEntries({
  contentId,
  limit = 5,
  heading = "Explore Related Content",
  className = "",
  relatedEntries: prefetchedEntries,
}: RelatedEntriesProps) {
  const [relatedEntries, setRelatedEntries] = useState<DirectoryEntry[]>(
    prefetchedEntries ?? []
  );
  const [loading, setLoading] = useState(!prefetchedEntries);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (prefetchedEntries) {
      return;
    }

    async function fetchRelatedContent() {
      try {
        setLoading(true);
        setError(null);

        const entries = await getRelatedContent(contentId, limit);
        setRelatedEntries(entries);
      } catch (err) {
        console.error("Failed to fetch related content:", err);
        setError("Failed to load related content. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    if (contentId) {
      fetchRelatedContent();
    }
  }, [contentId, limit, prefetchedEntries]);

  // Don't render if no content or error
  if (loading) {
    return (
      <section
        className={`related-content ${className}`}
        aria-label="Loading related content"
      >
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-body mb-6 text-2xl font-semibold">{heading}</h2>
          {/* Loading skeleton */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface rounded-button h-64 animate-pulse"
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className={`related-content ${className}`}
        aria-label="Related content error"
      >
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted text-center">{error}</p>
        </div>
      </section>
    );
  }

  if (relatedEntries.length === 0) {
    return (
      <section
        className={`related-content ${className}`}
        aria-label="No related content available"
      >
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-body mb-6 text-2xl font-semibold">{heading}</h2>
          <p className="text-muted text-center">
            No related heritage content available at this time.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`related-content ${className}`}
      aria-label="Related cultural heritage content"
    >
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <h2 className="text-body mb-6 text-2xl font-semibold">{heading}</h2>

        <RelatedCardsGrid entries={relatedEntries} />
      </div>
    </section>
  );
}

function RelatedCardsGrid({ entries }: { entries: DirectoryEntry[] }) {
  return (
    <>
      {/* Mobile: Horizontal scroll */}
      <div className="sm:hidden">
        <div
          className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {entries.map((entry) => (
            <div key={entry.id} className="w-[280px] flex-shrink-0 snap-start">
              <RelatedEntryCard entry={entry} />
            </div>
          ))}
        </div>
        <p className="text-muted mt-2 text-center text-xs">
          Swipe to see more →
        </p>
      </div>

      {/* Tablet & Desktop */}
      <div className="hidden gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <RelatedEntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </>
  );
}

function RelatedEntryCard({ entry }: { entry: DirectoryEntry }) {
  const excerpt =
    entry.description.length > 80
      ? `${entry.description.slice(0, 77)}…`
      : entry.description;

  return (
    <Link
      href={getEntryUrl(entry.slug, entry.category)}
      aria-label={`View details for ${entry.name}`}
      className="block h-full"
    >
      <article className="bg-canvas border-hairline rounded-button shadow-subtle hover:shadow-elevated flex h-full flex-col overflow-hidden border transition-all duration-300 hover:-translate-y-1">
        <div className="relative h-40 w-full">
          {entry.imageUrl ? (
            <Image
              src={entry.imageUrl}
              alt={`Photo of ${entry.name}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 280px, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="bg-surface text-muted flex h-full w-full items-center justify-center text-sm">
              No image available
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <span className="text-ocean-blue text-xs font-semibold tracking-wide uppercase">
            {entry.category}
          </span>
          <h3 className="text-body text-lg font-semibold">{entry.name}</h3>
          <p className="text-muted text-sm">{excerpt}</p>
          <p className="text-muted mt-auto text-xs font-medium">{entry.town}</p>
        </div>
      </article>
    </Link>
  );
}
