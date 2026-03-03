package com.nosilha.core.stories.api

import com.nosilha.core.shared.api.ApiResult
import com.nosilha.core.shared.api.PagedApiResult
import com.nosilha.core.stories.services.StoryService
import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

private val logger = KotlinLogging.logger {}

/**
 * REST controller for story submissions and public story access.
 *
 * <p>Handles both authenticated story submissions and public story retrieval.
 * Allows community members to share their personal stories and memories of Brava Island,
 * and enables public access to published stories.</p>
 *
 * <h3>Public Endpoints:</h3>
 * <ul>
 *   <li>GET /api/v1/stories - List published stories with pagination</li>
 *   <li>GET /api/v1/stories/slug/{slug} - Get single published story by slug</li>
 * </ul>
 *
 * <h3>Authenticated Endpoints:</h3>
 * <ul>
 *   <li>POST /api/v1/stories - Submit a new story</li>
 * </ul>
 *
 * <h3>Security:</h3>
 * <ul>
 *   <li>Public endpoints: No authentication required</li>
 *   <li>POST endpoint: Authentication required (configured in SecurityConfig)</li>
 *   <li>Rate limiting: 5 submissions per hour per IP address</li>
 *   <li>Honeypot spam protection</li>
 * </ul>
 *
 * @property storyService Service for managing story submissions and retrieval
 */
@RestController
@RequestMapping("/api/v1/stories")
class StoryController(
    private val storyService: StoryService,
) {
    // ========================================
    // PUBLIC ENDPOINTS
    // ========================================

    /**
     * List published stories with pagination.
     *
     * <p>This is a public endpoint that returns all published stories
     * in descending order by creation date. No authentication required.</p>
     *
     * <h4>Pagination:</h4>
     * <ul>
     *   <li>Default page size: 20</li>
     *   <li>Maximum page size: 50</li>
     *   <li>Page numbering starts at 0</li>
     * </ul>
     *
     * <h4>Example Request:</h4>
     * <pre>
     * GET /api/v1/stories?page=0&size=20
     * </pre>
     *
     * <h4>Example Response:</h4>
     * <pre>
     * {
     *   "data": [
     *     {
     *       "id": "550e8400-e29b-41d4-a716-446655440000",
     *       "slug": "my-childhood-in-faja-dagua",
     *       "title": "My Childhood in Fajã d'Água",
     *       "excerpt": "I remember the sound of waves...",
     *       "author": "Maria Silva",
     *       "storyType": "FULL",
     *       "templateType": "CHILDHOOD",
     *       "location": "Fajã d'Água Beach",
     *       "isFeatured": true,
     *       "createdAt": "2025-01-15T10:30:00Z"
     *     }
     *   ],
     *   "page": 0,
     *   "size": 20,
     *   "totalElements": 45,
     *   "totalPages": 3,
     *   "timestamp": "2025-01-15T12:00:00Z",
     *   "status": 200
     * }
     * </pre>
     *
     * @param page Page number (default: 0)
     * @param size Number of items per page (default: 20, max: 50)
     * @return PagedApiResult containing list of PublicStoryListDto
     */
    @GetMapping
    fun listPublishedStories(
        @RequestParam(name = "page", defaultValue = "0") page: Int,
        @RequestParam(name = "size", defaultValue = "20") size: Int,
    ): PagedApiResult<PublicStoryListDto> {
        logger.debug { "Fetching published stories - page: $page, size: $size" }
        val stories = storyService.listPublishedStories(page, size)
        return PagedApiResult.from(stories)
    }

    /**
     * Get a single published story by its slug.
     *
     * <p>This is a public endpoint that returns the full details of a published story.
     * No authentication required.</p>
     *
     * <h4>Example Request:</h4>
     * <pre>
     * GET /api/v1/stories/slug/my-childhood-in-faja-dagua
     * </pre>
     *
     * <h4>Example Response:</h4>
     * <pre>
     * {
     *   "data": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "slug": "my-childhood-in-faja-dagua",
     *     "title": "My Childhood in Fajã d'Água",
     *     "content": "Full story content here...",
     *     "author": "Maria Silva",
     *     "storyType": "FULL",
     *     "templateType": "CHILDHOOD",
     *     "location": "Fajã d'Água Beach",
     *     "isFeatured": true,
     *     "createdAt": "2025-01-15T10:30:00Z"
     *   },
     *   "timestamp": "2025-01-15T12:00:00Z",
     *   "status": 200
     * }
     * </pre>
     *
     * @param slug The URL-friendly publication slug
     * @return ApiResult containing PublicStoryDetailDto
     * @throws ResourceNotFoundException if story is not found or not published (results in 404 Not Found)
     */
    @GetMapping("/slug/{slug}")
    fun getPublishedStoryBySlug(
        @PathVariable slug: String,
    ): ApiResult<PublicStoryDetailDto> {
        logger.debug { "Fetching published story by slug: $slug" }
        val story = storyService.getPublishedStoryBySlug(slug)
        return ApiResult(data = story)
    }

    // ========================================
    // AUTHENTICATED ENDPOINTS
    // ========================================

    /**
     * Submit a new story.
     *
     * <p>Validates the submission, checks rate limits, and persists the story
     * for moderation review. Notifications are sent to administrators.</p>
     *
     * <h4>Validation Rules:</h4>
     * <ul>
     *   <li>Title: 1-255 characters</li>
     *   <li>Content: 10-5000 characters</li>
     *   <li>Story type: QUICK, FULL, or GUIDED</li>
     *   <li>Template type: Required if storyType is GUIDED</li>
     *   <li>Honeypot field must be empty (spam protection)</li>
     * </ul>
     *
     * <h4>Rate Limiting:</h4>
     * <ul>
     *   <li>Maximum 5 submissions per hour per IP address</li>
     *   <li>HTTP 429 Too Many Requests returned if limit exceeded</li>
     * </ul>
     *
     * @param request Story submission data from the form
     * @param authentication Spring Security authentication containing user ID
     * @param httpRequest HTTP request (used to extract IP address)
     * @return ResponseEntity with ApiResponse containing StorySubmittedResponse (201 Created)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun submitStory(
        @Valid @RequestBody request: CreateStoryRequest,
        authentication: Authentication,
        httpRequest: HttpServletRequest,
    ): ResponseEntity<ApiResult<StorySubmittedResponse>> {
        val authorId = authentication.name
        val ipAddress = extractIpAddress(httpRequest)

        logger.info { "Received story submission from user: $authorId (IP: $ipAddress) - type: ${request.storyType}" }

        val response = storyService.submitStory(request, authorId, ipAddress)

        logger.info { "Story ${response.id} created successfully by user: $authorId" }

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResult(data = response, status = HttpStatus.CREATED.value()))
    }

    /**
     * Extracts the client IP address from the HTTP request.
     *
     * <p>Checks X-Forwarded-For header first (for proxied requests),
     * then falls back to remote address.</p>
     *
     * @param request HTTP request
     * @return IP address or null if not available
     */
    private fun extractIpAddress(request: HttpServletRequest): String? {
        // Check X-Forwarded-For header (for proxied requests)
        val xForwardedFor = request.getHeader("X-Forwarded-For")
        if (!xForwardedFor.isNullOrBlank()) {
            // Take the first IP if multiple are present
            return xForwardedFor.split(",").firstOrNull()?.trim()
        }

        // Fall back to remote address
        return request.remoteAddr
    }
}
