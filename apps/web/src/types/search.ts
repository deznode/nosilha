/**
 * TypeScript interfaces for unified search functionality.
 * Combines directory entries (backend API) with MDX content (Pagefind).
 */

import type { DirectoryEntry } from "./directory";
import { getEntryUrl } from "@/lib/directory-utils";

/** Result types for unified search */
export type SearchResultType = "directory" | "article";

/** Directory category types (matching DirectoryEntry) */
export type DirectoryCategory =
  | "Restaurant"
  | "Hotel"
  | "Beach"
  | "Heritage"
  | "Nature"
  | "Town"
  | "Viewpoint"
  | "Trail"
  | "Church"
  | "Port";

/** Article categories from MDX content */
export type ArticleCategory =
  | "music"
  | "history"
  | "traditions"
  | "places"
  | "people";

/** Base search result interface */
export interface BaseSearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  url: string;
  excerpt?: string;
}

/** Directory entry search result */
export interface DirectorySearchResult extends BaseSearchResult {
  type: "directory";
  category: DirectoryCategory;
  town: string;
  imageUrl: string | null;
}

/** Article/MDX search result */
export interface ArticleSearchResult extends BaseSearchResult {
  type: "article";
  category: string;
  /** HTML excerpt with <mark> highlight tags from Pagefind */
  highlightedExcerpt?: string;
}

/** Union type for all search results */
export type UnifiedSearchResult = DirectorySearchResult | ArticleSearchResult;

/** Grouped search results for display */
export interface GroupedSearchResults {
  places: DirectorySearchResult[];
  articles: ArticleSearchResult[];
}

/** Pagefind result structure */
export interface PagefindResult {
  url: string;
  excerpt: string;
  meta: {
    title?: string;
    category?: string;
  };
}

/** Pagefind API interface */
export interface PagefindUI {
  init: () => Promise<void>;
  search: (query: string) => Promise<{
    results: Array<{
      id: string;
      data: () => Promise<PagefindResult>;
    }>;
  }>;
}

/**
 * Convert a DirectoryEntry to a DirectorySearchResult
 */
export function toDirectorySearchResult(
  entry: DirectoryEntry
): DirectorySearchResult {
  return {
    id: entry.id,
    type: "directory",
    title: entry.name,
    url: getEntryUrl(entry.slug, entry.category),
    excerpt: entry.description,
    category: entry.category,
    town: entry.town,
    imageUrl: entry.imageUrl,
  };
}

/**
 * Convert a PagefindResult to an ArticleSearchResult
 */
export function toArticleSearchResult(
  result: PagefindResult,
  index: number
): ArticleSearchResult {
  // Remove .html extension and ensure proper path
  const url = result.url.replace(/\.html$/, "");

  return {
    id: `article-${index}`,
    type: "article",
    title: result.meta.title || "Untitled",
    url,
    category: result.meta.category || "article",
    excerpt: result.excerpt.replace(/<\/?mark>/g, ""), // Plain text version
    highlightedExcerpt: result.excerpt, // HTML with highlights
  };
}
