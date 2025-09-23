import type { DirectoryEntry } from "@/types/directory";
import type { Town } from "@/types/town";

/**
 * API Contracts - Defines the interface for all API implementations
 * These contracts are extracted from the backend API and serve as the source of truth
 * for both backend and mock API implementations.
 */

// ================================
// CORE API INTERFACE
// ================================

/**
 * Main API interface that all implementations (backend and mock) must satisfy
 */
export interface ApiClient {
  // Directory Entry Operations
  getEntriesByCategory(
    category: string,
    page?: number,
    size?: number
  ): Promise<DirectoryEntry[]>;

  getEntryBySlug(slug: string): Promise<DirectoryEntry | undefined>;

  getEntriesForMap(category?: string): Promise<DirectoryEntry[]>;

  createDirectoryEntry(
    entryData: Omit<
      DirectoryEntry,
      "id" | "slug" | "rating" | "reviewCount" | "createdAt" | "updatedAt"
    >
  ): Promise<DirectoryEntry>;

  // Town Operations
  getTowns(): Promise<Town[]>;

  getTownBySlug(slug: string): Promise<Town | undefined>;

  getTownsForMap(): Promise<Town[]>;

  // Media Operations
  uploadImage(
    file: File,
    category?: string,
    description?: string
  ): Promise<string>;
}

// ================================
// REQUEST/RESPONSE TYPES
// ================================

/**
 * Configuration options for API requests
 */
export interface ApiRequestConfig {
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
}

/**
 * Standard API response wrapper (from backend)
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/**
 * Paged API response wrapper (from backend)
 */
export interface PagedApiResponse<T> {
  data: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/**
 * Error detail structure for validation errors
 */
export interface ErrorDetail {
  field: string;
  message: string;
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: ErrorDetail[];
  timestamp?: string;
}

// ================================
// AUTHENTICATION TYPES
// ================================

/**
 * Configuration for authenticated requests
 */
export interface AuthenticatedRequestConfig extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Authentication session information
 */
export interface AuthSession {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
}

// ================================
// CACHING CONFIGURATION
// ================================

/**
 * ISR cache configuration for different data types
 */
export const CacheConfig = {
  // Directory entries - semi-static content
  DIRECTORY_ENTRIES: { revalidate: 3600 }, // 1 hour

  // Individual entries
  INDIVIDUAL_ENTRY: { revalidate: 1800 }, // 30 minutes

  // Towns data - relatively stable
  TOWNS: { revalidate: 3600 }, // 1 hour

  // Map data - needs to be dynamic
  MAP_DATA: { cache: "no-store" as const },
} as const;

// ================================
// FACTORY TYPES
// ================================

/**
 * Factory function type for creating API clients
 */
export type ApiClientFactory = () => ApiClient;

/**
 * API implementation types
 */
export type ApiImplementationType = "backend" | "mock";

// ================================
// TYPE EXPORTS
// ================================

export type {
  DirectoryEntry,
  Town,
};