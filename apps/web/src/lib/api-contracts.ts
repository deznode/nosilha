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
  AiHealthResponse,
  AiDomainConfig,
  UpdateDomainConfigRequest,
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
   * Submit a directory entry for review.
   * Requires authentication - user info extracted from JWT token.
   */
  submitDirectoryEntry(
    request: DirectorySubmissionRequest
  ): Promise<DirectorySubmissionConfirmation>;

  // Town Operations
  getTowns(): Promise<Town[]>;

  getTownBySlug(slug: string): Promise<Town | undefined>;

  getTownsForMap(): Promise<Town[]>;

  // Media Operations
  uploadImage(
    file: File,
    options?: {
      entryId?: string;
      category?: string;
      description?: string;
    }
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

  /**
   * Update an existing directory entry.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * @param id Directory entry ID
   * @param data Update data
   * @returns Updated directory submission
   */
  updateDirectoryEntry(
    id: string,
    data: UpdateDirectoryEntryRequest
  ): Promise<DirectorySubmission>;

  /**
   * Delete a directory entry permanently.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * @param id Directory entry ID
   */
  deleteDirectoryEntry(id: string): Promise<void>;

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
   * Update gallery media metadata (PATCH semantics).
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * @param id Gallery media item ID
   * @param request Update request with optional fields
   * @returns Updated gallery media item
   */
  updateGalleryMedia(
    id: string,
    request: import("@/types/gallery").UpdateGalleryMediaRequest
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

  /**
   * Promotes a gallery image to become the hero image for a directory entry.
   *
   * **Admin Endpoint**: Requires ADMIN role.
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
  promoteToHeroImage(mediaId: string): Promise<void>;

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
  // ADMIN AI REVIEW OPERATIONS
  // ================================

  /**
   * Get AI analysis runs pending admin review.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * @param page Page number (default: 0)
   * @param size Page size (default: 20)
   * @returns Paginated list of analysis run summaries
   */
  getAiReviewQueue(
    page?: number,
    size?: number
  ): Promise<AdminQueueResponse<AnalysisRunSummary>>;

  /**
   * Get detailed AI output for a single analysis run.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * @param runId Analysis run ID
   * @returns Full analysis run detail
   */
  getAiRunDetail(runId: string): Promise<AnalysisRunDetail>;

  /**
   * Approve AI results as-is. Applies results to the media item.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * @param runId Analysis run ID
   */
  approveAiRun(runId: string): Promise<void>;

  /**
   * Reject AI results. Results are not applied to media.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * @param runId Analysis run ID
   * @param request Optional rejection notes
   */
  rejectAiRun(runId: string, request?: RejectRequest): Promise<void>;

  /**
   * Approve AI results with admin edits. Modified results are applied to media.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * @param runId Analysis run ID
   * @param request Edited fields to apply
   */
  approveEditedAiRun(
    runId: string,
    request: ApproveEditedRequest
  ): Promise<void>;

  /**
   * Batch fetch AI processing status for multiple media items.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * @param mediaIds Array of media item IDs to check
   * @returns AI status for each media item
   */
  getAiStatus(mediaIds: string[]): Promise<AiStatusResponse[]>;

  /**
   * Trigger AI analysis for a single media item.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * @param mediaId UUID of the gallery media item
   * @returns Trigger response with analysis run ID
   */
  triggerAnalysis(mediaId: string): Promise<AnalysisTriggerResponse>;

  /**
   * Trigger AI analysis for multiple media items in batch.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * @param request Batch request with media IDs
   * @returns Batch response with accepted/rejected counts
   */
  triggerBatchAnalysis(
    request: AnalyzeBatchRequest
  ): Promise<BatchAnalysisTriggerResponse>;

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
   * @returns PublicGalleryMediaPageResponse with paginated gallery items
   */
  getGalleryMedia(options?: {
    category?: string;
    decade?: string;
    q?: string;
    page?: number;
    size?: number;
  }): Promise<import("@/types/gallery").PublicGalleryMediaPageResponse>;

  /**
   * Get a single gallery media item by ID.
   *
   * **Public Endpoint**: No authentication required.
   *
   * @param id UUID of the gallery media item
   * @returns PublicGalleryMedia (UserUpload or External) or undefined if not found
   */
  getGalleryMediaById(
    id: string
  ): Promise<import("@/types/gallery").PublicGalleryMedia | undefined>;

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

  // ================================
  // TEXT AI OPERATIONS
  // ================================

  /**
   * Check if text AI is available.
   *
   * **Authenticated Endpoint**: Requires USER or ADMIN role.
   *
   * @returns AiAvailableResponse with availability status
   */
  checkAiAvailable(): Promise<AiAvailableResponse>;

  /**
   * Polish/improve content text using AI.
   *
   * **Authenticated Endpoint**: Requires USER or ADMIN role.
   *
   * @param request Content to polish
   * @returns Polished content
   */
  polishContent(request: PolishContentRequest): Promise<PolishContentResponse>;

  /**
   * Translate content to a target language using AI.
   *
   * **Authenticated Endpoint**: Requires USER or ADMIN role.
   *
   * @param request Content and target language
   * @returns Translated content
   */
  translateContent(
    request: TranslateContentRequest
  ): Promise<TranslateContentResponse>;

  /**
   * Generate writing prompts for a story template type.
   *
   * **Authenticated Endpoint**: Requires USER or ADMIN role.
   *
   * @param request Template type and optional existing content
   * @returns List of generated prompts
   */
  generatePrompts(
    request: GeneratePromptsRequest
  ): Promise<GeneratePromptsResponse>;

  /**
   * Generate AI description and tags for a directory entry.
   *
   * **Authenticated Endpoint**: Requires USER or ADMIN role.
   *
   * @param request Entry name and category
   * @returns Generated description and tags
   */
  generateDirectoryContent(
    request: GenerateDirectoryContentRequest
  ): Promise<DirectoryContentResponse>;

  // ================================
  // ADMIN AI DASHBOARD OPERATIONS
  // ================================

  /**
   * Get AI system health including provider stats and domain configs.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * @returns AiHealthResponse with providers and domain configs
   */
  getAiHealth(): Promise<AiHealthResponse>;

  /**
   * Update a domain's AI feature toggle.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   *
   * @param domain Domain name (gallery, stories, directory)
   * @param request Toggle state
   * @returns Updated domain config
   */
  updateAiDomainConfig(
    domain: string,
    request: UpdateDomainConfigRequest
  ): Promise<AiDomainConfig>;

  // ================================
  // ADMIN R2 STORAGE OPERATIONS
  // ================================

  /**
   * List objects in R2 bucket with optional prefix filter and pagination.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   */
  listR2Bucket(
    prefix?: string,
    continuationToken?: string,
    maxKeys?: number
  ): Promise<R2BucketListResponse>;

  /**
   * Generate presigned upload URLs for a batch of files.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   */
  bulkPresignR2(request: BulkPresignRequest): Promise<BulkPresignResponse>;

  /**
   * Confirm batch upload — creates ACTIVE media records with admin as reviewer.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   */
  bulkConfirmR2(request: BulkConfirmRequest): Promise<BulkConfirmResponse>;

  /**
   * Detect orphan objects in R2 that have no corresponding DB record.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   */
  detectR2Orphans(
    prefix?: string,
    continuationToken?: string,
    maxKeys?: number
  ): Promise<OrphanDetectionResponse>;

  /**
   * Link an orphan R2 object to a new DB media record.
   *
   * **Admin Endpoint**: Requires ADMIN role.
   */
  linkR2Orphan(
    request: LinkOrphanRequest
  ): Promise<import("@/types/gallery").UserUploadMedia>;

  /**
   * Delete an orphan R2 object (must not be linked to a DB record).
   *
   * **Admin Endpoint**: Requires ADMIN role.
   */
  deleteR2Orphan(request: DeleteOrphanRequest): Promise<void>;
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
 * Request payload for updating a directory entry
 */
export interface UpdateDirectoryEntryRequest {
  name?: string;
  category?: "RESTAURANT" | "HOTEL" | "BEACH" | "HERITAGE" | "NATURE";
  town?: string;
  description?: string;
  tags?: string[];
  imageUrl?: string;
  priceLevel?: "$" | "$$" | "$$$";
  latitude?: number;
  longitude?: number;
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

export type {
  AnalysisRunSummary,
  AnalysisRunDetail,
  ApproveEditedRequest,
  RejectRequest,
  AiStatusResponse,
  AnalysisTriggerResponse,
  AnalyzeBatchRequest,
  BatchAnalysisTriggerResponse,
  AiHealthResponse,
  AiDomainConfig,
  UpdateDomainConfigRequest,
} from "@/types/ai";
