/**
 * Types for Bookmark feature (User Story 3 - Save Places for Future Visits)
 *
 * These types match the backend API contracts defined in:
 * - backend/src/main/kotlin/com/nosilha/core/contentactions/api/BookmarkDto.kt
 * - backend/src/main/kotlin/com/nosilha/core/contentactions/domain/Bookmark.kt
 */

/**
 * DTO for creating a new bookmark.
 * Sent in POST /api/v1/bookmarks request.
 */
export interface BookmarkCreateRequest {
  /**
   * UUID of the directory entry to bookmark
   */
  entryId: string;
}

/**
 * DTO for bookmark response after successful creation.
 * Returned from POST /api/v1/bookmarks endpoint.
 */
export interface BookmarkDto {
  /**
   * UUID of the created bookmark
   */
  id: string;

  /**
   * UUID of the bookmarked directory entry
   */
  entryId: string;

  /**
   * ISO 8601 timestamp when the bookmark was created
   */
  createdAt: string;
}

/**
 * Directory entry details included in bookmark listings.
 * Subset of DirectoryEntryDto with essential fields for saved places display.
 */
export interface BookmarkEntryDetails {
  /**
   * UUID of the directory entry
   */
  id: string;

  /**
   * Display name of the place
   */
  name: string;

  /**
   * Entry category (Restaurant, Hotel, Beach, Landmark)
   */
  category: string;

  /**
   * URL-friendly slug for the entry
   */
  slug: string;

  /**
   * Short description of the place (nullable)
   */
  description: string | null;

  /**
   * Town where the place is located (nullable)
   */
  town: string | null;

  /**
   * URL to the thumbnail image (nullable)
   */
  thumbnailUrl: string | null;

  /**
   * Average rating (1-5 stars, nullable if no ratings)
   */
  averageRating: number | null;
}

/**
 * DTO for bookmark with full entry details.
 * Returned from GET /api/v1/users/me/bookmarks endpoint for listing saved places.
 */
export interface BookmarkWithEntryDto {
  /**
   * UUID of the bookmark
   */
  id: string;

  /**
   * ISO 8601 timestamp when the bookmark was created
   */
  createdAt: string;

  /**
   * Full directory entry details for display
   */
  entry: BookmarkEntryDetails;
}

/**
 * Error response from bookmark API endpoints.
 * Used for error handling in bookmark components.
 */
export interface BookmarkErrorResponse {
  /**
   * HTTP status code
   */
  status: number;

  /**
   * Error message from backend
   */
  message: string;

  /**
   * Error type (for programmatic handling)
   */
  error?: "Unauthorized" | "NotFound" | "Conflict" | "ServerError";
}
