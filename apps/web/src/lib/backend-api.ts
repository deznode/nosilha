import type { DirectoryEntry } from "@/types/directory";
import type { Town } from "@/types/town";
import type {
  ErrorDetail,
  MediaMetadataDto,
  ApprovedMediaPageResponse,
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
  StorySubmitRequest,
  StorySubmittedResponse,
  StoryModerationAction,
  SuggestionModerationAction,
  DashboardCounts,
  DirectorySubmissionRequest,
  DirectorySubmissionConfirmation,
} from "@/lib/api-contracts";
import {
  type StorySubmission,
  type StoryTemplate,
  SubmissionStatus,
  StoryType,
} from "@/types/story";
import type {
  AdminStats,
  Suggestion,
  Contributor,
  ContactMessage,
  ContactMessageStatus,
  DirectorySubmission,
  AdminQueueResponse,
} from "@/types/admin";
import type {
  ReactionCreateDto,
  ReactionResponseDto,
  ReactionCountsDto,
} from "@/types/reaction";
import type {
  BookmarkDto,
  BookmarkWithEntryDto,
  BookmarkCreateRequest,
} from "@/types/bookmark";
import type {
  ProfileDto,
  ContributionsDto,
  ProfileUpdateRequest,
} from "@/types/profile";
import type { ContactRequest, ContactConfirmationDto } from "@/types/contact";
import type {
  GalleryMedia,
  GalleryMediaPageResponse,
  GalleryMediaStatus,
  SubmitExternalMediaRequest,
  CreateExternalMediaRequest,
  UpdateGalleryStatusRequest,
  ExternalMedia,
} from "@/types/gallery";
import type {
  AnalysisRunSummary,
  AnalysisRunDetail,
  ApproveEditedRequest,
  RejectRequest,
  AiStatusResponse,
  AnalysisTriggerResponse,
  AnalyzeBatchRequest,
  BatchAnalysisTriggerResponse,
  PolishContentRequest,
  PolishContentResponse,
  TranslateContentRequest,
  TranslateContentResponse,
  GeneratePromptsRequest,
  GeneratePromptsResponse,
  GenerateDirectoryContentRequest,
  DirectoryContentResponse,
  AiAvailableResponse,
} from "@/types/ai";
import type {
  R2BucketListResponse,
  BulkPresignRequest,
  BulkPresignResponse,
  BulkConfirmRequest,
  BulkConfirmResponse,
  OrphanDetectionResponse,
  LinkOrphanRequest,
  DeleteOrphanRequest,
} from "@/types/r2-admin";
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

      // Validate and sanitize return URL (prevent open redirect attacks)
      // Only allow safe internal paths: alphanumeric, hyphens, underscores, and slashes
      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";
      const safePathPattern = /^\/[a-zA-Z0-9\-_\/]*$/;

      // Build login URL with optional safe returnUrl
      let loginUrl = "/login";
      if (
        currentPath &&
        safePathPattern.test(currentPath) &&
        !currentPath.includes("//") && // Prevent protocol-relative URLs
        currentPath !== "/login" && // Don't redirect back to login
        currentPath !== "/register" // Don't redirect to auth pages
      ) {
        loginUrl = `/login?returnUrl=${encodeURIComponent(currentPath)}`;
      }

      window.location.href = loginUrl;
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
    size: number = 20,
    searchQuery?: string,
    town?: string,
    sort?: string
  ): Promise<PaginatedResult<DirectoryEntry>> {
    const params = new URLSearchParams();

    if (category.toLowerCase() !== "all") {
      params.append("category", category);
    }

    // Only add search query if it's at least 2 characters (matches backend validation)
    if (searchQuery && searchQuery.trim().length >= 2) {
      params.append("q", searchQuery.trim());
    }

    // Add town parameter if provided
    // Note: URLSearchParams automatically encodes values, no need for encodeURIComponent
    if (town) {
      params.append("town", town);
    }

    // Add sort parameter if provided
    // Valid values: name_asc, name_desc, rating_desc, created_at_desc, relevance
    if (sort) {
      params.append("sort", sort);
    }

    params.append("page", page.toString());
    params.append("size", size.toString());

    const endpoint = `${env.apiUrl}/api/v1/directory/entries?${params.toString()}`;

    // Use no-store cache for search results to ensure fresh data, ISR for regular browsing
    const fetchConfig = searchQuery
      ? { cache: "no-store" as const }
      : { next: CacheConfig.DIRECTORY_ENTRIES };

    const response = await fetch(endpoint, fetchConfig);

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
    const endpoint = `${env.apiUrl}/api/v1/gallery/upload/presign`;

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
    const endpoint = `${env.apiUrl}/api/v1/gallery/upload/confirm`;

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
    const endpoint = `${env.apiUrl}/api/v1/gallery/entry/${entryId}`;

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
   * Get approved (AVAILABLE) user-uploaded media for gallery display.
   *
   * This fetches media that has been uploaded by users and approved by admins.
   * Used by the gallery page to display community-contributed photos alongside
   * curated external media.
   *
   * @param options Query parameters (contentType prefix for filtering, pagination)
   * @returns ApprovedMediaPageResponse with paginated approved media
   */
  async getApprovedMedia(options?: {
    contentType?: string;
    page?: number;
    size?: number;
  }): Promise<ApprovedMediaPageResponse> {
    const params = new URLSearchParams();
    if (options?.contentType) params.set("contentType", options.contentType);
    if (options?.page !== undefined)
      params.set("page", options.page.toString());
    if (options?.size !== undefined)
      params.set("size", options.size.toString());

    const queryString = params.toString();
    const endpoint = `${env.apiUrl}/api/v1/gallery/approved${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(endpoint, {
      method: "GET",
      next: CacheConfig.GALLERY, // Use gallery cache config (30 min revalidation)
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch approved media: ${response.status}`);
    }

    const payload: PagedApiResponse<MediaMetadataDto> = await response.json();

    return {
      items: payload.data,
      totalItems: payload.pageable.totalElements,
      totalPages: payload.pageable.totalPages,
      currentPage: payload.pageable.page,
    };
  }

  /**
   * Legacy method - uploads image using presigned URL flow.
   * Kept for backwards compatibility with existing components.
   *
   * @deprecated Use getPresignedUploadUrl + confirmUpload for new implementations
   */
  async uploadImage(
    file: File,
    options?: {
      entryId?: string;
      category?: string;
      description?: string;
    }
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

    // Confirm upload with entry association
    const mediaMetadata = await this.confirmUpload({
      key: presignResponse.key,
      originalName: file.name,
      contentType: file.type,
      fileSize: file.size,
      entryId: options?.entryId,
      category: options?.category,
      description: options?.description,
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
   * Submits a directory entry for review.
   *
   * **Authenticated Endpoint**: Requires valid JWT token.
   * User info is extracted from the token on the backend.
   *
   * @param request Contains name, category, town, description, and optional fields
   * @returns DirectorySubmissionConfirmation with id, name, and status
   * @throws Error if rate limit exceeded (HTTP 429)
   * @throws Error if validation fails (HTTP 400)
   * @throws Error if not authenticated (HTTP 401)
   */
  async submitDirectoryEntry(
    request: DirectorySubmissionRequest
  ): Promise<DirectorySubmissionConfirmation> {
    // Use new unified endpoint in places module
    const endpoint = `${env.apiUrl}/api/v1/directory/submissions`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      cache: "no-store", // Never cache POST requests
    });

    if (!response.ok) {
      if (response.status === 429) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            "You've exceeded the maximum number of submissions. Please try again later."
        );
      }
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            "Invalid submission data. Please check your input."
        );
      }
      throw new Error(`Failed to submit directory entry: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<DirectorySubmissionConfirmation>(payload);
  }

  // ================================
  // BOOKMARK OPERATIONS (User Story 2)
  // ================================

  /**
   * Creates a bookmark for a directory entry.
   *
   * **Authentication Required**: Uses JWT token from Supabase session.
   *
   * **Business Rules**:
   * - Maximum 100 bookmarks per user
   * - Returns 409 Conflict if entry already bookmarked
   * - Returns 404 if directory entry not found
   *
   * **Rate Limiting**: Standard API rate limiting applies.
   *
   * @param entryId UUID of the directory entry to bookmark
   * @returns BookmarkDto with bookmark details
   * @throws Error if maximum bookmarks reached (HTTP 400)
   * @throws Error if already bookmarked (HTTP 409)
   * @throws Error if entry not found (HTTP 404)
   * @throws Error if authentication failed (HTTP 401)
   */
  async createBookmark(entryId: string): Promise<BookmarkDto> {
    const endpoint = `${env.apiUrl}/api/v1/bookmarks`;

    const requestBody: BookmarkCreateRequest = { entryId };

    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      cache: "no-store", // Never cache POST requests
    });

    if (!response.ok) {
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Maximum bookmark limit reached.");
      }
      if (response.status === 409) {
        throw new Error("This entry is already bookmarked.");
      }
      if (response.status === 404) {
        throw new Error("Directory entry not found.");
      }
      throw new Error(`Failed to create bookmark: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<BookmarkDto>(payload);
  }

  /**
   * Removes a bookmark for a directory entry.
   *
   * **Authentication Required**: Uses JWT token from Supabase session.
   *
   * @param entryId UUID of the directory entry to unbookmark
   * @throws Error if bookmark not found (HTTP 404)
   * @throws Error if authentication failed (HTTP 401)
   */
  async deleteBookmark(entryId: string): Promise<void> {
    const endpoint = `${env.apiUrl}/api/v1/bookmarks/${entryId}`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "DELETE",
      cache: "no-store", // Never cache DELETE requests
    });

    if (!response.ok && response.status !== 204) {
      if (response.status === 404) {
        throw new Error("Bookmark not found");
      }
      throw new Error(`Failed to delete bookmark: ${response.status}`);
    }
  }

  /**
   * Gets paginated list of user's bookmarked entries with full entry details.
   *
   * **Authentication Required**: Uses JWT token from Supabase session.
   *
   * Returns bookmarks sorted by creation date (most recent first).
   *
   * @param page Page number (0-indexed, default: 0)
   * @param size Page size (default: 20, max: 100)
   * @returns PaginatedResult with BookmarkWithEntryDto items
   * @throws Error if authentication failed (HTTP 401)
   */
  async getBookmarks(
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResult<BookmarkWithEntryDto>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    const endpoint = `${env.apiUrl}/api/v1/users/me/bookmarks?${params.toString()}`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "GET",
      cache: "no-store", // Never cache authenticated user data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bookmarks: ${response.status}`);
    }

    const payload = (await response.json()) as unknown;
    return this.unwrapPagedResult<BookmarkWithEntryDto>(payload);
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

  // ================================
  // STORY SUBMISSION OPERATIONS
  // ================================

  /**
   * Submits a new story.
   *
   * **Authentication Required**: Requires USER or ADMIN role.
   *
   * **Rate Limiting**: 5 submissions per hour per IP address.
   *
   * **Spam Protection**: Honeypot field validation on server side.
   *
   * @param data Contains title, content, storyType, and optional fields
   * @returns StorySubmittedResponse with id and confirmation message
   * @throws Error if rate limit exceeded (HTTP 429)
   * @throws Error if validation fails (HTTP 400)
   * @throws Error if authentication failed (HTTP 401/403)
   */
  async submitStory(data: StorySubmitRequest): Promise<StorySubmittedResponse> {
    const endpoint = `${env.apiUrl}/api/v1/stories`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
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
          errorData.message || "Invalid story data. Please check your input."
        );
      }
      throw new Error(`Failed to submit story: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<StorySubmittedResponse>(payload);
  }

  /**
   * Fetches published stories from the backend API.
   * Uses ISR with 30 minute cache for story listings.
   *
   * **Public Endpoint**: No authentication required.
   *
   * @param page Page number (0-indexed, default: 0)
   * @param size Page size (default: 20)
   * @returns PaginatedResult with published stories
   */
  async getStories(
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResult<StorySubmission>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    const endpoint = `${env.apiUrl}/api/v1/stories?${params.toString()}`;

    // Use ISR with 30 minute cache for story listings
    const response = await fetch(endpoint, {
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const payload = (await response.json()) as unknown;
    return this.unwrapPagedResult<StorySubmission>(payload);
  }

  /**
   * Fetches a single story by its slug from the backend API.
   * Uses ISR with 30 minute cache for individual stories.
   *
   * **Public Endpoint**: No authentication required.
   * Only returns APPROVED/PUBLISHED stories.
   *
   * @param slug The slug of the story to fetch
   * @returns StorySubmission or undefined if not found
   */
  async getStoryBySlug(slug: string): Promise<StorySubmission | undefined> {
    const endpoint = `${env.apiUrl}/api/v1/stories/slug/${slug}`;

    // Use ISR with 30 minute cache for individual stories
    const response = await fetch(endpoint, {
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const payload = (await response.json()) as unknown;
    return this.unwrapApiResponse<StorySubmission>(payload);
  }

  // ================================
  // ADMIN STORY MODERATION OPERATIONS
  // ================================

  /**
   * Gets stories for admin moderation queue.
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * @param status Filter by submission status (optional)
   * @param page Page number (0-indexed)
   * @param size Page size
   */
  async getStoriesForAdmin(
    status?: SubmissionStatus | "ALL",
    page: number = 0,
    size: number = 20
  ): Promise<AdminQueueResponse<StorySubmission>> {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (status && status !== "ALL") {
      params.append("status", status);
    }

    const endpoint = `${env.apiUrl}/api/v1/admin/stories?${params}`;
    const response = await this.authenticatedFetch(endpoint);

    if (!response.ok) {
      throw new Error(`Failed to fetch stories: ${response.status}`);
    }

    const payload = await response.json();
    return this.transformAdminStoryResponse(payload);
  }

  /**
   * Transforms backend story response to frontend StorySubmission type.
   * Maps StoryDetailDto fields to frontend StorySubmission interface.
   */
  private transformAdminStoryResponse(
    payload: unknown
  ): AdminQueueResponse<StorySubmission> {
    const unwrapped = this.unwrapApiResponse<unknown>(payload);

    let rawItems: Record<string, unknown>[];
    let pagination: { totalElements: number; number: number; size: number };

    if (Array.isArray(unwrapped)) {
      rawItems = unwrapped as Record<string, unknown>[];
      const payloadRecord = payload as Record<string, unknown>;
      const pageable =
        (payloadRecord.pageable as Record<string, unknown>) || {};
      pagination = {
        totalElements: (pageable.totalElements as number) || 0,
        number: (pageable.page as number) || 0,
        size: (pageable.size as number) || 20,
      };
    } else {
      const data = unwrapped as {
        content: Record<string, unknown>[];
        page: typeof pagination;
      };
      rawItems = data.content || [];
      pagination = data.page || { totalElements: 0, number: 0, size: 20 };
    }

    // Map backend StoryDetailDto to frontend StorySubmission type
    const items: StorySubmission[] = rawItems.map((dto) => ({
      id: String(dto.id),
      slug: (dto.publicationSlug as string) || String(dto.id),
      title: (dto.title as string) || "",
      content: (dto.content as string) || "",
      author: (dto.authorId as string) || "Anonymous",
      authorId: dto.authorId as string | undefined,
      type: this.mapBackendStoryType(dto.storyType as string),
      status: this.mapBackendStoryStatus(dto.status as string),
      submittedAt: (dto.createdAt as string) || new Date().toISOString(),
      location: dto.relatedPlaceId ? String(dto.relatedPlaceId) : undefined,
      imageUrl: undefined, // Not provided by backend
      templateType: this.mapBackendTemplateType(
        dto.templateType as string | undefined
      ),
      adminNotes: dto.adminNotes as string | undefined,
      reviewedBy: dto.reviewedBy as string | undefined,
      reviewedAt: dto.reviewedAt as string | undefined,
    }));

    return {
      items,
      total: pagination.totalElements,
      page: pagination.number + 1,
      pageSize: pagination.size,
      hasMore:
        pagination.number <
        Math.ceil(pagination.totalElements / pagination.size) - 1,
    };
  }

  /**
   * Maps backend StoryType enum to frontend StoryType.
   */
  private mapBackendStoryType(backendType: string): StoryType {
    const typeMap: Record<string, StoryType> = {
      QUICK: StoryType.QUICK,
      FULL: StoryType.FULL,
      GUIDED: StoryType.GUIDED,
    };
    return typeMap[backendType] || StoryType.FULL;
  }

  /**
   * Maps backend StoryStatus enum to frontend SubmissionStatus.
   */
  private mapBackendStoryStatus(backendStatus: string): SubmissionStatus {
    const statusMap: Record<string, SubmissionStatus> = {
      PENDING: SubmissionStatus.PENDING,
      APPROVED: SubmissionStatus.APPROVED,
      REJECTED: SubmissionStatus.REJECTED,
      NEEDS_REVISION: SubmissionStatus.PENDING, // Map to PENDING in frontend
      PUBLISHED: SubmissionStatus.APPROVED, // Published = approved in frontend
    };
    return statusMap[backendStatus] || SubmissionStatus.PENDING;
  }

  /**
   * Maps backend TemplateType enum to frontend StoryTemplate.
   */
  private mapBackendTemplateType(
    backendType: string | undefined
  ): StoryTemplate | undefined {
    if (!backendType) return undefined;
    const templateMap: Record<string, StoryTemplate> = {
      FAMILY: "FAMILY",
      CHILDHOOD: "CHILDHOOD",
      DIASPORA: "DIASPORA",
      TRADITIONS: "TRADITIONS",
      FOOD: "FOOD",
      NARRATIVE: "NARRATIVE",
      RECIPE: "RECIPE",
      MIGRATION: "MIGRATION",
    };
    return templateMap[backendType];
  }

  /**
   * Updates story moderation status.
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * @param id Story submission ID
   * @param action Moderation action (APPROVE, REJECT, PUBLISH, UNPUBLISH)
   * @param notes Optional admin notes
   * @param slug Required when action is PUBLISH - the URL-friendly publication slug
   */
  async updateStoryStatus(
    id: string,
    action: StoryModerationAction,
    notes?: string,
    slug?: string
  ): Promise<void> {
    const endpoint = `${env.apiUrl}/api/v1/admin/stories/${id}`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        adminNotes: notes,
        publicationSlug: slug,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update story status: ${response.status}`);
    }
  }

  /**
   * Toggles featured status for a story.
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * @param id Story submission ID
   * @param featured Whether to feature the story
   */
  async toggleStoryFeatured(id: string, featured: boolean): Promise<void> {
    const endpoint = `${env.apiUrl}/api/v1/admin/stories/${id}/featured`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isFeatured: featured }),
    });

    if (!response.ok) {
      throw new Error(`Failed to toggle featured status: ${response.status}`);
    }
  }

  /**
   * Deletes a story submission.
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * @param id Story submission ID
   */
  async deleteStory(id: string): Promise<void> {
    const endpoint = `${env.apiUrl}/api/v1/admin/stories/${id}`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "DELETE",
    });

    if (!response.ok && response.status !== 204) {
      throw new Error(`Failed to delete story: ${response.status}`);
    }
  }

  // ================================
  // MDX ARCHIVAL ENGINE OPERATIONS
  // ================================

  /**
   * Generates MDX content from an approved story.
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * @param storyId The story submission ID
   * @param options Optional configuration (translations, language)
   */
  async generateMdx(
    storyId: string,
    options?: import("@/types/admin").GenerateMdxOptions
  ): Promise<import("@/types/admin").MdxContent> {
    const endpoint = `${env.apiUrl}/api/v1/admin/stories/${storyId}/generate-mdx`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options || {}),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate MDX: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<import("@/types/admin").MdxContent>(payload);
  }

  /**
   * Commits MDX content to the repository.
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * @param storyId The story submission ID
   * @param mdxSource The MDX content to commit
   * @param commitMessage Optional custom commit message
   */
  async commitMdx(
    storyId: string,
    mdxSource: string,
    commitMessage?: string
  ): Promise<import("@/types/admin").MdxCommitResult> {
    const endpoint = `${env.apiUrl}/api/v1/admin/stories/${storyId}/commit-mdx`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mdxSource, commitMessage }),
    });

    if (!response.ok) {
      throw new Error(`Failed to commit MDX: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<import("@/types/admin").MdxCommitResult>(
      payload
    );
  }

  // ================================
  // ADMIN SUGGESTION MODERATION OPERATIONS
  // ================================

  /**
   * Gets suggestions for admin moderation queue.
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * @param status Filter by submission status (optional)
   * @param page Page number (0-indexed)
   * @param size Page size
   */
  async getSuggestionsForAdmin(
    status?: SubmissionStatus | "ALL",
    page: number = 0,
    size: number = 20
  ): Promise<AdminQueueResponse<Suggestion>> {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (status && status !== "ALL") {
      params.append("status", status);
    }

    const endpoint = `${env.apiUrl}/api/v1/admin/suggestions?${params}`;
    const response = await this.authenticatedFetch(endpoint);

    if (!response.ok) {
      throw new Error(`Failed to fetch suggestions: ${response.status}`);
    }

    const payload = await response.json();
    return this.transformAdminSuggestionResponse(payload);
  }

  /**
   * Transforms backend suggestion response to frontend Suggestion type.
   * Maps SuggestionDetailDto fields to frontend Suggestion interface.
   */
  private transformAdminSuggestionResponse(
    payload: unknown
  ): AdminQueueResponse<Suggestion> {
    const unwrapped = this.unwrapApiResponse<unknown>(payload);

    let rawItems: Record<string, unknown>[];
    let pagination: { totalElements: number; number: number; size: number };

    if (Array.isArray(unwrapped)) {
      rawItems = unwrapped as Record<string, unknown>[];
      const payloadRecord = payload as Record<string, unknown>;
      const pageable =
        (payloadRecord.pageable as Record<string, unknown>) || {};
      pagination = {
        totalElements: (pageable.totalElements as number) || 0,
        number: (pageable.page as number) || 0,
        size: (pageable.size as number) || 20,
      };
    } else {
      const data = unwrapped as {
        content: Record<string, unknown>[];
        page: typeof pagination;
      };
      rawItems = data.content || [];
      pagination = data.page || { totalElements: 0, number: 0, size: 20 };
    }

    // Map backend SuggestionDetailDto to frontend Suggestion type
    const items: Suggestion[] = rawItems.map((dto) => ({
      id: dto.id as string,
      target: (dto.pageTitle as string) || `${dto.suggestionType} Suggestion`,
      targetId: dto.contentId as string | undefined,
      targetType: this.mapContentTypeToTargetType(dto.contentType as string),
      description: (dto.message as string) || "",
      status: dto.status as SubmissionStatus,
      submittedBy: dto.name as string,
      submittedByEmail: dto.email as string | undefined,
      timestamp: dto.createdAt as string,
      adminNotes: dto.adminNotes as string | undefined,
      reviewedBy: dto.reviewedBy as string | undefined,
      reviewedAt: dto.reviewedAt as string | undefined,
    }));

    return {
      items,
      total: pagination.totalElements,
      page: pagination.number + 1,
      pageSize: pagination.size,
      hasMore:
        pagination.number <
        Math.ceil(pagination.totalElements / pagination.size) - 1,
    };
  }

  /**
   * Maps backend contentType to frontend targetType.
   */
  private mapContentTypeToTargetType(
    contentType: string | undefined
  ): "directory" | "article" | "story" | undefined {
    if (!contentType) return undefined;
    const ct = contentType.toLowerCase();
    if (
      ct.includes("directory") ||
      ct.includes("restaurant") ||
      ct.includes("landmark")
    ) {
      return "directory";
    }
    if (ct.includes("article") || ct.includes("heritage")) {
      return "article";
    }
    if (ct.includes("story")) {
      return "story";
    }
    return undefined;
  }

  /**
   * Updates suggestion moderation status.
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * @param id Suggestion ID
   * @param action Moderation action (APPROVE, REJECT)
   * @param notes Optional admin notes
   */
  async updateSuggestionStatus(
    id: string,
    action: SuggestionModerationAction,
    notes?: string
  ): Promise<void> {
    const endpoint = `${env.apiUrl}/api/v1/admin/suggestions/${id}`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        adminNotes: notes,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update suggestion status: ${response.status}`);
    }
  }

  /**
   * Deletes a suggestion.
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * @param id Suggestion ID
   */
  async deleteSuggestion(id: string): Promise<void> {
    const endpoint = `${env.apiUrl}/api/v1/admin/suggestions/${id}`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "DELETE",
    });

    if (!response.ok && response.status !== 204) {
      throw new Error(`Failed to delete suggestion: ${response.status}`);
    }
  }

  // ================================
  // ADMIN DASHBOARD OPERATIONS
  // ================================

  /**
   * Gets admin dashboard statistics.
   *
   * **Authentication Required**: Requires ADMIN role.
   */
  async getAdminStats(): Promise<AdminStats> {
    const endpoint = `${env.apiUrl}/api/v1/admin/dashboard/stats`;
    const response = await this.authenticatedFetch(endpoint);

    if (!response.ok) {
      throw new Error(`Failed to fetch admin stats: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<AdminStats>(payload);
  }

  /**
   * Gets dashboard counts for pending items.
   *
   * **Authentication Required**: Requires ADMIN role.
   */
  async getDashboardCounts(): Promise<DashboardCounts> {
    const endpoint = `${env.apiUrl}/api/v1/admin/dashboard/counts`;
    const response = await this.authenticatedFetch(endpoint);

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard counts: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<DashboardCounts>(payload);
  }

  /**
   * Gets top contributors list.
   *
   * **Authentication Required**: Requires ADMIN role.
   */
  async getTopContributors(): Promise<Contributor[]> {
    const endpoint = `${env.apiUrl}/api/v1/admin/dashboard/contributors`;
    const response = await this.authenticatedFetch(endpoint);

    if (!response.ok) {
      throw new Error(`Failed to fetch top contributors: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<Contributor[]>(payload);
  }

  // ================================
  // ADMIN CONTACT MESSAGES
  // ================================

  /**
   * Gets contact messages for admin with optional status filtering.
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * @param status Optional status filter (UNREAD, READ, ARCHIVED)
   * @param page Page number (0-indexed, default: 0)
   * @param size Page size (default: 20)
   * @returns AdminQueueResponse with ContactMessage items
   * @throws Error if authentication failed (HTTP 401/403)
   */
  async getContactMessages(
    status?: ContactMessageStatus,
    page: number = 0,
    size: number = 20
  ): Promise<AdminQueueResponse<ContactMessage>> {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (status) {
      params.append("status", status);
    }

    const endpoint = `${env.apiUrl}/api/v1/admin/contact?${params}`;
    const response = await this.authenticatedFetch(endpoint);

    if (!response.ok) {
      throw new Error(`Failed to fetch contact messages: ${response.status}`);
    }

    const payload = await response.json();
    return this.transformAdminQueueResponse<ContactMessage>(payload);
  }

  /**
   * Updates contact message status.
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * @param id Contact message ID
   * @param status New status (UNREAD, READ, ARCHIVED)
   * @returns Updated ContactMessage
   * @throws Error if message not found (HTTP 404)
   * @throws Error if authentication failed (HTTP 401/403)
   */
  async updateContactMessageStatus(
    id: string,
    status: ContactMessageStatus
  ): Promise<ContactMessage> {
    const endpoint = `${env.apiUrl}/api/v1/admin/contact/${id}`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Contact message not found");
      }
      throw new Error(
        `Failed to update contact message status: ${response.status}`
      );
    }

    const payload = await response.json();
    return this.unwrapApiResponse<ContactMessage>(payload);
  }

  /**
   * Deletes a contact message.
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * @param id Contact message ID
   * @throws Error if message not found (HTTP 404)
   * @throws Error if authentication failed (HTTP 401/403)
   */
  async deleteContactMessage(id: string): Promise<void> {
    const endpoint = `${env.apiUrl}/api/v1/admin/contact/${id}`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "DELETE",
    });

    if (!response.ok && response.status !== 204) {
      if (response.status === 404) {
        throw new Error("Contact message not found");
      }
      throw new Error(`Failed to delete contact message: ${response.status}`);
    }
  }

  // ================================
  // ADMIN DIRECTORY SUBMISSIONS
  // ================================

  /**
   * Gets directory entries for admin with optional status filtering.
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * Unified endpoint that returns all directory entries (both seeded and submitted).
   * Filter by status: PENDING for moderation queue, PUBLISHED for live entries, etc.
   *
   * @param status Optional status filter (PENDING, APPROVED, PUBLISHED, ARCHIVED)
   * @param page Page number (0-indexed, default: 0)
   * @param size Page size (default: 20)
   * @returns AdminQueueResponse with DirectorySubmission items
   * @throws Error if authentication failed (HTTP 401/403)
   */
  async getDirectorySubmissions(
    status?: SubmissionStatus | "ALL",
    page: number = 0,
    size: number = 20
  ): Promise<AdminQueueResponse<DirectorySubmission>> {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (status && status !== "ALL") {
      params.append("status", status);
    }

    // Use unified endpoint in places module
    const endpoint = `${env.apiUrl}/api/v1/admin/directory/entries?${params}`;
    const response = await this.authenticatedFetch(endpoint);

    if (!response.ok) {
      throw new Error(`Failed to fetch directory entries: ${response.status}`);
    }

    const payload = await response.json();
    return this.transformAdminDirectorySubmissionResponse(payload);
  }

  /**
   * Updates directory entry status.
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * @param id Directory entry ID
   * @param status New status (PENDING, APPROVED, PUBLISHED, ARCHIVED)
   * @param notes Optional admin notes explaining the decision
   * @returns Updated DirectorySubmission
   * @throws Error if entry not found (HTTP 404)
   * @throws Error if authentication failed (HTTP 401/403)
   */
  async updateDirectorySubmissionStatus(
    id: string,
    status: SubmissionStatus,
    notes?: string
  ): Promise<DirectorySubmission> {
    // Use unified endpoint in places module
    const endpoint = `${env.apiUrl}/api/v1/admin/directory/entries/${id}/status`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, adminNotes: notes }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Directory entry not found");
      }
      throw new Error(
        `Failed to update directory entry status: ${response.status}`
      );
    }

    const payload = await response.json();
    return this.transformDirectorySubmission(
      this.unwrapApiResponse<Record<string, unknown>>(payload)
    );
  }

  /**
   * Updates an existing directory entry.
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * @param id Directory entry ID
   * @param data Update data
   * @returns Updated DirectorySubmission
   * @throws Error if entry not found (HTTP 404)
   * @throws Error if validation fails (HTTP 400)
   * @throws Error if authentication failed (HTTP 401/403)
   */
  async updateDirectoryEntry(
    id: string,
    data: import("@/lib/api-contracts").UpdateDirectoryEntryRequest
  ): Promise<DirectorySubmission> {
    const endpoint = `${env.apiUrl}/api/v1/directory/entries/${id}`;

    // Transform category to uppercase for backend
    const requestData = {
      ...data,
      category: data.category?.toUpperCase(),
    };

    const response = await this.authenticatedFetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Directory entry not found");
      }
      if (response.status === 400) {
        const error = await response.json();
        throw new Error(error.message || "Invalid update data");
      }
      throw new Error(`Failed to update directory entry: ${response.status}`);
    }

    const payload = await response.json();
    return this.transformDirectorySubmission(
      this.unwrapApiResponse<Record<string, unknown>>(payload)
    );
  }

  /**
   * Deletes a directory entry permanently.
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * @param id Directory entry ID
   * @throws Error if entry not found (HTTP 404)
   * @throws Error if authentication failed (HTTP 401/403)
   */
  async deleteDirectoryEntry(id: string): Promise<void> {
    const endpoint = `${env.apiUrl}/api/v1/directory/entries/${id}`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "DELETE",
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Directory entry not found");
      }
      throw new Error(`Failed to delete directory entry: ${response.status}`);
    }
  }

  /**
   * Transforms backend directory submission to frontend format.
   * Backend sends uppercase enum values (RESTAURANT), frontend expects title case (Restaurant).
   */
  private transformDirectorySubmission(
    dto: Record<string, unknown>
  ): DirectorySubmission {
    // Convert uppercase category to title case (RESTAURANT → Restaurant)
    const categoryMap: Record<
      string,
      "Restaurant" | "Hotel" | "Beach" | "Heritage" | "Nature"
    > = {
      RESTAURANT: "Restaurant",
      HOTEL: "Hotel",
      BEACH: "Beach",
      HERITAGE: "Heritage",
      NATURE: "Nature",
      // Also support already title-case values for backwards compatibility
      Restaurant: "Restaurant",
      Hotel: "Hotel",
      Beach: "Beach",
      Heritage: "Heritage",
      Nature: "Nature",
      // Support legacy values for backward compatibility
      LANDMARK: "Heritage",
      Landmark: "Heritage",
    };
    const rawCategory = (dto.category as string) || "Restaurant";
    const category = categoryMap[rawCategory] || "Restaurant";

    return {
      id: dto.id as string,
      name: dto.name as string,
      category,
      town: dto.town as string,
      customTown: dto.customTown as string | undefined,
      description: dto.description as string,
      tags: (dto.tags as string[]) || [],
      imageUrl: dto.imageUrl as string | undefined,
      priceLevel: dto.priceLevel as "$" | "$$" | "$$$" | undefined,
      latitude: dto.latitude as number | undefined,
      longitude: dto.longitude as number | undefined,
      status: dto.status as SubmissionStatus,
      submittedBy: dto.submittedBy as string,
      submittedByEmail: dto.submittedByEmail as string | undefined,
      submittedAt: dto.submittedAt as string,
      adminNotes: dto.adminNotes as string | undefined,
      reviewedBy: dto.reviewedBy as string | undefined,
      reviewedAt: dto.reviewedAt as string | undefined,
    };
  }

  /**
   * Transforms backend paged response to AdminQueueResponse format for directory submissions.
   *
   * Backend returns PagedApiResult with structure:
   * { data: [...], pageable: { page, size, totalElements, ... }, timestamp, status }
   */
  private transformAdminDirectorySubmissionResponse(
    payload: unknown
  ): AdminQueueResponse<DirectorySubmission> {
    // PagedApiResult has data as array and pageable for pagination
    const response = payload as {
      data: Record<string, unknown>[];
      pageable: {
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
        first: boolean;
        last: boolean;
      };
    };

    const rawItems = response.data || [];
    const pageable = response.pageable || {
      page: 0,
      size: 20,
      totalElements: 0,
      last: true,
    };

    const items = rawItems.map((dto) => this.transformDirectorySubmission(dto));

    return {
      items,
      total: pageable.totalElements,
      page: pageable.page + 1, // Convert 0-indexed to 1-indexed
      pageSize: pageable.size,
      hasMore: !pageable.last,
    };
  }

  // ================================
  // ADMIN MEDIA MODERATION OPERATIONS
  // ================================

  /**
   * Gets media items for admin moderation queue.
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * @param status Filter by media status (optional)
   * @param page Page number (0-indexed)
   * @param size Page size
   */
  async getAdminMedia(
    status?: import("@/types/admin").MediaStatus | "ALL",
    page: number = 0,
    size: number = 20
  ): Promise<AdminQueueResponse<import("@/types/admin").AdminMediaListItem>> {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (status && status !== "ALL") {
      params.append("status", status);
    }

    const endpoint = `${env.apiUrl}/api/v1/admin/media?${params}`;
    const response = await this.authenticatedFetch(endpoint);

    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.status}`);
    }

    const payload = await response.json();
    return this.transformAdminMediaResponse(payload);
  }

  /**
   * Gets detailed media information for moderation.
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * @param id Media item ID
   */
  async getAdminMediaDetail(
    id: string
  ): Promise<import("@/types/admin").AdminMediaDetail> {
    const endpoint = `${env.apiUrl}/api/v1/admin/media/${id}`;
    const response = await this.authenticatedFetch(endpoint);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Media not found");
      }
      throw new Error(`Failed to fetch media detail: ${response.status}`);
    }

    const payload = await response.json();
    const dto = this.unwrapApiResponse<Record<string, unknown>>(payload);
    return this.transformMediaDetail(dto);
  }

  /**
   * Updates media moderation status.
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * @param id Media item ID
   * @param request Update request with action and optional notes
   */
  async updateMediaStatus(
    id: string,
    request: import("@/types/admin").UpdateMediaStatusRequest
  ): Promise<import("@/types/admin").AdminMediaDetail> {
    const endpoint = `${env.apiUrl}/api/v1/admin/media/${id}`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Media not found");
      }
      throw new Error(`Failed to update media status: ${response.status}`);
    }

    const payload = await response.json();
    const dto = this.unwrapApiResponse<Record<string, unknown>>(payload);
    return this.transformMediaDetail(dto);
  }

  /**
   * Deletes a media item (soft delete).
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * @param id Media item ID
   */
  async deleteMedia(id: string): Promise<void> {
    const endpoint = `${env.apiUrl}/api/v1/admin/media/${id}`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "DELETE",
    });

    if (!response.ok && response.status !== 204) {
      if (response.status === 404) {
        throw new Error("Media not found");
      }
      throw new Error(`Failed to delete media: ${response.status}`);
    }
  }

  /**
   * Transforms backend media response to AdminQueueResponse format.
   * Maps MediaDetailDto fields to frontend AdminMediaListItem interface.
   *
   * Backend returns PagedApiResult with structure:
   * { data: [...], pageable: { page, size, totalElements, ... }, timestamp, status }
   */
  private transformAdminMediaResponse(
    payload: unknown
  ): AdminQueueResponse<import("@/types/admin").AdminMediaListItem> {
    // PagedApiResult has data as array and pageable for pagination
    const response = payload as {
      data: Record<string, unknown>[];
      pageable: {
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
        first: boolean;
        last: boolean;
      };
    };

    const rawItems = response.data || [];
    const pageable = response.pageable || {
      page: 0,
      size: 20,
      totalElements: 0,
      last: true,
    };

    const items = rawItems.map(
      (dto): import("@/types/admin").AdminMediaListItem => ({
        id: dto.id as string,
        title:
          (dto.title as string) || (dto.originalName as string) || "Untitled",
        contentType: (dto.contentType as string) || "unknown",
        thumbnailUrl: dto.publicUrl as string | undefined,
        status:
          (dto.status as import("@/types/admin").MediaStatus) || "PENDING",
        severity: (dto.severity as number) || 0,
        uploadedBy: dto.uploadedBy as string | undefined,
        createdAt: (dto.createdAt as string) || new Date().toISOString(),
      })
    );

    return {
      items,
      total: pageable.totalElements,
      page: pageable.page + 1, // Convert 0-indexed to 1-indexed
      pageSize: pageable.size,
      hasMore: !pageable.last,
    };
  }

  /**
   * Transforms backend media DTO to AdminMediaDetail.
   */
  private transformMediaDetail(
    dto: Record<string, unknown>
  ): import("@/types/admin").AdminMediaDetail {
    return {
      id: dto.id as string,
      title:
        (dto.title as string) || (dto.originalName as string) || "Untitled",
      contentType: (dto.contentType as string) || "unknown",
      thumbnailUrl: dto.thumbnailUrl as string | undefined,
      status: (dto.status as import("@/types/admin").MediaStatus) || "PENDING",
      severity: (dto.severity as number) || 0,
      uploadedBy: dto.uploadedBy as string | undefined,
      createdAt: (dto.createdAt as string) || new Date().toISOString(),
      fileName: (dto.fileName as string) || (dto.originalName as string) || "",
      publicUrl: dto.publicUrl as string | undefined,
      category: dto.category as string | undefined,
      description: dto.description as string | undefined,
      reviewedBy: dto.reviewedBy as string | undefined,
      reviewedAt: dto.reviewedAt as string | undefined,
      rejectionReason: dto.rejectionReason as string | undefined,
    };
  }

  // ================================
  // PROFILE OPERATIONS (User Story 1)
  // ================================

  /**
   * Gets authenticated user's profile.
   *
   * **Authentication Required**: Uses JWT token from Supabase session.
   *
   * Retrieves the profile for the authenticated user. If no profile exists,
   * the backend automatically creates one with default settings.
   *
   * @returns ProfileDto with user profile information
   * @throws Error if authentication failed (HTTP 401)
   */
  async getProfile(): Promise<ProfileDto> {
    const endpoint = `${env.apiUrl}/api/v1/users/me`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "GET",
      cache: "no-store", // Always fetch fresh profile data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<ProfileDto>(payload);
  }

  /**
   * Gets authenticated user's contributions.
   *
   * **Authentication Required**: Uses JWT token from Supabase session.
   *
   * Retrieves aggregated contribution data including:
   * - Reactions: Counts grouped by reaction type (LOVE, CELEBRATE, INSIGHTFUL, SUPPORT)
   * - Suggestions: List of content improvement suggestions with status
   * - Stories: List of submitted stories with moderation status
   *
   * @returns ContributionsDto with aggregated contribution data
   * @throws Error if authentication failed (HTTP 401)
   */
  async getContributions(): Promise<ContributionsDto> {
    const endpoint = `${env.apiUrl}/api/v1/users/me/contributions`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "GET",
      cache: "no-store", // Always fetch fresh contributions data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch contributions: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<ContributionsDto>(payload);
  }

  /**
   * Updates authenticated user's profile.
   *
   * **Authentication Required**: Uses JWT token from Supabase session.
   *
   * All fields in the request are optional to support partial updates.
   * Rate limited to 10 updates per minute.
   *
   * @param request Profile update data (all fields optional)
   * @returns Updated ProfileDto
   * @throws Error if rate limit exceeded (HTTP 429)
   * @throws Error if validation fails (HTTP 400)
   * @throws Error if authentication failed (HTTP 401)
   */
  async updateProfile(request: ProfileUpdateRequest): Promise<ProfileDto> {
    const endpoint = `${env.apiUrl}/api/v1/users/me`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      cache: "no-store", // Never cache profile updates
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Too many profile updates. Please wait a moment.");
      }
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid profile data.");
      }
      throw new Error(`Failed to update profile: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<ProfileDto>(payload);
  }

  // ================================
  // CONTACT FORM OPERATIONS (User Story 5)
  // ================================

  /**
   * Submits a contact form message.
   *
   * **Public Endpoint**: No authentication required - allows anonymous contact.
   *
   * **Rate Limiting**: 3 submissions per hour per IP address.
   *
   * @param request Contact form data (name, email, subjectCategory, message)
   * @returns ContactConfirmationDto with submission ID and confirmation message
   * @throws Error if rate limit exceeded (HTTP 429)
   * @throws Error if validation fails (HTTP 400)
   */
  async submitContactMessage(
    request: ContactRequest
  ): Promise<ContactConfirmationDto> {
    const endpoint = `${env.apiUrl}/api/v1/contact`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      cache: "no-store", // Never cache POST requests
    });

    if (!response.ok) {
      if (response.status === 429) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            "You've exceeded the maximum number of contact submissions. Please try again later."
        );
      }
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            "Invalid contact form data. Please check your input."
        );
      }
      throw new Error(`Failed to submit contact form: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<ContactConfirmationDto>(payload);
  }

  // ================================
  // GALLERY OPERATIONS (UNIFIED MEDIA)
  // ================================

  /**
   * Fetches unified gallery media (user uploads + external content).
   *
   * **Public Endpoint**: No authentication required.
   *
   * **Caching**: Uses ISR with 30 minute cache for gallery content.
   *
   * Returns ACTIVE media from both user uploads and admin-curated external
   * content in a unified, discriminated union response.
   *
   * @param options Query parameters (category, page, size)
   * @returns GalleryMediaPageResponse with paginated gallery items
   * @throws Error if API call fails
   */
  async getGalleryMedia(options?: {
    category?: string;
    page?: number;
    size?: number;
  }): Promise<GalleryMediaPageResponse> {
    const params = new URLSearchParams();

    if (options?.category) {
      params.append("category", options.category);
    }
    if (options?.page !== undefined) {
      params.append("page", String(options.page));
    }
    if (options?.size !== undefined) {
      params.append("size", String(options.size));
    }

    const endpoint = `${env.apiUrl}/api/v1/gallery${params.toString() ? `?${params.toString()}` : ""}`;

    // Use ISR with 30 minute cache for gallery content
    const response = await fetch(endpoint, {
      next: { revalidate: 1800 }, // 30 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch gallery media: ${response.status}`);
    }

    const payload = await response.json();

    // PagedApiResult has data as array and pageable for pagination
    const response_data = payload as {
      data: GalleryMedia[];
      pageable: {
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
        first: boolean;
        last: boolean;
      };
    };

    const items = response_data.data || [];
    const pageable = response_data.pageable || {
      page: 0,
      size: 50,
      totalElements: 0,
      totalPages: 1,
    };

    return {
      items,
      totalItems: pageable.totalElements,
      totalPages: pageable.totalPages,
      currentPage: pageable.page,
    };
  }

  /**
   * Fetches a single gallery media item by ID.
   *
   * **Public Endpoint**: No authentication required.
   *
   * **Caching**: Uses ISR with 30 minute cache for individual media items.
   *
   * @param id UUID of the gallery media item
   * @returns GalleryMedia (UserUpload or External) or undefined if not found
   * @throws Error if API call fails
   */
  async getGalleryMediaById(id: string): Promise<GalleryMedia | undefined> {
    const endpoint = `${env.apiUrl}/api/v1/gallery/${id}`;

    // Use ISR with 30 minute cache for individual media items
    const response = await fetch(endpoint, {
      next: { revalidate: 1800 }, // 30 minutes
    });

    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      throw new Error(
        `Failed to fetch gallery media by ID: ${response.status}`
      );
    }

    const payload = await response.json();
    return this.unwrapApiResponse<GalleryMedia>(payload);
  }

  /**
   * Fetches available gallery categories.
   *
   * **Public Endpoint**: No authentication required.
   *
   * **Caching**: Uses ISR with 1 hour cache for categories list.
   *
   * @returns Array of category strings
   * @throws Error if API call fails
   */
  async getGalleryCategories(): Promise<string[]> {
    const endpoint = `${env.apiUrl}/api/v1/gallery/categories`;

    // Use ISR with 1 hour cache for relatively static categories
    const response = await fetch(endpoint, {
      next: { revalidate: 3600 }, // 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch gallery categories: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<string[]>(payload);
  }

  /**
   * Submit external media for admin review.
   *
   * **Public Endpoint**: No authentication required.
   *
   * Allows community members to submit external media (YouTube videos, etc.)
   * for review and potential inclusion in the gallery.
   *
   * @param request External media submission data
   * @returns Submission confirmation
   * @throws Error if API call fails
   */
  async submitExternalMedia(
    request: SubmitExternalMediaRequest
  ): Promise<{ id: string; message: string }> {
    const endpoint = `${env.apiUrl}/api/v1/gallery/submit`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit external media: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<{ id: string; message: string }>(payload);
  }

  // ================================
  // ADMIN GALLERY MODERATION OPERATIONS
  // ================================

  /**
   * Get unified gallery moderation queue (user uploads + external media).
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * @param status Optional status filter
   * @param page Page number (default: 0)
   * @param size Page size (default: 20)
   * @returns Paginated list of gallery media items
   */
  async getAdminGallery(
    status?: GalleryMediaStatus | "ALL",
    page: number = 0,
    size: number = 20
  ): Promise<AdminQueueResponse<GalleryMedia>> {
    const params = new URLSearchParams();
    if (status && status !== "ALL") {
      params.append("status", status);
    }
    params.append("page", String(page));
    params.append("size", String(size));

    const endpoint = `${env.apiUrl}/api/v1/admin/gallery/queue?${params.toString()}`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch admin gallery queue: ${response.status}`
      );
    }

    const payload = await response.json();
    return this.transformAdminQueueResponse<GalleryMedia>(payload);
  }

  /**
   * Get detailed gallery media information for moderation.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * @param id Gallery media item ID
   * @returns Detailed gallery media item
   */
  async getAdminGalleryDetail(id: string): Promise<GalleryMedia> {
    const endpoint = `${env.apiUrl}/api/v1/admin/gallery/${id}`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch gallery media detail: ${response.status}`
      );
    }

    const payload = await response.json();
    return this.unwrapApiResponse<GalleryMedia>(payload);
  }

  /**
   * Update gallery media moderation status.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * @param id Gallery media item ID
   * @param request Moderation action request
   * @returns Updated gallery media item
   */
  async updateGalleryStatus(
    id: string,
    request: UpdateGalleryStatusRequest
  ): Promise<GalleryMedia> {
    const endpoint = `${env.apiUrl}/api/v1/admin/gallery/${id}/status`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to update gallery status: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<GalleryMedia>(payload);
  }

  /**
   * Archive (soft delete) a gallery media item.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * @param id Gallery media item ID
   */
  async archiveGalleryMedia(id: string): Promise<void> {
    const endpoint = `${env.apiUrl}/api/v1/admin/gallery/${id}`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to archive gallery media: ${response.status}`);
    }
  }

  /**
   * Create external media directly (admin only, bypasses moderation).
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * @param request External media creation data
   * @returns Created external media item
   */
  async createExternalMedia(
    request: CreateExternalMediaRequest
  ): Promise<ExternalMedia> {
    const endpoint = `${env.apiUrl}/api/v1/admin/gallery/external`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create external media: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<ExternalMedia>(payload);
  }

  /**
   * Promotes a gallery image to become the hero image for a directory entry.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * This action updates the directory entry's imageUrl to the gallery media's
   * publicUrl through event-driven communication. The frontend will need to
   * refresh the directory entry to see the updated hero image.
   *
   * Prerequisites:
   * - Media must be a user upload (not external media)
   * - Media must have ACTIVE status (already approved)
   * - Media must be linked to a directory entry (entryId not null)
   * - Media must have a public URL
   *
   * @param mediaId UUID of the gallery media item to promote
   * @throws Error if media not found (HTTP 404)
   * @throws Error if validation fails (HTTP 400)
   * @throws Error if authentication failed (HTTP 401/403)
   */
  async promoteToHeroImage(mediaId: string): Promise<void> {
    const endpoint = `${env.apiUrl}/api/v1/admin/gallery/${mediaId}/promote-hero`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "PATCH",
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Gallery media not found");
      }
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            "Invalid promotion request. Check media requirements."
        );
      }
      throw new Error(`Failed to promote to hero image: ${response.status}`);
    }
  }

  // ================================
  // ADMIN AI REVIEW OPERATIONS
  // ================================

  /**
   * Get AI analysis runs pending admin review.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   */
  async getAiReviewQueue(
    page: number = 0,
    size: number = 20
  ): Promise<AdminQueueResponse<AnalysisRunSummary>> {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("size", String(size));

    const endpoint = `${env.apiUrl}/api/v1/admin/ai/review-queue?${params.toString()}`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch AI review queue: ${response.status}`);
    }

    const payload = await response.json();
    return this.transformAdminQueueResponse<AnalysisRunSummary>(payload);
  }

  /**
   * Get detailed AI output for a single analysis run.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   */
  async getAiRunDetail(runId: string): Promise<AnalysisRunDetail> {
    const endpoint = `${env.apiUrl}/api/v1/admin/ai/review/${runId}`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch AI run detail: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<AnalysisRunDetail>(payload);
  }

  /**
   * Approve AI results as-is.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   */
  async approveAiRun(runId: string): Promise<void> {
    const endpoint = `${env.apiUrl}/api/v1/admin/ai/review/${runId}/approve`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to approve AI run: ${response.status}`);
    }
  }

  /**
   * Reject AI results.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   */
  async rejectAiRun(runId: string, request?: RejectRequest): Promise<void> {
    const endpoint = `${env.apiUrl}/api/v1/admin/ai/review/${runId}/reject`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: request ? JSON.stringify(request) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Failed to reject AI run: ${response.status}`);
    }
  }

  /**
   * Approve AI results with admin edits.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   */
  async approveEditedAiRun(
    runId: string,
    request: ApproveEditedRequest
  ): Promise<void> {
    const endpoint = `${env.apiUrl}/api/v1/admin/ai/review/${runId}/approve-edited`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to approve edited AI run: ${response.status}`);
    }
  }

  /**
   * Batch fetch AI processing status for multiple media items.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   */
  async getAiStatus(mediaIds: string[]): Promise<AiStatusResponse[]> {
    const params = new URLSearchParams();
    mediaIds.forEach((id) => params.append("mediaIds", id));

    const endpoint = `${env.apiUrl}/api/v1/admin/ai/status?${params.toString()}`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch AI status: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<AiStatusResponse[]>(payload);
  }

  /**
   * Trigger AI analysis for a single media item.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   */
  async triggerAnalysis(mediaId: string): Promise<AnalysisTriggerResponse> {
    const endpoint = `${env.apiUrl}/api/v1/admin/gallery/${mediaId}/analyze`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to trigger AI analysis: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<AnalysisTriggerResponse>(payload);
  }

  /**
   * Trigger AI analysis for multiple media items in batch.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   */
  async triggerBatchAnalysis(
    request: AnalyzeBatchRequest
  ): Promise<BatchAnalysisTriggerResponse> {
    const endpoint = `${env.apiUrl}/api/v1/admin/gallery/analyze-batch`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to trigger batch AI analysis: ${response.status}`
      );
    }

    const payload = await response.json();
    return this.unwrapApiResponse<BatchAnalysisTriggerResponse>(payload);
  }

  // ================================
  // TEXT AI OPERATIONS
  // ================================

  async checkAiAvailable(): Promise<AiAvailableResponse> {
    const endpoint = `${env.apiUrl}/api/v1/ai/available`;

    const response = await this.authenticatedFetch(endpoint, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to check AI availability: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<AiAvailableResponse>(payload);
  }

  async polishContent(
    request: PolishContentRequest
  ): Promise<PolishContentResponse> {
    const endpoint = `${env.apiUrl}/api/v1/ai/polish`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to polish content: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<PolishContentResponse>(payload);
  }

  async translateContent(
    request: TranslateContentRequest
  ): Promise<TranslateContentResponse> {
    const endpoint = `${env.apiUrl}/api/v1/ai/translate`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to translate content: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<TranslateContentResponse>(payload);
  }

  async generatePrompts(
    request: GeneratePromptsRequest
  ): Promise<GeneratePromptsResponse> {
    const endpoint = `${env.apiUrl}/api/v1/ai/prompts`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to generate prompts: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<GeneratePromptsResponse>(payload);
  }

  async generateDirectoryContent(
    request: GenerateDirectoryContentRequest
  ): Promise<DirectoryContentResponse> {
    const endpoint = `${env.apiUrl}/api/v1/ai/directory-content`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to generate directory content: ${response.status}`
      );
    }

    const payload = await response.json();
    return this.unwrapApiResponse<DirectoryContentResponse>(payload);
  }

  // ================================
  // ADMIN R2 STORAGE OPERATIONS
  // ================================

  async listR2Bucket(
    prefix?: string,
    continuationToken?: string,
    maxKeys: number = 100
  ): Promise<R2BucketListResponse> {
    const params = new URLSearchParams();
    if (prefix) params.append("prefix", prefix);
    if (continuationToken)
      params.append("continuationToken", continuationToken);
    params.append("maxKeys", String(maxKeys));

    const endpoint = `${env.apiUrl}/api/v1/admin/gallery/r2/list?${params.toString()}`;
    const response = await this.authenticatedFetch(endpoint);

    if (!response.ok) {
      throw new Error(`Failed to list R2 bucket: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<R2BucketListResponse>(payload);
  }

  async bulkPresignR2(
    request: BulkPresignRequest
  ): Promise<BulkPresignResponse> {
    const endpoint = `${env.apiUrl}/api/v1/admin/gallery/r2/bulk-presign`;
    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to generate bulk presign URLs: ${response.status}`
      );
    }

    const payload = await response.json();
    return this.unwrapApiResponse<BulkPresignResponse>(payload);
  }

  async bulkConfirmR2(
    request: BulkConfirmRequest
  ): Promise<BulkConfirmResponse> {
    const endpoint = `${env.apiUrl}/api/v1/admin/gallery/r2/bulk-confirm`;
    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to confirm bulk upload: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<BulkConfirmResponse>(payload);
  }

  async detectR2Orphans(
    prefix?: string,
    continuationToken?: string,
    maxKeys: number = 1000
  ): Promise<OrphanDetectionResponse> {
    const params = new URLSearchParams();
    if (prefix) params.append("prefix", prefix);
    if (continuationToken)
      params.append("continuationToken", continuationToken);
    params.append("maxKeys", String(maxKeys));

    const endpoint = `${env.apiUrl}/api/v1/admin/gallery/r2/orphans?${params.toString()}`;
    const response = await this.authenticatedFetch(endpoint);

    if (!response.ok) {
      throw new Error(`Failed to detect R2 orphans: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<OrphanDetectionResponse>(payload);
  }

  async linkR2Orphan(
    request: LinkOrphanRequest
  ): Promise<import("@/types/gallery").UserUploadMedia> {
    const endpoint = `${env.apiUrl}/api/v1/admin/gallery/r2/orphans/link`;
    const response = await this.authenticatedFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to link R2 orphan: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<import("@/types/gallery").UserUploadMedia>(
      payload
    );
  }

  async deleteR2Orphan(request: DeleteOrphanRequest): Promise<void> {
    const endpoint = `${env.apiUrl}/api/v1/admin/gallery/r2/orphans`;
    const response = await this.authenticatedFetch(endpoint, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status === 422) {
        throw new Error(
          "Cannot delete: this R2 object is linked to a database record"
        );
      }
      throw new Error(`Failed to delete R2 orphan: ${response.status}`);
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Transforms backend paged response to AdminQueueResponse format.
   * Handles two response formats:
   * - Format 1: { data: [...], pageable: {...} } - items directly in data array
   * - Format 2: { data: { content: [...], page: {...} } } - Spring Boot standard
   */
  private transformAdminQueueResponse<T>(
    payload: unknown
  ): AdminQueueResponse<T> {
    const unwrapped = this.unwrapApiResponse<unknown>(payload);

    let items: T[];
    let pagination: { totalElements: number; number: number; size: number };

    if (Array.isArray(unwrapped)) {
      // Format 1: data is directly an array, pageable at root level
      items = unwrapped as T[];
      const payloadRecord = payload as Record<string, unknown>;
      const pageable =
        (payloadRecord.pageable as Record<string, unknown>) || {};
      pagination = {
        totalElements: (pageable.totalElements as number) || 0,
        number: (pageable.page as number) || 0,
        size: (pageable.size as number) || 20,
      };
    } else {
      // Format 2: data.content structure (Spring Boot standard)
      const data = unwrapped as {
        content: T[];
        page: typeof pagination;
      };
      items = data.content || [];
      pagination = data.page || { totalElements: 0, number: 0, size: 20 };
    }

    return {
      items,
      total: pagination.totalElements,
      page: pagination.number + 1, // Convert 0-indexed to 1-indexed
      pageSize: pagination.size,
      hasMore:
        pagination.number <
        Math.ceil(pagination.totalElements / pagination.size) - 1,
    };
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
