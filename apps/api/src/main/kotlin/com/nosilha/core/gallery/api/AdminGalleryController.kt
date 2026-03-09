package com.nosilha.core.gallery.api

import com.nosilha.core.gallery.api.dto.AnalysisTriggerResponse
import com.nosilha.core.gallery.api.dto.AnalyzeBatchRequest
import com.nosilha.core.gallery.api.dto.BatchAnalysisTriggerResponse
import com.nosilha.core.gallery.api.dto.BatchErrorDto
import com.nosilha.core.gallery.api.dto.BulkConfirmRequest
import com.nosilha.core.gallery.api.dto.BulkConfirmResponse
import com.nosilha.core.gallery.api.dto.BulkPresignRequest
import com.nosilha.core.gallery.api.dto.BulkPresignResponse
import com.nosilha.core.gallery.api.dto.CreateExternalMediaRequest
import com.nosilha.core.gallery.api.dto.DeleteOrphanRequest
import com.nosilha.core.gallery.api.dto.GalleryMediaDto
import com.nosilha.core.gallery.api.dto.LinkOrphanRequest
import com.nosilha.core.gallery.api.dto.ModerationActionRequest
import com.nosilha.core.gallery.api.dto.OrphanDetectionResponse
import com.nosilha.core.gallery.api.dto.R2BucketListResponse
import com.nosilha.core.gallery.api.dto.UpdateExifRequest
import com.nosilha.core.gallery.api.dto.UpdateGalleryMediaRequest
import com.nosilha.core.gallery.api.dto.YouTubeSyncRequest
import com.nosilha.core.gallery.api.dto.YouTubeSyncResult
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.gallery.domain.GalleryModerationService
import com.nosilha.core.gallery.domain.R2AdminService
import com.nosilha.core.gallery.domain.YouTubeSyncService
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
    private val r2AdminService: R2AdminService?,
    private val youTubeSyncService: YouTubeSyncService?,
) {
    private fun requireR2Admin(): R2AdminService = requireNotNull(r2AdminService) { "R2 storage is not configured" }

    private fun requireYouTubeSync(): YouTubeSyncService = requireNotNull(youTubeSyncService) { "YouTube sync is not configured" }

    private fun extractAdminId(authentication: Authentication): UUID = UUID.fromString(authentication.name)

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
     * Update gallery media metadata.
     *
     * PATCH semantics — only non-null fields in the request body are applied.
     * Type-specific fields (author for ExternalMedia, photographerCredit for
     * UserUploadedMedia) are applied only when the media matches that type.
     *
     * Example:
     * PATCH /api/v1/admin/gallery/{id}
     * {
     *   "title": "Updated Title",
     *   "description": "Updated description"
     * }
     */
    @PatchMapping("/{id}")
    fun updateMediaMetadata(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateGalleryMediaRequest,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<GalleryMediaDto>> {
        val adminId = extractAdminId(authentication)
        logger.info { "Admin $adminId updating media metadata: $id" }

        val updated = moderationService.updateMediaMetadata(id, request)
            ?: return ResponseEntity.notFound().build()

        return ResponseEntity.ok(ApiResult(data = updated))
    }

    /**
     * Update EXIF metadata for a user-uploaded media item.
     *
     * Dedicated endpoint for re-extracting and applying EXIF metadata.
     * Only applies to UserUploadedMedia. Creates an audit trail entry
     * with action "EXIF_UPDATE".
     *
     * PATCH semantics — only non-null fields in the request body are applied.
     * Returns 422 if the media is not a UserUploadedMedia.
     *
     * Example:
     * POST /api/v1/admin/gallery/{mediaId}/update-exif
     * {
     *   "latitude": 14.8672,
     *   "longitude": -24.7045,
     *   "cameraMake": "DJI",
     *   "photoType": "CULTURAL_SITE"
     * }
     */
    @PostMapping("/{mediaId}/update-exif")
    fun updateExifMetadata(
        @PathVariable mediaId: UUID,
        @Valid @RequestBody request: UpdateExifRequest,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<GalleryMediaDto>> {
        val adminId = extractAdminId(authentication)
        logger.info { "Admin $adminId updating EXIF metadata for media $mediaId" }

        val updated = moderationService.applyExifUpdate(mediaId, adminId, request)
            ?: return ResponseEntity.notFound().build()

        return ResponseEntity.ok(ApiResult(data = updated))
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
        val adminId = extractAdminId(authentication)
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
        val adminId = extractAdminId(authentication)
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
        val adminId = extractAdminId(authentication)
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
        val adminId = extractAdminId(authentication)
        logger.info { "Admin $adminId promoting media $mediaId to hero image" }

        moderationService.promoteToHeroImage(mediaId, adminId)

        return ResponseEntity.ok(ApiResult(data = Unit))
    }

    /**
     * Trigger AI analysis for a single media item.
     *
     * Returns 202 Accepted — analysis runs asynchronously via events.
     */
    @PostMapping("/{mediaId}/analyze")
    fun triggerAnalysis(
        @PathVariable mediaId: UUID,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<AnalysisTriggerResponse>> {
        val adminId = extractAdminId(authentication)
        logger.info { "Admin $adminId triggering AI analysis for media $mediaId" }

        val runId = moderationService.triggerAnalysis(mediaId, adminId)

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(
            ApiResult(
                data = AnalysisTriggerResponse(
                    mediaId = mediaId,
                    analysisRunId = runId,
                    status = "PROCESSING",
                ),
                status = HttpStatus.ACCEPTED.value(),
            ),
        )
    }

    /**
     * Trigger AI analysis for multiple media items.
     *
     * Returns 202 Accepted with batch progress info.
     */
    @PostMapping("/analyze-batch")
    fun triggerBatchAnalysis(
        @Valid @RequestBody request: AnalyzeBatchRequest,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<BatchAnalysisTriggerResponse>> {
        val adminId = extractAdminId(authentication)
        logger.info { "Admin $adminId triggering batch AI analysis for ${request.mediaIds.size} items" }

        val result = moderationService.triggerBatchAnalysis(request.mediaIds, adminId)

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(
            ApiResult(
                data = BatchAnalysisTriggerResponse(
                    batchId = result.batchId,
                    accepted = result.accepted,
                    rejected = result.rejected,
                    errors = result.errors.map { BatchErrorDto(mediaId = it.mediaId, reason = it.reason) },
                ),
                status = HttpStatus.ACCEPTED.value(),
            ),
        )
    }

    // --- R2 Admin Endpoints ---

    /**
     * List objects in the R2 bucket with optional prefix filtering.
     *
     * Uses continuation token pagination for efficient scanning of large buckets.
     *
     * @param prefix Optional key prefix to filter by (e.g., "uploads/2025/")
     * @param continuationToken Pagination token from a previous response
     * @param maxKeys Maximum objects per page (default 100, max 1000)
     */
    @GetMapping("/r2/list")
    fun listR2Bucket(
        @RequestParam(required = false) prefix: String?,
        @RequestParam(required = false) continuationToken: String?,
        @RequestParam(defaultValue = "100") maxKeys: Int,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<R2BucketListResponse>> {
        val adminId = extractAdminId(authentication)
        logger.info { "Admin $adminId listing R2 bucket (prefix=$prefix, maxKeys=$maxKeys)" }
        val result = requireR2Admin().listBucket(prefix, continuationToken, maxKeys)
        return ResponseEntity.ok(ApiResult(data = result))
    }

    /**
     * Generate batch presigned PUT URLs for direct R2 upload.
     *
     * Admin uploads use 30-minute expiry. Max 20 files per batch.
     */
    @PostMapping("/r2/bulk-presign")
    fun bulkPresignR2(
        @Valid @RequestBody request: BulkPresignRequest,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<BulkPresignResponse>> {
        val adminId = extractAdminId(authentication)
        logger.info { "Admin $adminId requesting bulk presign for ${request.files.size} files" }
        val result = requireR2Admin().generateBulkPresignUrls(request, adminId)
        return ResponseEntity.ok(ApiResult(data = result))
    }

    /**
     * Confirm batch upload and create media records with ACTIVE status.
     *
     * Admin uploads bypass the moderation queue. Records are auto-approved
     * with reviewedBy = adminId. Max 20 uploads per batch.
     */
    @PostMapping("/r2/bulk-confirm")
    @ResponseStatus(HttpStatus.CREATED)
    fun bulkConfirmR2(
        @Valid @RequestBody request: BulkConfirmRequest,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<BulkConfirmResponse>> {
        val adminId = extractAdminId(authentication)
        logger.info { "Admin $adminId confirming batch upload of ${request.uploads.size} files" }
        val result = requireR2Admin().confirmBatchUpload(request, adminId)
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResult(data = result, status = HttpStatus.CREATED.value()),
        )
    }

    /**
     * Detect orphaned R2 objects with no corresponding database record.
     *
     * Scans R2 bucket and compares against stored storage keys.
     * Uses continuation token pagination for large buckets.
     */
    @GetMapping("/r2/orphans")
    fun detectR2Orphans(
        @RequestParam(required = false) prefix: String?,
        @RequestParam(required = false) continuationToken: String?,
        @RequestParam(defaultValue = "1000") maxKeys: Int,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<OrphanDetectionResponse>> {
        val adminId = extractAdminId(authentication)
        logger.info { "Admin $adminId scanning for R2 orphans (prefix=$prefix, maxKeys=$maxKeys)" }
        val result = requireR2Admin().detectOrphans(prefix, continuationToken, maxKeys)
        return ResponseEntity.ok(ApiResult(data = result))
    }

    /**
     * Create a database record for an orphaned R2 object.
     *
     * Fetches metadata from R2 via HeadObject and creates a UserUploadedMedia
     * record with ACTIVE status. Returns 400 if the key is already linked.
     */
    @PostMapping("/r2/orphans/link")
    @ResponseStatus(HttpStatus.CREATED)
    fun linkR2Orphan(
        @Valid @RequestBody request: LinkOrphanRequest,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<GalleryMediaDto.UserUpload>> {
        val adminId = extractAdminId(authentication)
        logger.info { "Admin $adminId linking orphan: ${request.storageKey}" }
        val media = requireR2Admin().linkOrphan(
            storageKey = request.storageKey,
            category = request.category,
            description = request.description,
            adminId = adminId,
        )
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResult(data = GalleryMediaDto.from(media), status = HttpStatus.CREATED.value()),
        )
    }

    /**
     * Permanently delete an orphaned R2 object.
     *
     * Safety check: verifies the key has no corresponding DB record before deletion.
     * Returns 422 if the key is linked to a media record.
     */
    @DeleteMapping("/r2/orphans")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteR2Orphan(
        @Valid @RequestBody request: DeleteOrphanRequest,
        authentication: Authentication,
    ) {
        val adminId = extractAdminId(authentication)
        logger.info { "Admin $adminId deleting orphan: ${request.storageKey}" }
        requireR2Admin().deleteOrphan(request.storageKey)
    }

    // --- YouTube Sync ---

    /**
     * Triggers a YouTube channel or playlist sync.
     *
     * <p>When called without a request body (or with empty body), syncs the full
     * channel configured via {@code youtube.sync.channel-handle}. When a
     * {@code playlistId} is provided, syncs that specific playlist.</p>
     *
     * <p>Requires {@code youtube.sync.enabled=true} configuration. Returns 503
     * if YouTube sync is not enabled.</p>
     *
     * @param request Optional sync parameters (playlistId, category override)
     * @param authentication Admin authentication
     * @return Sync result summary with synced/skipped/error counts
     */
    @PostMapping("/youtube/sync")
    fun syncYouTubeVideos(
        @RequestBody(required = false) request: YouTubeSyncRequest?,
        authentication: Authentication,
    ): ApiResult<YouTubeSyncResult> {
        val adminId = extractAdminId(authentication)
        logger.info { "Admin $adminId triggering YouTube sync" }

        val syncService = requireYouTubeSync()
        val result = if (request?.playlistId != null) {
            syncService.syncPlaylist(request.playlistId, request.category, adminId)
        } else {
            syncService.syncChannel(adminId)
        }

        return ApiResult(data = result)
    }
}
