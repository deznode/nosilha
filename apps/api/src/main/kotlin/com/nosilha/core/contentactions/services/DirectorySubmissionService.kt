package com.nosilha.core.contentactions.services

import com.github.benmanes.caffeine.cache.Cache
import com.github.benmanes.caffeine.cache.Caffeine
import com.nosilha.core.contentactions.api.AdminDirectorySubmissionDto
import com.nosilha.core.contentactions.api.CreateDirectorySubmissionRequest
import com.nosilha.core.contentactions.domain.DirectorySubmission
import com.nosilha.core.contentactions.domain.DirectorySubmissionStatus
import com.nosilha.core.contentactions.repository.DirectorySubmissionRepository
import com.nosilha.core.shared.exception.RateLimitExceededException
import com.nosilha.core.shared.exception.ResourceNotFoundException
import com.nosilha.core.shared.util.ContentSanitizer
import io.github.bucket4j.Bucket
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Duration
import java.time.Instant
import java.util.UUID
import java.util.concurrent.TimeUnit

private val logger = KotlinLogging.logger {}

/**
 * Service for managing directory entry submissions.
 *
 * <p>Handles community-submitted directory entries with moderation workflow.
 * Implements rate limiting (3 submissions per hour per IP) to prevent spam.</p>
 *
 * <p><strong>Business Rules:</strong></p>
 * <ul>
 *   <li>Rate limit: 3 submissions per hour per IP address</li>
 *   <li>All submissions start with PENDING status</li>
 *   <li>IP addresses are stored for rate limiting and abuse prevention</li>
 *   <li>Admin approval/rejection updates status with optional notes</li>
 * </ul>
 *
 * @property directorySubmissionRepository Repository for persisting directory submissions
 */
@Service
class DirectorySubmissionService(
    private val directorySubmissionRepository: DirectorySubmissionRepository,
) {
    companion object {
        /** Maximum directory submissions per hour per IP address */
        const val MAX_SUBMISSIONS_PER_HOUR = 3L
    }

    /**
     * Caffeine cache for rate limiting by IP address.
     *
     * <p>Uses Bucket4j's token bucket algorithm for atomic, race-condition-free
     * rate limiting. Each IP gets a bucket that refills 3 tokens per hour.</p>
     *
     * <ul>
     *   <li>maximumSize: Prevents unbounded memory growth (cap at 10k unique IPs)</li>
     *   <li>expireAfterAccess: Cleans up buckets for IPs not seen in 1 hour</li>
     * </ul>
     *
     * <p><strong>Note:</strong> For horizontal scaling, consider using Redis-backed
     * Bucket4j (bucket4j-redis). The current in-memory approach is suitable for
     * single-instance deployments.</p>
     */
    private val rateLimitBuckets: Cache<String, Bucket> = Caffeine
        .newBuilder()
        .maximumSize(10_000)
        .expireAfterAccess(1, TimeUnit.HOURS)
        .build()

    // ================================
    // PUBLIC SUBMISSION METHODS
    // ================================

    /**
     * Submits a new directory entry for review.
     *
     * <p>Performs rate limiting checks before persisting the submission.
     * Entries are stored with PENDING status for admin review.</p>
     *
     * @param request Directory submission data
     * @param submittedBy Display name or identifier of the submitter
     * @param submittedByEmail Optional email of the submitter
     * @param ipAddress IP address of the submitter (for rate limiting)
     * @return Created AdminDirectorySubmissionDto
     * @throws RateLimitExceededException if user has exceeded submission limit
     */
    @Transactional
    fun submitDirectoryEntry(
        request: CreateDirectorySubmissionRequest,
        submittedBy: String,
        submittedByEmail: String?,
        ipAddress: String?,
    ): AdminDirectorySubmissionDto {
        logger.info { "Processing directory submission from IP: $ipAddress" }

        // Atomic rate limiting using Bucket4j token bucket algorithm
        if (ipAddress != null) {
            val bucket = getBucketForIp(ipAddress)
            if (!bucket.tryConsume(1)) {
                logger.warn { "Rate limit exceeded for IP: $ipAddress" }
                throw RateLimitExceededException(
                    "You have exceeded the maximum number of submissions ($MAX_SUBMISSIONS_PER_HOUR per hour). " +
                        "Please try again later.",
                )
            }
        }

        // Sanitize user input to prevent XSS
        val sanitizedName = ContentSanitizer.sanitizeStrict(request.name.trim())
        val sanitizedDescription = ContentSanitizer.sanitize(request.description.trim())
        val sanitizedTags = request.tags.map { ContentSanitizer.sanitizeStrict(it.trim()) }

        // Create and persist directory submission
        val submission = DirectorySubmission(
            name = sanitizedName,
            category = request.category,
            town = request.town.trim(),
            customTown = request.customTown?.trim(),
            description = sanitizedDescription,
            tags = sanitizedTags,
            imageUrl = request.imageUrl,
            priceLevel = request.priceLevel,
            latitude = request.latitude,
            longitude = request.longitude,
            submittedBy = submittedBy,
            submittedByEmail = submittedByEmail,
            ipAddress = ipAddress,
            status = DirectorySubmissionStatus.PENDING,
        )

        val savedSubmission = directorySubmissionRepository.saveAndFlush(submission)
        logger.info { "Directory submission ${savedSubmission.id} created successfully" }

        return AdminDirectorySubmissionDto.fromEntity(savedSubmission)
    }

    /**
     * Gets or creates a rate limit bucket for the given IP address.
     *
     * <p>Uses Bucket4j's token bucket algorithm for atomic, race-condition-free
     * rate limiting. The bucket is configured to allow MAX_SUBMISSIONS_PER_HOUR
     * tokens that refill every hour.</p>
     *
     * <p><strong>Token Bucket Algorithm:</strong></p>
     * <ul>
     *   <li>Capacity: 3 tokens (MAX_SUBMISSIONS_PER_HOUR)</li>
     *   <li>Refill: 3 tokens every hour (intervally refill)</li>
     *   <li>Each submission consumes 1 token</li>
     *   <li>If no tokens available, submission is rejected</li>
     * </ul>
     *
     * <p><strong>Thread Safety:</strong> Uses computeIfAbsent for atomic bucket
     * creation, eliminating race conditions present in the previous DB-based approach.</p>
     *
     * @param ipAddress IP address to get bucket for
     * @return Bucket configured for rate limiting
     */
    private fun getBucketForIp(ipAddress: String): Bucket =
        rateLimitBuckets.get(ipAddress) {
            logger.debug { "Creating rate limit bucket for IP: $ipAddress" }
            Bucket
                .builder()
                .addLimit { limit ->
                    limit
                        .capacity(MAX_SUBMISSIONS_PER_HOUR)
                        .refillIntervally(MAX_SUBMISSIONS_PER_HOUR, Duration.ofHours(1))
                }.build()
        }

    // ================================
    // ADMIN METHODS
    // ================================

    /**
     * Lists directory submissions with optional status filtering and pagination.
     *
     * <p>Used by admin panel for moderation queue. Submissions are sorted by creation date (newest first).</p>
     *
     * @param status Optional status filter (PENDING, APPROVED, REJECTED)
     * @param page Zero-based page number (default: 0)
     * @param size Number of items per page (default: 20, max: 100)
     * @return Page of AdminDirectorySubmissionDto
     */
    @Transactional(readOnly = true)
    fun listSubmissions(
        status: DirectorySubmissionStatus?,
        page: Int,
        size: Int,
    ): Page<AdminDirectorySubmissionDto> {
        val pageable = PageRequest.of(page, size.coerceAtMost(100))

        val submissions =
            if (status != null) {
                directorySubmissionRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
            } else {
                directorySubmissionRepository.findAllByOrderByCreatedAtDesc(pageable)
            }

        logger.debug { "Found ${submissions.totalElements} directory submissions (status=$status, page=$page)" }
        return submissions.map { AdminDirectorySubmissionDto.fromEntity(it) }
    }

    /**
     * Gets a single directory submission by ID.
     *
     * @param id UUID of the directory submission
     * @return AdminDirectorySubmissionDto
     * @throws ResourceNotFoundException if submission is not found
     */
    @Transactional(readOnly = true)
    fun getSubmission(id: UUID): AdminDirectorySubmissionDto {
        val submission =
            directorySubmissionRepository.findById(id).orElseThrow {
                ResourceNotFoundException("Directory submission not found: $id")
            }
        return AdminDirectorySubmissionDto.fromEntity(submission)
    }

    /**
     * Updates the status of a directory submission.
     *
     * <p>Allows admins to approve or reject submissions with optional notes.</p>
     *
     * @param id UUID of the directory submission
     * @param status New status (APPROVED or REJECTED)
     * @param adminNotes Optional notes explaining the decision
     * @param reviewedBy User ID of the admin performing the review
     * @return Updated AdminDirectorySubmissionDto
     * @throws ResourceNotFoundException if submission is not found
     */
    @Transactional
    fun updateStatus(
        id: UUID,
        status: DirectorySubmissionStatus,
        adminNotes: String?,
        reviewedBy: String,
    ): AdminDirectorySubmissionDto {
        val submission =
            directorySubmissionRepository.findById(id).orElseThrow {
                ResourceNotFoundException("Directory submission not found: $id")
            }

        logger.info { "Updating directory submission $id status from ${submission.status} to $status" }

        submission.status = status
        submission.adminNotes = adminNotes
        submission.reviewedBy = reviewedBy
        submission.reviewedAt = Instant.now()

        val saved = directorySubmissionRepository.save(submission)

        return AdminDirectorySubmissionDto.fromEntity(saved)
    }

    /**
     * Counts directory submissions by status.
     *
     * <p>Used for dashboard pending counts.</p>
     *
     * @param status Directory submission status to count
     * @return Number of submissions with the specified status
     */
    @Transactional(readOnly = true)
    fun countByStatus(status: DirectorySubmissionStatus): Long = directorySubmissionRepository.countByStatus(status)
}
