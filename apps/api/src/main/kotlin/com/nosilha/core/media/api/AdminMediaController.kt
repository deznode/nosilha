package com.nosilha.core.media.api

import com.nosilha.core.media.domain.MediaModerationService
import com.nosilha.core.media.domain.MediaStatus
import com.nosilha.core.shared.api.ApiResult
import com.nosilha.core.shared.api.PagedApiResult
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * Admin REST controller for managing media moderation queue.
 *
 * <p>Provides administrative endpoints for moderating community-uploaded media files.
 * All endpoints require ADMIN role (configured in SecurityConfig).</p>
 *
 * <h3>Endpoints:</h3>
 * <ul>
 *   <li>GET /api/v1/admin/media - List media with optional status filter and pagination</li>
 *   <li>GET /api/v1/admin/media/{id} - Get single media file details</li>
 *   <li>PUT /api/v1/admin/media/{id} - Update media status (approve/flag/reject)</li>
 *   <li>DELETE /api/v1/admin/media/{id} - Soft delete a media file</li>
 * </ul>
 *
 * <h3>Security:</h3>
 * <ul>
 *   <li>Authentication required: ADMIN role</li>
 *   <li>All moderation actions are logged with admin user ID</li>
 *   <li>Complete audit trail maintained in media_moderation_audit table</li>
 * </ul>
 *
 * @property mediaModerationService Service for managing media moderation
 */
@RestController
@RequestMapping("/api/v1/admin/media")
class AdminMediaController(
    private val mediaModerationService: MediaModerationService,
) {
    /**
     * Lists media files with optional status filtering and pagination.
     *
     * <p>Supports filtering by media status (PENDING, PROCESSING, PENDING_REVIEW, FLAGGED, AVAILABLE, DELETED).
     * Pagination parameters allow for efficient retrieval of large result sets. Results are ordered
     * by creation date descending to show newest uploads first.</p>
     *
     * <h4>Query Parameters:</h4>
     * <ul>
     *   <li>status (optional): Filter by media status</li>
     *   <li>page (default: 0): Zero-based page number</li>
     *   <li>size (default: 20): Number of items per page (max 100)</li>
     * </ul>
     *
     * <h4>Response:</h4>
     * Returns a paginated list of media files with metadata including total pages and elements.
     * Each media item includes essential information for queue display: ID, filename, content type,
     * file size, status, severity, uploader, and creation timestamp.
     *
     * @param status Optional status filter (PENDING, PROCESSING, PENDING_REVIEW, FLAGGED, AVAILABLE, DELETED)
     * @param page Zero-based page number (default: 0)
     * @param size Number of items per page (default: 20, max: 100)
     * @return PagedApiResult containing list of AdminMediaListDto with pagination metadata
     */
    @GetMapping
    fun listMedia(
        @RequestParam(required = false) status: MediaStatus?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): PagedApiResult<AdminMediaListDto> {
        val result = mediaModerationService.listPendingMedia(status, page, size)
        return PagedApiResult.from(result)
    }

    /**
     * Retrieves detailed information for a specific media file.
     *
     * <p>Returns complete media data including file metadata, storage information, review history,
     * and moderation details. Used for the detailed review view in the admin panel where admins
     * can preview the media and make moderation decisions.</p>
     *
     * <h4>Response:</h4>
     * Includes all fields necessary for admin moderation including:
     * <ul>
     *   <li>File information (filename, content type, size, storage key, public URL)</li>
     *   <li>Association metadata (entry ID, category, description, display order)</li>
     *   <li>Moderation status and severity</li>
     *   <li>Review history (reviewed by, reviewed at, rejection reason)</li>
     *   <li>Upload metadata (uploaded by, created at, updated at)</li>
     * </ul>
     *
     * @param id UUID of the media file to retrieve
     * @return ResponseEntity with ApiResult containing AdminMediaDetailDto
     * @throws ResourceNotFoundException if media is not found (404 Not Found)
     */
    @GetMapping("/{id}")
    fun getMedia(
        @PathVariable id: UUID,
    ): ResponseEntity<ApiResult<AdminMediaDetailDto>> {
        val media = mediaModerationService.getMediaDetail(id)
        return ResponseEntity.ok(ApiResult(data = media, status = HttpStatus.OK.value()))
    }

    /**
     * Updates the status of a media file based on admin moderation action.
     *
     * <p>Allows admins to moderate media by approving, flagging, or rejecting uploads.
     * The admin's user ID is automatically extracted from the authentication context and
     * recorded in both the media entity and the audit trail.</p>
     *
     * <h4>Moderation Actions:</h4>
     * <ul>
     *   <li>APPROVE: Mark media as approved and make it publicly available (status: AVAILABLE)</li>
     *   <li>FLAG: Flag media for further review with optional severity (status: FLAGGED, requires reason)</li>
     *   <li>REJECT: Reject media and soft delete it (status: DELETED, requires reason)</li>
     * </ul>
     *
     * <h4>Validation Rules:</h4>
     * <ul>
     *   <li>Action is required (APPROVE, FLAG, or REJECT)</li>
     *   <li>Reason is required for FLAG and REJECT actions (max 1024 characters)</li>
     *   <li>Severity is optional for FLAG action (0=normal, 1=low, 2=medium, 3=high)</li>
     * </ul>
     *
     * <h4>Side Effects:</h4>
     * <ul>
     *   <li>Updates media status, reviewed_by, and reviewed_at fields</li>
     *   <li>Stores reason in rejection_reason field for FLAG and REJECT actions</li>
     *   <li>Creates audit entry in media_moderation_audit table</li>
     *   <li>Clears rejection_reason for APPROVE action</li>
     * </ul>
     *
     * @param id UUID of the media file to update
     * @param request Update request containing action, optional reason, and optional severity
     * @param authentication Spring Security authentication context (provides admin ID)
     * @return ResponseEntity with ApiResult containing updated AdminMediaDetailDto
     * @throws ResourceNotFoundException if media is not found (404 Not Found)
     * @throws BusinessException if validation fails (e.g., missing reason for FLAG/REJECT)
     */
    @PutMapping("/{id}")
    fun updateMediaStatus(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateMediaStatusRequest,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<AdminMediaDetailDto>> {
        val adminId = UUID.fromString(authentication.name)
        val updated =
            mediaModerationService.updateStatus(
                id = id,
                action = request.action,
                reason = request.reason,
                severity = request.severity,
                performedBy = adminId,
            )
        return ResponseEntity.ok(ApiResult(data = updated, status = HttpStatus.OK.value()))
    }

    /**
     * Soft deletes a media file from the system.
     *
     * <p>Changes the media status to DELETED without permanently removing the record from the database.
     * This allows for recovery if needed and maintains audit trail integrity. The admin's user ID is
     * recorded in the media entity and audit trail.</p>
     *
     * <h4>Use Cases:</h4>
     * <ul>
     *   <li>Removing spam uploads</li>
     *   <li>Deleting duplicate files</li>
     *   <li>Removing inappropriate content</li>
     *   <li>Cleaning up test submissions</li>
     * </ul>
     *
     * <h4>Warning:</h4>
     * This is a soft delete operation that changes the status to DELETED. The media record remains
     * in the database and can be restored by changing the status back to AVAILABLE. For permanent
     * deletion, manual database operations are required.
     *
     * <h4>Side Effects:</h4>
     * <ul>
     *   <li>Updates media status to DELETED</li>
     *   <li>Records admin ID and timestamp in reviewed_by and reviewed_at fields</li>
     *   <li>Creates audit entry in media_moderation_audit table</li>
     * </ul>
     *
     * @param id UUID of the media file to delete
     * @param authentication Spring Security authentication context (provides admin ID)
     * @throws ResourceNotFoundException if media is not found (404 Not Found)
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteMedia(
        @PathVariable id: UUID,
        authentication: Authentication,
    ) {
        val adminId = UUID.fromString(authentication.name)
        mediaModerationService.deleteMedia(id, adminId)
    }
}
