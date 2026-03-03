/**
 * Type definitions for the History page content
 *
 * These types define the structure of translated content for the history page.
 * Content is stored in TypeScript files (en.ts, pt.ts, etc.) instead of MDX
 * because the page is primarily structured data rather than prose content.
 */

import type {
  TimelineEvent,
  HistoricalFigure,
  ThematicSection,
} from "@/components/content";

/**
 * Hero section configuration for the video header
 */
export interface Hero {
  videoSrc: string;
  title: string;
  subtitle: string;
}

/**
 * Academic citation for source attribution
 * Must match Citation in @/components/ui/citation-section.tsx
 */
export interface Citation {
  source: string;
  author: string;
  year: number;
  url?: string;
}

/**
 * Icon grid item for the "Living Traditions" section
 * Must match IconGridItem in @/components/content/icon-grid.tsx
 */
export interface IconGridItem {
  icon: "musical-note" | "book-open" | "globe-alt";
  title: string;
  description: string;
  iconColor?:
    | "ocean-blue"
    | "valley-green"
    | "bougainvillea-pink"
    | "sobrado-ochre";
}

/**
 * Statistic item for the statistics grid
 * Must match Statistic in @/components/content/statistics-grid.tsx
 */
export interface Statistic {
  value: string;
  label: string;
  description: string;
  color:
    | "ocean-blue"
    | "valley-green"
    | "bougainvillea-pink"
    | "sobrado-ochre"
    | "sunny-yellow";
}

/**
 * Page metadata for SEO and display
 */
export interface HistoryPageMetadata {
  title: string;
  description: string;
  publishDate: string;
  updatedDate: string;
  author: string;
  category: string;
  tags: string[];
  language: string;
  slug: string;
  keywords?: string;
  openGraph?: {
    title: string;
    description: string;
    images?: string[];
  };
}

/**
 * Complete history page data structure
 */
export interface HistoryPageData {
  metadata: HistoryPageMetadata;
  hero: Hero;
  sections: ThematicSection[];
  figures: HistoricalFigure[];
  timeline: TimelineEvent[];
  citations: Citation[];
  iconGridItems: IconGridItem[];
  statisticsData: Statistic[];
}

// Re-export types from components for convenience
export type { TimelineEvent, HistoricalFigure, ThematicSection };
