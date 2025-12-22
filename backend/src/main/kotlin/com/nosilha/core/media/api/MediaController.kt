package com.nosilha.core.media.api

import com.nosilha.core.media.api.dto.ConfirmRequest
import com.nosilha.core.media.api.dto.MediaResponse
import com.nosilha.core.media.api.dto.ModerationAction
import com.nosilha.core.media.api.dto.PresignRequest
import com.nosilha.core.media.api.dto.PresignResponse
import com.nosilha.core.media.api.dto.StatusUpdateRequest
import com.nosilha.core.media.domain.MediaService
import com.nosilha.core.media.domain.MediaStatus
import com.nosilha.core.media.repository.MediaRepository
import com.nosilha.core.shared.api.ApiResponse
import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.validation.Valid
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
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
 * REST controller for media upload, retrieval, and management.
 *
 * Upload Flow:
 * 1. POST /presign - Get presigned URL for direct R2 upload
 * 2. Client uploads directly to R2 using presigned URL
 * 3. POST /confirm - Confirm upload and create metadata record
 *
 * Moderation Flow:
 * Media transitions: PENDING → PROCESSING → PENDING_REVIEW → AVAILABLE/DELETED
 */
@RestController
@RequestMapping("/api/v1/media")
class MediaController(
    private val mediaService: MediaService,
    private val mediaRepository: MediaRepository,
) {
    /**
     * Generates a presigned URL for direct browser-to-R2 upload.
     *
     * The URL expires in 10 minutes. After successful upload to R2,
     * the client should call POST /confirm with the returned key.
     *
     * Rate limited: 20 uploads/hour, 100 uploads/day per user.
     */
    @PostMapping("/presign")
    fun generatePresignedUrl(
        @Valid @RequestBody request: PresignRequest,
        authentication: Authentication,
    ): ApiResponse<PresignResponse> {
        val userId = extractUserId(authentication)
        logger.info {
            "Presign request from user $userId: ${request.fileName} " +
                "(${request.contentType}, ${request.fileSize} bytes)"
        }

        val result = mediaService.generatePresignedUrl(
            fileName = request.fileName,
            contentType = request.contentType,
            fileSize = request.fileSize,
            userId = userId,
        )

        return ApiResponse(
            data = PresignResponse(
                uploadUrl = result.uploadUrl,
                key = result.key,
                expiresAt = result.expiresAt,
            ),
        )
    }

    /**
     * Confirms a completed upload and creates the media metadata record.
     *
     * Called after the client successfully uploads to R2 using the presigned URL.
     * Creates a Media record with PROCESSING status.
     */
    @PostMapping("/confirm")
    @ResponseStatus(HttpStatus.CREATED)
    fun confirmUpload(
        @Valid @RequestBody request: ConfirmRequest,
        authentication: Authentication,
    ): ApiResponse<MediaResponse> {
        val userId = extractUserId(authentication)
        logger.info { "Confirm upload from user $userId: key=${request.key}" }

        val media = mediaService.confirmUpload(
            key = request.key,
            originalName = request.originalName,
            contentType = request.contentType,
            fileSize = request.fileSize,
            entryId = request.entryId,
            category = request.category,
            description = request.description,
            userId = userId,
        )

        return ApiResponse(
            data = MediaResponse.from(media),
            status = HttpStatus.CREATED.value(),
        )
    }

    /**
     * Retrieves metadata for a specific media file.
     *
     * Non-admin users can only view AVAILABLE media.
     */
    @GetMapping("/{id}")
    @Suppress("ReturnCount")
    fun getMedia(
        @PathVariable id: UUID,
        authentication: Authentication?,
    ): ResponseEntity<ApiResponse<MediaResponse>> {
        val media = mediaRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()

        // Non-authenticated or non-admin users can only see AVAILABLE media
        val isAdmin = authentication?.hasRole("ADMIN") ?: false
        if (!isAdmin && media.status != MediaStatus.AVAILABLE) {
            return ResponseEntity.notFound().build()
        }

        return ResponseEntity.ok(ApiResponse(data = MediaResponse.from(media)))
    }

    /**
     * Retrieves all AVAILABLE media associated with a directory entry.
     */
    @GetMapping("/entry/{entryId}")
    fun getMediaByEntry(
        @PathVariable entryId: UUID,
    ): ApiResponse<List<MediaResponse>> {
        val mediaList = mediaRepository.findByEntryIdAndStatusOrderByDisplayOrderAsc(
            entryId = entryId,
            status = MediaStatus.AVAILABLE,
        )
        return ApiResponse(data = mediaList.map { MediaResponse.from(it) })
    }

    /**
     * Retrieves paginated list of media pending review (admin only).
     */
    @GetMapping("/pending")
    fun getPendingMedia(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        authentication: Authentication,
    ): ResponseEntity<ApiResponse<List<MediaResponse>>> {
        if (!authentication.hasRole("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }

        val pageable = PageRequest.of(page, minOf(size, 100))
        val mediaPage = mediaRepository.findByStatusOrderByCreatedAtDesc(
            status = MediaStatus.PENDING_REVIEW,
            pageable = pageable,
        )

        return ResponseEntity.ok(
            ApiResponse(
                data = mediaPage.content.map { MediaResponse.from(it) },
            ),
        )
    }

    /**
     * Updates media status (admin moderation: approve/reject).
     */
    @PatchMapping("/{id}/status")
    @Suppress("ReturnCount")
    fun updateMediaStatus(
        @PathVariable id: UUID,
        @Valid @RequestBody request: StatusUpdateRequest,
        authentication: Authentication,
    ): ResponseEntity<ApiResponse<MediaResponse>> {
        if (!authentication.hasRole("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }

        val adminId = UUID.fromString(extractUserId(authentication))

        val media = when (request.action) {
            ModerationAction.APPROVE -> mediaService.approveMedia(id, adminId)
            ModerationAction.REJECT -> {
                requireNotNull(request.reason) { "Rejection reason is required" }
                mediaService.rejectMedia(id, adminId, request.reason)
            }
        }

        if (media == null) {
            return ResponseEntity.notFound().build()
        }

        return ResponseEntity.ok(ApiResponse(data = MediaResponse.from(media)))
    }

    /**
     * Soft deletes a media file (owner or admin).
     *
     * Users can only delete their own media. Admins can delete any media.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteMedia(
        @PathVariable id: UUID,
        authentication: Authentication,
    ): ResponseEntity<Void> {
        val userId = extractUserId(authentication)
        val isAdmin = authentication.hasRole("ADMIN")

        val deleted = mediaService.softDelete(id, userId, isAdmin)
        return if (deleted) {
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    /**
     * Permanently deletes media from R2 storage and database (admin only).
     *
     * Only works on media in DELETED status.
     */
    @DeleteMapping("/{id}/purge")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun purgeMedia(
        @PathVariable id: UUID,
        authentication: Authentication,
    ): ResponseEntity<Void> {
        if (!authentication.hasRole("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }

        val purged = mediaService.purge(id)
        return if (purged) {
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    /**
     * Extracts user ID from Spring Security authentication.
     */
    private fun extractUserId(authentication: Authentication): String {
        return authentication.principal as? String
            ?: error("Authentication principal must be a string (user ID)")
    }

    /**
     * Checks if authentication has a specific role.
     */
    private fun Authentication.hasRole(role: String): Boolean {
        return authorities.any { it.authority == "ROLE_$role" }
    }
}
