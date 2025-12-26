package com.nosilha.core.media.domain

import com.nosilha.core.media.repository.MediaRepository
import com.nosilha.core.shared.events.DirectoryEntryCreatedEvent
import com.nosilha.core.shared.exception.RateLimitExceededException
import io.github.oshai.kotlinlogging.KotlinLogging
import io.micrometer.core.instrument.Counter
import io.micrometer.core.instrument.MeterRegistry
import org.springframework.modulith.events.ApplicationModuleListener
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ConcurrentLinkedDeque

private val logger = KotlinLogging.logger {}

/**
 * Media Service for media asset management and storage orchestration.
 *
 * Upload Flow:
 * 1. generatePresignedUrl - Generates presigned URL for direct R2 upload
 * 2. confirmUpload - Confirms upload and creates media record with PROCESSING status
 * 3. System transitions to PENDING_REVIEW after processing
 *
 * Moderation Flow:
 * - approveMedia - Transitions PENDING_REVIEW → AVAILABLE
 * - rejectMedia - Transitions PENDING_REVIEW → DELETED with reason
 * - softDelete - Transitions AVAILABLE → DELETED
 * - purge - Permanently removes DELETED media
 */
@Service
class MediaService(
    private val r2StorageService: R2StorageService?,
    private val mediaRepository: MediaRepository,
    meterRegistry: MeterRegistry,
) {
    companion object {
        private const val MAX_UPLOADS_PER_HOUR = 20
        private const val MAX_UPLOADS_PER_DAY = 100
        private const val HOUR_IN_SECONDS = 3600L
        private const val DAY_IN_SECONDS = 86400L
        private const val MINUTES_IN_HOUR = 60
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

    private val moderationApprovedCounter: Counter = Counter
        .builder("media.moderation.approved")
        .description("Number of media items approved by admins")
        .register(meterRegistry)

    private val moderationRejectedCounter: Counter = Counter
        .builder("media.moderation.rejected")
        .description("Number of media items rejected by admins")
        .register(meterRegistry)

    // In-memory rate limiter: userId -> list of upload timestamps
    // TODO: Replace with Redis-based rate limiter for production (distributed instances)
    private val hourlyRateLimiter = ConcurrentHashMap<String, ConcurrentLinkedDeque<Instant>>()
    private val dailyRateLimiter = ConcurrentHashMap<String, ConcurrentLinkedDeque<Instant>>()

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
        userId: String,
    ): PresignedPutUrlResult {
        requireR2Enabled()

        // Check rate limits before proceeding
        checkRateLimit(userId)

        logger.info { "Generating presigned URL for user $userId: $fileName ($contentType, $fileSize bytes)" }

        val result = r2StorageService!!.generatePresignedPutUrl(fileName, contentType)

        // Record this upload attempt for rate limiting
        recordUploadAttempt(userId)

        logger.info { "Generated presigned URL for key: ${result.key} (expires: ${result.expiresAt})" }
        return result
    }

    /**
     * Checks if user is within upload rate limits.
     *
     * Enforces:
     * - Maximum 20 uploads per hour
     * - Maximum 100 uploads per day
     *
     * @param userId User to check
     * @throws RateLimitExceededException if limit exceeded
     */
    private fun checkRateLimit(userId: String) {
        val now = Instant.now()

        // Check hourly limit
        val hourlySubmissions = hourlyRateLimiter.computeIfAbsent(userId) { ConcurrentLinkedDeque() }
        synchronized(hourlySubmissions) {
            val hourAgo = now.minusSeconds(HOUR_IN_SECONDS)
            hourlySubmissions.removeIf { it.isBefore(hourAgo) }

            if (hourlySubmissions.size >= MAX_UPLOADS_PER_HOUR) {
                val oldestInWindow = hourlySubmissions.peekFirst()
                val minutesUntilReset = if (oldestInWindow != null) {
                    ((oldestInWindow.epochSecond + HOUR_IN_SECONDS - now.epochSecond) / MINUTES_IN_HOUR).toInt()
                } else {
                    MINUTES_IN_HOUR
                }
                logger.warn { "Hourly rate limit exceeded for user $userId" }
                throw RateLimitExceededException(
                    "Rate limit exceeded. Try again in $minutesUntilReset minutes.",
                )
            }
        }

        // Check daily limit
        val dailySubmissions = dailyRateLimiter.computeIfAbsent(userId) { ConcurrentLinkedDeque() }
        synchronized(dailySubmissions) {
            val dayAgo = now.minusSeconds(DAY_IN_SECONDS)
            dailySubmissions.removeIf { it.isBefore(dayAgo) }

            if (dailySubmissions.size >= MAX_UPLOADS_PER_DAY) {
                logger.warn { "Daily rate limit exceeded for user $userId" }
                throw RateLimitExceededException(
                    "Daily upload limit reached. Try again tomorrow.",
                )
            }
        }
    }

    /**
     * Records an upload attempt for rate limiting.
     */
    private fun recordUploadAttempt(userId: String) {
        val now = Instant.now()

        hourlyRateLimiter.computeIfAbsent(userId) { ConcurrentLinkedDeque() }.add(now)
        dailyRateLimiter.computeIfAbsent(userId) { ConcurrentLinkedDeque() }.add(now)
    }

    /**
     * Confirms a completed upload and creates the media metadata record.
     *
     * Verifies the file exists in R2 before creating the record.
     * Sets initial status to PROCESSING (auto-transitions to PENDING_REVIEW for MVP).
     *
     * @param key Storage key from presign response
     * @param originalName Original filename
     * @param contentType MIME type
     * @param fileSize File size in bytes
     * @param entryId Optional directory entry association
     * @param category Optional media category
     * @param description Optional description
     * @param userId User who uploaded
     * @return Created Media entity
     * @throws IllegalStateException if file not found in R2
     */
    @Transactional
    fun confirmUpload(
        key: String,
        originalName: String,
        contentType: String,
        fileSize: Long,
        entryId: UUID?,
        category: String?,
        description: String?,
        userId: String,
    ): Media {
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
        val publicUrl = r2StorageService!!.getPublicUrl(key)

        // Create media record with PROCESSING status
        // For MVP, we auto-transition to PENDING_REVIEW since there's no async processing
        val media = Media(
            fileName = fileName,
            originalName = originalName,
            contentType = contentType,
            fileSize = fileSize,
            storageKey = key,
            publicUrl = publicUrl,
            entryId = entryId,
            category = category,
            description = description,
            status = MediaStatus.PENDING_REVIEW, // Auto-transition for MVP (no async processing)
            source = MediaSource.LOCAL,
            uploadedBy = userId,
        )

        val saved = mediaRepository.save(media)
        uploadSuccessCounter.increment()
        logger.info { "Created media record: id=${saved.id}, status=${saved.status}" }

        return saved
    }

    /**
     * Approves media (admin action) - transitions PENDING_REVIEW → AVAILABLE.
     *
     * @param mediaId Media to approve
     * @param adminId Admin performing the action
     * @return Updated Media or null if not found or invalid state
     */
    @Transactional
    fun approveMedia(
        mediaId: UUID,
        adminId: UUID,
    ): Media? {
        val media = mediaRepository.findById(mediaId).orElse(null)
            ?: return null

        check(media.status == MediaStatus.PENDING_REVIEW) {
            logger.warn { "Cannot approve media $mediaId - current status: ${media.status}" }
            "Can only approve media in PENDING_REVIEW status"
        }

        media.status = MediaStatus.AVAILABLE
        media.reviewedBy = adminId
        media.reviewedAt = Instant.now()

        val saved = mediaRepository.save(media)
        moderationApprovedCounter.increment()
        logger.info { "Media approved: id=$mediaId by admin $adminId" }

        return saved
    }

    /**
     * Rejects media (admin action) - transitions PENDING_REVIEW → DELETED.
     *
     * @param mediaId Media to reject
     * @param adminId Admin performing the action
     * @param reason Rejection reason
     * @return Updated Media or null if not found
     */
    @Transactional
    fun rejectMedia(
        mediaId: UUID,
        adminId: UUID,
        reason: String,
    ): Media? {
        val media = mediaRepository.findById(mediaId).orElse(null)
            ?: return null

        check(media.status == MediaStatus.PENDING_REVIEW) {
            logger.warn { "Cannot reject media $mediaId - current status: ${media.status}" }
            "Can only reject media in PENDING_REVIEW status"
        }

        media.status = MediaStatus.DELETED
        media.reviewedBy = adminId
        media.reviewedAt = Instant.now()
        media.rejectionReason = reason

        val saved = mediaRepository.save(media)
        moderationRejectedCounter.increment()
        logger.info { "Media rejected: id=$mediaId by admin $adminId, reason: $reason" }

        return saved
    }

    /**
     * Soft deletes media (owner or admin action) - transitions AVAILABLE → DELETED.
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
        userId: String,
        isAdmin: Boolean,
    ): Boolean {
        val media = mediaRepository.findById(mediaId).orElse(null)
            ?: return false

        // Check authorization: owner or admin
        if (!isAdmin && media.uploadedBy != userId) {
            logger.warn { "Unauthorized delete attempt: user $userId for media $mediaId" }
            return false
        }

        if (media.status == MediaStatus.DELETED) {
            logger.debug { "Media already deleted: $mediaId" }
            return true
        }

        check(media.status == MediaStatus.AVAILABLE) {
            logger.warn { "Cannot delete media $mediaId - current status: ${media.status}" }
            "Can only delete AVAILABLE media"
        }

        media.status = MediaStatus.DELETED
        mediaRepository.save(media)

        logger.info { "Media soft deleted: id=$mediaId by user $userId (admin=$isAdmin)" }
        return true
    }

    /**
     * Permanently deletes media from R2 and database (admin only).
     *
     * Only works on media in DELETED status.
     *
     * @param mediaId Media to purge
     * @return true if purged, false if not found or invalid state
     */
    @Transactional
    fun purge(mediaId: UUID): Boolean {
        val media = mediaRepository.findById(mediaId).orElse(null)
            ?: return false

        check(media.status == MediaStatus.DELETED) {
            logger.warn { "Cannot purge media $mediaId - must be in DELETED status, current: ${media.status}" }
            "Can only purge media in DELETED status"
        }

        // Delete from R2 if enabled
        @Suppress("TooGenericExceptionCaught")
        try {
            r2StorageService?.deleteObject(media.storageKey)
        } catch (e: Exception) {
            logger.error(e) { "Failed to delete object from R2: ${media.storageKey}" }
            // Continue with database deletion even if R2 fails
        }

        // Delete from database
        mediaRepository.delete(media)

        logger.info { "Media purged: id=$mediaId, key=${media.storageKey}" }
        return true
    }

    /**
     * Listens to DirectoryEntryCreatedEvent for cross-module awareness.
     * Media can be associated with directory entries via the entry_id field.
     */
    @ApplicationModuleListener
    fun onDirectoryEntryCreated(event: DirectoryEntryCreatedEvent) {
        logger.info {
            "Received DirectoryEntryCreatedEvent for entry: ${event.entryId} " +
                "(category: ${event.category}, name: ${event.name})"
        }
        logger.debug { "Directory entry created - media association via entry_id: ${event.entryId}" }
    }
}
