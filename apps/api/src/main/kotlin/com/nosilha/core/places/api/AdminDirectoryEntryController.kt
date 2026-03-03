package com.nosilha.core.places.api

import com.nosilha.core.places.domain.DirectoryEntryService
import com.nosilha.core.places.domain.DirectoryEntryStatus
import com.nosilha.core.shared.api.ApiResult
import com.nosilha.core.shared.api.PagedApiResult
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
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
 * Admin REST controller for managing directory entries.
 *
 * <p>Provides administrative endpoints for reviewing and moderating directory
 * entries. All endpoints require ADMIN role (configured in SecurityConfig).</p>
 *
 * <h3>Endpoints:</h3>
 * <ul>
 *   <li>GET /api/v1/admin/directory/entries - List entries with optional status filter</li>
 *   <li>GET /api/v1/admin/directory/entries/{id} - Get single entry details</li>
 *   <li>PUT /api/v1/admin/directory/entries/{id}/status - Update entry status</li>
 * </ul>
 *
 * <h3>Security:</h3>
 * <ul>
 *   <li>Authentication required: ADMIN role</li>
 *   <li>All moderation actions are logged with admin ID</li>
 * </ul>
 *
 * @property service Service for managing directory entries
 */
@RestController
@RequestMapping("/api/v1/admin/directory")
@Tag(name = "Admin Directory", description = "Admin endpoints for directory entry moderation")
class AdminDirectoryEntryController(
    private val service: DirectoryEntryService,
) {
    /**
     * Lists directory entries with optional status filtering and pagination.
     *
     * <p>Supports filtering by entry status (PENDING, APPROVED, PUBLISHED, ARCHIVED).
     * Pagination parameters allow for efficient retrieval of large result sets.</p>
     *
     * <h4>Query Parameters:</h4>
     * <ul>
     *   <li>status (optional): Filter by entry status</li>
     *   <li>page (default: 0): Zero-based page number</li>
     *   <li>size (default: 20): Number of items per page (max 100)</li>
     * </ul>
     *
     * @param status Optional status filter
     * @param page Zero-based page number (default: 0)
     * @param size Number of items per page (default: 20, max: 100)
     * @return PagedApiResult containing list of AdminDirectoryEntryDto with pagination metadata
     */
    @GetMapping("/entries")
    @Operation(
        summary = "List directory entries",
        description = "Get paginated list of directory entries with optional status filtering. Requires ADMIN role.",
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Directory entries retrieved successfully"),
            ApiResponse(responseCode = "401", description = "Authentication required"),
            ApiResponse(responseCode = "403", description = "Admin role required"),
        ],
    )
    fun listDirectoryEntries(
        @RequestParam(required = false) status: DirectoryEntryStatus?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): PagedApiResult<AdminDirectoryEntryDto> {
        val result = service.getAdminEntries(status, page, size)
        return PagedApiResult.from(result)
    }

    /**
     * Retrieves detailed information for a specific directory entry.
     *
     * @param id UUID of the directory entry to retrieve
     * @return ResponseEntity with ApiResult containing AdminDirectoryEntryDto
     * @throws ResourceNotFoundException if entry is not found (404 Not Found)
     */
    @GetMapping("/entries/{id}")
    @Operation(
        summary = "Get directory entry",
        description = "Get detailed information for a specific directory entry. Requires ADMIN role.",
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Directory entry retrieved successfully"),
            ApiResponse(responseCode = "404", description = "Directory entry not found"),
        ],
    )
    fun getDirectoryEntry(
        @PathVariable id: UUID,
    ): ResponseEntity<ApiResult<AdminDirectoryEntryDto>> {
        val entry = service.getAdminEntry(id)
        return ResponseEntity.ok(ApiResult(data = entry, status = HttpStatus.OK.value()))
    }

    /**
     * Updates the status of a directory entry.
     *
     * <p>Allows admins to change entry lifecycle status with optional admin notes.</p>
     *
     * <h4>State Transitions:</h4>
     * <ul>
     *   <li>PENDING → APPROVED: Admin approves the submission</li>
     *   <li>APPROVED → PUBLISHED: Admin publishes the entry</li>
     *   <li>Any → ARCHIVED: Admin archives/soft-deletes the entry</li>
     * </ul>
     *
     * @param id UUID of the directory entry to update
     * @param request Update request containing the new status and optional admin notes
     * @param authentication Authentication object containing admin user ID
     * @return ResponseEntity with ApiResult containing updated AdminDirectoryEntryDto
     * @throws ResourceNotFoundException if entry is not found (404 Not Found)
     */
    @PutMapping("/entries/{id}/status")
    @Operation(
        summary = "Update directory entry status",
        description = "Update the lifecycle status of a directory entry. Requires ADMIN role.",
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Directory entry updated successfully"),
            ApiResponse(responseCode = "404", description = "Directory entry not found"),
        ],
    )
    fun updateDirectoryEntryStatus(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateDirectoryEntryStatusRequest,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<AdminDirectoryEntryDto>> {
        val adminUserId = UUID.fromString(authentication.name)
        val updated = service.updateEntryStatus(
            id = id,
            status = request.status,
            adminNotes = request.adminNotes,
            reviewedBy = adminUserId,
        )
        return ResponseEntity.ok(ApiResult(data = updated, status = HttpStatus.OK.value()))
    }
}
