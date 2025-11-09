import type { DirectoryEntry } from "@/types/directory";
import type { Town } from "@/types/town";
import type {
  ReactionCreateDto,
  ReactionResponseDto,
  ReactionCountsDto,
} from "@/types/reaction";
import { getApiClient } from "@/lib/api-factory";

/**
 * Unified API Export Point
 *
 * This module provides a single point of access to API functionality,
 * abstracting away the underlying implementation (backend vs mock).
 * All components should import API functions from this module.
 */

// Get the configured API client instance
const apiClient = getApiClient();

// ================================
// DIRECTORY ENTRY OPERATIONS
// ================================

/**
 * Fetches all directory entries or entries for a specific category.
 * Automatically uses the configured API implementation (backend or mock).
 * @param category The category to fetch, or 'all' to fetch all entries.
 * @param page The page number (default: 0).
 * @param size The page size (default: 20).
 * @returns A promise that resolves to an array of directory entries.
 */
export async function getEntriesByCategory(
  category: string,
  page: number = 0,
  size: number = 20
): Promise<DirectoryEntry[]> {
  return apiClient.getEntriesByCategory(category, page, size);
}

/**
 * Fetches a single directory entry by its slug.
 * Automatically uses the configured API implementation (backend or mock).
 * @param slug The slug of the entry to fetch.
 * @returns A promise that resolves to a single directory entry or undefined if not found.
 */
export async function getEntryBySlug(
  slug: string
): Promise<DirectoryEntry | undefined> {
  return apiClient.getEntryBySlug(slug);
}

/**
 * Creates a new directory entry.
 * Automatically uses the configured API implementation (backend or mock).
 * @param entryData The data for the new entry, excluding id and slug.
 * @returns A promise that resolves to the newly created directory entry.
 */
export async function createDirectoryEntry(
  entryData: Omit<
    DirectoryEntry,
    "id" | "slug" | "rating" | "reviewCount" | "createdAt" | "updatedAt"
  >
): Promise<DirectoryEntry> {
  return apiClient.createDirectoryEntry(entryData);
}

/**
 * Fetches entries for real-time interactive features like maps.
 * Automatically uses the configured API implementation (backend or mock).
 * @param category The category to fetch, or 'all' to fetch all entries.
 * @returns A promise that resolves to an array of directory entries.
 */
export async function getEntriesForMap(
  category: string = "all"
): Promise<DirectoryEntry[]> {
  return apiClient.getEntriesForMap(category);
}

/**
 * Uploads an image file and returns the public URL.
 * Automatically uses the configured API implementation (backend or mock).
 * @param file The image file to upload.
 * @param category Optional category for file organization.
 * @param description Optional description of the file.
 * @returns A promise that resolves to the public URL of the uploaded image.
 */
export async function uploadImage(
  file: File,
  category?: string,
  description?: string
): Promise<string> {
  return apiClient.uploadImage(file, category, description);
}

// ================================
// TOWN OPERATIONS
// ================================

/**
 * Fetches all towns.
 * Automatically uses the configured API implementation (backend or mock).
 * @returns A promise that resolves to an array of towns.
 */
export async function getTowns(): Promise<Town[]> {
  return apiClient.getTowns();
}

/**
 * Fetches a single town by its slug.
 * Automatically uses the configured API implementation (backend or mock).
 * @param slug The slug of the town to fetch.
 * @returns A promise that resolves to a single town or undefined if not found.
 */
export async function getTownBySlug(slug: string): Promise<Town | undefined> {
  return apiClient.getTownBySlug(slug);
}

/**
 * Fetches towns for real-time interactive features like maps.
 * Automatically uses the configured API implementation (backend or mock).
 * @returns A promise that resolves to an array of towns.
 */
export async function getTownsForMap(): Promise<Town[]> {
  return apiClient.getTownsForMap();
}

// All components should use the unified API functions above that automatically
// switch between mock and backend implementations based on environment configuration.

// ================================
// REACTION OPERATIONS (User Story 2)
// ================================

/**
 * Submits a new reaction or updates an existing reaction.
 * Requires user authentication via JWT token.
 * Automatically uses the configured API implementation (backend or mock).
 * @param createDto Contains contentId and reactionType
 * @returns A promise that resolves to the reaction response with updated count
 * @throws Error if rate limit exceeded (HTTP 429)
 * @throws Error if authentication failed (HTTP 401)
 */
export async function submitReaction(
  createDto: ReactionCreateDto
): Promise<ReactionResponseDto> {
  return apiClient.submitReaction(createDto);
}

/**
 * Removes user's reaction to content.
 * Requires user authentication via JWT token.
 * Automatically uses the configured API implementation (backend or mock).
 * @param contentId UUID of the heritage page/content
 * @throws Error if reaction doesn't exist (HTTP 404)
 * @throws Error if authentication failed (HTTP 401)
 */
export async function deleteReaction(contentId: string): Promise<void> {
  return apiClient.deleteReaction(contentId);
}

/**
 * Gets aggregated reaction counts for a specific content page.
 * Public endpoint - no authentication required to view counts.
 * If user is authenticated, response includes their current reaction.
 * Automatically uses the configured API implementation (backend or mock).
 * @param contentId UUID of the heritage page/content
 * @returns A promise that resolves to reaction counts and user's reaction (if authenticated)
 */
export async function getReactionCounts(
  contentId: string
): Promise<ReactionCountsDto> {
  return apiClient.getReactionCounts(contentId);
}

// ================================
// SUGGESTION OPERATIONS (User Story 3)
// ================================

/**
 * Submits a content improvement suggestion.
 * No authentication required - allows community contributions.
 * Rate limited to 5 submissions per hour per IP address.
 * Automatically uses the configured API implementation (backend or mock).
 * @param suggestionDto Contains contentId, name, email, suggestionType, message, and honeypot
 * @returns A promise that resolves to the suggestion response with confirmation message
 * @throws Error if rate limit exceeded (HTTP 429)
 * @throws Error if validation fails (HTTP 400)
 */
export async function submitSuggestion(suggestionDto: {
  contentId: string;
  name: string;
  email: string;
  suggestionType: 'CORRECTION' | 'ADDITION' | 'FEEDBACK';
  message: string;
  honeypot?: string;
}): Promise<{ id: string | null; message: string }> {
  return apiClient.submitSuggestion(suggestionDto);
}

// ================================
// UTILITY EXPORTS
// ================================

// Export API factory utilities for advanced use cases
export {
  getApiClient,
  getApiImplementationType,
  isUsingMockApi,
  logApiConfiguration,
  resetApiClient,
} from "@/lib/api-factory";

// Export types for TypeScript support
export type { ApiClient } from "@/lib/api-contracts";
