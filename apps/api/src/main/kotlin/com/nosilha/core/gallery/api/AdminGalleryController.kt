package com.nosilha.core.gallery.api

import com.nosilha.core.gallery.api.dto.CreateExternalMediaRequest
import com.nosilha.core.gallery.api.dto.GalleryMediaDto
import com.nosilha.core.gallery.api.dto.ModerationActionRequest
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.gallery.domain.GalleryModerationService
import com.nosilha.core.shared.api.ApiResult
import com.nosilha.core.shared.api.PagedApiResult
import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

private val logger = KotlinLogging.logger {}

/**
 * Admin REST controller for managing gallery media moderation.
 *
 * Provides administrative endpoints for moderating both user-uploaded media
 * and admin-curated external content through a unified moderation queue.
 *
 * Endpoints:
 * - GET /queue - Unified moderation queue (both user uploads and external media)
 * - GET /{id} - Detailed view of any media item
 * - PATCH /{id}/status - Moderation action (approve/flag/reject)
 * - POST /external - Create external media directly (admin only, bypasses moderation)
 * - DELETE /{id} - Archive media item
 *
 * Security:
 * - All endpoints require ADMIN role (enforced via @PreAuthorize)
 * - All moderation actions are logged with admin user ID
 * - Complete audit trail maintained in gallery_media_moderation_audit table
 *
 * Moderation Actions:
 * - APPROVE: Mark media as ACTIVE and make it publicly visible
 * - FLAG: Flag media for further review with optional severity (status: FLAGGED)
 * - REJECT: Reject media and change status to REJECTED
 */
@RestController
@RequestMapping("/api/v1/admin/gallery")
@PreAuthorize("hasRole('ADMIN')")
class AdminGalleryController(
    private val moderationService: GalleryModerationService,
) {
    /**
     * Get unified moderation queue with optional status filtering.
     *
     * Returns a paginated list of gallery media items (both user uploads and
     * external content) ordered by creation date descending.
     *
     * Query Parameters:
     * - status: Optional status filter (PENDING_REVIEW, PROCESSING, FLAGGED, ACTIVE, REJECTED, ARCHIVED)
     * - page: Page number (default: 0)
     * - size: Items per page (default: 20, max: 100)
     *
     * Example: GET /api/v1/admin/gallery/queue?status=PENDING_REVIEW&page=0&size=20
     */
    @GetMapping("/queue")
    fun getModerationQueue(
        @RequestParam(required = false) status: GalleryMediaStatus? = null,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): PagedApiResult<GalleryMediaDto> {
        logger.debug { "Fetching moderation queue - status: $status, page: $page, size: $size" }
        return moderationService.listMediaForModeration(status, page, size)
    }

    /**
     * Get detailed view of a specific gallery media item.
     *
     * Returns complete information for admin review including:
     * - Media metadata (title, description, category)
     * - Type-specific fields (file info for uploads, platform info for external)
     * - Moderation status and review history
     * - Uploader/curator information
     *
     * Returns 404 if media not found.
     */
    @GetMapping("/{id}")
    fun getMediaDetail(
        @PathVariable id: UUID,
    ): ResponseEntity<ApiResult<GalleryMediaDto>> {
        logger.debug { "Fetching media detail: $id" }
        val media = moderationService.getMediaDetail(id)
            ?: return ResponseEntity.notFound().build()

        return ResponseEntity.ok(ApiResult(data = media))
    }

    /**
     * Update media status based on moderation action.
     *
     * Allows admins to approve, flag, or reject gallery media items.
     * The admin's user ID is automatically extracted from authentication
     * and recorded in both the media entity and audit trail.
     *
     * Moderation Actions:
     * - APPROVE: Mark media as ACTIVE (publicly visible)
     * - FLAG: Flag for review with optional severity (requires reason)
     * - REJECT: Reject media, change status to REJECTED (requires reason)
     *
     * Example:
     * PATCH /api/v1/admin/gallery/{id}/status
     * {
     *   "action": "APPROVE"
     * }
     *
     * PATCH /api/v1/admin/gallery/{id}/status
     * {
     *   "action": "REJECT",
     *   "reason": "Inappropriate content"
     * }
     */
    @PatchMapping("/{id}/status")
    fun updateMediaStatus(
        @PathVariable id: UUID,
        @Valid @RequestBody request: ModerationActionRequest,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<GalleryMediaDto>> {
        val adminId = UUID.fromString(authentication.name)
        logger.info { "Admin $adminId moderating media $id: ${request.action}" }

        val updated = moderationService.updateStatus(
            id = id,
            action = request.action,
            reason = request.reason,
            severity = request.severity,
            performedBy = adminId,
        ) ?: return ResponseEntity.notFound().build()

        return ResponseEntity.ok(ApiResult(data = updated))
    }

    /**
     * Create external media directly (admin only).
     *
     * Allows admins to directly create external media (YouTube videos, etc.)
     * with ACTIVE status, bypassing the moderation workflow.
     *
     * This endpoint is for admin-curated content only. User submissions
     * should use POST /api/v1/gallery/submit instead.
     *
     * Example:
     * POST /api/v1/admin/gallery/external
     * {
     *   "mediaType": "VIDEO",
     *   "platform": "YOUTUBE",
     *   "externalId": "dQw4w9WgXcQ",
     *   "title": "Official Tourism Video",
     *   "description": "Promotional video...",
     *   "category": "Tourism",
     *   "displayOrder": 1
     * }
     */
    @PostMapping("/external")
    @ResponseStatus(HttpStatus.CREATED)
    fun createExternalMedia(
        @Valid @RequestBody request: CreateExternalMediaRequest,
        authentication: Authentication,
    ): ApiResult<GalleryMediaDto.External> {
        val adminId = authentication.name
        logger.info { "Admin $adminId creating external media: ${request.title}" }

        val media = moderationService.createExternalMedia(request, adminId)

        return ApiResult(
            data = media,
            status = HttpStatus.CREATED.value(),
        )
    }

    /**
     * Archive a gallery media item (soft delete).
     *
     * Changes the media status to ARCHIVED without permanently removing
     * the record. This allows for recovery if needed and maintains audit
     * trail integrity.
     *
     * Use Cases:
     * - Removing spam uploads
     * - Deleting duplicate files
     * - Removing inappropriate content
     * - Cleaning up test submissions
     *
     * Note: This is a soft delete. The media record remains in the database
     * and can be restored by changing status back to ACTIVE.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun archiveMedia(
        @PathVariable id: UUID,
        authentication: Authentication,
    ) {
        val adminId = UUID.fromString(authentication.name)
        logger.info { "Admin $adminId archiving media: $id" }

        moderationService.archiveMedia(id, adminId)
    }

    /**
     * Promote a gallery image to become the hero image for a directory entry.
     *
     * This endpoint allows admins to select an approved user-uploaded image
     * to become the hero image displayed on the directory entry detail page.
     *
     * Prerequisites:
     * - Media must be a user upload (not external media)
     * - Media must have ACTIVE status (already approved)
     * - Media must be linked to a directory entry (entryId not null)
     * - Media must have a public URL
     *
     * The update is performed via event-driven communication: this endpoint
     * publishes a HeroImagePromotedEvent that the Places module consumes
     * to update the directory entry's imageUrl field.
     *
     * Example:
     * PATCH /api/v1/admin/gallery/{mediaId}/promote-hero
     *
     * @param mediaId UUID of the media item to promote
     * @param authentication Current admin user
     * @return 200 OK on success
     */
    @PatchMapping("/{mediaId}/promote-hero")
    fun promoteToHeroImage(
        @PathVariable mediaId: UUID,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<Unit>> {
        val adminId = UUID.fromString(authentication.name)
        logger.info { "Admin $adminId promoting media $mediaId to hero image" }

        moderationService.promoteToHeroImage(mediaId, adminId)

        return ResponseEntity.ok(ApiResult(data = Unit))
    }
}
