import type { DirectoryEntry } from "@/types/directory";
import type { Town } from "@/types/town";
import type { ErrorDetail } from "@/types/api";
import type {
  ApiClient,
  ApiResponse,
  PagedApiResponse,
} from "@/lib/api-contracts";
import { CacheConfig } from "@/lib/api-contracts";
import { env } from "@/lib/env";
import { supabase } from "@/lib/supabase-client";
import {
  validateDirectoryEntries,
  validateDirectoryEntry,
  validateTowns,
  validateTown,
} from "@/lib/api-validation";

/**
 * Backend API Client - Pure implementation without fallbacks
 * This implementation handles all communication with the Spring Boot backend API
 */
export class BackendApiClient implements ApiClient {
  /**
   * Creates an authenticated fetch request with JWT token from Supabase session
   */
  private async authenticatedFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers = {
      ...options.headers,
    };

    // Add Authorization header if user is authenticated
    if (session?.access_token) {
      Object.assign(headers, {
        Authorization: `Bearer ${session.access_token}`,
      });
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle authentication errors
    if (response.status === 401) {
      // Token expired or invalid - sign out user
      await supabase.auth.signOut();
      window.location.href = "/login";
      throw new Error("Authentication expired. Please log in again.");
    }

    if (response.status === 403) {
      throw new Error(
        "Access denied. You do not have permission to perform this action."
      );
    }

    return response;
  }

  /**
   * Fetches all directory entries or entries for a specific category from the backend API.
   * Uses ISR with 1 hour cache for optimal performance.
   */
  async getEntriesByCategory(
    category: string,
    page: number = 0,
    size: number = 20
  ): Promise<DirectoryEntry[]> {
    const params = new URLSearchParams();

    if (category.toLowerCase() !== "all") {
      params.append("category", category);
    }
    params.append("page", page.toString());
    params.append("size", size.toString());

    const endpoint = `${env.apiUrl}/api/v1/directory/entries?${params.toString()}`;

    // Use ISR with 1 hour cache for directory content (semi-static data)
    const response = await fetch(endpoint, {
      next: CacheConfig.DIRECTORY_ENTRIES,
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const apiResponse: PagedApiResponse<DirectoryEntry> = await response.json();
    // Extract and validate data from PagedApiResponse
    const rawData = apiResponse.data || [];
    return validateDirectoryEntries(rawData);
  }

  /**
   * Fetches a single directory entry by its slug from the backend API.
   * Uses ISR with 30 minute cache for individual entries.
   */
  async getEntryBySlug(slug: string): Promise<DirectoryEntry | undefined> {
    const endpoint = `${env.apiUrl}/api/v1/directory/slug/${slug}`;

    // Use ISR with 30 minute cache for individual entries
    const response = await fetch(endpoint, {
      next: CacheConfig.INDIVIDUAL_ENTRY,
    });

    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const apiResponse: ApiResponse<DirectoryEntry> = await response.json();
    // Extract and validate data from ApiResponse
    return validateDirectoryEntry(apiResponse.data) || undefined;
  }

  /**
   * Creates a new directory entry by sending a POST request to the backend API.
   */
  async createDirectoryEntry(
    entryData: Omit<
      DirectoryEntry,
      "id" | "slug" | "rating" | "reviewCount" | "createdAt" | "updatedAt"
    >
  ): Promise<DirectoryEntry> {
    const endpoint = `${env.apiUrl}/api/v1/directory/entries`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entryData),
    });

    if (!response.ok) {
      try {
        const errorResult = await response.json();

        // Handle validation errors with detailed field information
        if (errorResult.error === "Validation failed" && errorResult.details) {
          const fieldErrors = errorResult.details
            .map((detail: ErrorDetail) => `${detail.field}: ${detail.message}`)
            .join(", ");
          throw new Error(`Validation failed: ${fieldErrors}`);
        }

        // Handle other structured errors
        throw new Error(
          errorResult.error ||
            errorResult.message ||
            `API error: ${response.status}`
        );
      } catch (_parseError) {
        // If we can't parse the error response, provide a generic message
        throw new Error(
          `Failed to create directory entry (${response.status})`
        );
      }
    }

    const apiResponse: ApiResponse<DirectoryEntry> = await response.json();
    // Extract data from ApiResponse
    return apiResponse.data;
  }

  /**
   * Fetches entries for real-time interactive features like maps.
   * Uses no-store cache to ensure fresh data for dynamic interactions.
   */
  async getEntriesForMap(category: string = "all"): Promise<DirectoryEntry[]> {
    const params = new URLSearchParams();

    if (category.toLowerCase() !== "all") {
      params.append("category", category);
    }
    // Use larger page size for map view to get more entries
    params.append("size", "100");

    const endpoint = `${env.apiUrl}/api/v1/directory/entries?${params.toString()}`;

    // Keep dynamic for real-time map interactions
    const response = await fetch(endpoint, CacheConfig.MAP_DATA);

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const apiResponse: PagedApiResponse<DirectoryEntry> = await response.json();
    // Extract and validate data from PagedApiResponse
    const rawData = apiResponse.data || [];
    return validateDirectoryEntries(rawData);
  }

  /**
   * Uploads an image file to the backend API and returns the public URL.
   * Requires user authentication via JWT token.
   */
  async uploadImage(
    file: File,
    category?: string,
    description?: string
  ): Promise<string> {
    const endpoint = `${env.apiUrl}/api/v1/media/upload`;

    // Create FormData for multipart/form-data request
    const formData = new FormData();
    formData.append("file", file);
    if (category) formData.append("category", category);
    if (description) formData.append("description", description);

    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
      body: formData,
      // Don't set Content-Type header - let browser set it with boundary for multipart
    });

    if (!response.ok) {
      try {
        const errorResult = await response.json();
        throw new Error(
          errorResult.error ||
            errorResult.message ||
            `Upload failed (${response.status})`
        );
      } catch (_parseError) {
        throw new Error(`Failed to upload image (${response.status})`);
      }
    }

    const apiResponse = await response.json();
    // Extract URL from MediaMetadataDto in ApiResponse
    return apiResponse.data.url;
  }

  /**
   * Fetches all towns from the backend API.
   * Uses ISR with 1 hour cache for optimal performance.
   */
  async getTowns(): Promise<Town[]> {
    const endpoint = `${env.apiUrl}/api/v1/towns/all`;

    // Use ISR with 1 hour cache for towns data (semi-static data)
    const response = await fetch(endpoint, {
      next: CacheConfig.TOWNS,
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const apiResponse: ApiResponse<Town[]> = await response.json();
    // Extract and validate data from ApiResponse
    const rawData = apiResponse.data || [];
    return validateTowns(rawData);
  }

  /**
   * Fetches a single town by its slug from the backend API.
   * Uses ISR with 30 minute cache for individual towns.
   */
  async getTownBySlug(slug: string): Promise<Town | undefined> {
    const endpoint = `${env.apiUrl}/api/v1/towns/slug/${slug}`;

    // Use ISR with 30 minute cache for individual towns
    const response = await fetch(endpoint, {
      next: CacheConfig.INDIVIDUAL_ENTRY,
    });

    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const apiResponse: ApiResponse<Town> = await response.json();
    // Extract and validate data from ApiResponse
    return validateTown(apiResponse.data) || undefined;
  }

  /**
   * Fetches towns for real-time interactive features like maps.
   * Uses no-store cache to ensure fresh data for dynamic interactions.
   */
  async getTownsForMap(): Promise<Town[]> {
    const endpoint = `${env.apiUrl}/api/v1/towns/all`;

    // Keep dynamic for real-time map interactions
    const response = await fetch(endpoint, CacheConfig.MAP_DATA);

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const apiResponse: ApiResponse<Town[]> = await response.json();
    // Extract and validate data from ApiResponse
    const rawData = apiResponse.data || [];
    return validateTowns(rawData);
  }
}
