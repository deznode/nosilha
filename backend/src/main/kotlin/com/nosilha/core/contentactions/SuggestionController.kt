package com.nosilha.core.contentactions

import com.nosilha.core.contentactions.api.SuggestionCreateDto
import com.nosilha.core.contentactions.api.SuggestionResponseDto
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

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
    private val suggestionService: SuggestionService
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
     * @return ResponseEntity with SuggestionResponseDto (201 Created) or error (400/429)
     */
    @PostMapping
    fun submitSuggestion(
        @Valid @RequestBody dto: SuggestionCreateDto,
        request: HttpServletRequest
    ): ResponseEntity<SuggestionResponseDto> {
        val ipAddress = extractIpAddress(request)
        logger.info("Received suggestion submission from IP: $ipAddress for content ${dto.contentId}")

        return try {
            val response = suggestionService.submitSuggestion(dto, ipAddress)
            logger.info("Suggestion ${response.id} created successfully")
            ResponseEntity.status(HttpStatus.CREATED).body(response)
        } catch (e: RateLimitExceededException) {
            logger.warn("Rate limit exceeded for IP: $ipAddress - ${e.message}")
            ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(
                    SuggestionResponseDto(
                        id = null,
                        message = e.message ?: "Rate limit exceeded. Please try again later."
                    )
                )
        } catch (e: HoneypotSpamDetectedException) {
            logger.warn("Honeypot spam detected from IP: $ipAddress")
            // Return success to avoid revealing spam detection to bots
            ResponseEntity.status(HttpStatus.CREATED)
                .body(
                    SuggestionResponseDto(
                        id = null,
                        message = "Thank you for your submission."
                    )
                )
        } catch (e: Exception) {
            logger.error("Error processing suggestion from IP: $ipAddress", e)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                    SuggestionResponseDto(
                        id = null,
                        message = "An error occurred while processing your suggestion. Please try again later."
                    )
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
