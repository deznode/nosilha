package com.nosilha.core.contentactions

import com.nosilha.core.contentactions.api.ReactionCountsDto
import com.nosilha.core.contentactions.api.ReactionCreateDto
import com.nosilha.core.contentactions.api.ReactionResponseDto
import com.nosilha.core.shared.api.ApiResult
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * REST controller for user reactions to cultural heritage content.
 *
 * <p>Provides endpoints for:
 * <ul>
 *   <li>POST /api/v1/reactions - Submit or update reaction (authenticated)</li>
 *   <li>DELETE /api/v1/reactions/content/{contentId} - Remove reaction (authenticated)</li>
 *   <li>GET /api/v1/reactions/content/{contentId} - Get aggregated counts (public)</li>
 * </ul>
 *
 * <p><strong>Authentication</strong>: POST and DELETE require JWT authentication.
 * GET endpoint is public (shows counts for all users, current user's reaction if authenticated).</p>
 *
 * <p><strong>Rate Limiting</strong>: POST endpoint enforces 10 reactions/minute per user.</p>
 */
@RestController
@RequestMapping("/api/v1/reactions")
@Validated
class ReactionController(
    private val reactionService: ReactionService,
) {
    companion object {
        private val logger = LoggerFactory.getLogger(ReactionController::class.java)
    }

    /**
     * Submits a new reaction or updates an existing reaction.
     *
     * <p><strong>Authentication Required</strong>: Extracts userId from JWT token.</p>
     *
     * <p><strong>Business Rules</strong>:
     * <ul>
     *   <li>If user has no reaction: creates new reaction</li>
     *   <li>If user clicks same reaction type: removes reaction (toggle off)</li>
     *   <li>If user clicks different type: replaces old with new reaction</li>
     * </ul>
     *
     * <p><strong>Optimistic UI Support</strong>: Frontend can update counts immediately.
     * If this call fails (rate limit, network), frontend should rollback UI changes.</p>
     *
     * <p><strong>Rate Limiting</strong>: Maximum 10 reactions per minute per user.
     * Returns HTTP 429 if exceeded.</p>
     *
     * <p><strong>Example Request</strong>:
     * <pre>
     * POST /api/v1/reactions
     * Authorization: Bearer {jwt-token}
     * {
     *   "contentId": "789e0123-e45b-67c8-d901-234567890abc",
     *   "reactionType": "LOVE"
     * }
     * </pre>
     *
     * <p><strong>Example Response (New Reaction)</strong>:
     * <pre>
     * HTTP 201 Created
     * {
     *   "id": "550e8400-e29b-41d4-a716-446655440000",
     *   "contentId": "789e0123-e45b-67c8-d901-234567890abc",
     *   "reactionType": "LOVE",
     *   "count": 43
     * }
     * </pre>
     *
     * <p><strong>Example Response (Toggle Off)</strong>:
     * <pre>
     * HTTP 200 OK
     * {
     *   "id": "550e8400-e29b-41d4-a716-446655440000",
     *   "contentId": "789e0123-e45b-67c8-d901-234567890abc",
     *   "reactionType": "LOVE",
     *   "count": 42
     * }
     * </pre>
     *
     * @param createDto Contains contentId and reactionType
     * @param authentication Spring Security authentication (contains userId from JWT)
     * @return ApiResponse wrapping ReactionResponseDto with reaction details and updated count
     * @throws com.nosilha.core.shared.exception.RateLimitExceededException if rate limit exceeded (HTTP 429)
     */
    @PostMapping
    fun submitReaction(
        @Valid @RequestBody createDto: ReactionCreateDto,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<ReactionResponseDto>> {
        val userId = extractUserId(authentication)

        logger.info(
            "User {} submitting reaction {} for content {}",
            userId,
            createDto.reactionType,
            createDto.contentId,
        )

        val result = reactionService.submitReaction(userId, createDto)

        // Return 201 Created for new reactions, 200 OK for updates/removals
        val status =
            when (result.operation) {
                ReactionService.ReactionSubmissionResult.Operation.CREATED -> HttpStatus.CREATED
                ReactionService.ReactionSubmissionResult.Operation.UPDATED,
                ReactionService.ReactionSubmissionResult.Operation.REMOVED,
                -> HttpStatus.OK
            }

        logger.info(
            "Reaction submitted successfully: {} by user {} (count: {}, operation: {})",
            createDto.reactionType,
            userId,
            result.reaction.count,
            result.operation,
        )

        val payload = ApiResult(data = result.reaction, status = status.value())
        return ResponseEntity.status(status).body(payload)
    }

    /**
     * Removes user's reaction to content.
     *
     * <p><strong>Authentication Required</strong>: Extracts userId from JWT token.</p>
     *
     * <p>Used when frontend explicitly wants to remove a reaction. Note that clicking
     * the same reaction type in submitReaction also removes it (toggle off behavior).</p>
     *
     * <p><strong>Example Request</strong>:
     * <pre>
     * DELETE /api/v1/reactions/content/789e0123-e45b-67c8-d901-234567890abc
     * Authorization: Bearer {jwt-token}
     * </pre>
     *
     * <p><strong>Example Response</strong>:
     * <pre>
     * HTTP 204 No Content
     * </pre>
     *
     * @param contentId UUID of the heritage page/content
     * @param authentication Spring Security authentication (contains userId from JWT)
     * @return 204 No Content on success
     * @throws com.nosilha.core.shared.exception.ResourceNotFoundException if reaction doesn't exist (HTTP 404)
     */
    @DeleteMapping("/content/{contentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteReaction(
        @PathVariable contentId: UUID,
        authentication: Authentication,
    ) {
        val userId = extractUserId(authentication)

        logger.info("User {} deleting reaction for content {}", userId, contentId)

        reactionService.deleteReaction(userId, contentId)

        logger.info("Reaction deleted successfully for user {} on content {}", userId, contentId)
    }

    /**
     * Gets aggregated reaction counts for a specific content page.
     *
     * <p><strong>Public Endpoint</strong>: No authentication required to view counts.
     * If user is authenticated, response includes their current reaction.</p>
     *
     * <p><strong>Caching</strong>: Results cached for 5 minutes. Cache invalidated
     * when any user submits/removes a reaction.</p>
     *
     * <p><strong>Example Request (Unauthenticated)</strong>:
     * <pre>
     * GET /api/v1/reactions/content/789e0123-e45b-67c8-d901-234567890abc
     * </pre>
     *
     * <p><strong>Example Response (Unauthenticated)</strong>:
     * <pre>
     * HTTP 200 OK
     * {
     *   "contentId": "789e0123-e45b-67c8-d901-234567890abc",
     *   "reactions": {
     *     "LOVE": 42,
     *     "CELEBRATE": 15,
     *     "INSIGHTFUL": 8,
     *     "SUPPORT": 23
     *   },
     *   "userReaction": null
     * }
     * </pre>
     *
     * <p><strong>Example Request (Authenticated)</strong>:
     * <pre>
     * GET /api/v1/reactions/content/789e0123-e45b-67c8-d901-234567890abc
     * Authorization: Bearer {jwt-token}
     * </pre>
     *
     * <p><strong>Example Response (Authenticated)</strong>:
     * <pre>
     * HTTP 200 OK
     * {
     *   "contentId": "789e0123-e45b-67c8-d901-234567890abc",
     *   "reactions": {
     *     "LOVE": 42,
     *     "CELEBRATE": 15,
     *     "INSIGHTFUL": 8,
     *     "SUPPORT": 23
     *   },
     *   "userReaction": "LOVE"
     * }
     * </pre>
     *
     * @param contentId UUID of the heritage page/content
     * @param authentication Spring Security authentication (null for unauthenticated users)
     * @return ReactionCountsDto with counts map and user's reaction (if authenticated)
     */
    @GetMapping("/content/{contentId}")
    fun getReactionCounts(
        @PathVariable contentId: UUID,
        authentication: Authentication?,
    ): ApiResult<ReactionCountsDto> {
        val userId = authentication?.let { extractUserId(it) }

        logger.debug("Fetching reaction counts for content {} (user: {})", contentId, userId)

        val counts = reactionService.getReactionCounts(contentId, userId)

        logger.debug(
            "Returning reaction counts for content {}: {} (user reaction: {})",
            contentId,
            counts.reactions,
            counts.userReaction,
        )

        return ApiResult(data = counts)
    }

    /**
     * Extracts user ID from Spring Security authentication.
     *
     * <p>JWT filter sets authentication principal to user ID (UUID string).
     * This method parses it back to UUID.</p>
     *
     * @param authentication Spring Security authentication object
     * @return User ID as UUID
     * @throws IllegalStateException if principal is not a valid UUID
     */
    private fun extractUserId(authentication: Authentication): UUID {
        val principal =
            authentication.principal as? String
                ?: throw IllegalStateException("Authentication principal must be a string (user ID)")

        return try {
            UUID.fromString(principal)
        } catch (e: IllegalArgumentException) {
            throw IllegalStateException("Authentication principal must be a valid UUID: $principal", e)
        }
    }
}
