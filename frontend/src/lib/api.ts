import type { DirectoryEntry } from "@/types/directory";
import type { Town } from "@/types/town";
import type {
  ReactionCreateDto,
  ReactionResponseDto,
  ReactionCountsDto,
} from "@/types/reaction";
import type { MediaMetadataDto } from "@/types/api";
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
  searchQuery?: string
): Promise<PaginatedResult<DirectoryEntry>> {
  return apiClient.getEntriesByCategory(category, page, size, searchQuery);
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
 * @param category Optional category for file organization.
 * @param description Optional description of the file.
 * @returns A promise that resolves to the public URL of the uploaded image.
 */
export async function uploadImage(
  file: File,
  category?: string,
  description?: string
): Promise<string> {
  return apiClient.uploadImage(file, category, description);
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
  suggestionType: "CORRECTION" | "ADDITION" | "FEEDBACK";
  message: string;
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
 */
export async function updateStoryStatus(
  id: string,
  action: StoryModerationAction,
  notes?: string
): Promise<void> {
  return apiClient.updateStoryStatus(id, action, notes);
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
 * Note: Backend endpoint not yet implemented - uses mock data.
 * @returns A promise that resolves to paginated contact messages
 */
export async function getContactMessages(): Promise<
  AdminQueueResponse<ContactMessage>
> {
  return apiClient.getContactMessages();
}

/**
 * Updates contact message status.
 * Requires ADMIN role authentication.
 * Automatically uses the configured API implementation (backend or mock).
 * Note: Backend endpoint not yet implemented - uses mock data.
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
 * Note: Backend endpoint not yet implemented - uses mock data.
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
 * Note: Backend endpoint not yet implemented - uses mock data.
 * @param status Filter by submission status (optional)
 * @returns A promise that resolves to paginated directory submissions
 */
export async function getDirectorySubmissions(
  status?: SubmissionStatus | "ALL"
): Promise<AdminQueueResponse<DirectorySubmission>> {
  return apiClient.getDirectorySubmissions(status);
}

/**
 * Updates directory submission status.
 * Requires ADMIN role authentication.
 * Automatically uses the configured API implementation (backend or mock).
 * Note: Backend endpoint not yet implemented - uses mock data.
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
