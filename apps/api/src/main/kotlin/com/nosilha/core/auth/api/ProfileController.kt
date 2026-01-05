package com.nosilha.core.auth.api

import com.nosilha.core.auth.ProfileService
import com.nosilha.core.auth.api.dto.ContributionsDto
import com.nosilha.core.auth.api.dto.ProfileDto
import com.nosilha.core.auth.api.dto.ProfileUpdateRequest
import com.nosilha.core.contentactions.api.BookmarkWithEntryDto
import com.nosilha.core.contentactions.services.BookmarkService
import com.nosilha.core.shared.api.ApiResult
import com.nosilha.core.shared.api.PagedApiResult
import io.github.oshai.kotlinlogging.KotlinLogging
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import io.swagger.v3.oas.annotations.responses.ApiResponse as SwaggerApiResponse

private val logger = KotlinLogging.logger {}

/**
 * REST controller for user profile and contribution management.
 *
 * <p>Provides endpoints for authenticated users to access and manage their profile data
 * and contribution history. All endpoints require JWT authentication.</p>
 *
 * <h3>Endpoints:</h3>
 * <ul>
 *   <li>GET /api/v1/users/me - Get authenticated user's profile</li>
 *   <li>PUT /api/v1/users/me - Update authenticated user's profile (rate limited: 10/min)</li>
 *   <li>GET /api/v1/users/me/contributions - Get aggregated contribution data</li>
 *   <li>GET /api/v1/users/me/bookmarks - Get paginated list of user's bookmarks</li>
 * </ul>
 *
 * <h3>Security:</h3>
 * <ul>
 *   <li>Authentication required (JWT token from Supabase)</li>
 *   <li>User ID extracted from JWT token claims</li>
 *   <li>Auto-creates profile if doesn't exist (getOrCreate pattern)</li>
 *   <li>Rate limiting on PUT endpoint (10 updates per minute per user)</li>
 * </ul>
 *
 * @property profileService Service for managing user profiles and contributions
 * @property bookmarkService Service for managing user bookmarks
 */
@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Profile", description = "User profile and contribution management endpoints")
class ProfileController(
    private val profileService: ProfileService,
    private val bookmarkService: BookmarkService,
) {
    /**
     * Retrieves the authenticated user's profile.
     *
     * <p>If the user doesn't have a profile yet, one is automatically created with
     * default values (EN language, default notification preferences). This ensures
     * all authenticated users have a profile without requiring explicit signup.</p>
     *
     * <p><strong>Authentication Required</strong>: Extracts userId from JWT token.</p>
     *
     * <p><strong>Example Request</strong>:
     * <pre>
     * GET /api/v1/users/me
     * Authorization: Bearer {jwt-token}
     * </pre>
     *
     * <p><strong>Example Response</strong>:
     * <pre>
     * HTTP 200 OK
     * {
     *   "data": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "userId": "auth0|123456789",
     *     "displayName": "Maria Silva",
     *     "location": "Brava Island, Cape Verde",
     *     "preferredLanguage": "PT",
     *     "notificationPreferences": {
     *       "emailNotifications": true,
     *       "contentUpdates": true,
     *       "communityDigest": false
     *     },
     *     "createdAt": "2024-01-15T10:30:00Z",
     *     "updatedAt": "2024-01-20T14:45:00Z"
     *   },
     *   "timestamp": "2024-01-21T12:00:00Z",
     *   "status": 200
     * }
     * </pre>
     *
     * @param authentication Spring Security authentication containing user ID from JWT
     * @return ApiResult wrapping ProfileDto with user profile information
     */
    @GetMapping("/me")
    @Operation(
        summary = "Get authenticated user's profile",
        description = "Retrieves the profile for the authenticated user. Creates a default profile if one doesn't exist.",
        security = [SecurityRequirement(name = "bearerAuth")],
    )
    @SwaggerApiResponse(responseCode = "200", description = "Profile retrieved successfully")
    @SwaggerApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token")
    fun getProfile(authentication: Authentication): ApiResult<ProfileDto> {
        val userId = extractUserId(authentication)

        logger.info { "Retrieving profile for user: $userId" }

        val profile = profileService.getOrCreateProfile(userId)

        logger.debug { "Profile retrieved for user $userId: ${profile.id}" }

        return ApiResult(data = profile, status = HttpStatus.OK.value())
    }

    /**
     * Updates the authenticated user's profile.
     *
     * <p>Supports partial updates - only non-null fields in the request will be applied.
     * The profile must already exist (created automatically via GET /me endpoint during
     * initial authentication).</p>
     *
     * <p><strong>Authentication Required</strong>: Extracts userId from JWT token.</p>
     *
     * <p><strong>Rate Limiting</strong>: Maximum 10 updates per minute per user to prevent
     * abuse. Exceeding this limit results in HTTP 429 Too Many Requests.</p>
     *
     * <p><strong>Example Request</strong>:
     * <pre>
     * PUT /api/v1/users/me
     * Authorization: Bearer {jwt-token}
     * Content-Type: application/json
     *
     * {
     *   "displayName": "Maria Silva",
     *   "location": "Brava Island, Cape Verde",
     *   "preferredLanguage": "PT",
     *   "notificationPreferences": {
     *     "emailNotifications": true,
     *     "contentUpdates": true,
     *     "communityDigest": false
     *   }
     * }
     * </pre>
     *
     * <p><strong>Example Response</strong>:
     * <pre>
     * HTTP 200 OK
     * {
     *   "data": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "userId": "auth0|123456789",
     *     "displayName": "Maria Silva",
     *     "location": "Brava Island, Cape Verde",
     *     "preferredLanguage": "PT",
     *     "notificationPreferences": {
     *       "emailNotifications": true,
     *       "contentUpdates": true,
     *       "communityDigest": false
     *     },
     *     "createdAt": "2024-01-15T10:30:00Z",
     *     "updatedAt": "2024-01-21T12:00:00Z"
     *   },
     *   "timestamp": "2024-01-21T12:00:00Z",
     *   "status": 200
     * }
     * </pre>
     *
     * @param authentication Spring Security authentication containing user ID from JWT
     * @param request ProfileUpdateRequest with optional fields to update
     * @return ApiResult wrapping ProfileDto with updated profile information
     */
    @PutMapping("/me")
    @Operation(
        summary = "Update authenticated user's profile",
        description = "Updates the authenticated user's profile settings. All fields are optional for partial updates.",
        security = [SecurityRequirement(name = "bearerAuth")],
    )
    @SwaggerApiResponse(responseCode = "200", description = "Profile updated successfully")
    @SwaggerApiResponse(responseCode = "400", description = "Validation error - invalid field values")
    @SwaggerApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token")
    @SwaggerApiResponse(responseCode = "404", description = "Profile not found - call GET /me first to create profile")
    @SwaggerApiResponse(responseCode = "429", description = "Rate limit exceeded - max 10 updates per minute")
    fun updateProfile(
        authentication: Authentication,
        @Valid @RequestBody request: ProfileUpdateRequest,
    ): ApiResult<ProfileDto> {
        val userId = extractUserId(authentication)

        logger.info { "Updating profile for user: $userId" }

        val updatedProfile = profileService.updateProfile(userId, request)

        logger.debug { "Profile updated for user $userId: ${updatedProfile.id}" }

        return ApiResult(data = updatedProfile, status = HttpStatus.OK.value())
    }

    /**
     * Retrieves aggregated contribution data for the authenticated user.
     *
     * <p>Aggregates all contributions made by the user across the platform:
     * <ul>
     *   <li>Reactions: Counts grouped by reaction type (LOVE, CELEBRATE, INSIGHTFUL, SUPPORT)</li>
     *   <li>Suggestions: List of content improvement suggestions with status</li>
     *   <li>Stories: List of submitted stories with moderation status</li>
     * </ul>
     *
     * <p><strong>Authentication Required</strong>: Extracts userId from JWT token.</p>
     *
     * <p><strong>Example Request</strong>:
     * <pre>
     * GET /api/v1/users/me/contributions
     * Authorization: Bearer {jwt-token}
     * </pre>
     *
     * <p><strong>Example Response</strong>:
     * <pre>
     * HTTP 200 OK
     * {
     *   "data": {
     *     "reactionCounts": {
     *       "LOVE": 42,
     *       "CELEBRATE": 15,
     *       "INSIGHTFUL": 8,
     *       "SUPPORT": 23
     *     },
     *     "suggestions": [
     *       {
     *         "id": "789e0123-e45b-67c8-d901-234567890abc",
     *         "contentId": "456f7890-a12b-34c5-d678-901234567def",
     *         "suggestionType": "CORRECTION",
     *         "status": "PENDING",
     *         "createdAt": "2024-01-15T10:30:00Z"
     *       }
     *     ],
     *     "stories": [
     *       {
     *         "id": "abc12345-def6-7890-abcd-ef1234567890",
     *         "title": "My grandmother's memories of Brava",
     *         "storyType": "FULL",
     *         "status": "APPROVED",
     *         "createdAt": "2024-01-10T08:15:00Z"
     *       }
     *     ],
     *     "totalReactions": 88,
     *     "totalSuggestions": 1,
     *     "totalStories": 1
     *   },
     *   "timestamp": "2024-01-21T12:00:00Z",
     *   "status": 200
     * }
     * </pre>
     *
     * @param authentication Spring Security authentication containing user ID from JWT
     * @return ApiResult wrapping ContributionsDto with aggregated contribution data
     */
    @GetMapping("/me/contributions")
    @Operation(
        summary = "Get authenticated user's contributions",
        description = "Retrieves aggregated contribution data including reactions, suggestions, and stories submitted by the user.",
        security = [SecurityRequirement(name = "bearerAuth")],
    )
    @SwaggerApiResponse(responseCode = "200", description = "Contributions retrieved successfully")
    @SwaggerApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token")
    fun getContributions(authentication: Authentication): ApiResult<ContributionsDto> {
        val userId = extractUserId(authentication)

        logger.info { "Retrieving contributions for user: $userId" }

        val contributions = profileService.getContributions(userId)

        logger.debug {
            "Contributions retrieved for user $userId: ${contributions.totalReactions} reactions, ${contributions.totalSuggestions} suggestions, ${contributions.totalStories} stories"
        }

        return ApiResult(data = contributions, status = HttpStatus.OK.value())
    }

    /**
     * Retrieves the authenticated user's bookmarks with full entry details.
     *
     * <p>Returns a paginated list of all bookmarks created by the user, ordered by
     * creation date (newest first). Each bookmark includes complete directory entry
     * information for display in the user's saved items list.</p>
     *
     * <p><strong>Authentication Required</strong>: Extracts userId from JWT token.</p>
     *
     * <p><strong>Pagination Parameters</strong>:
     * <ul>
     *   <li>page: Page number (0-indexed), default 0</li>
     *   <li>size: Items per page (default 20, max 100)</li>
     * </ul>
     *
     * <p><strong>Example Request</strong>:
     * <pre>
     * GET /api/v1/users/me/bookmarks?page=0&size=20
     * Authorization: Bearer {jwt-token}
     * </pre>
     *
     * <p><strong>Example Response</strong>:
     * <pre>
     * HTTP 200 OK
     * {
     *   "data": [
     *     {
     *       "id": "123e4567-e89b-12d3-a456-426614174000",
     *       "entry": {
     *         "id": "456e7890-e89b-12d3-a456-426614174001",
     *         "name": "Restaurante Vista Mar",
     *         "category": "RESTAURANT",
     *         "slug": "restaurante-vista-mar",
     *         "town": "Nova Sintra",
     *         "averageRating": 4.5,
     *         "thumbnailUrl": "https://example.com/image.jpg"
     *       },
     *       "createdAt": "2024-01-15T10:30:00Z"
     *     }
     *   ],
     *   "pageable": {
     *     "page": 0,
     *     "size": 20,
     *     "totalElements": 42,
     *     "totalPages": 3,
     *     "first": true,
     *     "last": false
     *   },
     *   "timestamp": "2024-01-21T12:00:00Z",
     *   "status": 200
     * }
     * </pre>
     *
     * @param authentication Spring Security authentication containing user ID from JWT
     * @param page Page number (0-indexed), default 0
     * @param size Items per page (default 20, max 100)
     * @return PagedApiResponse containing list of bookmarks with entry details and pagination metadata
     */
    @GetMapping("/me/bookmarks")
    @Operation(
        summary = "Get authenticated user's bookmarks",
        description = "Retrieves a paginated list of the user's bookmarks with full directory entry details, " +
            "ordered by creation date (newest first).",
        security = [SecurityRequirement(name = "bearerAuth")],
    )
    @SwaggerApiResponse(responseCode = "200", description = "Bookmarks retrieved successfully")
    @SwaggerApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token")
    fun getBookmarks(
        authentication: Authentication,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): PagedApiResult<BookmarkWithEntryDto> {
        val userId = extractUserId(authentication)

        logger.info { "Retrieving bookmarks for user: $userId (page: $page, size: $size)" }

        // Ensure size doesn't exceed maximum
        val effectiveSize = size.coerceAtMost(100)
        val pageable = PageRequest.of(page, effectiveSize)

        val bookmarksPage = bookmarkService.getBookmarks(userId, pageable)

        logger.debug {
            "Bookmarks retrieved for user $userId: ${bookmarksPage.numberOfElements} items on page ${bookmarksPage.number}/${bookmarksPage.totalPages}"
        }

        return PagedApiResult.from(bookmarksPage)
    }

    /**
     * Extracts user ID from Spring Security authentication.
     *
     * <p>For Supabase JWT authentication, the principal contains the user ID as a string.
     * This is different from the UUID-based authentication used in some other controllers
     * (like ReactionController), as Supabase uses string-based user IDs.</p>
     *
     * @param authentication Spring Security authentication object
     * @return User ID as String (Supabase auth user ID)
     * @throws IllegalStateException if principal is not a string
     */
    private fun extractUserId(authentication: Authentication): String {
        val userId =
            authentication.name
                ?: throw IllegalStateException("Authentication name must be present (user ID)")

        logger.trace { "Extracted user ID from authentication: $userId" }

        return userId
    }
}
