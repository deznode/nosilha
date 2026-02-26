package com.nosilha.core.gallery.api

import com.nosilha.core.gallery.api.dto.ConfirmRequest
import com.nosilha.core.gallery.api.dto.GalleryMediaDto
import com.nosilha.core.gallery.api.dto.PresignRequest
import com.nosilha.core.gallery.api.dto.PresignResponse
import com.nosilha.core.gallery.api.dto.PublicGalleryMediaDto
import com.nosilha.core.gallery.api.dto.SubmitExternalMediaRequest
import com.nosilha.core.gallery.api.dto.TimelineDto
import com.nosilha.core.gallery.domain.GalleryService
import com.nosilha.core.shared.api.ApiResult
import com.nosilha.core.shared.api.PagedApiResult
import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
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
 * Unified REST controller for gallery media (user uploads and external content).
 *
 * Provides public access to active gallery media and authenticated endpoints
 * for user uploads and external media submissions.
 *
 * Endpoints:
 * - GET / - List active gallery media (mixed UserUpload and External)
 * - GET /{id} - Get single gallery item
 * - GET /entry/{entryId} - Media for directory entry (UserUploadedMedia only)
 * - GET /categories - Distinct categories across all media
 * - GET /random - Random gallery photos (unseeded)
 * - GET /featured - Daily featured photo (seeded by day)
 * - GET /weekly - Weekly discovery photos (seeded by ISO week)
 * - GET /timeline - Decade-grouped timeline aggregation
 * - POST /upload/presign - Presigned URL for user upload
 * - POST /upload/confirm - Confirm user upload
 * - POST /submit - Submit external media for review
 *
 * User Upload Flow:
 * 1. POST /upload/presign - Get presigned URL for direct R2 upload
 * 2. Client uploads directly to R2 using presigned URL
 * 3. POST /upload/confirm - Confirm upload and create metadata record
 *
 * External Media Submission Flow:
 * 1. POST /submit - Submit external media (YouTube, etc.) for admin review
 *
 * Moderation Flow:
 * - User Uploads: PROCESSING → PENDING_REVIEW → ACTIVE/REJECTED → ARCHIVED
 * - External Media: PENDING_REVIEW → ACTIVE → ARCHIVED
 */
@RestController
@RequestMapping("/api/v1/gallery")
class GalleryController(
    private val galleryService: GalleryService,
) {
    /**
     * List active gallery media with pagination and optional filtering.
     *
     * Returns a unified list of ACTIVE media from both user uploads and
     * external curated content, ordered by displayOrder.
     *
     * Query Parameters:
     * - category: Optional category filter
     * - page: Page number (default: 0)
     * - size: Items per page (default: 50, max: 100)
     *
     * Example: GET /api/v1/gallery?category=Nature&page=0&size=20
     */
    @GetMapping
    fun listGalleryMedia(
        @RequestParam(required = false) category: String? = null,
        @RequestParam(required = false) decade: String? = null,
        @RequestParam(name = "q", required = false) query: String? = null,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int,
    ): PagedApiResult<PublicGalleryMediaDto> {
        logger.debug { "Listing gallery media - category: $category, decade: $decade, q: $query, page: $page, size: $size" }
        return galleryService.listActiveMediaPublic(category, decade, query, page, size)
    }

    /**
     * Get a single gallery media item by ID.
     *
     * Returns either UserUpload or External media item.
     * Non-admin users can only view ACTIVE media.
     *
     * Returns 404 if media not found or not active (for non-admins).
     */
    @GetMapping("/{id}")
    fun getGalleryMedia(
        @PathVariable id: UUID,
    ): ResponseEntity<ApiResult<PublicGalleryMediaDto>> {
        val media = galleryService.getByIdPublic(id)
            ?: return ResponseEntity.notFound().build()

        return ResponseEntity.ok(ApiResult(data = media))
    }

    /**
     * Retrieves all ACTIVE user-uploaded media associated with a directory entry.
     *
     * This endpoint is specific to user uploads that are linked to directory entries.
     * External media is not included in these results.
     */
    @GetMapping("/entry/{entryId}")
    fun getMediaByEntry(
        @PathVariable entryId: UUID,
    ): ApiResult<List<PublicGalleryMediaDto.UserUpload>> {
        logger.debug { "Fetching media for entry: $entryId" }
        return ApiResult(data = galleryService.getMediaByEntryPublic(entryId))
    }

    /**
     * Get distinct list of categories used by active gallery media.
     *
     * Returns all unique categories from ACTIVE media items (both user uploads
     * and external content), sorted alphabetically.
     *
     * Useful for populating category filter dropdowns in the frontend.
     */
    @GetMapping("/categories")
    fun getCategories(): ApiResult<List<String>> {
        logger.debug { "Fetching gallery categories" }
        return ApiResult(data = galleryService.getCategories())
    }

    /**
     * Returns N randomly selected gallery photos.
     *
     * <p>Each call returns different results (unseeded random).
     * Count is capped at 10 to prevent abuse.</p>
     *
     * @param count Number of random photos (default 1, max 10)
     * @return ApiResult with list of random gallery media items
     */
    @GetMapping("/random")
    fun getRandomMedia(
        @RequestParam(name = "count", defaultValue = "1") count: Int,
    ): ApiResult<List<PublicGalleryMediaDto>> {
        val cappedCount = count.coerceIn(1, 10)
        logger.debug { "Random media request: count=$cappedCount" }
        return ApiResult(data = galleryService.getRandomMedia(cappedCount))
    }

    /**
     * Returns the daily featured photo.
     *
     * <p>Same photo returned for all users on the same calendar day.
     * Returns an empty list when the gallery has no photos.</p>
     *
     * @return ApiResult with a single-element list (or empty)
     */
    @GetMapping("/featured")
    fun getDailyFeatured(): ApiResult<List<PublicGalleryMediaDto>> {
        logger.debug { "Daily featured photo request" }
        val featured = galleryService.getDailyFeatured()
        return ApiResult(data = listOfNotNull(featured))
    }

    /**
     * Returns this week's discovery photos (up to 5).
     *
     * <p>Same photos returned for the same ISO week.
     * Returns an empty list when the gallery has no photos.</p>
     *
     * @return ApiResult with list of weekly discovery photos
     */
    @GetMapping("/weekly")
    fun getWeeklyDiscovery(): ApiResult<List<PublicGalleryMediaDto>> {
        logger.debug { "Weekly discovery request" }
        return ApiResult(data = galleryService.getWeeklyDiscovery())
    }

    /**
     * Get gallery timeline aggregated by decade.
     *
     * Groups all gallery-visible media into decade buckets with counts
     * and up to 3 sample photos per decade for preview thumbnails.
     * Cached for 30 minutes.
     *
     * @return ApiResult with timeline data grouped by decade
     */
    @GetMapping("/timeline")
    fun getTimeline(): ApiResult<TimelineDto> {
        logger.debug { "Timeline aggregation request" }
        return ApiResult(data = galleryService.getTimelineAggregation())
    }

    /**
     * Generates a presigned URL for direct browser-to-R2 upload.
     *
     * The URL expires in 10 minutes. After successful upload to R2,
     * the client should call POST /upload/confirm with the returned key.
     *
     * Rate limited: 20 uploads/hour, 100 uploads/day per user.
     */
    @PostMapping("/upload/presign")
    fun generatePresignedUrl(
        @Valid @RequestBody request: PresignRequest,
        authentication: Authentication,
    ): ApiResult<PresignResponse> {
        val userId = extractUserId(authentication)
        logger.info {
            "Presign request from user $userId: ${request.fileName} " +
                "(${request.contentType}, ${request.fileSize} bytes)"
        }

        val result = galleryService.generatePresignedUrl(
            fileName = request.fileName,
            contentType = request.contentType,
            fileSize = request.fileSize,
            userId = userId,
        )

        return ApiResult(
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
     * Creates a UserUploadedMedia record with PENDING_REVIEW status.
     *
     * Accepts EXIF metadata (privacy-processed client-side) and manual metadata
     * for historical photos without EXIF data.
     */
    @PostMapping("/upload/confirm")
    @ResponseStatus(HttpStatus.CREATED)
    fun confirmUpload(
        @Valid @RequestBody request: ConfirmRequest,
        authentication: Authentication,
    ): ApiResult<GalleryMediaDto.UserUpload> {
        val userId = extractUserId(authentication)
        logger.info { "Confirm upload from user $userId: key=${request.key}, photoType=${request.photoType}" }

        val media = galleryService.confirmUpload(
            key = request.key,
            originalName = request.originalName,
            contentType = request.contentType,
            fileSize = request.fileSize,
            entryId = request.entryId,
            category = request.category,
            description = request.description,
            userId = userId,
            // EXIF metadata (privacy-processed)
            latitude = request.latitude,
            longitude = request.longitude,
            altitude = request.altitude,
            dateTaken = request.dateTaken,
            cameraMake = request.cameraMake,
            cameraModel = request.cameraModel,
            orientation = request.orientation,
            // Privacy tracking
            photoType = request.photoType,
            gpsPrivacyLevel = request.gpsPrivacyLevel,
            // Manual metadata
            approximateDate = request.approximateDate,
            locationName = request.locationName,
            photographerCredit = request.photographerCredit,
            archiveSource = request.archiveSource,
        )

        return ApiResult(
            data = media,
            status = HttpStatus.CREATED.value(),
        )
    }

    /**
     * Submit external media for admin review.
     *
     * Allows authenticated users to submit external content (YouTube videos,
     * external images, podcasts) for admin moderation. Created media will
     * have PENDING_REVIEW status.
     *
     * Example:
     * POST /api/v1/gallery/submit
     * {
     *   "mediaType": "VIDEO",
     *   "platform": "YOUTUBE",
     *   "externalId": "dQw4w9WgXcQ",
     *   "title": "Cultural Festival 2024",
     *   "description": "Annual celebration...",
     *   "category": "Culture"
     * }
     */
    @PostMapping("/submit")
    @ResponseStatus(HttpStatus.CREATED)
    fun submitExternalMedia(
        @Valid @RequestBody request: SubmitExternalMediaRequest,
        authentication: Authentication,
    ): ApiResult<GalleryMediaDto.External> {
        val userId = extractUserId(authentication)
        logger.info { "External media submission from user $userId: ${request.title}" }

        val media = galleryService.submitExternalMedia(request, userId)

        return ApiResult(
            data = media,
            status = HttpStatus.CREATED.value(),
        )
    }

    /**
     * Extracts user ID from Spring Security authentication.
     *
     * For Supabase JWT authentication via JwtAuthenticationToken, the user ID
     * is stored in the 'name' property (third constructor parameter), not in
     * the principal (which contains the Jwt object itself).
     */
    private fun extractUserId(authentication: Authentication): UUID =
        UUID.fromString(
            authentication.name
                ?: error("Authentication name must be present (user ID)"),
        )
}
