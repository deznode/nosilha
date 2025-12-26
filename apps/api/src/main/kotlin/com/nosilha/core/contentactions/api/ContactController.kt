package com.nosilha.core.contentactions.api

import com.nosilha.core.contentactions.services.ContactService
import com.nosilha.core.shared.api.ApiResponse
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
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
 * REST controller for contact form submissions.
 *
 * <p>Provides a public endpoint for visitors to submit contact messages.
 * Messages are stored for admin review with rate limiting to prevent abuse.</p>
 *
 * <h3>Endpoints:</h3>
 * <ul>
 *   <li>POST /api/v1/contact - Submit a contact form message</li>
 * </ul>
 *
 * <h3>Security:</h3>
 * <ul>
 *   <li>No authentication required (allows anonymous contact)</li>
 *   <li>Rate limiting: 3 submissions per hour per IP address</li>
 * </ul>
 *
 * @property contactService Service for managing contact messages
 */
@RestController
@RequestMapping("/api/v1/contact")
@Tag(name = "Contact", description = "Contact form submission endpoints")
class ContactController(
    private val contactService: ContactService,
) {
    private val logger = LoggerFactory.getLogger(ContactController::class.java)

    /**
     * Submits a new contact form message.
     *
     * <p>Validates the submission, checks rate limits, and persists the message.
     * All messages are stored with UNREAD status for admin review.</p>
     *
     * <h4>Validation Rules:</h4>
     * <ul>
     *   <li>Name: 2-100 characters</li>
     *   <li>Email: Valid email format</li>
     *   <li>Subject category: GENERAL_INQUIRY, CONTENT_SUGGESTION, TECHNICAL_ISSUE, or PARTNERSHIP</li>
     *   <li>Message: 10-5000 characters</li>
     * </ul>
     *
     * <h4>Rate Limiting:</h4>
     * <ul>
     *   <li>Maximum 3 submissions per hour per IP address</li>
     *   <li>HTTP 429 Too Many Requests returned if limit exceeded</li>
     * </ul>
     *
     * @param request Contact form data
     * @param httpRequest HTTP request (used to extract IP address)
     * @return ApiResponse with ContactConfirmationDto (201 Created)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
        summary = "Submit contact form",
        description = "Submit a contact message. Rate limited to 3 submissions per hour per IP address.",
    )
    @ApiResponses(
        value = [
            io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "201",
                description = "Contact message submitted successfully",
            ),
            io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "400",
                description = "Invalid request data",
            ),
            io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "429",
                description = "Rate limit exceeded",
            ),
        ],
    )
    fun submitContact(
        @Valid @RequestBody request: ContactCreateRequest,
        httpRequest: HttpServletRequest,
    ): ApiResponse<ContactConfirmationDto> {
        val ipAddress = extractIpAddress(httpRequest)
        logger.info("Received contact form submission from IP: $ipAddress")

        val response = contactService.submitContact(request, ipAddress)
        logger.info("Contact message ${response.id} created successfully")

        return ApiResponse(data = response, status = HttpStatus.CREATED.value())
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
