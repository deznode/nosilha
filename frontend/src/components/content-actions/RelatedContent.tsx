'use client';

import React, { useEffect, useState } from 'react';
import { DirectoryEntry } from '@/types/directory';
import { getRelatedContent } from '@/lib/api';
import { DirectoryCard } from '@/components/ui/directory-card';

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
  heading = 'Explore Related Content',
  className = '',
}: RelatedContentProps) {
  const [relatedEntries, setRelatedEntries] = useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRelatedContent() {
      try {
        setLoading(true);
        setError(null);

        const entries = await getRelatedContent(contentId, limit);
        setRelatedEntries(entries);
      } catch (err) {
        console.error('Failed to fetch related content:', err);
        setError('Failed to load related content. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (contentId) {
      fetchRelatedContent();
    }
  }, [contentId, limit]);

  // Don't render if no content or error
  if (loading) {
    return (
      <section
        className={`related-content ${className}`}
        aria-label="Loading related content"
      >
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-text-primary text-2xl font-semibold mb-6">
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
        <h2 className="text-text-primary text-2xl font-semibold mb-6">
          {heading}
        </h2>

        {/* Mobile: Horizontal scroll */}
        <div className="sm:hidden">
          <div
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {relatedEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex-shrink-0 w-[280px] snap-start"
              >
                <DirectoryCard entry={entry} />
              </div>
            ))}
          </div>
          {/* Scroll indicator */}
          <p className="text-text-tertiary text-xs text-center mt-2">
            Swipe to see more →
          </p>
        </div>

        {/* Tablet & Desktop: Grid layout */}
        <div className="hidden sm:grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {relatedEntries.map((entry) => (
            <DirectoryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </section>
  );
}

// CSS to hide scrollbar on mobile (add to globals.css if needed)
// .scrollbar-hide::-webkit-scrollbar {
//   display: none;
// }
