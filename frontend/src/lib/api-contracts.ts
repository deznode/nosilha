import type { DirectoryEntry } from "@/types/directory";
import type { Town } from "@/types/town";
import type {
  ReactionCreateDto,
  ReactionResponseDto,
  ReactionCountsDto,
} from "@/types/reaction";
import type { MediaMetadataDto } from "@/types/api";
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
   */
  updateStoryStatus(
    id: string,
    action: StoryModerationAction,
    notes?: string
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
  getContactMessages(): Promise<AdminQueueResponse<ContactMessage>>;

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
    status?: SubmissionStatus | "ALL"
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
 * Request payload for submitting a story
 */
export interface StorySubmitRequest {
  title: string;
  content: string;
  storyType: "QUICK" | "FULL" | "GUIDED" | "PHOTO";
  templateType?: string;
  relatedPlaceId?: string;
  location?: string;
  authorName?: string;
  imageUrl?: string;
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
 * Moderation action for stories
 */
export type StoryModerationAction =
  | "APPROVE"
  | "REJECT"
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

  // Reaction counts - cached for 5 minutes (per spec.md FR-015)
  REACTION_COUNTS: { revalidate: 300 }, // 5 minutes

  // Related content - cached for 5 minutes (User Story 5)
  RELATED_CONTENT: { revalidate: 300 }, // 5 minutes
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
