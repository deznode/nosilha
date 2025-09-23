import type { DirectoryEntry } from "@/types/directory";
import type { Town } from "@/types/town";
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

// ================================
// LEGACY EXPORTS (for backward compatibility during transition)
// ================================

// Re-export legacy functions for build-time static generation
export {
  getMockEntriesByCategory,
  getMockEntryBySlug,
  getMockTowns,
  getMockTownBySlug,
} from "@/lib/mock-api";

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
