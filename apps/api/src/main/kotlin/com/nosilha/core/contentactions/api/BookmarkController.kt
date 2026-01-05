package com.nosilha.core.contentactions.api

import com.nosilha.core.contentactions.services.BookmarkService
import com.nosilha.core.shared.api.ApiResult
import io.github.oshai.kotlinlogging.KotlinLogging
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID
import io.swagger.v3.oas.annotations.responses.ApiResponse as SwaggerApiResponse

private val logger = KotlinLogging.logger {}

/**
 * REST controller for user bookmarks.
 *
 * <p>Provides endpoints for managing bookmarks on directory entries. Allows authenticated
 * users to save entries for quick access later.</p>
 *
 * <h3>Endpoints:</h3>
 * <ul>
 *   <li>POST /api/v1/bookmarks - Create a new bookmark</li>
 *   <li>DELETE /api/v1/bookmarks/{entryId} - Remove a bookmark</li>
 * </ul>
 *
 * <h3>Security:</h3>
 * <ul>
 *   <li>Authentication required for all endpoints</li>
 *   <li>Users can only manage their own bookmarks</li>
 *   <li>Maximum 100 bookmarks per user</li>
 * </ul>
 *
 * @property bookmarkService Service for managing bookmark business logic
 */
@RestController
@RequestMapping("/api/v1/bookmarks")
@Tag(name = "Bookmarks", description = "User bookmark management for directory entries")
class BookmarkController(
    private val bookmarkService: BookmarkService,
) {
    /**
     * Create a new bookmark for a directory entry.
     *
     * <p>Saves a directory entry to the user's bookmark list for quick access.
     * Each user can have a maximum of 100 bookmarks.</p>
     *
     * <h4>Validation Rules:</h4>
     * <ul>
     *   <li>Entry ID: Required, must be a valid UUID</li>
     *   <li>Directory entry must exist</li>
     *   <li>User cannot bookmark the same entry twice</li>
     *   <li>User must be under the 100 bookmark limit</li>
     * </ul>
     *
     * <h4>Example Request:</h4>
     * <pre>
     * POST /api/v1/bookmarks
     * Authorization: Bearer {jwt-token}
     * Content-Type: application/json
     *
     * {
     *   "entryId": "550e8400-e29b-41d4-a716-446655440000"
     * }
     * </pre>
     *
     * <h4>Example Response:</h4>
     * <pre>
     * HTTP 201 Created
     * {
     *   "data": {
     *     "id": "789e0123-e45b-67c8-d901-234567890abc",
     *     "entryId": "550e8400-e29b-41d4-a716-446655440000",
     *     "createdAt": "2025-01-15T10:30:00Z"
     *   },
     *   "timestamp": "2025-01-15T10:30:00Z",
     *   "status": 201
     * }
     * </pre>
     *
     * @param request Bookmark creation request containing the entry ID
     * @param authentication Spring Security authentication containing user ID from JWT
     * @return ResponseEntity with ApiResponse containing BookmarkDto (201 Created)
     * @throws com.nosilha.core.shared.exception.ResourceNotFoundException if directory entry doesn't exist (HTTP 404)
     * @throws com.nosilha.core.shared.exception.BusinessException if bookmark already exists or limit reached (HTTP 400)
     */
    @PostMapping
    @Operation(
        summary = "Create bookmark",
        description = "Creates a new bookmark for a directory entry. Maximum 100 bookmarks per user.",
    )
    @ApiResponses(
        value = [
            SwaggerApiResponse(
                responseCode = "201",
                description = "Bookmark created successfully",
                content = [Content(schema = Schema(implementation = BookmarkDto::class))],
            ),
            SwaggerApiResponse(
                responseCode = "400",
                description = "Invalid request (entry already bookmarked or limit reached)",
            ),
            SwaggerApiResponse(
                responseCode = "401",
                description = "Unauthorized - JWT token missing or invalid",
            ),
            SwaggerApiResponse(
                responseCode = "404",
                description = "Directory entry not found",
            ),
            SwaggerApiResponse(
                responseCode = "429",
                description = "Too many requests - rate limit exceeded",
            ),
        ],
    )
    @ResponseStatus(HttpStatus.CREATED)
    fun createBookmark(
        @Valid @RequestBody request: BookmarkCreateRequest,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<BookmarkDto>> {
        val userId = authentication.name

        logger.info { "Creating bookmark for user $userId on entry ${request.entryId}" }

        val bookmark = bookmarkService.createBookmark(userId, request.entryId)

        logger.info { "Bookmark created successfully: ${bookmark.id} for user $userId on entry ${request.entryId}" }

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResult(data = bookmark, status = HttpStatus.CREATED.value()))
    }

    /**
     * Remove a bookmark for a directory entry.
     *
     * <p>Deletes the user's bookmark for the specified directory entry.
     * The bookmark must exist for the deletion to succeed.</p>
     *
     * <h4>Example Request:</h4>
     * <pre>
     * DELETE /api/v1/bookmarks/550e8400-e29b-41d4-a716-446655440000
     * Authorization: Bearer {jwt-token}
     * </pre>
     *
     * <h4>Example Response:</h4>
     * <pre>
     * HTTP 204 No Content
     * </pre>
     *
     * @param entryId UUID of the directory entry to unbookmark
     * @param authentication Spring Security authentication containing user ID from JWT
     * @return 204 No Content on success
     * @throws com.nosilha.core.shared.exception.ResourceNotFoundException if bookmark doesn't exist (HTTP 404)
     */
    @DeleteMapping("/{entryId}")
    @Operation(
        summary = "Delete bookmark",
        description = "Removes a bookmark for a directory entry. The bookmark must exist for deletion to succeed.",
    )
    @ApiResponses(
        value = [
            SwaggerApiResponse(
                responseCode = "204",
                description = "Bookmark deleted successfully",
            ),
            SwaggerApiResponse(
                responseCode = "401",
                description = "Unauthorized - JWT token missing or invalid",
            ),
            SwaggerApiResponse(
                responseCode = "404",
                description = "Bookmark not found",
            ),
        ],
    )
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteBookmark(
        @PathVariable entryId: UUID,
        authentication: Authentication,
    ) {
        val userId = authentication.name

        logger.info { "Deleting bookmark for user $userId on entry $entryId" }

        bookmarkService.deleteBookmark(userId, entryId)

        logger.info { "Bookmark deleted successfully for user $userId on entry $entryId" }
    }
}
