package com.nosilha.core.contentactions

import com.nosilha.core.contentactions.api.SuggestionCreateDto
import com.nosilha.core.contentactions.api.SuggestionResponseDto
import com.nosilha.core.shared.api.ApiResult
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

/**
 * REST controller for community content improvement suggestions.
 *
 * <p>Provides endpoints for community members to submit suggestions for corrections,
 * additions, or feedback on cultural heritage content. Implements spam protection
 * and rate limiting to maintain content quality.</p>
 *
 * <h3>Endpoints:</h3>
 * <ul>
 *   <li>POST /api/v1/suggestions - Submit a new suggestion</li>
 * </ul>
 *
 * <h3>Security:</h3>
 * <ul>
 *   <li>No authentication required (allows unauthenticated community contributions)</li>
 *   <li>Rate limiting: 5 submissions per hour per IP address</li>
 *   <li>Honeypot spam protection</li>
 * </ul>
 *
 * @property suggestionService Service for managing suggestions
 */
@RestController
@RequestMapping("/api/v1/suggestions")
class SuggestionController(
    private val suggestionService: SuggestionService,
) {
    private val logger = LoggerFactory.getLogger(SuggestionController::class.java)

    /**
     * Submits a new content improvement suggestion.
     *
     * <p>Validates the submission, checks rate limits, and persists the suggestion.
     * Email notifications are sent to administrators for review.</p>
     *
     * <h4>Validation Rules:</h4>
     * <ul>
     *   <li>Name: 2-255 characters</li>
     *   <li>Email: Valid RFC 5322 format</li>
     *   <li>Suggestion type: CORRECTION, ADDITION, or FEEDBACK</li>
     *   <li>Message: 10-5000 characters</li>
     *   <li>Honeypot field must be empty (spam protection)</li>
     * </ul>
     *
     * <h4>Rate Limiting:</h4>
     * <ul>
     *   <li>Maximum 5 submissions per hour per IP address</li>
     *   <li>HTTP 429 Too Many Requests returned if limit exceeded</li>
     * </ul>
     *
     * @param dto Suggestion data from the form submission
     * @param request HTTP request (used to extract IP address)
     * @return ApiResponse with SuggestionResponseDto (201 Created).
     * Rate limit violations continue propagating to the global handler.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun submitSuggestion(
        @Valid @RequestBody dto: SuggestionCreateDto,
        request: HttpServletRequest,
    ): ApiResult<SuggestionResponseDto> {
        val ipAddress = extractIpAddress(request)
        logger.info("Received suggestion submission from IP: $ipAddress for content ${dto.contentId}")

        return try {
            val response = suggestionService.submitSuggestion(dto, ipAddress)
            logger.info("Suggestion ${response.id} created successfully")
            ApiResult(data = response, status = HttpStatus.CREATED.value())
        } catch (e: HoneypotSpamDetectedException) {
            logger.warn("Honeypot spam detected from IP: $ipAddress")
            ApiResult(
                data =
                    SuggestionResponseDto(
                        id = null,
                        message = "Thank you for your submission.",
                    ),
                status = HttpStatus.CREATED.value(),
            )
        }
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
