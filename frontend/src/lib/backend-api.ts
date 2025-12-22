import type { DirectoryEntry } from "@/types/directory";
import type { Town } from "@/types/town";
import type {
  ErrorDetail,
  MediaMetadataDto,
  PresignRequest,
  PresignResponse,
  ConfirmRequest,
} from "@/types/api";
import type {
  ApiClient,
  ApiResponse,
  PagedApiResponse,
  PaginatedResult,
  PaginationMetadata,
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
  ): Promise<PaginatedResult<DirectoryEntry>> {
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

    const payload = (await response.json()) as unknown;
    const { items, pagination } =
      this.unwrapPagedResult<DirectoryEntry>(payload);
    return {
      items: validateDirectoryEntries(items),
      pagination,
    };
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

    const payload = (await response.json()) as unknown;
    const entry = this.unwrapApiResponse<DirectoryEntry>(payload);
    return validateDirectoryEntry(entry) || undefined;
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

    const payload = (await response.json()) as unknown;
    return this.unwrapApiResponse<DirectoryEntry>(payload);
  }

  /**
   * Fetches entries for real-time interactive features like maps.
   * Uses no-store cache to ensure fresh data for dynamic interactions.
   */
  async getEntriesForMap(
    category: string = "all"
  ): Promise<PaginatedResult<DirectoryEntry>> {
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

    const payload = (await response.json()) as unknown;
    const { items, pagination } =
      this.unwrapPagedResult<DirectoryEntry>(payload);
    return {
      items: validateDirectoryEntries(items),
      pagination,
    };
  }

  // ================================
  // MEDIA UPLOAD OPERATIONS (Presigned URL Flow)
  // ================================

  /**
   * Requests a presigned URL for direct browser-to-R2 upload.
   *
   * **Authentication Required**: Uses JWT token from Supabase session.
   *
   * **Rate Limiting**: Maximum 20 uploads per hour, 100 per day per user.
   * Backend returns HTTP 429 if exceeded.
   *
   * @param request Contains fileName, contentType, and fileSize
   * @returns PresignResponse with uploadUrl, key, and expiresAt
   * @throws Error if rate limit exceeded (HTTP 429)
   * @throws Error if validation fails (HTTP 400)
   */
  async getPresignedUploadUrl(
    request: PresignRequest
  ): Promise<PresignResponse> {
    const endpoint = `${env.apiUrl}/api/v1/media/presign`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 429) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            "Upload rate limit exceeded. Please try again later."
        );
      }
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Invalid file. Please check file type and size."
        );
      }
      throw new Error(`Failed to get upload URL: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<PresignResponse>(payload);
  }

  /**
   * Confirms a completed upload and creates the media metadata record.
   *
   * **Authentication Required**: Uses JWT token from Supabase session.
   *
   * Call this after successfully uploading to R2 using the presigned URL.
   * Creates a Media record with PENDING_REVIEW status.
   *
   * @param request Contains key, originalName, contentType, fileSize, and optional entryId, category, description
   * @returns MediaMetadataDto with full media metadata
   * @throws Error if upload not found in R2 (HTTP 422)
   */
  async confirmUpload(request: ConfirmRequest): Promise<MediaMetadataDto> {
    const endpoint = `${env.apiUrl}/api/v1/media/confirm`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Upload confirmation failed: ${response.status}`
      );
    }

    const payload = await response.json();
    return this.unwrapApiResponse<MediaMetadataDto>(payload);
  }

  /**
   * Fetches media metadata for a specific directory entry.
   *
   * **Public Endpoint**: Returns only AVAILABLE media.
   *
   * @param entryId UUID of the directory entry
   * @returns Array of MediaMetadataDto for the entry
   */
  async getMediaByEntry(entryId: string): Promise<MediaMetadataDto[]> {
    const endpoint = `${env.apiUrl}/api/v1/media/entry/${entryId}`;

    const response = await fetch(endpoint, {
      method: "GET",
      next: CacheConfig.INDIVIDUAL_ENTRY,
    });

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(`Failed to fetch media: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<MediaMetadataDto[]>(payload);
  }

  /**
   * Legacy method - uploads image using presigned URL flow.
   * Kept for backwards compatibility with existing components.
   *
   * @deprecated Use getPresignedUploadUrl + confirmUpload for new implementations
   */
  async uploadImage(
    file: File,
    category?: string,
    description?: string
  ): Promise<string> {
    // Get presigned URL
    const presignResponse = await this.getPresignedUploadUrl({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
    });

    // Upload to R2 directly
    const uploadResponse = await fetch(presignResponse.uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload to storage: ${uploadResponse.status}`);
    }

    // Confirm upload
    const mediaMetadata = await this.confirmUpload({
      key: presignResponse.key,
      originalName: file.name,
      contentType: file.type,
      fileSize: file.size,
      category,
      description,
    });

    return mediaMetadata.publicUrl ?? "";
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

    const payload = (await response.json()) as unknown;
    const rawData = this.unwrapApiResponse<Town[]>(payload) ?? [];
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

    const payload = (await response.json()) as unknown;
    const town = this.unwrapApiResponse<Town>(payload);
    return validateTown(town) || undefined;
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

    const payload = (await response.json()) as unknown;
    const rawData = this.unwrapApiResponse<Town[]>(payload) ?? [];
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

    const payload = await response.json();
    return this.unwrapApiResponse<ReactionResponseDto>(payload);
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
    const processResponse = async (
      response: Response
    ): Promise<ReactionCountsDto> => {
      if (!response.ok) {
        throw new Error(`Failed to fetch reaction counts: ${response.status}`);
      }
      const payload = await response.json();
      return this.unwrapApiResponse<ReactionCountsDto>(payload);
    };

    try {
      const response = await this.authenticatedFetch(endpoint, {
        method: "GET",
        next: CacheConfig.REACTION_COUNTS,
      });
      return await processResponse(response);
    } catch (_error) {
      // If authentication failed but we're just viewing counts, try unauthenticated
      const response = await fetch(endpoint, {
        method: "GET",
        next: CacheConfig.REACTION_COUNTS,
      });
      return await processResponse(response);
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
    pageTitle: string;
    pageUrl: string;
    contentType: string;
    name: string;
    email: string;
    suggestionType: "CORRECTION" | "ADDITION" | "FEEDBACK";
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
        throw new Error(
          errorData.message || "Rate limit exceeded. Please try again later."
        );
      }
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            "Invalid suggestion data. Please check your input."
        );
      }
      throw new Error(`Failed to submit suggestion: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<{ id: string | null; message: string }>(
      payload
    );
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

    const payload = (await response.json()) as unknown;
    return this.unwrapApiResponse<DirectoryEntry[]>(payload);
  }

  /**
   * Determines whether a payload follows the ApiResponse envelope structure.
   */
  private isApiResponsePayload<T>(payload: unknown): payload is ApiResponse<T> {
    return typeof payload === "object" && payload !== null && "data" in payload;
  }

  private isPagedApiResponsePayload<T>(
    payload: unknown
  ): payload is PagedApiResponse<T> {
    return (
      typeof payload === "object" &&
      payload !== null &&
      "data" in payload &&
      ("pageable" in payload || "pagination" in payload)
    );
  }

  /**
   * Extracts the data portion from ApiResponse envelopes, enforcing the shared contract.
   */
  private unwrapApiResponse<T>(payload: unknown): T {
    if (!this.isApiResponsePayload<T>(payload)) {
      throw new Error("Unexpected API response format: missing data wrapper");
    }
    return payload.data as T;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  private getNumber(value: unknown): number | undefined {
    return typeof value === "number" ? value : undefined;
  }

  private getBoolean(value: unknown): boolean | undefined {
    return typeof value === "boolean" ? value : undefined;
  }

  /**
   * Extracts paginated results (items + metadata) from payloads.
   */
  private unwrapPagedResult<T>(payload: unknown): PaginatedResult<T> {
    if (this.isPagedApiResponsePayload<T>(payload)) {
      return {
        items: ((payload as PagedApiResponse<T>).data ?? []) as T[],
        pagination: this.extractPaginationMetadata(payload),
      };
    }

    if (this.isApiResponsePayload<T[]>(payload)) {
      return {
        items: (payload.data ?? []) as T[],
        pagination: null,
      };
    }

    throw new Error("Unexpected API response format: expected paged data");
  }

  private extractPaginationMetadata(
    payload: PagedApiResponse<unknown> | Record<string, unknown>
  ): PaginationMetadata | null {
    const payloadRecord = payload as Record<string, unknown>;
    const sourceCandidate =
      ("pageable" in payloadRecord ? payloadRecord.pageable : undefined) ??
      ("pagination" in payloadRecord ? payloadRecord.pagination : undefined);

    if (!this.isRecord(sourceCandidate)) {
      return null;
    }

    const page =
      this.getNumber(sourceCandidate.page) ??
      this.getNumber(sourceCandidate.currentPage) ??
      this.getNumber(sourceCandidate.number) ??
      this.getNumber(sourceCandidate.index) ??
      0;
    const size =
      this.getNumber(sourceCandidate.size) ??
      this.getNumber(sourceCandidate.pageSize) ??
      this.getNumber(sourceCandidate.limit) ??
      0;
    const totalElements =
      this.getNumber(sourceCandidate.totalElements) ??
      this.getNumber(sourceCandidate.total) ??
      this.getNumber(sourceCandidate.count) ??
      0;
    const totalPages =
      this.getNumber(sourceCandidate.totalPages) ??
      this.getNumber(sourceCandidate.pages) ??
      (size > 0 ? Math.max(1, Math.ceil(totalElements / size)) : 1);

    return {
      page,
      size,
      totalElements,
      totalPages,
      first:
        this.getBoolean(sourceCandidate.first) ??
        this.getBoolean(sourceCandidate.isFirst) ??
        page <= 0,
      last:
        this.getBoolean(sourceCandidate.last) ??
        this.getBoolean(sourceCandidate.isLast) ??
        page >= totalPages - 1,
    };
  }
}
