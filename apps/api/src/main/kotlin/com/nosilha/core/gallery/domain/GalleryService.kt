package com.nosilha.core.gallery.domain

import com.github.benmanes.caffeine.cache.Cache
import com.github.benmanes.caffeine.cache.Caffeine
import com.nosilha.core.auth.api.UserProfileQueryService
import com.nosilha.core.gallery.api.dto.GalleryMediaDto
import com.nosilha.core.gallery.api.dto.PublicGalleryMediaDto
import com.nosilha.core.gallery.api.dto.SubmitExternalMediaRequest
import com.nosilha.core.gallery.api.dto.contributorIds
import com.nosilha.core.gallery.api.dto.toDto
import com.nosilha.core.gallery.api.dto.toPublicDto
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import com.nosilha.core.shared.api.PageableInfo
import com.nosilha.core.shared.api.PagedApiResult
import com.nosilha.core.shared.events.AiResultsApprovedEvent
import com.nosilha.core.shared.events.DirectoryEntryCreatedEvent
import com.nosilha.core.shared.events.MediaAnalysisCompletedEvent
import com.nosilha.core.shared.events.MediaAnalysisFailedEvent
import com.nosilha.core.shared.exception.RateLimitExceededException
import io.github.bucket4j.Bucket
import io.github.oshai.kotlinlogging.KotlinLogging
import io.micrometer.core.instrument.Counter
import io.micrometer.core.instrument.MeterRegistry
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.modulith.events.ApplicationModuleListener
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.Duration
import java.time.Instant
import java.util.UUID
import java.util.concurrent.TimeUnit

private val logger = KotlinLogging.logger {}

/**
 * Gallery Service for unified media asset management and storage orchestration.
 *
 * Manages both user-uploaded media and admin-curated external content through
 * a single service interface with polymorphic handling.
 *
 * User Upload Flow:
 * 1. generatePresignedUrl - Generates presigned URL for direct R2 upload
 * 2. confirmUpload - Confirms upload and creates UserUploadedMedia record with PENDING_REVIEW status
 *
 * External Media Flow:
 * 1. submitExternal - User submits external media for review (PENDING_REVIEW status)
 * 2. createExternal - Admin directly creates external media (ACTIVE status)
 *
 * Moderation Flow:
 * - Handled by GalleryModerationService
 * - Supports both UserUploadedMedia and ExternalMedia in unified queue
 */
@Service
class GalleryService(
    private val r2StorageService: R2StorageService?,
    private val repository: GalleryMediaRepository,
    private val userProfileQueryService: UserProfileQueryService,
    meterRegistry: MeterRegistry,
) {
    companion object {
        private const val MAX_UPLOADS_PER_HOUR = 20L
        private const val MAX_UPLOADS_PER_DAY = 100L

        private val RAW_FILENAME_PATTERNS = listOf(
            // UUID prefix (e.g., "a1b2c3d4-e5f6-...")
            Regex("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-"),
            // Camera filename prefixes
            Regex("^(DJI|IMG|DSC|DCIM|DSCN|P)_", RegexOption.IGNORE_CASE),
            // File extensions (title shouldn't contain these)
            Regex("\\.(jpe?g|png|webp|heic|mp4|mov)$", RegexOption.IGNORE_CASE),
        )

        /**
         * Detects raw camera filenames and UUID-based strings that should be
         * replaced with AI-generated titles.
         */
        fun isRawFilename(title: String): Boolean {
            if (title.isBlank()) return true
            return RAW_FILENAME_PATTERNS.any { it.containsMatchIn(title) }
        }
    }

    // Metrics counters for media operations
    private val uploadSuccessCounter: Counter = Counter
        .builder("media.upload.success")
        .description("Number of successful media upload confirmations")
        .register(meterRegistry)

    private val uploadFailureCounter: Counter = Counter
        .builder("media.upload.failure")
        .description("Number of failed media upload attempts")
        .register(meterRegistry)

    private val externalMediaCreatedCounter: Counter = Counter
        .builder("media.external.created")
        .description("Number of external media items created")
        .register(meterRegistry)

    private val moderationApprovedCounter: Counter = Counter
        .builder("media.moderation.approved")
        .description("Number of media items approved by admins")
        .register(meterRegistry)

    private val moderationRejectedCounter: Counter = Counter
        .builder("media.moderation.rejected")
        .description("Number of media items rejected by admins")
        .register(meterRegistry)

    /**
     * Caffeine cache for rate limiting by user ID.
     *
     * Uses Bucket4j's token bucket algorithm with dual bandwidth limits:
     * - 20 uploads per hour (short-term burst protection)
     * - 100 uploads per day (long-term abuse prevention)
     */
    private val rateLimitBuckets: Cache<UUID, Bucket> = Caffeine
        .newBuilder()
        .maximumSize(10_000)
        .expireAfterAccess(1, TimeUnit.DAYS)
        .build()

    /** Whether R2 storage is enabled and available. */
    val isR2Enabled: Boolean
        get() = r2StorageService != null

    /**
     * Throws if R2 storage is not enabled.
     * Call this before any operation that requires R2.
     */
    private fun requireR2Enabled() {
        check(r2StorageService != null) {
            "R2 storage is not enabled. Set cloudflare.r2.enabled=true to enable media uploads."
        }
    }

    // ================================
    // User Upload Operations
    // ================================

    /**
     * Generates a presigned PUT URL for direct browser-to-R2 upload.
     *
     * Validates file metadata and rate limits before generating URL.
     *
     * @param fileName Original filename
     * @param contentType MIME type (must be allowed type)
     * @param fileSize File size in bytes (must be ≤ 50MB)
     * @param userId User requesting the upload
     * @return PresignedPutUrlResult with uploadUrl, key, and expiration
     * @throws IllegalArgumentException if validation fails
     * @throws RateLimitExceededException if rate limit exceeded
     */
    fun generatePresignedUrl(
        fileName: String,
        contentType: String,
        fileSize: Long,
        userId: UUID,
    ): PresignedPutUrlResult {
        requireR2Enabled()

        // Check rate limits before proceeding
        checkRateLimit(userId)

        logger.info { "Generating presigned URL for user $userId: $fileName ($contentType, $fileSize bytes)" }

        val result = r2StorageService!!.generatePresignedPutUrl(fileName, contentType)

        logger.info { "Generated presigned URL for key: ${result.key} (expires: ${result.expiresAt})" }
        return result
    }

    /**
     * Checks if user is within upload rate limits and consumes a token.
     *
     * Uses Bucket4j's token bucket algorithm with dual bandwidth limits:
     * - Maximum 20 uploads per hour (refills hourly)
     * - Maximum 100 uploads per day (refills daily)
     *
     * @param userId User to check
     * @throws RateLimitExceededException if either limit exceeded
     */
    private fun checkRateLimit(userId: UUID) {
        val bucket = getBucketForUser(userId)
        if (!bucket.tryConsume(1)) {
            logger.warn { "Rate limit exceeded for user $userId" }
            throw RateLimitExceededException(
                "Upload rate limit exceeded. Please try again later.",
            )
        }
    }

    /**
     * Gets or creates a rate limit bucket for the given user ID.
     *
     * Creates a bucket with two bandwidth limits:
     * - 20 tokens refilling every hour (burst protection)
     * - 100 tokens refilling every day (abuse prevention)
     *
     * @param userId User ID to get bucket for
     * @return Bucket configured with dual rate limits
     */
    private fun getBucketForUser(userId: UUID): Bucket =
        rateLimitBuckets.get(userId) {
            logger.debug { "Creating rate limit bucket for user: $userId" }
            Bucket
                .builder()
                .addLimit { limit ->
                    limit
                        .capacity(MAX_UPLOADS_PER_HOUR)
                        .refillIntervally(MAX_UPLOADS_PER_HOUR, Duration.ofHours(1))
                }.addLimit { limit ->
                    limit
                        .capacity(MAX_UPLOADS_PER_DAY)
                        .refillIntervally(MAX_UPLOADS_PER_DAY, Duration.ofDays(1))
                }.build()
        }

    /**
     * Confirms a completed upload and creates the UserUploadedMedia metadata record.
     *
     * Verifies the file exists in R2 before creating the record.
     * Sets initial status to PENDING_REVIEW for MVP (no async processing).
     *
     * @param key Storage key from presign response
     * @param originalName Original filename
     * @param contentType MIME type
     * @param fileSize File size in bytes
     * @param entryId Optional directory entry association
     * @param category Optional media category
     * @param description Optional description
     * @param userId User who uploaded
     * @param latitude GPS latitude (privacy-processed)
     * @param longitude GPS longitude (privacy-processed)
     * @param altitude GPS altitude in meters
     * @param dateTaken Original capture date from EXIF
     * @param cameraMake Camera manufacturer
     * @param cameraModel Camera model
     * @param orientation EXIF orientation (1-8)
     * @param photoType Photo type (CULTURAL_SITE, COMMUNITY_EVENT, PERSONAL)
     * @param gpsPrivacyLevel Applied GPS privacy level
     * @param approximateDate Manual date entry for historical photos
     * @param locationName Manual location name
     * @param photographerCredit Photographer name
     * @param archiveSource Source of historical photo
     * @return Created UserUploadedMedia DTO
     * @throws IllegalStateException if file not found in R2
     */
    @Transactional
    @Suppress("LongParameterList")
    fun confirmUpload(
        key: String,
        originalName: String,
        contentType: String,
        fileSize: Long,
        entryId: UUID?,
        category: String?,
        description: String?,
        userId: UUID,
        // EXIF metadata (privacy-processed)
        latitude: Double? = null,
        longitude: Double? = null,
        altitude: Double? = null,
        dateTaken: Instant? = null,
        cameraMake: String? = null,
        cameraModel: String? = null,
        orientation: Int? = null,
        // Privacy tracking
        photoType: String? = null,
        gpsPrivacyLevel: String? = null,
        // Manual metadata
        approximateDate: String? = null,
        locationName: String? = null,
        photographerCredit: String? = null,
        archiveSource: String? = null,
    ): GalleryMediaDto.UserUpload {
        requireR2Enabled()
        logger.info { "Confirming upload for user $userId: key=$key" }

        // Verify the file was actually uploaded to R2
        if (!r2StorageService!!.objectExists(key)) {
            uploadFailureCounter.increment()
            logger.warn { "Upload confirmation failed - object not found in R2: $key" }
            error("Upload not found. Please retry the upload.")
        }

        // Generate unique filename from the key
        val fileName = key.substringAfterLast("/")
        val publicUrl = r2StorageService.getPublicUrl(key)

        // Create UserUploadedMedia record with PENDING_REVIEW status
        // For MVP, we skip PROCESSING since there's no async processing
        val media = UserUploadedMedia().apply {
            this.fileName = fileName
            this.originalName = originalName
            this.contentType = contentType
            this.fileSize = fileSize
            this.storageKey = key
            this.publicUrl = publicUrl
            this.entryId = entryId
            this.category = category
            this.description = description
            this.title = description ?: originalName // Use description as title, fallback to filename
            this.status = GalleryMediaStatus.PENDING_REVIEW
            this.source = MediaSource.LOCAL
            this.uploadedBy = userId
            this.displayOrder = 0
            this.showInGallery = (entryId == null)
            // EXIF metadata (privacy-processed)
            this.latitude = latitude?.let { BigDecimal.valueOf(it) }
            this.longitude = longitude?.let { BigDecimal.valueOf(it) }
            this.altitude = altitude?.let { BigDecimal.valueOf(it) }
            this.dateTaken = dateTaken
            this.cameraMake = cameraMake
            this.cameraModel = cameraModel
            this.orientation = orientation ?: 1
            // Privacy tracking
            this.photoType = photoType
            this.gpsPrivacyLevel = gpsPrivacyLevel
            // Manual metadata
            this.approximateDate = approximateDate
            this.locationName = locationName
            this.photographerCredit = photographerCredit
            this.archiveSource = archiveSource
            // Smart credit attribution
            if (!photographerCredit.isNullOrBlank()) {
                val parsed = CreditParser.parseCredit(photographerCredit)
                this.creditPlatform = parsed.platform
                this.creditHandle = parsed.handle
                this.photographerCredit = parsed.displayName
            }
        }

        val saved = repository.save(media)
        uploadSuccessCounter.increment()
        logger.info { "Created UserUploadedMedia record: id=${saved.id}, status=${saved.status}, hasGps=${latitude != null}" }

        val displayName = userProfileQueryService.findDisplayName(userId)
        return GalleryMediaDto.from(saved, displayName)
    }

    // ================================
    // External Media Operations (Legacy - kept for backward compatibility)
    // ================================
    // Note: New code should use submitExternalMedia() and GalleryModerationService.createExternalMedia()

    // ================================
    // Moderation Operations (Legacy - migrating to GalleryModerationService)
    // ================================

    /**
     * Approves media (admin action) - transitions PENDING_REVIEW → ACTIVE.
     *
     * @param mediaId Media to approve
     * @param adminId Admin performing the action
     * @return Updated GalleryMedia or null if not found or invalid state
     */
    @Transactional
    fun approveMedia(
        mediaId: UUID,
        adminId: UUID,
    ): GalleryMedia? {
        val media = repository.findById(mediaId).orElse(null)
            ?: return null

        check(media.status == GalleryMediaStatus.PENDING_REVIEW) {
            logger.warn { "Cannot approve media $mediaId - current status: ${media.status}" }
            "Can only approve media in PENDING_REVIEW status"
        }

        media.status = GalleryMediaStatus.ACTIVE
        media.reviewedBy = adminId
        media.reviewedAt = Instant.now()

        val saved = repository.save(media)
        moderationApprovedCounter.increment()
        logger.info { "Media approved: id=$mediaId by admin $adminId" }

        return saved
    }

    /**
     * Rejects media (admin action) - transitions PENDING_REVIEW → REJECTED.
     *
     * @param mediaId Media to reject
     * @param adminId Admin performing the action
     * @param reason Rejection reason
     * @return Updated GalleryMedia or null if not found
     */
    @Transactional
    fun rejectMedia(
        mediaId: UUID,
        adminId: UUID,
        reason: String,
    ): GalleryMedia? {
        val media = repository.findById(mediaId).orElse(null)
            ?: return null

        check(media.status == GalleryMediaStatus.PENDING_REVIEW) {
            logger.warn { "Cannot reject media $mediaId - current status: ${media.status}" }
            "Can only reject media in PENDING_REVIEW status"
        }

        media.status = GalleryMediaStatus.REJECTED
        media.reviewedBy = adminId
        media.reviewedAt = Instant.now()
        media.rejectionReason = reason

        val saved = repository.save(media)
        moderationRejectedCounter.increment()
        logger.info { "Media rejected: id=$mediaId by admin $adminId, reason: $reason" }

        return saved
    }

    /**
     * Soft deletes media (owner or admin action) - transitions ACTIVE → ARCHIVED.
     *
     * @param mediaId Media to delete
     * @param userId User requesting deletion
     * @param isAdmin Whether user is admin
     * @return true if deleted, false if not found or unauthorized
     */
    @Transactional
    @Suppress("ReturnCount")
    fun softDelete(
        mediaId: UUID,
        userId: UUID,
        isAdmin: Boolean,
    ): Boolean {
        val media = repository.findById(mediaId).orElse(null)
            ?: return false

        // Check authorization: owner (for user uploads) or admin
        if (!isAdmin) {
            if (media is UserUploadedMedia && media.uploadedBy != userId) {
                logger.warn { "Unauthorized delete attempt: user $userId for media $mediaId" }
                return false
            }
            if (media is ExternalMedia) {
                logger.warn { "Non-admin cannot delete external media: $mediaId" }
                return false
            }
        }

        if (media.status == GalleryMediaStatus.ARCHIVED) {
            logger.debug { "Media already archived: $mediaId" }
            return true
        }

        check(media.status == GalleryMediaStatus.ACTIVE) {
            logger.warn { "Cannot delete media $mediaId - current status: ${media.status}" }
            "Can only delete ACTIVE media"
        }

        media.status = GalleryMediaStatus.ARCHIVED
        repository.save(media)

        logger.info { "Media soft deleted: id=$mediaId by user $userId (admin=$isAdmin)" }
        return true
    }

    /**
     * Permanently deletes media from R2 and database (admin only).
     *
     * Only works on media in ARCHIVED status. For UserUploadedMedia, also deletes from R2.
     *
     * @param mediaId Media to purge
     * @return true if purged, false if not found or invalid state
     */
    @Transactional
    fun purge(mediaId: UUID): Boolean {
        val media = repository.findById(mediaId).orElse(null)
            ?: return false

        check(media.status == GalleryMediaStatus.ARCHIVED) {
            logger.warn { "Cannot purge media $mediaId - must be in ARCHIVED status, current: ${media.status}" }
            "Can only purge media in ARCHIVED status"
        }

        // Delete from R2 if it's UserUploadedMedia and R2 is enabled
        if (media is UserUploadedMedia && media.storageKey != null) {
            @Suppress("TooGenericExceptionCaught")
            try {
                r2StorageService?.deleteObject(media.storageKey!!)
                logger.info { "Deleted object from R2: ${media.storageKey}" }
            } catch (e: Exception) {
                logger.error(e) { "Failed to delete object from R2: ${media.storageKey}" }
                // Continue with database deletion even if R2 fails
            }
        }

        // Delete from database
        repository.delete(media)

        logger.info { "Media purged: id=$mediaId" }
        return true
    }

    // ================================
    // Query Operations
    // ================================

    // -- Private query methods (shared logic) --

    private fun queryActiveMedia(
        category: String?,
        decade: String?,
        page: Int,
        size: Int,
    ): Page<GalleryMedia> {
        val pageable = PageRequest.of(page, minOf(size, 100))
        val needsInMemoryFilter = category != null || decade != null

        return if (needsInMemoryFilter) {
            var filtered: List<GalleryMedia> = repository
                .findByStatusAndShowInGalleryTrue(GalleryMediaStatus.ACTIVE)

            if (category != null) {
                filtered = filtered.filter { it.category == category }
            }

            if (decade != null) {
                val yearRange = parseDecadeRange(decade)
                if (yearRange != null) {
                    filtered = filtered.filter { media -> resolveYear(media) in yearRange }
                }
            }

            filtered = filtered.sortedBy { it.displayOrder }
            val start = page * size
            val end = minOf(start + size, filtered.size)
            val pageContent = if (start < filtered.size) filtered.subList(start, end) else emptyList()

            PageImpl(pageContent, pageable, filtered.size.toLong())
        } else {
            repository.findByStatusAndShowInGalleryTrueOrderByDisplayOrderAsc(GalleryMediaStatus.ACTIVE, pageable)
        }
    }

    /**
     * Parses a decade string into an IntRange of years.
     * Supported values: pre-1975, 1975-1990, 1990-2010, 2010-plus
     */
    private fun parseDecadeRange(decade: String): IntRange? =
        when (decade) {
            "pre-1975" -> Int.MIN_VALUE..1974
            "1975-1990" -> 1975..1990
            "1990-2010" -> 1990..2010
            "2010-plus" -> 2010..Int.MAX_VALUE
            else -> null
        }

    private val yearPattern = Regex("""(\d{4})""")

    /**
     * Resolves the best available year for a gallery media item.
     * Priority: dateTaken (EXIF) > approximateDate (parsed) > createdAt
     */
    private fun resolveYear(media: GalleryMedia): Int {
        if (media is UserUploadedMedia) {
            media.dateTaken?.let { return it.atZone(java.time.ZoneOffset.UTC).year }
            media.approximateDate?.let { approx ->
                yearPattern.find(approx)?.groupValues?.get(1)?.toIntOrNull()?.let { return it }
            }
        }
        return media.createdAt.atZone(java.time.ZoneOffset.UTC).year
    }

    private fun queryActiveById(id: UUID): GalleryMedia? {
        val media = repository.findById(id).orElse(null) ?: return null
        return if (media.status == GalleryMediaStatus.ACTIVE) media else null
    }

    private fun queryMediaByEntry(entryId: UUID): List<UserUploadedMedia> =
        repository.findByEntryIdAndStatusOrderByDisplayOrderAsc(entryId, GalleryMediaStatus.ACTIVE)

    // -- Public API methods (lean DTO) --

    /**
     * Lists active gallery media for public API consumption.
     *
     * Returns a lean DTO that excludes AI fields, storage internals,
     * and internal user IDs.
     */
    @Transactional(readOnly = true)
    fun listActiveMediaPublic(
        category: String?,
        decade: String?,
        page: Int,
        size: Int,
    ): PagedApiResult<PublicGalleryMediaDto> {
        val mediaPage = queryActiveMedia(category, decade, page, size)
        val displayNames = resolveDisplayNames(mediaPage.content)
        val dtos = mediaPage.content.map { it.toPublicDto(displayNames) }

        return PagedApiResult(
            data = dtos,
            pageable = PageableInfo(
                page = mediaPage.number,
                size = mediaPage.size,
                totalElements = mediaPage.totalElements,
                totalPages = mediaPage.totalPages,
                first = mediaPage.isFirst,
                last = mediaPage.isLast,
            ),
        )
    }

    /**
     * Gets a single ACTIVE gallery media item by ID for public API consumption.
     */
    @Transactional(readOnly = true)
    fun getByIdPublic(id: UUID): PublicGalleryMediaDto? {
        val media = queryActiveById(id) ?: return null
        val displayNames = resolveDisplayNames(listOf(media))
        return media.toPublicDto(displayNames)
    }

    /**
     * Gets all ACTIVE user-uploaded media for a directory entry (public API).
     */
    @Transactional(readOnly = true)
    fun getMediaByEntryPublic(entryId: UUID): List<PublicGalleryMediaDto.UserUpload> {
        val mediaList = queryMediaByEntry(entryId)
        val displayNames = resolveDisplayNames(mediaList)
        return mediaList.map { PublicGalleryMediaDto.from(it, it.uploadedBy?.let { id -> displayNames[id] }) }
    }

    // -- Admin API methods (full DTO) --

    /**
     * Lists active gallery media with optional category filtering and pagination.
     *
     * Returns the full DTO including AI fields and storage internals.
     * Used by admin endpoints.
     */
    @Transactional(readOnly = true)
    fun listActiveMedia(
        category: String?,
        page: Int,
        size: Int,
    ): PagedApiResult<GalleryMediaDto> {
        val mediaPage = queryActiveMedia(category, null, page, size)
        val displayNames = resolveDisplayNames(mediaPage.content)
        val dtos = mediaPage.content.map { it.toDto(displayNames) }

        return PagedApiResult(
            data = dtos,
            pageable = PageableInfo(
                page = mediaPage.number,
                size = mediaPage.size,
                totalElements = mediaPage.totalElements,
                totalPages = mediaPage.totalPages,
                first = mediaPage.isFirst,
                last = mediaPage.isLast,
            ),
        )
    }

    /**
     * Gets a single gallery media item by ID.
     *
     * @param id Media ID
     * @param isAdmin Whether the requester is an admin (admins can view any status)
     * @return Media DTO or null if not found or not accessible
     */
    @Transactional(readOnly = true)
    fun getById(
        id: UUID,
        isAdmin: Boolean = false,
    ): GalleryMediaDto? {
        val media = repository.findById(id).orElse(null) ?: return null

        // Non-admin users can only view ACTIVE media
        if (!isAdmin && media.status != GalleryMediaStatus.ACTIVE) {
            return null
        }

        val displayNames = resolveDisplayNames(listOf(media))
        return media.toDto(displayNames)
    }

    /**
     * Gets all ACTIVE user-uploaded media for a directory entry.
     */
    @Transactional(readOnly = true)
    fun getMediaByEntry(entryId: UUID): List<GalleryMediaDto.UserUpload> {
        val mediaList = queryMediaByEntry(entryId)
        val displayNames = resolveDisplayNames(mediaList)
        return mediaList.map { GalleryMediaDto.from(it, it.uploadedBy?.let { id -> displayNames[id] }) }
    }

    /**
     * Gets distinct list of categories from ACTIVE media.
     *
     * @return Sorted list of unique categories
     */
    @Transactional(readOnly = true)
    fun getCategories(): List<String> =
        repository
            .findByStatusAndShowInGalleryTrue(GalleryMediaStatus.ACTIVE)
            .mapNotNull { it.category }
            .distinct()
            .sorted()

    /**
     * User submits external media for admin review.
     *
     * Creates ExternalMedia with PENDING_REVIEW status.
     *
     * @param request External media submission request
     * @param userId User submitting the media
     * @return Created external media DTO
     */
    @Transactional
    fun submitExternalMedia(
        request: SubmitExternalMediaRequest,
        userId: UUID,
    ): GalleryMediaDto.External {
        logger.info { "User $userId submitting external media: ${request.title} (${request.mediaType}, ${request.platform})" }

        val media = ExternalMedia().apply {
            this.mediaType = request.mediaType
            this.platform = request.platform
            this.externalId = request.externalId
            this.url = request.url
            this.thumbnailUrl = request.thumbnailUrl
            this.title = request.title
            this.description = request.description
            this.author = request.author
            this.category = request.category
            this.displayOrder = request.displayOrder
            this.status = GalleryMediaStatus.PENDING_REVIEW
            this.curatedBy = userId
            // Smart credit attribution
            if (!request.author.isNullOrBlank()) {
                val parsed = CreditParser.parseCredit(request.author)
                this.creditPlatform = parsed.platform
                this.creditHandle = parsed.handle
                this.author = parsed.displayName
            }
        }

        val saved = repository.save(media)
        externalMediaCreatedCounter.increment()
        logger.info { "Created ExternalMedia for review: id=${saved.id}" }

        val displayName = userProfileQueryService.findDisplayName(userId)
        return GalleryMediaDto.from(saved, displayName)
    }

    /**
     * Batch-resolves display names for a list of gallery media items.
     */
    private fun resolveDisplayNames(mediaList: List<GalleryMedia>): Map<UUID, String> {
        val userIds = mediaList.contributorIds()
        return if (userIds.isNotEmpty()) userProfileQueryService.findDisplayNames(userIds) else emptyMap()
    }

    /**
     * Listens to DirectoryEntryCreatedEvent for cross-module awareness.
     * UserUploadedMedia can be associated with directory entries via the entry_id field.
     */
    @ApplicationModuleListener
    fun onDirectoryEntryCreated(event: DirectoryEntryCreatedEvent) {
        logger.info {
            "Received DirectoryEntryCreatedEvent for entry: ${event.entryId} " +
                "(category: ${event.category}, name: ${event.name})"
        }
        logger.debug { "Directory entry created - media association via entry_id: ${event.entryId}" }
    }

    /**
     * Listens to MediaAnalysisCompletedEvent for logging purposes.
     * Results are NOT auto-applied; they require moderator approval via the AI module.
     */
    @ApplicationModuleListener
    fun onMediaAnalysisCompleted(event: MediaAnalysisCompletedEvent) {
        logger.info {
            "AI analysis completed for media ${event.mediaId}: " +
                "${event.providers.size} providers, ${event.tags.size} tags, " +
                "alt text: ${event.altText != null}, description: ${event.description != null}"
        }
    }

    /**
     * Listens to MediaAnalysisFailedEvent for logging purposes.
     * Admin can view failed analysis runs and retry via the admin endpoints.
     */
    @ApplicationModuleListener
    fun onMediaAnalysisFailed(event: MediaAnalysisFailedEvent) {
        logger.warn {
            "AI analysis failed for media ${event.mediaId}: ${event.errorMessage}" +
                (event.provider?.let { " (provider: $it)" } ?: "")
        }
    }

    /**
     * Applies moderator-approved AI results to the UserUploadedMedia entity.
     *
     * This is the final step in the AI moderation workflow:
     * AI analysis → moderator review → approval event → entity update.
     */
    @ApplicationModuleListener
    fun onAiResultsApproved(event: AiResultsApprovedEvent) {
        val media = repository.findById(event.mediaId).orElse(null)

        if (media == null) {
            logger.warn { "Media not found for AI results approval: ${event.mediaId}" }
            return
        }

        if (media !is UserUploadedMedia) {
            logger.warn { "Cannot apply AI results to non-upload media: ${event.mediaId}" }
            return
        }

        media.aiTitle = event.title
        media.aiAltText = event.altText
        media.aiDescription = event.description
        media.aiTags = event.tags.toTypedArray().ifEmpty { null }
        media.aiLabels = event.labels
        media.aiProcessedAt = Instant.now()

        // Promote AI content into canonical fields
        promoteAiContent(media, event)

        repository.save(media)

        logger.info {
            "Applied approved AI results to media ${event.mediaId} " +
                "(run: ${event.analysisRunId}, moderator: ${event.moderatorId})"
        }
    }

    /**
     * Promotes approved AI-generated content into canonical fields.
     *
     * Promotion rules (conservative — preserves human-authored content):
     * - aiTitle → title: only when current title looks like a raw camera filename
     * - aiDescription → description: only when description is null or blank
     * - aiAltText → altText: always (canonical alt text for WCAG compliance)
     */
    private fun promoteAiContent(
        media: UserUploadedMedia,
        event: AiResultsApprovedEvent,
    ) {
        if (!event.title.isNullOrBlank() && isRawFilename(media.title)) {
            media.title = event.title
            logger.debug { "Promoted AI title for media ${media.id}: '${event.title}'" }
        }

        if (!event.description.isNullOrBlank() && media.description.isNullOrBlank()) {
            media.description = event.description
            logger.debug { "Promoted AI description for media ${media.id}" }
        }

        if (!event.altText.isNullOrBlank()) {
            media.altText = event.altText
            logger.debug { "Promoted AI alt text for media ${media.id}" }
        }
    }
}
