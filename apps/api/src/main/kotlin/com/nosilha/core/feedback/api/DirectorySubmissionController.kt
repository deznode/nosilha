package com.nosilha.core.feedback.api

import com.nosilha.core.feedback.services.DirectorySubmissionService
import com.nosilha.core.shared.api.ApiResult
import io.github.oshai.kotlinlogging.KotlinLogging
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

private val logger = KotlinLogging.logger {}

/**
 * REST controller for public directory submissions.
 *
 * <p>Provides a public endpoint for community members to submit new directory entries
 * for review. Submissions go through a moderation queue before being published.</p>
 *
 * <h3>Endpoints:</h3>
 * <ul>
 *   <li>POST /api/v1/directory-submissions - Submit a directory entry for review</li>
 * </ul>
 *
 * <h3>Security:</h3>
 * <ul>
 *   <li>No authentication required (allows anonymous submissions)</li>
 *   <li>Rate limiting: 3 submissions per hour per IP address</li>
 * </ul>
 *
 * @property directorySubmissionService Service for managing directory submissions
 */
@RestController
@RequestMapping("/api/v1/directory-submissions")
@Tag(name = "Directory Submissions", description = "Public directory entry submission endpoints")
class DirectorySubmissionController(
    private val directorySubmissionService: DirectorySubmissionService,
) {
    /**
     * Submits a new directory entry for review.
     *
     * <p>Validates the submission, checks rate limits, and persists the entry.
     * All submissions are stored with PENDING status for admin review.</p>
     *
     * <h4>Validation Rules:</h4>
     * <ul>
     *   <li>Name: 1-255 characters</li>
     *   <li>Category: RESTAURANT, LANDMARK, NATURE, or CULTURE</li>
     *   <li>Town: 1-100 characters</li>
     *   <li>Description: 10-2000 characters</li>
     * </ul>
     *
     * <h4>Rate Limiting:</h4>
     * <ul>
     *   <li>Maximum 3 submissions per hour per IP address</li>
     *   <li>HTTP 429 Too Many Requests returned if limit exceeded</li>
     * </ul>
     *
     * @param request Directory submission data
     * @param submittedBy Display name of the submitter (required)
     * @param submittedByEmail Optional email of the submitter
     * @param httpRequest HTTP request (used to extract IP address)
     * @return ApiResult with DirectorySubmissionConfirmationDto (201 Created)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
        summary = "Submit directory entry",
        description = "Submit a new directory entry for review. Rate limited to 3 submissions per hour per IP address.",
    )
    @ApiResponses(
        value = [
            io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "201",
                description = "Directory entry submitted successfully",
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
    fun submitDirectoryEntry(
        @Valid @RequestBody request: CreateDirectorySubmissionRequest,
        @RequestParam submittedBy: String,
        @RequestParam(required = false) submittedByEmail: String?,
        httpRequest: HttpServletRequest,
    ): ApiResult<DirectorySubmissionConfirmationDto> {
        val ipAddress = extractIpAddress(httpRequest)
        logger.info { "Received directory submission from IP: $ipAddress, submittedBy: $submittedBy" }

        val response = directorySubmissionService.submitDirectoryEntry(
            request = request,
            submittedBy = submittedBy,
            submittedByEmail = submittedByEmail,
            ipAddress = ipAddress,
        )

        logger.info { "Directory submission ${response.id} created successfully" }

        return ApiResult(
            data = DirectorySubmissionConfirmationDto(
                id = response.id,
                name = response.name,
                status = response.status,
            ),
            status = HttpStatus.CREATED.value(),
        )
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
