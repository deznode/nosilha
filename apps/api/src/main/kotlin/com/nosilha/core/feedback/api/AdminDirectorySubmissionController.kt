package com.nosilha.core.feedback.api

import com.nosilha.core.feedback.domain.DirectorySubmissionStatus
import com.nosilha.core.feedback.services.DirectorySubmissionService
import com.nosilha.core.shared.api.ApiResult
import com.nosilha.core.shared.api.PagedApiResult
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * Admin REST controller for managing directory submissions.
 *
 * <p>Provides administrative endpoints for reviewing and moderating community-submitted
 * directory entries. All endpoints require ADMIN role (configured in SecurityConfig).</p>
 *
 * <h3>Endpoints:</h3>
 * <ul>
 *   <li>GET /api/v1/admin/directory-submissions - List submissions with optional status filter</li>
 *   <li>GET /api/v1/admin/directory-submissions/{id} - Get single submission details</li>
 *   <li>PUT /api/v1/admin/directory-submissions/{id} - Update submission status (approve/reject)</li>
 * </ul>
 *
 * <h3>Security:</h3>
 * <ul>
 *   <li>Authentication required: ADMIN role</li>
 *   <li>All moderation actions are logged with admin ID</li>
 * </ul>
 *
 * @property directorySubmissionService Service for managing directory submissions
 */
@RestController
@RequestMapping("/api/v1/admin/directory-submissions")
@Tag(name = "Admin Directory Submissions", description = "Admin endpoints for directory submission moderation")
class AdminDirectorySubmissionController(
    private val directorySubmissionService: DirectorySubmissionService,
) {
    /**
     * Lists directory submissions with optional status filtering and pagination.
     *
     * <p>Supports filtering by submission status (PENDING, APPROVED, REJECTED).
     * Pagination parameters allow for efficient retrieval of large result sets.</p>
     *
     * <h4>Query Parameters:</h4>
     * <ul>
     *   <li>status (optional): Filter by submission status</li>
     *   <li>page (default: 0): Zero-based page number</li>
     *   <li>size (default: 20): Number of items per page (max 100)</li>
     * </ul>
     *
     * <h4>Response:</h4>
     * Returns a paginated list of directory submissions with metadata including total pages and elements.
     *
     * @param status Optional status filter (PENDING, APPROVED, REJECTED)
     * @param page Zero-based page number (default: 0)
     * @param size Number of items per page (default: 20, max: 100)
     * @return PagedApiResult containing list of AdminDirectorySubmissionDto with pagination metadata
     */
    @GetMapping
    @Operation(
        summary = "List directory submissions",
        description = "Get paginated list of directory submissions with optional status filtering. Requires ADMIN role.",
    )
    @ApiResponses(
        value = [
            io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "200",
                description = "Directory submissions retrieved successfully",
            ),
            io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "401",
                description = "Authentication required",
            ),
            io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "403",
                description = "Admin role required",
            ),
        ],
    )
    fun listDirectorySubmissions(
        @RequestParam(required = false) status: DirectorySubmissionStatus?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): PagedApiResult<AdminDirectorySubmissionDto> {
        val result = directorySubmissionService.listSubmissions(status, page, size)
        return PagedApiResult.from(result)
    }

    /**
     * Retrieves detailed information for a specific directory submission.
     *
     * <p>Returns complete submission data including location details and submitter information.</p>
     *
     * @param id UUID of the directory submission to retrieve
     * @return ResponseEntity with ApiResult containing AdminDirectorySubmissionDto
     * @throws ResourceNotFoundException if submission is not found (404 Not Found)
     */
    @GetMapping("/{id}")
    @Operation(
        summary = "Get directory submission",
        description = "Get detailed information for a specific directory submission. Requires ADMIN role.",
    )
    @ApiResponses(
        value = [
            io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "200",
                description = "Directory submission retrieved successfully",
            ),
            io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "404",
                description = "Directory submission not found",
            ),
        ],
    )
    fun getDirectorySubmission(
        @PathVariable id: UUID,
    ): ResponseEntity<ApiResult<AdminDirectorySubmissionDto>> {
        val submission = directorySubmissionService.getSubmission(id)
        return ResponseEntity.ok(ApiResult(data = submission, status = HttpStatus.OK.value()))
    }

    /**
     * Updates the status of a directory submission.
     *
     * <p>Allows admins to approve or reject submissions with optional admin notes.</p>
     *
     * <h4>State Transitions:</h4>
     * <ul>
     *   <li>PENDING → APPROVED: Admin approves the submission</li>
     *   <li>PENDING → REJECTED: Admin rejects the submission with feedback</li>
     * </ul>
     *
     * @param id UUID of the directory submission to update
     * @param request Update request containing the new status and optional admin notes
     * @param authentication Authentication object containing admin user ID
     * @return ResponseEntity with ApiResult containing updated AdminDirectorySubmissionDto
     * @throws ResourceNotFoundException if submission is not found (404 Not Found)
     */
    @PutMapping("/{id}")
    @Operation(
        summary = "Update directory submission status",
        description = "Update the status of a directory submission (approve/reject). Requires ADMIN role.",
    )
    @ApiResponses(
        value = [
            io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "200",
                description = "Directory submission updated successfully",
            ),
            io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "404",
                description = "Directory submission not found",
            ),
        ],
    )
    fun updateDirectorySubmissionStatus(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateDirectorySubmissionStatusRequest,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<AdminDirectorySubmissionDto>> {
        val adminUserId = authentication.name
        val updated = directorySubmissionService.updateStatus(
            id = id,
            status = request.status,
            adminNotes = request.adminNotes,
            reviewedBy = adminUserId,
        )
        return ResponseEntity.ok(ApiResult(data = updated, status = HttpStatus.OK.value()))
    }
}
