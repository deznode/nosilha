import type { DirectoryEntry } from "@/types/directory";
import type { Town } from "@/types/town";
import type { ErrorDetail } from "@/types/api";
import type {
  ApiClient,
  ApiResponse,
  PagedApiResponse,
} from "@/lib/api-contracts";
import type {
  ReactionCreateDto,
  ReactionResponseDto,
  ReactionCountsDto,
} from "@/types/reaction";
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

  // ================================
  // REACTION OPERATIONS (User Story 2)
  // ================================

  /**
   * Submits a new reaction or updates an existing reaction.
   *
   * **Authentication Required**: Uses JWT token from Supabase session.
   *
   * **Business Rules**:
   * - If user has no reaction: creates new reaction
   * - If user clicks same reaction type: removes reaction (toggle off)
   * - If user clicks different type: replaces old with new reaction
   *
   * **Rate Limiting**: Maximum 10 reactions per minute per user.
   * Backend returns HTTP 429 if exceeded.
   *
   * @param createDto Contains contentId and reactionType
   * @returns ReactionResponseDto with reaction details and updated count
   * @throws Error if rate limit exceeded (HTTP 429)
   * @throws Error if authentication failed (HTTP 401)
   */
  async submitReaction(
    createDto: ReactionCreateDto
  ): Promise<ReactionResponseDto> {
    const endpoint = `${env.apiUrl}/api/v1/reactions`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createDto),
      cache: "no-store", // Never cache POST requests
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Too many reactions. Please wait a moment.");
      }
      throw new Error(`Failed to submit reaction: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Removes user's reaction to content.
   *
   * **Authentication Required**: Uses JWT token from Supabase session.
   *
   * @param contentId UUID of the heritage page/content
   * @throws Error if reaction doesn't exist (HTTP 404)
   * @throws Error if authentication failed (HTTP 401)
   */
  async deleteReaction(contentId: string): Promise<void> {
    const endpoint = `${env.apiUrl}/api/v1/reactions/content/${contentId}`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "DELETE",
      cache: "no-store", // Never cache DELETE requests
    });

    if (!response.ok && response.status !== 204) {
      if (response.status === 404) {
        throw new Error("Reaction not found");
      }
      throw new Error(`Failed to delete reaction: ${response.status}`);
    }
  }

  /**
   * Gets aggregated reaction counts for a specific content page.
   *
   * **Public Endpoint**: No authentication required to view counts.
   * If user is authenticated, response includes their current reaction.
   *
   * **Caching**: Results cached for 5 minutes (ISR).
   *
   * @param contentId UUID of the heritage page/content
   * @returns ReactionCountsDto with counts map and user's reaction (if authenticated)
   */
  async getReactionCounts(contentId: string): Promise<ReactionCountsDto> {
    const endpoint = `${env.apiUrl}/api/v1/reactions/content/${contentId}`;

    // Use authenticatedFetch to include JWT if available, but don't fail if not authenticated
    try {
      const response = await this.authenticatedFetch(endpoint, {
        method: "GET",
        next: CacheConfig.REACTION_COUNTS,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reaction counts: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // If authentication failed but we're just viewing counts, try unauthenticated
      const response = await fetch(endpoint, {
        method: "GET",
        next: CacheConfig.REACTION_COUNTS,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reaction counts: ${response.status}`);
      }

      return await response.json();
    }
  }

  /**
   * Submits a content improvement suggestion.
   *
   * **Public Endpoint**: No authentication required - allows community contributions.
   *
   * **Rate Limiting**: 5 submissions per hour per IP address.
   *
   * **Spam Protection**: Honeypot field validation on server side.
   *
   * @param suggestionDto Contains contentId, name, email, suggestionType, message, and honeypot
   * @returns Promise resolving to suggestion response with confirmation message
   * @throws Error if rate limit exceeded (HTTP 429)
   * @throws Error if validation fails (HTTP 400)
   */
  async submitSuggestion(suggestionDto: {
    contentId: string;
    name: string;
    email: string;
    suggestionType: 'CORRECTION' | 'ADDITION' | 'FEEDBACK';
    message: string;
    honeypot?: string;
  }): Promise<{ id: string | null; message: string }> {
    const endpoint = `${env.apiUrl}/api/v1/suggestions`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(suggestionDto),
      cache: "no-store", // Never cache POST requests
    });

    if (!response.ok) {
      if (response.status === 429) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Rate limit exceeded. Please try again later.");
      }
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid suggestion data. Please check your input.");
      }
      throw new Error(`Failed to submit suggestion: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Fetches 3-5 related content items for a given heritage page.
   * Uses content discovery algorithm matching by category, town, and cuisine.
   * Cached for 5 minutes using ISR (per spec.md Phase 9).
   *
   * **User Story 5 - Phase 9**: Discovering Related Cultural Content
   *
   * @param contentId UUID of the current heritage page
   * @param limit Number of results to return (3-5, default: 5)
   * @returns Promise resolving to array of related directory entries
   */
  async getRelatedContent(
    contentId: string,
    limit: number = 5
  ): Promise<DirectoryEntry[]> {
    const endpoint = `${env.apiUrl}/api/v1/directory/entries/${contentId}/related?limit=${limit}`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: CacheConfig.RELATED_CONTENT, // 5-minute ISR cache
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Content not found, return empty array
        console.warn(`Content ${contentId} not found for related content`);
        return [];
      }
      throw new Error(`Failed to fetch related content: ${response.status}`);
    }

    const apiResponse: ApiResponse<DirectoryEntry[]> = await response.json();
    return apiResponse.data;
  }
}
