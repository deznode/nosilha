package com.nosilha.core.contentactions.api

import com.nosilha.core.contentactions.StoryService
import com.nosilha.core.shared.api.ApiResult
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

/**
 * REST controller for story submissions.
 *
 * <p>Handles authenticated user story submissions. Allows community members
 * to share their personal stories and memories of Brava Island.</p>
 *
 * <h3>Endpoints:</h3>
 * <ul>
 *   <li>POST /api/v1/stories - Submit a new story</li>
 * </ul>
 *
 * <h3>Security:</h3>
 * <ul>
 *   <li>Authentication required (configured in SecurityConfig)</li>
 *   <li>Rate limiting: 5 submissions per hour per IP address</li>
 *   <li>Honeypot spam protection</li>
 * </ul>
 *
 * @property storyService Service for managing story submissions
 */
@RestController
@RequestMapping("/api/v1/stories")
class StoryController(
    private val storyService: StoryService,
) {
    private val logger = LoggerFactory.getLogger(StoryController::class.java)

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

        logger.info(
            "Received story submission from user: {} (IP: {}) - type: {}",
            authorId,
            ipAddress,
            request.storyType
        )

        val response = storyService.submitStory(request, authorId, ipAddress)

        logger.info("Story ${response.id} created successfully by user: $authorId")

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
