"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DirectoryEntry } from "@/types/directory";
import { getRelatedContent } from "@/lib/api";

interface RelatedContentProps {
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
   * Optional prefetched entries for Storybook/tests to avoid live API calls
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
export function RelatedContent({
  contentId,
  limit = 5,
  heading = "Explore Related Content",
  className = "",
  relatedEntries: prefetchedEntries,
}: RelatedContentProps) {
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
          <h2 className="text-text-primary mb-6 text-2xl font-semibold">
            {heading}
          </h2>
          {/* Loading skeleton */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-background-secondary h-64 animate-pulse rounded-lg"
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
          <p className="text-text-secondary text-center">{error}</p>
        </div>
      </section>
    );
  }

  if (relatedEntries.length === 0) {
    return null; // Don't show section if no related content
  }

  return (
    <section
      className={`related-content ${className}`}
      aria-label="Related cultural heritage content"
    >
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <h2 className="text-text-primary mb-6 text-2xl font-semibold">
          {heading}
        </h2>

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
        <p className="text-text-tertiary mt-2 text-center text-xs">
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
      href={`/directory/entry/${entry.slug}`}
      aria-label={`View details for ${entry.name}`}
      className="block h-full"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
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
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              No image available
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <span className="text-ocean-blue text-xs font-semibold tracking-wide uppercase">
            {entry.category}
          </span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {entry.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{excerpt}</p>
          <p className="mt-auto text-xs font-medium text-gray-500 dark:text-gray-400">
            {entry.town}
          </p>
        </div>
      </article>
    </Link>
  );
}
