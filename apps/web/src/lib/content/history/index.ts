/**
 * History page content loader with i18n support
 *
 * Provides language-aware content loading for the history page.
 * Uses dynamic imports to load only the requested language's content.
 */

import type { Language } from "../translations";
import type { HistoryPageData } from "./types";

// Track which languages have content files
const AVAILABLE_HISTORY_LANGUAGES: Language[] = ["en"];

/**
 * Get history page data for a specific language
 *
 * Uses dynamic imports for code splitting - only the requested
 * language's content file is loaded.
 *
 * @param lang - The language to load content for
 * @returns The history page data or null if language not available
 */
export async function getHistoryData(
  lang: Language
): Promise<HistoryPageData | null> {
  // Check if language is available
  if (!AVAILABLE_HISTORY_LANGUAGES.includes(lang)) {
    return null;
  }

  try {
    // Dynamic import for code splitting
    const contentModule = await import(`./${lang}`);
    return contentModule.historyData;
  } catch {
    console.error(`Failed to load history content for language: ${lang}`);
    return null;
  }
}

/**
 * Get available languages for the history page
 *
 * Used by the language switcher to show which translations exist.
 */
export function getAvailableHistoryLanguages(): Language[] {
  return [...AVAILABLE_HISTORY_LANGUAGES];
}

/**
 * Check if a language has history page content
 */
export function hasHistoryLanguage(lang: Language): boolean {
  return AVAILABLE_HISTORY_LANGUAGES.includes(lang);
}

// Re-export types for convenience
export type { HistoryPageData } from "./types";
export type {
  Hero,
  Citation,
  IconGridItem,
  Statistic,
  HistoryPageMetadata,
} from "./types";
