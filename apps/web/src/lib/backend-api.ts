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
  StorySubmitRequest,
  StorySubmittedResponse,
  StoryModerationAction,
  SuggestionModerationAction,
  DashboardCounts,
} from "@/lib/api-contracts";
import type { StorySubmission, SubmissionStatus } from "@/types/story";
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
  CuratedMedia,
  CuratedMediaPageResponse,
  MediaType,
} from "@/types/curated-media";
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
    return this.transformAdminQueueResponse<StorySubmission>(payload);
  }

  /**
   * Updates story moderation status.
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * @param id Story submission ID
   * @param action Moderation action (APPROVE, REJECT, PUBLISH, UNPUBLISH)
   * @param notes Optional admin notes
   */
  async updateStoryStatus(
    id: string,
    action: StoryModerationAction,
    notes?: string
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
    return this.transformAdminQueueResponse<Suggestion>(payload);
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
   * Gets directory submissions for admin with optional status filtering.
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * @param status Optional status filter (PENDING, APPROVED, REJECTED)
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

    const endpoint = `${env.apiUrl}/api/v1/admin/directory-submissions?${params}`;
    const response = await this.authenticatedFetch(endpoint);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch directory submissions: ${response.status}`
      );
    }

    const payload = await response.json();
    return this.transformAdminDirectorySubmissionResponse(payload);
  }

  /**
   * Updates directory submission status.
   *
   * **Authentication Required**: Requires ADMIN role.
   *
   * @param id Directory submission ID
   * @param status New status (PENDING, APPROVED, REJECTED)
   * @param notes Optional admin notes explaining the decision
   * @returns Updated DirectorySubmission
   * @throws Error if submission not found (HTTP 404)
   * @throws Error if authentication failed (HTTP 401/403)
   */
  async updateDirectorySubmissionStatus(
    id: string,
    status: SubmissionStatus,
    notes?: string
  ): Promise<DirectorySubmission> {
    const endpoint = `${env.apiUrl}/api/v1/admin/directory-submissions/${id}`;

    const response = await this.authenticatedFetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, adminNotes: notes }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Directory submission not found");
      }
      throw new Error(
        `Failed to update directory submission status: ${response.status}`
      );
    }

    const payload = await response.json();
    return this.transformDirectorySubmission(
      this.unwrapApiResponse<Record<string, unknown>>(payload)
    );
  }

  /**
   * Transforms backend directory submission to frontend format.
   */
  private transformDirectorySubmission(
    dto: Record<string, unknown>
  ): DirectorySubmission {
    return {
      id: dto.id as string,
      name: dto.name as string,
      category: dto.category as
        | "Restaurant"
        | "Landmark"
        | "Nature"
        | "Culture",
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
   */
  private transformAdminDirectorySubmissionResponse(
    payload: unknown
  ): AdminQueueResponse<DirectorySubmission> {
    const data = this.unwrapApiResponse<{
      content: Record<string, unknown>[];
      page: { totalElements: number; number: number; size: number };
    }>(payload);

    const items = (data.content || []).map((dto) =>
      this.transformDirectorySubmission(dto)
    );

    return {
      items,
      total: data.page?.totalElements || 0,
      page: (data.page?.number || 0) + 1, // Convert 0-indexed to 1-indexed
      pageSize: data.page?.size || 20,
      hasMore:
        (data.page?.number || 0) <
        Math.ceil((data.page?.totalElements || 0) / (data.page?.size || 20)) -
          1,
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
  // CURATED MEDIA OPERATIONS
  // ================================

  /**
   * Fetches curated media items from the gallery.
   *
   * **Public Endpoint**: No authentication required.
   *
   * **Caching**: Uses ISR with 30 minute cache for gallery content.
   *
   * @param options Query parameters (mediaType, category, page, size)
   * @returns CuratedMediaPageResponse with paginated curated media items
   * @throws Error if API call fails
   */
  async getCuratedMedia(options?: {
    mediaType?: MediaType;
    category?: string;
    page?: number;
    size?: number;
  }): Promise<CuratedMediaPageResponse> {
    const params = new URLSearchParams();

    if (options?.mediaType) {
      params.append("type", options.mediaType);
    }
    if (options?.category) {
      params.append("category", options.category);
    }
    if (options?.page !== undefined) {
      params.append("page", String(options.page));
    }
    if (options?.size !== undefined) {
      params.append("size", String(options.size));
    }

    const endpoint = `${env.apiUrl}/api/v1/curated-media${params.toString() ? `?${params.toString()}` : ""}`;

    // Use ISR with 30 minute cache for gallery content
    const response = await fetch(endpoint, {
      next: { revalidate: 1800 }, // 30 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch curated media: ${response.status}`);
    }

    const payload = await response.json();
    return this.unwrapApiResponse<CuratedMediaPageResponse>(payload);
  }

  /**
   * Fetches a single curated media item by ID.
   *
   * **Public Endpoint**: No authentication required.
   *
   * **Caching**: Uses ISR with 30 minute cache for individual media items.
   *
   * @param id UUID of the curated media item
   * @returns CuratedMedia or undefined if not found
   * @throws Error if API call fails
   */
  async getCuratedMediaById(id: string): Promise<CuratedMedia | undefined> {
    const endpoint = `${env.apiUrl}/api/v1/curated-media/${id}`;

    // Use ISR with 30 minute cache for individual media items
    const response = await fetch(endpoint, {
      next: { revalidate: 1800 }, // 30 minutes
    });

    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      throw new Error(
        `Failed to fetch curated media by ID: ${response.status}`
      );
    }

    const payload = await response.json();
    return this.unwrapApiResponse<CuratedMedia>(payload);
  }

  /**
   * Fetches available curated media categories.
   *
   * **Public Endpoint**: No authentication required.
   *
   * **Caching**: Uses ISR with 1 hour cache for categories list.
   *
   * @returns Array of category strings
   * @throws Error if API call fails
   */
  async getCuratedMediaCategories(): Promise<string[]> {
    const endpoint = `${env.apiUrl}/api/v1/curated-media/categories`;

    // Use ISR with 1 hour cache for relatively static categories
    const response = await fetch(endpoint, {
      next: { revalidate: 3600 }, // 1 hour
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch curated media categories: ${response.status}`
      );
    }

    const payload = await response.json();
    return this.unwrapApiResponse<string[]>(payload);
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Transforms backend paged response to AdminQueueResponse format.
   */
  private transformAdminQueueResponse<T>(
    payload: unknown
  ): AdminQueueResponse<T> {
    const data = this.unwrapApiResponse<{
      content: T[];
      page: { totalElements: number; number: number; size: number };
    }>(payload);

    return {
      items: data.content || [],
      total: data.page?.totalElements || 0,
      page: (data.page?.number || 0) + 1, // Convert 0-indexed to 1-indexed
      pageSize: data.page?.size || 20,
      hasMore:
        (data.page?.number || 0) <
        Math.ceil((data.page?.totalElements || 0) / (data.page?.size || 20)) -
          1,
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
