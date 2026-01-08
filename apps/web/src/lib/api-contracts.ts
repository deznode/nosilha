import type { DirectoryEntry } from "@/types/directory";
import type { Town } from "@/types/town";
import type {
  ReactionCreateDto,
  ReactionResponseDto,
  ReactionCountsDto,
} from "@/types/reaction";
import type { MediaMetadataDto, ApprovedMediaPageResponse } from "@/types/api";
import type { StorySubmission, SubmissionStatus } from "@/types/story";
import type {
  AdminStats,
  Suggestion,
  Contributor,
  ContactMessage,
  ContactMessageStatus,
  DirectorySubmission,
  AdminQueueResponse,
  MdxContent,
  MdxCommitResult,
  GenerateMdxOptions,
} from "@/types/admin";
import type {
  ProfileDto,
  ContributionsDto,
  ProfileUpdateRequest,
} from "@/types/profile";
import type { BookmarkDto, BookmarkWithEntryDto } from "@/types/bookmark";
import type { ContactRequest, ContactConfirmationDto } from "@/types/contact";

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
/**
 * Query parameters for directory entries
 */
export interface DirectoryQueryParams {
  category?: string;
  page?: number;
  size?: number;
  searchQuery?: string;
  town?: string;
  sort?:
    | "name_asc"
    | "name_desc"
    | "rating_desc"
    | "created_at_desc"
    | "relevance";
}

export interface ApiClient {
  // Directory Entry Operations
  getEntriesByCategory(
    category: string,
    page?: number,
    size?: number,
    searchQuery?: string,
    town?: string,
    sort?: string
  ): Promise<PaginatedResult<DirectoryEntry>>;

  getEntryBySlug(slug: string): Promise<DirectoryEntry | undefined>;

  getEntriesForMap(category?: string): Promise<PaginatedResult<DirectoryEntry>>;

  createDirectoryEntry(
    entryData: Omit<
      DirectoryEntry,
      "id" | "slug" | "rating" | "reviewCount" | "createdAt" | "updatedAt"
    >
  ): Promise<DirectoryEntry>;

  /**
   * Submit a directory entry for review (public, rate-limited).
   * No authentication required.
   * Rate limited to 3 submissions per hour per IP address.
   */
  submitDirectoryEntry(
    request: DirectorySubmissionRequest,
    submittedBy: string,
    submittedByEmail?: string
  ): Promise<DirectorySubmissionConfirmation>;

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

  getMediaByEntry(entryId: string): Promise<MediaMetadataDto[]>;

  /**
   * Get approved (AVAILABLE) user-uploaded media for gallery display.
   *
   * **Public Endpoint**: No authentication required.
   *
   * @param options Query parameters (contentType prefix, page, size)
   * @returns ApprovedMediaPageResponse with paginated approved media
   */
  getApprovedMedia(options?: {
    contentType?: string;
    page?: number;
    size?: number;
  }): Promise<ApprovedMediaPageResponse>;

  // Reaction Operations (User Story 2)
  submitReaction(createDto: ReactionCreateDto): Promise<ReactionResponseDto>;

  deleteReaction(contentId: string): Promise<void>;

  getReactionCounts(contentId: string): Promise<ReactionCountsDto>;

  // Suggestion Operations (User Story 3)
  submitSuggestion(suggestionDto: {
    contentId: string;
    pageTitle: string;
    pageUrl: string;
    contentType: string;
    name: string;
    email: string;
    suggestionType: "CORRECTION" | "ADDITION" | "FEEDBACK";
    message: string;
    honeypot?: string;
  }): Promise<{ id: string | null; message: string }>;

  // Bookmark Operations (User Story 2)
  createBookmark(entryId: string): Promise<BookmarkDto>;

  deleteBookmark(entryId: string): Promise<void>;

  getBookmarks(
    page?: number,
    size?: number
  ): Promise<PaginatedResult<BookmarkWithEntryDto>>;

  // Related Content Operations (User Story 5 - Phase 9)
  getRelatedContent(
    contentId: string,
    limit?: number
  ): Promise<DirectoryEntry[]>;

  // ================================
  // STORY SUBMISSION OPERATIONS
  // ================================

  /**
   * Submit a new story (public, no auth required)
   */
  submitStory(data: StorySubmitRequest): Promise<StorySubmittedResponse>;

  /**
   * Get published stories (public endpoint)
   */
  getStories(
    page?: number,
    size?: number
  ): Promise<PaginatedResult<StorySubmission>>;

  /**
   * Get a story by slug (public endpoint)
   */
  getStoryBySlug(slug: string): Promise<StorySubmission | undefined>;

  // ================================
  // ADMIN STORY MODERATION OPERATIONS
  // ================================

  /**
   * Get stories for admin moderation queue
   */
  getStoriesForAdmin(
    status?: SubmissionStatus | "ALL",
    page?: number,
    size?: number
  ): Promise<AdminQueueResponse<StorySubmission>>;

  /**
   * Update story moderation status (approve, reject, publish, unpublish)
   * @param slug Required when action is PUBLISH - the URL-friendly publication slug
   */
  updateStoryStatus(
    id: string,
    action: StoryModerationAction,
    notes?: string,
    slug?: string
  ): Promise<void>;

  /**
   * Toggle featured status for a story
   */
  toggleStoryFeatured(id: string, featured: boolean): Promise<void>;

  /**
   * Delete a story
   */
  deleteStory(id: string): Promise<void>;

  // ================================
  // MDX ARCHIVAL ENGINE OPERATIONS
  // ================================

  /**
   * Generate MDX content from an approved story
   */
  generateMdx(
    storyId: string,
    options?: GenerateMdxOptions
  ): Promise<MdxContent>;

  /**
   * Commit MDX content to repository
   */
  commitMdx(
    storyId: string,
    mdxSource: string,
    commitMessage?: string
  ): Promise<MdxCommitResult>;

  // ================================
  // ADMIN SUGGESTION MODERATION OPERATIONS
  // ================================

  /**
   * Get suggestions for admin moderation queue
   */
  getSuggestionsForAdmin(
    status?: SubmissionStatus | "ALL",
    page?: number,
    size?: number
  ): Promise<AdminQueueResponse<Suggestion>>;

  /**
   * Update suggestion moderation status (approve, reject)
   */
  updateSuggestionStatus(
    id: string,
    action: SuggestionModerationAction,
    notes?: string
  ): Promise<void>;

  /**
   * Delete a suggestion
   */
  deleteSuggestion(id: string): Promise<void>;

  // ================================
  // ADMIN DASHBOARD OPERATIONS
  // ================================

  /**
   * Get dashboard statistics
   */
  getAdminStats(): Promise<AdminStats>;

  /**
   * Get dashboard counts (pending items)
   */
  getDashboardCounts(): Promise<DashboardCounts>;

  /**
   * Get top contributors
   */
  getTopContributors(): Promise<Contributor[]>;

  // ================================
  // ADMIN CONTACT MESSAGES (Mock-only for now)
  // ================================

  /**
   * Get contact messages for admin
   */
  getContactMessages(
    status?: ContactMessageStatus,
    page?: number,
    size?: number
  ): Promise<AdminQueueResponse<ContactMessage>>;

  /**
   * Update contact message status
   */
  updateContactMessageStatus(
    id: string,
    status: ContactMessageStatus
  ): Promise<ContactMessage>;

  /**
   * Delete a contact message
   */
  deleteContactMessage(id: string): Promise<void>;

  // ================================
  // ADMIN DIRECTORY SUBMISSIONS (Mock-only for now)
  // ================================

  /**
   * Get directory submissions for admin
   */
  getDirectorySubmissions(
    status?: SubmissionStatus | "ALL",
    page?: number,
    size?: number
  ): Promise<AdminQueueResponse<DirectorySubmission>>;

  /**
   * Update directory submission status
   */
  updateDirectorySubmissionStatus(
    id: string,
    status: SubmissionStatus,
    notes?: string
  ): Promise<DirectorySubmission>;

  // ================================
  // ADMIN GALLERY MODERATION OPERATIONS
  // ================================

  /**
   * Get unified gallery moderation queue (user uploads + external media).
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * Returns a paginated list of gallery media items for moderation,
   * including both user uploads and external content.
   *
   * @param status Optional status filter
   * @param page Page number (default: 0)
   * @param size Page size (default: 20)
   * @returns Paginated list of gallery media items
   */
  getAdminGallery(
    status?: import("@/types/gallery").GalleryMediaStatus | "ALL",
    page?: number,
    size?: number
  ): Promise<AdminQueueResponse<import("@/types/gallery").GalleryMedia>>;

  /**
   * Get detailed gallery media information for moderation.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * @param id Gallery media item ID
   * @returns Detailed gallery media item
   */
  getAdminGalleryDetail(
    id: string
  ): Promise<import("@/types/gallery").GalleryMedia>;

  /**
   * Update gallery media moderation status.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * @param id Gallery media item ID
   * @param request Moderation action request
   * @returns Updated gallery media item
   */
  updateGalleryStatus(
    id: string,
    request: import("@/types/gallery").UpdateGalleryStatusRequest
  ): Promise<import("@/types/gallery").GalleryMedia>;

  /**
   * Archive (soft delete) a gallery media item.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * @param id Gallery media item ID
   */
  archiveGalleryMedia(id: string): Promise<void>;

  /**
   * Create external media directly (admin only, bypasses moderation).
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * @param request External media creation data
   * @returns Created external media item
   */
  createExternalMedia(
    request: import("@/types/gallery").CreateExternalMediaRequest
  ): Promise<import("@/types/gallery").ExternalMedia>;

  // ================================
  // PROFILE OPERATIONS (User Story 1)
  // ================================

  /**
   * Get authenticated user's profile
   */
  getProfile(): Promise<ProfileDto>;

  /**
   * Get authenticated user's contributions
   */
  getContributions(): Promise<ContributionsDto>;

  /**
   * Update authenticated user's profile
   */
  updateProfile(request: ProfileUpdateRequest): Promise<ProfileDto>;

  // ================================
  // CONTACT FORM OPERATIONS (User Story 5)
  // ================================

  /**
   * Submit contact form message.
   *
   * **Public Endpoint**: No authentication required - allows anonymous contact.
   *
   * **Rate Limiting**: 3 submissions per hour per IP address.
   *
   * **Validation**:
   * - name: 2-100 characters
   * - email: valid email format
   * - message: 10-5000 characters
   *
   * @param request Contact form submission data
   * @returns ContactConfirmationDto with confirmation message and submission ID
   * @throws Error if rate limit exceeded (HTTP 429)
   * @throws Error if validation fails (HTTP 400)
   */
  submitContactMessage(
    request: ContactRequest
  ): Promise<ContactConfirmationDto>;

  // ================================
  // GALLERY OPERATIONS (UNIFIED MEDIA)
  // ================================

  /**
   * Get unified gallery media items (user uploads + external content).
   *
   * **Public Endpoint**: No authentication required.
   *
   * Returns ACTIVE media from both user uploads and admin-curated external
   * content in a unified, discriminated union response.
   *
   * @param options Query parameters (category, page, size)
   * @returns GalleryMediaPageResponse with paginated gallery items
   */
  getGalleryMedia(options?: {
    category?: string;
    page?: number;
    size?: number;
  }): Promise<import("@/types/gallery").GalleryMediaPageResponse>;

  /**
   * Get a single gallery media item by ID.
   *
   * **Public Endpoint**: No authentication required.
   *
   * @param id UUID of the gallery media item
   * @returns GalleryMedia (UserUpload or External) or undefined if not found
   */
  getGalleryMediaById(
    id: string
  ): Promise<import("@/types/gallery").GalleryMedia | undefined>;

  /**
   * Get available gallery categories.
   *
   * **Public Endpoint**: No authentication required.
   *
   * @returns Array of category strings
   */
  getGalleryCategories(): Promise<string[]>;

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
   */
  submitExternalMedia(
    request: import("@/types/gallery").SubmitExternalMediaRequest
  ): Promise<{ id: string; message: string }>;
}

export interface PaginationMetadata {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMetadata | null;
}

// ================================
// STORY SUBMISSION TYPES
// ================================

/**
 * Request payload for submitting a story.
 * Matches backend CreateStoryRequest DTO.
 * Note: Author is derived from authenticated user on backend.
 */
export interface StorySubmitRequest {
  title: string;
  content: string;
  storyType: "QUICK" | "FULL" | "GUIDED";
  templateType?: string;
  relatedPlaceId?: string;
  honeypot?: string;
}

/**
 * Response after submitting a story
 */
export interface StorySubmittedResponse {
  id: string | null;
  message: string;
}

/**
 * Request payload for submitting a directory entry for review
 */
export interface DirectorySubmissionRequest {
  name: string;
  category: "RESTAURANT" | "HOTEL" | "BEACH" | "HERITAGE" | "NATURE";
  town: string;
  customTown?: string;
  description: string;
  tags?: string[];
  imageUrl?: string;
  priceLevel?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Response after submitting a directory entry for review
 */
export interface DirectorySubmissionConfirmation {
  id: string;
  name: string;
  status: string;
}

/**
 * Moderation action for stories
 */
export type StoryModerationAction =
  | "APPROVE"
  | "REJECT"
  | "FLAG"
  | "PUBLISH"
  | "UNPUBLISH";

/**
 * Moderation action for suggestions
 */
export type SuggestionModerationAction = "APPROVE" | "REJECT";

/**
 * Dashboard counts for admin overview
 */
export interface DashboardCounts {
  pendingSuggestions: number;
  pendingStories: number;
  pendingMessages: number;
  pendingDirectory: number;
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
  timestamp: string;
  status: number;
}

/**
 * Paged API response wrapper (from backend)
 */
export interface PagedApiResponse<T> {
  data: T[];
  timestamp: string;
  status: number;
  pageable: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
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

  // Reaction counts - cached for 5 minutes (per spec.md FR-015)
  REACTION_COUNTS: { revalidate: 300 }, // 5 minutes

  // Related content - cached for 5 minutes (User Story 5)
  RELATED_CONTENT: { revalidate: 300 }, // 5 minutes

  // Gallery content - cached for 30 minutes (curated and approved media)
  GALLERY: { revalidate: 1800 }, // 30 minutes
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

export type { DirectoryEntry, Town };

// Re-export story and admin types for convenience
export type { StorySubmission, SubmissionStatus } from "@/types/story";

export type {
  AdminStats,
  Suggestion,
  Contributor,
  ContactMessage,
  ContactMessageStatus,
  DirectorySubmission,
  AdminQueueResponse,
} from "@/types/admin";
