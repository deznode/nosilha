import type { DirectoryEntry } from "@/types/directory";
import type { Town } from "@/types/town";
import type {
  ReactionCreateDto,
  ReactionResponseDto,
  ReactionCountsDto,
} from "@/types/reaction";
import type { MediaMetadataDto, ApprovedMediaPageResponse } from "@/types/api";
import type {
  PaginatedResult,
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
 * @param searchQuery Optional search query (min 2 chars for API call).
 * @returns A promise that resolves to an array of directory entries.
 */
export async function getEntriesByCategory(
  category: string,
  page: number = 0,
  size: number = 20,
  searchQuery?: string,
  town?: string,
  sort?: string
): Promise<PaginatedResult<DirectoryEntry>> {
  return apiClient.getEntriesByCategory(
    category,
    page,
    size,
    searchQuery,
    town,
    sort
  );
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
 * Submits a directory entry for review.
 * Requires authentication - user info is extracted from JWT token.
 * Automatically uses the configured API implementation (backend or mock).
 * @param request Contains name, category, town, description, and optional fields
 * @returns A promise that resolves to confirmation with id, name, and status
 * @throws Error if rate limit exceeded (HTTP 429)
 * @throws Error if validation fails (HTTP 400)
 */
export async function submitDirectoryEntry(
  request: import("@/lib/api-contracts").DirectorySubmissionRequest
): Promise<import("@/lib/api-contracts").DirectorySubmissionConfirmation> {
  return apiClient.submitDirectoryEntry(request);
}

/**
 * Fetches entries for real-time interactive features like maps.
 * Automatically uses the configured API implementation (backend or mock).
 * @param category The category to fetch, or 'all' to fetch all entries.
 * @returns A promise that resolves to an array of directory entries.
 */
export async function getEntriesForMap(
  category: string = "all"
): Promise<PaginatedResult<DirectoryEntry>> {
  return apiClient.getEntriesForMap(category);
}

/**
 * Uploads an image file and returns the public URL.
 * Automatically uses the configured API implementation (backend or mock).
 * @param file The image file to upload.
 * @param options Optional upload options (entryId, category, description).
 * @returns A promise that resolves to the public URL of the uploaded image.
 */
export async function uploadImage(
  file: File,
  options?: {
    entryId?: string;
    category?: string;
    description?: string;
  }
): Promise<string> {
  return apiClient.uploadImage(file, options);
}

/**
 * Fetches media metadata for a directory entry.
 * Returns only AVAILABLE media items.
 * Automatically uses the configured API implementation (backend or mock).
 * @param entryId The directory entry's unique identifier.
 * @returns A promise that resolves to an array of media metadata.
 */
export async function getMediaByEntry(
  entryId: string
): Promise<MediaMetadataDto[]> {
  return apiClient.getMediaByEntry(entryId);
}

/**
 * Fetches approved (AVAILABLE) user-uploaded media for gallery display.
 * This returns community-contributed photos that have been moderated and approved.
 */
export async function getApprovedMedia(options?: {
  contentType?: string;
  page?: number;
  size?: number;
}): Promise<ApprovedMediaPageResponse> {
  return apiClient.getApprovedMedia(options);
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

// All components should use the unified API functions above that automatically
// switch between mock and backend implementations based on environment configuration.

// ================================
// REACTION OPERATIONS (User Story 2)
// ================================

/**
 * Submits a new reaction or updates an existing reaction.
 * Requires user authentication via JWT token.
 * Automatically uses the configured API implementation (backend or mock).
 * @param createDto Contains contentId and reactionType
 * @returns A promise that resolves to the reaction response with updated count
 * @throws Error if rate limit exceeded (HTTP 429)
 * @throws Error if authentication failed (HTTP 401)
 */
export async function submitReaction(
  createDto: ReactionCreateDto
): Promise<ReactionResponseDto> {
  return apiClient.submitReaction(createDto);
}

/**
 * Removes user's reaction to content.
 * Requires user authentication via JWT token.
 * Automatically uses the configured API implementation (backend or mock).
 * @param contentId UUID of the heritage page/content
 * @throws Error if reaction doesn't exist (HTTP 404)
 * @throws Error if authentication failed (HTTP 401)
 */
export async function deleteReaction(contentId: string): Promise<void> {
  return apiClient.deleteReaction(contentId);
}

/**
 * Gets aggregated reaction counts for a specific content page.
 * Public endpoint - no authentication required to view counts.
 * If user is authenticated, response includes their current reaction.
 * Automatically uses the configured API implementation (backend or mock).
 * @param contentId UUID of the heritage page/content
 * @returns A promise that resolves to reaction counts and user's reaction (if authenticated)
 */
export async function getReactionCounts(
  contentId: string
): Promise<ReactionCountsDto> {
  return apiClient.getReactionCounts(contentId);
}

// ================================
// SUGGESTION OPERATIONS (User Story 3)
// ================================

/**
 * Submits a content improvement suggestion.
 * No authentication required - allows community contributions.
 * Rate limited to 5 submissions per hour per IP address.
 * Automatically uses the configured API implementation (backend or mock).
 * @param suggestionDto Contains contentId, name, email, suggestionType, message, and honeypot
 * @returns A promise that resolves to the suggestion response with confirmation message
 * @throws Error if rate limit exceeded (HTTP 429)
 * @throws Error if validation fails (HTTP 400)
 */
export async function submitSuggestion(suggestionDto: {
  contentId: string;
  pageTitle: string;
  pageUrl: string;
  contentType: string;
  name: string;
  email: string;
  suggestionType:
    | "CORRECTION"
    | "ADDITION"
    | "FEEDBACK"
    | "PHOTO_IDENTIFICATION";
  message: string;
  mediaId?: string;
  honeypot?: string;
}): Promise<{ id: string | null; message: string }> {
  return apiClient.submitSuggestion(suggestionDto);
}

// ================================
// RELATED CONTENT OPERATIONS (User Story 5 - Phase 9)
// ================================

/**
 * Fetches 3-5 related content items for a given heritage page.
 * Public endpoint - no authentication required.
 * Uses content discovery algorithm matching by category, town, and cuisine.
 * Automatically uses the configured API implementation (backend or mock).
 *
 * **Algorithm Priority**:
 * 1. Same category + same town (highest relevance)
 * 2. Same category + same cuisine (for restaurants)
 * 3. Same category only (fallback)
 *
 * @param contentId UUID of the current heritage page
 * @param limit Number of results to return (3-5, default: 5)
 * @returns A promise that resolves to an array of related directory entries
 */
export async function getRelatedContent(
  contentId: string,
  limit: number = 5
): Promise<DirectoryEntry[]> {
  return apiClient.getRelatedContent(contentId, limit);
}

// ================================
// STORY SUBMISSION OPERATIONS
// ================================

/**
 * Submits a new story for review.
 * No authentication required - open to community contributions.
 * Rate limited to 5 submissions per hour per IP address.
 * Automatically uses the configured API implementation (backend or mock).
 * @param data Contains title, content, storyType, and optional fields
 * @returns A promise that resolves to the submission response with id and message
 * @throws Error if rate limit exceeded (HTTP 429)
 * @throws Error if validation fails (HTTP 400)
 */
export async function submitStory(
  data: StorySubmitRequest
): Promise<StorySubmittedResponse> {
  return apiClient.submitStory(data);
}

/**
 * Fetches published stories.
 * Public endpoint - no authentication required.
 * Automatically uses the configured API implementation (backend or mock).
 * @param page Page number (0-indexed, default: 0)
 * @param size Page size (default: 20)
 * @returns A promise that resolves to paginated story submissions
 */
export async function getStories(
  page: number = 0,
  size: number = 20
): Promise<PaginatedResult<StorySubmission>> {
  return apiClient.getStories(page, size);
}

/**
 * Fetches a single story by its slug.
 * Public endpoint - no authentication required.
 * Only returns approved/published stories.
 * Automatically uses the configured API implementation (backend or mock).
 * @param slug The slug of the story to fetch
 * @returns A promise that resolves to a story or undefined if not found
 */
export async function getStoryBySlug(
  slug: string
): Promise<StorySubmission | undefined> {
  return apiClient.getStoryBySlug(slug);
}

// ================================
// ADMIN STORY MODERATION OPERATIONS
// ================================

/**
 * Gets stories for admin moderation queue.
 * Requires ADMIN role authentication.
 * Automatically uses the configured API implementation (backend or mock).
 * @param status Filter by submission status (optional, defaults to all)
 * @param page Page number (0-indexed, default: 0)
 * @param size Page size (default: 20)
 * @returns A promise that resolves to paginated story submissions
 */
export async function getStoriesForAdmin(
  status?: SubmissionStatus | "ALL",
  page?: number,
  size?: number
): Promise<AdminQueueResponse<StorySubmission>> {
  return apiClient.getStoriesForAdmin(status, page, size);
}

/**
 * Updates story moderation status.
 * Requires ADMIN role authentication.
 * Automatically uses the configured API implementation (backend or mock).
 * @param id Story submission ID
 * @param action Moderation action (APPROVE, REJECT, PUBLISH, UNPUBLISH)
 * @param notes Optional admin notes
 * @param slug Required when action is PUBLISH - the URL-friendly publication slug
 */
export async function updateStoryStatus(
  id: string,
  action: StoryModerationAction,
  notes?: string,
  slug?: string
): Promise<void> {
  return apiClient.updateStoryStatus(id, action, notes, slug);
}

/**
 * Toggles featured status for a story.
 * Requires ADMIN role authentication.
 * Automatically uses the configured API implementation (backend or mock).
 * @param id Story submission ID
 * @param featured Whether to feature the story
 */
export async function toggleStoryFeatured(
  id: string,
  featured: boolean
): Promise<void> {
  return apiClient.toggleStoryFeatured(id, featured);
}

/**
 * Deletes a story submission.
 * Requires ADMIN role authentication.
 * Automatically uses the configured API implementation (backend or mock).
 * @param id Story submission ID
 */
export async function deleteStory(id: string): Promise<void> {
  return apiClient.deleteStory(id);
}

// ================================
// ADMIN SUGGESTION MODERATION OPERATIONS
// ================================

/**
 * Gets suggestions for admin moderation queue.
 * Requires ADMIN role authentication.
 * Automatically uses the configured API implementation (backend or mock).
 * @param status Filter by submission status (optional, defaults to all)
 * @param page Page number (0-indexed, default: 0)
 * @param size Page size (default: 20)
 * @returns A promise that resolves to paginated suggestions
 */
export async function getSuggestionsForAdmin(
  status?: SubmissionStatus | "ALL",
  page?: number,
  size?: number
): Promise<AdminQueueResponse<Suggestion>> {
  return apiClient.getSuggestionsForAdmin(status, page, size);
}

/**
 * Updates suggestion moderation status.
 * Requires ADMIN role authentication.
 * Automatically uses the configured API implementation (backend or mock).
 * @param id Suggestion ID
 * @param action Moderation action (APPROVE, REJECT)
 * @param notes Optional admin notes
 */
export async function updateSuggestionStatus(
  id: string,
  action: SuggestionModerationAction,
  notes?: string
): Promise<void> {
  return apiClient.updateSuggestionStatus(id, action, notes);
}

/**
 * Deletes a suggestion.
 * Requires ADMIN role authentication.
 * Automatically uses the configured API implementation (backend or mock).
 * @param id Suggestion ID
 */
export async function deleteSuggestion(id: string): Promise<void> {
  return apiClient.deleteSuggestion(id);
}

// ================================
// ADMIN DASHBOARD OPERATIONS
// ================================

/**
 * Gets admin dashboard statistics.
 * Requires ADMIN role authentication.
 * Automatically uses the configured API implementation (backend or mock).
 * @returns A promise that resolves to admin statistics
 */
export async function getAdminStats(): Promise<AdminStats> {
  return apiClient.getAdminStats();
}

/**
 * Gets dashboard counts for pending items.
 * Requires ADMIN role authentication.
 * Automatically uses the configured API implementation (backend or mock).
 * @returns A promise that resolves to counts of pending items
 */
export async function getDashboardCounts(): Promise<DashboardCounts> {
  return apiClient.getDashboardCounts();
}

/**
 * Gets top contributors list.
 * Requires ADMIN role authentication.
 * Automatically uses the configured API implementation (backend or mock).
 * @returns A promise that resolves to list of top contributors
 */
export async function getTopContributors(): Promise<Contributor[]> {
  return apiClient.getTopContributors();
}

// ================================
// PUBLIC CONTACT FORM OPERATIONS
// ================================

/**
 * Submits a contact form message.
 * Public endpoint - no authentication required.
 * Automatically uses the configured API implementation (backend or mock).
 * @param request Contact form data
 * @returns A promise that resolves to confirmation details
 * @throws Error if rate limit exceeded (HTTP 429)
 * @throws Error if validation fails (HTTP 400)
 */
export async function submitContactMessage(
  request: import("@/types/contact").ContactRequest
): Promise<import("@/types/contact").ContactConfirmationDto> {
  return apiClient.submitContactMessage(request);
}

// ================================
// ADMIN CONTACT MESSAGES OPERATIONS
// ================================

/**
 * Gets contact messages for admin.
 * Requires ADMIN role authentication.
 * Automatically uses the configured API implementation (backend or mock).
 * @param status Filter by message status (optional)
 * @param page Page number (default: 0)
 * @param size Page size (default: 20)
 * @returns A promise that resolves to paginated contact messages
 */
export async function getContactMessages(
  status?: ContactMessageStatus,
  page?: number,
  size?: number
): Promise<AdminQueueResponse<ContactMessage>> {
  return apiClient.getContactMessages(status, page, size);
}

/**
 * Updates contact message status.
 * Requires ADMIN role authentication.
 * Automatically uses the configured API implementation (backend or mock).
 * @param id Contact message ID
 * @param status New status
 * @returns A promise that resolves to updated contact message
 */
export async function updateContactMessageStatus(
  id: string,
  status: ContactMessageStatus
): Promise<ContactMessage> {
  return apiClient.updateContactMessageStatus(id, status);
}

/**
 * Deletes a contact message.
 * Requires ADMIN role authentication.
 * Automatically uses the configured API implementation (backend or mock).
 * @param id Contact message ID
 */
export async function deleteContactMessage(id: string): Promise<void> {
  return apiClient.deleteContactMessage(id);
}

// ================================
// ADMIN DIRECTORY SUBMISSIONS OPERATIONS
// ================================

/**
 * Gets directory submissions for admin.
 * Requires ADMIN role authentication.
 * Automatically uses the configured API implementation (backend or mock).
 * @param status Filter by submission status (optional)
 * @param page Page number (default: 0)
 * @param size Page size (default: 20)
 * @returns A promise that resolves to paginated directory submissions
 */
export async function getDirectorySubmissions(
  status?: SubmissionStatus | "ALL",
  page?: number,
  size?: number
): Promise<AdminQueueResponse<DirectorySubmission>> {
  return apiClient.getDirectorySubmissions(status, page, size);
}

/**
 * Updates directory submission status.
 * Requires ADMIN role authentication.
 * Automatically uses the configured API implementation (backend or mock).
 * @param id Directory submission ID
 * @param status New submission status
 * @param notes Optional admin notes
 * @returns A promise that resolves to updated directory submission
 */
export async function updateDirectorySubmissionStatus(
  id: string,
  status: SubmissionStatus,
  notes?: string
): Promise<DirectorySubmission> {
  return apiClient.updateDirectorySubmissionStatus(id, status, notes);
}

/**
 * Updates an existing directory entry.
 * Requires ADMIN role authentication.
 * Automatically uses the configured API implementation (backend or mock).
 * @param id Directory entry ID
 * @param data Update data (all fields optional)
 * @returns A promise that resolves to updated directory submission
 * @throws Error if entry not found (HTTP 404)
 * @throws Error if validation fails (HTTP 400)
 * @throws Error if authentication failed (HTTP 401/403)
 */
export async function updateDirectoryEntry(
  id: string,
  data: import("@/lib/api-contracts").UpdateDirectoryEntryRequest
): Promise<DirectorySubmission> {
  return apiClient.updateDirectoryEntry(id, data);
}

/**
 * Deletes a directory entry permanently.
 * Requires ADMIN role authentication.
 * Automatically uses the configured API implementation (backend or mock).
 * @param id Directory entry ID
 * @throws Error if entry not found (HTTP 404)
 * @throws Error if authentication failed (HTTP 401/403)
 */
export async function deleteDirectoryEntry(id: string): Promise<void> {
  return apiClient.deleteDirectoryEntry(id);
}

// ================================
// PROFILE OPERATIONS (User Story 1)
// ================================

/**
 * Gets authenticated user's profile.
 * Requires user authentication via JWT token.
 * Automatically uses the configured API implementation (backend or mock).
 * @returns A promise that resolves to the user's profile
 * @throws Error if authentication failed (HTTP 401)
 */
export async function getProfile(): Promise<
  import("@/types/profile").ProfileDto
> {
  return apiClient.getProfile();
}

/**
 * Gets authenticated user's contributions.
 * Requires user authentication via JWT token.
 * Automatically uses the configured API implementation (backend or mock).
 * @returns A promise that resolves to the user's contributions data
 * @throws Error if authentication failed (HTTP 401)
 */
export async function getContributions(): Promise<
  import("@/types/profile").ContributionsDto
> {
  return apiClient.getContributions();
}

/**
 * Updates authenticated user's profile.
 * Requires user authentication via JWT token.
 * Automatically uses the configured API implementation (backend or mock).
 * @param request Profile update data (all fields optional)
 * @returns A promise that resolves to the updated profile
 * @throws Error if rate limit exceeded (HTTP 429)
 * @throws Error if validation fails (HTTP 400)
 * @throws Error if authentication failed (HTTP 401)
 */
export async function updateProfile(
  request: import("@/types/profile").ProfileUpdateRequest
): Promise<import("@/types/profile").ProfileDto> {
  return apiClient.updateProfile(request);
}

// ================================
// GALLERY OPERATIONS (UNIFIED MEDIA)
// ================================

/**
 * Fetches unified gallery media (user uploads + external content).
 * Public endpoint - no authentication required.
 * Uses ISR with 30 minute cache for gallery content.
 * Automatically uses the configured API implementation (backend or mock).
 *
 * Returns ACTIVE media from both user uploads and admin-curated external
 * content in a unified, discriminated union response.
 *
 * @param options Query parameters (category, page, size)
 * @returns A promise that resolves to paginated gallery items
 * @throws Error if API call fails
 */
export async function getGalleryMedia(options?: {
  category?: string;
  decade?: string;
  q?: string;
  hasGeo?: boolean;
  page?: number;
  size?: number;
}): Promise<import("@/types/gallery").PublicGalleryMediaPageResponse> {
  return apiClient.getGalleryMedia(options);
}

/**
 * Fetches a single gallery media item by ID.
 * Public endpoint - no authentication required.
 * Uses ISR with 30 minute cache for individual media items.
 * Automatically uses the configured API implementation (backend or mock).
 * @param id UUID of the gallery media item
 * @returns A promise that resolves to public gallery media (UserUpload or External) or undefined if not found
 * @throws Error if API call fails
 */
export async function getGalleryMediaById(
  id: string
): Promise<import("@/types/gallery").PublicGalleryMedia | undefined> {
  return apiClient.getGalleryMediaById(id);
}

/**
 * Fetches available gallery categories.
 * Public endpoint - no authentication required.
 * Uses ISR with 1 hour cache for categories list.
 * Automatically uses the configured API implementation (backend or mock).
 * @returns A promise that resolves to array of category strings
 * @throws Error if API call fails
 */
export async function getGalleryCategories(): Promise<string[]> {
  return apiClient.getGalleryCategories();
}

export async function getRandomGalleryMedia(
  count?: number
): Promise<import("@/types/gallery").PublicGalleryMedia[]> {
  return apiClient.getRandomGalleryMedia(count);
}

export async function getFeaturedPhoto(): Promise<
  import("@/types/gallery").PublicGalleryMedia | null
> {
  return apiClient.getFeaturedPhoto();
}

export async function getWeeklyDiscovery(): Promise<
  import("@/types/gallery").PublicGalleryMedia[]
> {
  return apiClient.getWeeklyDiscovery();
}

export async function getGalleryTimeline(): Promise<
  import("@/types/gallery").TimelineResponse
> {
  return apiClient.getGalleryTimeline();
}

/**
 * Submit external media for admin review.
 * Public endpoint - no authentication required.
 * Allows community members to submit external media (YouTube videos, etc.)
 * for review and potential inclusion in the gallery.
 * Automatically uses the configured API implementation (backend or mock).
 * @param request External media submission data
 * @returns A promise that resolves to submission confirmation
 * @throws Error if API call fails
 */
export async function submitExternalMedia(
  request: import("@/types/gallery").SubmitExternalMediaRequest
): Promise<{ id: string; message: string }> {
  return apiClient.submitExternalMedia(request);
}

// ================================
// ADMIN GALLERY MODERATION OPERATIONS
// ================================

/**
 * Get unified gallery moderation queue (user uploads + external media).
 * Admin endpoint - requires ADMIN role.
 * Automatically uses the configured API implementation (backend or mock).
 * @param status Optional status filter
 * @param page Page number (default: 0)
 * @param size Page size (default: 20)
 * @returns A promise that resolves to paginated gallery media items
 */
export async function getAdminGallery(
  status?: import("@/types/gallery").GalleryMediaStatus | "ALL",
  page?: number,
  size?: number,
  aiModerationStatus?: string
): Promise<
  import("@/types/admin").AdminQueueResponse<
    import("@/types/gallery").GalleryMedia
  >
> {
  return apiClient.getAdminGallery(status, page, size, aiModerationStatus);
}

/**
 * Get detailed gallery media information for moderation.
 * Admin endpoint - requires ADMIN role.
 * Automatically uses the configured API implementation (backend or mock).
 * @param id Gallery media item ID
 * @returns A promise that resolves to detailed gallery media item
 */
export async function getAdminGalleryDetail(
  id: string
): Promise<import("@/types/gallery").GalleryMedia> {
  return apiClient.getAdminGalleryDetail(id);
}

/**
 * Update gallery media moderation status.
 * Admin endpoint - requires ADMIN role.
 * Automatically uses the configured API implementation (backend or mock).
 * @param id Gallery media item ID
 * @param request Moderation action request
 * @returns A promise that resolves to updated gallery media item
 */
export async function updateGalleryStatus(
  id: string,
  request: import("@/types/gallery").UpdateGalleryStatusRequest
): Promise<import("@/types/gallery").GalleryMedia> {
  return apiClient.updateGalleryStatus(id, request);
}

/**
 * Update gallery media metadata (PATCH semantics).
 * Admin endpoint - requires ADMIN role.
 * Automatically uses the configured API implementation (backend or mock).
 * @param id Gallery media item ID
 * @param request Update request with optional fields
 * @returns A promise that resolves to updated gallery media item
 */
export async function updateGalleryMedia(
  id: string,
  request: import("@/types/gallery").UpdateGalleryMediaRequest
): Promise<import("@/types/gallery").GalleryMedia> {
  return apiClient.updateGalleryMedia(id, request);
}

/**
 * Update EXIF metadata for a user-uploaded gallery media item.
 * Admin endpoint - requires ADMIN role.
 * @param mediaId Gallery media item ID
 * @param request EXIF fields to update (PATCH semantics)
 */
export async function updateExif(
  mediaId: string,
  request: import("@/types/gallery").UpdateExifRequest
): Promise<import("@/types/gallery").GalleryMedia> {
  return apiClient.updateExif(mediaId, request);
}

/**
 * Archive (soft delete) a gallery media item.
 * Admin endpoint - requires ADMIN role.
 * Automatically uses the configured API implementation (backend or mock).
 * @param id Gallery media item ID
 */
export async function archiveGalleryMedia(id: string): Promise<void> {
  return apiClient.archiveGalleryMedia(id);
}

/**
 * Create external media directly (admin only, bypasses moderation).
 * Admin endpoint - requires ADMIN role.
 * Automatically uses the configured API implementation (backend or mock).
 * @param request External media creation data
 * @returns A promise that resolves to created external media item
 */
export async function createExternalMedia(
  request: import("@/types/gallery").CreateExternalMediaRequest
): Promise<import("@/types/gallery").ExternalMedia> {
  return apiClient.createExternalMedia(request);
}

/**
 * Promotes a gallery image to become the hero image for a directory entry.
 * Admin endpoint - requires ADMIN role.
 * Automatically uses the configured API implementation (backend or mock).
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
export async function promoteToHeroImage(mediaId: string): Promise<void> {
  return apiClient.promoteToHeroImage(mediaId);
}

// ================================
// TEXT AI OPERATIONS
// ================================

/**
 * Check if text AI is available.
 * Requires authentication.
 */
export async function checkAiAvailable(): Promise<
  import("@/types/ai").AiAvailableResponse
> {
  return apiClient.checkAiAvailable();
}

/**
 * Polish/improve content text using AI.
 * Requires authentication.
 */
export async function polishContent(
  request: import("@/types/ai").PolishContentRequest
): Promise<import("@/types/ai").PolishContentResponse> {
  return apiClient.polishContent(request);
}

/**
 * Translate content to a target language using AI.
 * Requires authentication.
 */
export async function translateContent(
  request: import("@/types/ai").TranslateContentRequest
): Promise<import("@/types/ai").TranslateContentResponse> {
  return apiClient.translateContent(request);
}

/**
 * Generate writing prompts for a story template type.
 * Requires authentication.
 */
export async function generatePrompts(
  request: import("@/types/ai").GeneratePromptsRequest
): Promise<import("@/types/ai").GeneratePromptsResponse> {
  return apiClient.generatePrompts(request);
}

/**
 * Generate AI description and tags for a directory entry.
 * Requires authentication.
 */
export async function generateDirectoryContent(
  request: import("@/types/ai").GenerateDirectoryContentRequest
): Promise<import("@/types/ai").DirectoryContentResponse> {
  return apiClient.generateDirectoryContent(request);
}

// ================================
// ADMIN AI REVIEW OPERATIONS
// ================================

/**
 * Gets AI analysis runs pending admin review.
 * Requires ADMIN role authentication.
 * @param page Page number (default: 0)
 * @param size Page size (default: 20)
 * @returns Paginated list of analysis run summaries
 */
export async function getAiReviewQueue(
  page?: number,
  size?: number,
  status?: import("@/types/ai").AiModerationStatus | "ALL"
): Promise<
  import("@/types/admin").AdminQueueResponse<
    import("@/types/ai").AnalysisRunSummary
  >
> {
  return apiClient.getAiReviewQueue(page, size, status);
}

/**
 * Gets detailed AI output for a single analysis run.
 * Requires ADMIN role authentication.
 * @param runId Analysis run ID
 * @returns Full analysis run detail
 */
export async function getAiRunDetail(
  runId: string
): Promise<import("@/types/ai").AnalysisRunDetail> {
  return apiClient.getAiRunDetail(runId);
}

/**
 * Approves AI results as-is.
 * Requires ADMIN role authentication.
 * @param runId Analysis run ID
 */
export async function approveAiRun(runId: string): Promise<void> {
  return apiClient.approveAiRun(runId);
}

/**
 * Rejects AI results.
 * Requires ADMIN role authentication.
 * @param runId Analysis run ID
 * @param request Optional rejection notes
 */
export async function rejectAiRun(
  runId: string,
  request?: import("@/types/ai").RejectRequest
): Promise<void> {
  return apiClient.rejectAiRun(runId, request);
}

/**
 * Approves AI results with admin edits.
 * Requires ADMIN role authentication.
 * @param runId Analysis run ID
 * @param request Edited fields to apply
 */
export async function approveEditedAiRun(
  runId: string,
  request: import("@/types/ai").ApproveEditedRequest
): Promise<void> {
  return apiClient.approveEditedAiRun(runId, request);
}

/**
 * Batch fetches AI processing status for multiple media items.
 * Requires ADMIN role authentication.
 * @param mediaIds Array of media item IDs to check
 * @returns AI status for each media item
 */
export async function getAiStatus(
  mediaIds: string[]
): Promise<import("@/types/ai").AiStatusResponse[]> {
  return apiClient.getAiStatus(mediaIds);
}

/**
 * Triggers AI analysis for a single media item.
 * Requires ADMIN role authentication.
 * @param mediaId UUID of the gallery media item
 * @returns Trigger response with analysis run ID
 */
export async function triggerAnalysis(
  mediaId: string
): Promise<import("@/types/ai").AnalysisTriggerResponse> {
  return apiClient.triggerAnalysis(mediaId);
}

/**
 * Triggers AI analysis for multiple media items in batch.
 * Requires ADMIN role authentication.
 * @param request Batch request with media IDs
 * @returns Batch response with accepted/rejected counts
 */
export async function triggerBatchAnalysis(
  request: import("@/types/ai").AnalyzeBatchRequest
): Promise<import("@/types/ai").BatchAnalysisTriggerResponse> {
  return apiClient.triggerBatchAnalysis(request);
}

// ================================
// ADMIN AI DASHBOARD OPERATIONS
// ================================

/**
 * Get AI system health including provider stats and domain configs.
 * Requires ADMIN role authentication.
 */
export async function getAiHealth(): Promise<
  import("@/types/ai").AiHealthResponse
> {
  return apiClient.getAiHealth();
}

/**
 * Update a domain's AI feature toggle.
 * Requires ADMIN role authentication.
 * @param domain Domain name (gallery, stories, directory)
 * @param request Toggle state
 * @returns Updated domain config
 */
export async function updateAiDomainConfig(
  domain: string,
  request: import("@/types/ai").UpdateDomainConfigRequest
): Promise<import("@/types/ai").AiDomainConfig> {
  return apiClient.updateAiDomainConfig(domain, request);
}

// ================================
// ADMIN MEDIA MODERATION OPERATIONS
// ================================
// NOTE: Old admin media operations have been replaced by unified gallery
// moderation. See ADMIN GALLERY MODERATION OPERATIONS section above.

// ================================
// MDX ARCHIVAL ENGINE OPERATIONS
// ================================

/**
 * Generates MDX content from an approved story.
 * Requires ADMIN role authentication.
 * Only available for stories with status APPROVED.
 * Automatically uses the configured API implementation (backend or mock).
 * @param storyId The story submission ID
 * @param options Optional configuration (translations, language)
 * @returns A promise that resolves to MDX content with validation status
 * @throws Error if authentication failed (HTTP 401)
 * @throws Error if story not found or not approved (HTTP 404/400)
 */
export async function generateMdx(
  storyId: string,
  options?: import("@/types/admin").GenerateMdxOptions
): Promise<import("@/types/admin").MdxContent> {
  return apiClient.generateMdx(storyId, options);
}

/**
 * Commits MDX content to the repository.
 * Requires ADMIN role authentication.
 * Can commit even if schema validation shows errors (warning displayed).
 * Automatically uses the configured API implementation (backend or mock).
 * @param storyId The story submission ID
 * @param mdxSource The MDX content to commit
 * @param commitMessage Optional custom commit message
 * @returns A promise that resolves to commit confirmation details
 * @throws Error if authentication failed (HTTP 401)
 * @throws Error if commit fails (HTTP 500)
 */
export async function commitMdx(
  storyId: string,
  mdxSource: string,
  commitMessage?: string
): Promise<import("@/types/admin").MdxCommitResult> {
  return apiClient.commitMdx(storyId, mdxSource, commitMessage);
}

// ================================
// ADMIN R2 STORAGE OPERATIONS
// ================================

/**
 * Lists objects in the R2 bucket with optional prefix filter and pagination.
 * Requires ADMIN role authentication.
 */
export async function listR2Bucket(
  prefix?: string,
  continuationToken?: string,
  maxKeys?: number
): Promise<import("@/types/r2-admin").R2BucketListResponse> {
  return apiClient.listR2Bucket(prefix, continuationToken, maxKeys);
}

/**
 * Generates presigned upload URLs for a batch of files.
 * Requires ADMIN role authentication.
 */
export async function bulkPresignR2(
  request: import("@/types/r2-admin").BulkPresignRequest
): Promise<import("@/types/r2-admin").BulkPresignResponse> {
  return apiClient.bulkPresignR2(request);
}

/**
 * Confirms batch upload — creates ACTIVE media records with admin as reviewer.
 * Requires ADMIN role authentication.
 */
export async function bulkConfirmR2(
  request: import("@/types/r2-admin").BulkConfirmRequest
): Promise<import("@/types/r2-admin").BulkConfirmResponse> {
  return apiClient.bulkConfirmR2(request);
}

/**
 * Detects orphan objects in R2 that have no corresponding DB record.
 * Requires ADMIN role authentication.
 */
export async function detectR2Orphans(
  prefix?: string,
  continuationToken?: string,
  maxKeys?: number
): Promise<import("@/types/r2-admin").OrphanDetectionResponse> {
  return apiClient.detectR2Orphans(prefix, continuationToken, maxKeys);
}

/**
 * Links an orphan R2 object to a new DB media record.
 * Requires ADMIN role authentication.
 */
export async function linkR2Orphan(
  request: import("@/types/r2-admin").LinkOrphanRequest
): Promise<import("@/types/gallery").UserUploadMedia> {
  return apiClient.linkR2Orphan(request);
}

/**
 * Deletes an orphan R2 object (must not be linked to a DB record).
 * Requires ADMIN role authentication.
 */
export async function deleteR2Orphan(
  request: import("@/types/r2-admin").DeleteOrphanRequest
): Promise<void> {
  return apiClient.deleteR2Orphan(request);
}

// ================================
// ADMIN YOUTUBE SYNC OPERATIONS
// ================================

/**
 * Fetches YouTube sync configuration (enabled toggle, default category, API key status).
 * Requires ADMIN role authentication.
 */
export async function getYouTubeSyncConfig(): Promise<
  import("@/types/youtube").YouTubeSyncConfig
> {
  return apiClient.getYouTubeSyncConfig();
}

/**
 * Updates YouTube sync configuration (enabled toggle, default category).
 * Requires ADMIN role authentication.
 */
export async function updateYouTubeSyncConfig(
  request: import("@/types/youtube").UpdateYouTubeSyncConfigRequest
): Promise<import("@/types/youtube").YouTubeSyncConfig> {
  return apiClient.updateYouTubeSyncConfig(request);
}

/**
 * Triggers a YouTube channel or playlist sync.
 * Requires ADMIN role authentication.
 */
export async function triggerYouTubeSync(
  request?: import("@/types/youtube").YouTubeSyncRequest
): Promise<import("@/types/youtube").YouTubeSyncResult> {
  return apiClient.triggerYouTubeSync(request);
}

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
