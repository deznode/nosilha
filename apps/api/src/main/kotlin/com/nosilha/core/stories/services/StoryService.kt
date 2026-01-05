package com.nosilha.core.stories.services

import com.github.benmanes.caffeine.cache.Cache
import com.github.benmanes.caffeine.cache.Caffeine
import com.nosilha.core.auth.api.UserProfileQueryService
import com.nosilha.core.directory.api.DirectoryEntryQueryService
import com.nosilha.core.shared.exception.BusinessException
import com.nosilha.core.shared.exception.RateLimitExceededException
import com.nosilha.core.shared.exception.ResourceNotFoundException
import com.nosilha.core.shared.util.ContentSanitizer
import com.nosilha.core.stories.api.CreateStoryRequest
import com.nosilha.core.stories.api.PublicStoryDetailDto
import com.nosilha.core.stories.api.PublicStoryListDto
import com.nosilha.core.stories.api.StoryDetailDto
import com.nosilha.core.stories.api.StoryListDto
import com.nosilha.core.stories.api.StoryModerationAction
import com.nosilha.core.stories.api.StorySubmittedResponse
import com.nosilha.core.stories.api.toDetailDto
import com.nosilha.core.stories.api.toListDto
import com.nosilha.core.stories.domain.StoryStatus
import com.nosilha.core.stories.domain.StorySubmission
import com.nosilha.core.stories.domain.StoryType
import com.nosilha.core.stories.events.StoryPublishedEvent
import com.nosilha.core.stories.events.StoryStatusChangedEvent
import com.nosilha.core.stories.events.StorySubmittedEvent
import com.nosilha.core.stories.repository.StorySubmissionRepository
import io.github.bucket4j.Bucket
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.context.ApplicationEventPublisher
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
 * Service for managing story submissions.
 *
 * Handles community story submissions with rate limiting and spam protection.
 */
@Service
class StoryService(
    private val repository: StorySubmissionRepository,
    private val eventPublisher: ApplicationEventPublisher,
    private val userProfileQueryService: UserProfileQueryService,
    private val directoryEntryQueryService: DirectoryEntryQueryService,
) {
    companion object {
        const val MAX_SUBMISSIONS_PER_HOUR = 5L
    }

    /**
     * Caffeine cache for rate limiting by IP address.
     *
     * <p>Uses Bucket4j's token bucket algorithm for atomic, race-condition-free
     * rate limiting. Each IP gets a bucket that refills 5 tokens per hour.</p>
     *
     * <ul>
     *   <li>maximumSize: Prevents unbounded memory growth (cap at 10k unique IPs)</li>
     *   <li>expireAfterAccess: Cleans up buckets for IPs not seen in 1 hour</li>
     * </ul>
     */
    private val rateLimitBuckets: Cache<String, Bucket> = Caffeine
        .newBuilder()
        .maximumSize(10_000)
        .expireAfterAccess(1, TimeUnit.HOURS)
        .build()

    /**
     * Submit a new story for review.
     *
     * @param request The story submission request
     * @param authorId The authenticated user's ID
     * @param ipAddress Optional IP address for rate limiting
     * @return Response containing the created story ID
     * @throws RateLimitExceededException if the user has exceeded the submission limit
     * @throws BusinessException if a guided story is missing template type
     */
    @Transactional
    fun submitStory(
        request: CreateStoryRequest,
        authorId: String,
        ipAddress: String?,
    ): StorySubmittedResponse {
        // Honeypot check - if filled, silently accept but don't save
        if (!request.honeypot.isNullOrBlank()) {
            logger.warn { "Honeypot triggered for story submission from IP: $ipAddress" }
            return StorySubmittedResponse(id = null)
        }

        // Atomic rate limiting using Bucket4j token bucket algorithm
        if (ipAddress != null) {
            val bucket = getBucketForIp(ipAddress)
            if (!bucket.tryConsume(1)) {
                logger.warn { "Rate limit exceeded for IP: $ipAddress" }
                throw RateLimitExceededException(
                    "You have exceeded the maximum number of submissions ($MAX_SUBMISSIONS_PER_HOUR per hour). Please try again later.",
                )
            }
        }

        // Validate guided stories have template type
        if (request.storyType == StoryType.GUIDED && request.templateType == null) {
            throw BusinessException("Guided stories must specify a template type")
        }

        // Sanitize user input to prevent XSS
        val sanitizedTitle = ContentSanitizer.sanitizeStrict(request.title)
        val sanitizedContent = ContentSanitizer.sanitize(request.content)

        // Create entity
        val story = StorySubmission(
            title = sanitizedTitle,
            content = sanitizedContent,
            storyType = request.storyType,
            templateType = request.templateType,
            authorId = authorId,
            relatedPlaceId = request.relatedPlaceId,
            status = StoryStatus.PENDING,
            ipAddress = ipAddress,
        )

        val saved = repository.save(story)
        logger.info { "Story submitted: id=${saved.id}, author=$authorId, type=${request.storyType}" }

        // Publish event
        eventPublisher.publishEvent(
            StorySubmittedEvent(
                storyId = saved.id!!,
                authorId = authorId,
                storyType = saved.storyType,
                relatedPlaceId = saved.relatedPlaceId,
            )
        )

        return StorySubmittedResponse(
            id = saved.id,
            message = "Thank you for sharing your story. It has been submitted for review."
        )
    }

    /**
     * Gets or creates a rate limit bucket for the given IP address.
     *
     * <p>Uses Bucket4j's token bucket algorithm for atomic, race-condition-free
     * rate limiting. The bucket is configured to allow MAX_SUBMISSIONS_PER_HOUR
     * tokens that refill every hour.</p>
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

    /**
     * Lists stories with optional status filtering and pagination.
     *
     * Admin endpoint to view all stories with support for filtering by moderation status.
     * Page size is capped at 100 to prevent excessive data transfer.
     *
     * @param status Optional status filter (PENDING, APPROVED, REJECTED, NEEDS_REVISION, PUBLISHED). If null, returns all stories.
     * @param page Zero-based page number
     * @param size Number of items per page (max 100)
     * @return Paginated list of stories as list DTOs
     */
    @Transactional(readOnly = true)
    fun listStories(
        status: StoryStatus?,
        page: Int,
        size: Int,
    ): Page<StoryListDto> {
        val pageable = PageRequest.of(page, minOf(size, 100))
        val stories =
            if (status != null) {
                repository.findByStatus(status, pageable)
            } else {
                repository.findAllBy(pageable)
            }

        logger.debug { "Retrieved ${stories.numberOfElements} stories (page $page, size $size, status: $status)" }
        return stories.map { it.toListDto() }
    }

    /**
     * Lists stories with full details for admin queue display.
     *
     * Returns complete story data including content and review information,
     * enabling admins to make moderation decisions without loading individual details.
     *
     * @param status Optional status filter (PENDING, APPROVED, REJECTED, NEEDS_REVISION, PUBLISHED). If null, returns all stories.
     * @param page Zero-based page number
     * @param size Number of items per page (max 100)
     * @return Paginated list of stories as detail DTOs
     */
    @Transactional(readOnly = true)
    fun listStoriesWithDetails(
        status: StoryStatus?,
        page: Int,
        size: Int,
    ): Page<StoryDetailDto> {
        val pageable = PageRequest.of(page, minOf(size, 100))
        val stories =
            if (status != null) {
                repository.findByStatus(status, pageable)
            } else {
                repository.findAllBy(pageable)
            }

        logger.debug { "Retrieved ${stories.numberOfElements} stories with details (page $page, size $size, status: $status)" }
        return stories.map { it.toDetailDto() }
    }

    /**
     * Gets detailed information for a specific story.
     *
     * Admin endpoint to view complete story details for review.
     *
     * @param id UUID of the story
     * @return Story detail DTO with all fields
     * @throws ResourceNotFoundException if story is not found
     */
    @Transactional(readOnly = true)
    fun getStory(id: UUID): StoryDetailDto {
        val story =
            repository
                .findById(id)
                .orElseThrow { ResourceNotFoundException("Story with id $id not found") }

        logger.debug { "Retrieved story $id for admin review" }
        return story.toDetailDto()
    }

    /**
     * Updates the status of a story based on admin moderation action.
     *
     * Admin endpoint to approve, reject, request revisions, or publish stories.
     * Publishes a status change event or publication event for potential email notifications or audit logging.
     *
     * @param id UUID of the story
     * @param action Moderation action (APPROVE, REJECT, REQUEST_REVISION, or PUBLISH)
     * @param notes Optional admin notes about the review decision
     * @param slug Optional publication slug (required for PUBLISH action)
     * @param adminId Supabase user ID of the admin performing the review
     * @return Updated story detail DTO
     * @throws ResourceNotFoundException if story is not found
     * @throws BusinessException if PUBLISH action is used without a publicationSlug
     */
    @Transactional
    fun updateStoryStatus(
        id: UUID,
        action: StoryModerationAction,
        notes: String?,
        slug: String?,
        adminId: String,
    ): StoryDetailDto {
        val story =
            repository
                .findById(id)
                .orElseThrow { ResourceNotFoundException("Story with id $id not found") }

        val previousStatus = story.status
        val newStatus =
            when (action) {
                StoryModerationAction.APPROVE -> StoryStatus.APPROVED
                StoryModerationAction.REJECT -> StoryStatus.REJECTED
                StoryModerationAction.REQUEST_REVISION -> StoryStatus.NEEDS_REVISION
                StoryModerationAction.FLAG -> StoryStatus.FLAGGED
                StoryModerationAction.PUBLISH -> {
                    if (slug.isNullOrBlank()) {
                        throw BusinessException("Publication slug is required when publishing a story")
                    }
                    StoryStatus.PUBLISHED
                }
            }

        // Sanitize admin notes if provided
        val sanitizedNotes = notes?.let { ContentSanitizer.sanitizeStrict(it) }

        val updatedStory =
            story.copy(
                status = newStatus,
                adminNotes = sanitizedNotes,
                reviewedBy = adminId,
                reviewedAt = Instant.now(),
                publicationSlug = if (action == StoryModerationAction.PUBLISH) slug else story.publicationSlug,
            )

        val savedStory = repository.save(updatedStory)
        logger.info { "Story $id status changed from $previousStatus to $newStatus by admin $adminId" }

        // Publish appropriate event
        if (action == StoryModerationAction.PUBLISH) {
            val publishEvent =
                StoryPublishedEvent(
                    storyId = id,
                    publicationSlug = slug!!,
                    authorId = story.authorId,
                    title = story.title,
                )
            eventPublisher.publishEvent(publishEvent)
            logger.debug { "Published StoryPublishedEvent for story $id" }
        } else {
            val statusChangeEvent =
                StoryStatusChangedEvent(
                    storyId = id,
                    previousStatus = previousStatus,
                    newStatus = newStatus,
                    reviewedBy = adminId,
                    adminNotes = notes,
                )
            eventPublisher.publishEvent(statusChangeEvent)
            logger.debug { "Published StoryStatusChangedEvent for story $id" }
        }

        return savedStory.toDetailDto()
    }

    /**
     * Toggles the featured status of a story.
     *
     * Admin endpoint to mark stories as featured for special display on the frontend.
     * Featured stories can be highlighted in carousels or special sections.
     *
     * @param id UUID of the story
     * @param isFeatured Whether the story should be featured
     * @return Updated story detail DTO
     * @throws ResourceNotFoundException if story is not found
     */
    @Transactional
    fun toggleFeatured(
        id: UUID,
        isFeatured: Boolean,
    ): StoryDetailDto {
        val story =
            repository
                .findById(id)
                .orElseThrow { ResourceNotFoundException("Story with id $id not found") }

        val updatedStory = story.copy(isFeatured = isFeatured)
        val savedStory = repository.save(updatedStory)

        logger.info { "Story $id featured status changed to $isFeatured" }
        return savedStory.toDetailDto()
    }

    /**
     * Marks a story as archived to MDX.
     *
     * Admin endpoint to link a story submission to its archived MDX file after
     * the MDX has been committed via the AdminMdxController. This creates a
     * bidirectional reference between the story submission and its archive.
     *
     * @param id UUID of the story
     * @param slug The slug used in the MDX archive (content/stories/{slug}.mdx)
     * @param adminId Supabase user ID of the admin performing the archival
     * @param archivedAt Optional timestamp when the story was archived (defaults to now)
     * @return Updated story detail DTO
     * @throws ResourceNotFoundException if story is not found
     * @throws BusinessException if story is not in PUBLISHED status
     */
    @Transactional
    fun markAsArchived(
        id: UUID,
        slug: String,
        adminId: String,
        archivedAt: Instant? = null,
    ): StoryDetailDto {
        val story =
            repository
                .findById(id)
                .orElseThrow { ResourceNotFoundException("Story with id $id not found") }

        // Validate story is published (only published stories should be archived)
        if (story.status != StoryStatus.PUBLISHED) {
            throw BusinessException(
                "Only published stories can be archived. Current status: ${story.status}. " +
                    "Please publish the story before archiving.",
            )
        }

        val updatedStory =
            story.copy(
                archivedAt = archivedAt ?: Instant.now(),
                archivedSlug = slug,
                archivedBy = adminId,
            )

        val savedStory = repository.save(updatedStory)
        logger.info { "Story $id marked as archived with slug '$slug' by admin $adminId" }

        return savedStory.toDetailDto()
    }

    /**
     * Deletes a story from the system.
     *
     * Admin endpoint to remove spam or invalid stories. This operation is permanent
     * and should be used sparingly as it breaks the audit trail.
     *
     * @param id UUID of the story to delete
     * @throws ResourceNotFoundException if story is not found
     */
    @Transactional
    fun deleteStory(id: UUID) {
        val story =
            repository
                .findById(id)
                .orElseThrow { ResourceNotFoundException("Story with id $id not found") }

        repository.delete(story)
        logger.warn { "Story $id deleted by admin (author: ${story.authorId}, type: ${story.storyType})" }
    }

    // ========== PUBLIC API METHODS ==========

    /**
     * Lists published stories for public display.
     *
     * Public endpoint to view all published stories with author names resolved.
     * Page size is capped at 50 for public APIs.
     *
     * @param page Zero-based page number
     * @param size Number of items per page (max 50)
     * @return Paginated list of published stories as public DTOs
     */
    @Transactional(readOnly = true)
    fun listPublishedStories(
        page: Int,
        size: Int,
    ): Page<PublicStoryListDto> {
        val pageable = PageRequest.of(page, minOf(size, 50))
        val stories = repository.findByStatusOrderByCreatedAtDesc(StoryStatus.PUBLISHED, pageable)

        // Batch fetch author display names for efficiency
        val authorIds = stories.content.map { it.authorId }.distinct()
        val displayNamesById = userProfileQueryService.findDisplayNames(authorIds)

        // Batch fetch related place names
        val placeIds = stories.content.mapNotNull { it.relatedPlaceId }.distinct()
        val placeNamesById = directoryEntryQueryService.findEntryNames(placeIds)

        logger.debug { "Retrieved ${stories.numberOfElements} published stories (page $page)" }
        return stories.map { story ->
            story.toPublicListDto(
                authorName = displayNamesById[story.authorId] ?: "Anonymous",
                locationName = story.relatedPlaceId?.let { placeNamesById[it] },
            )
        }
    }

    /**
     * Gets a published story by its publication slug.
     *
     * Public endpoint to retrieve a single published story for display.
     *
     * @param slug The URL-friendly publication slug
     * @return Public story detail DTO
     * @throws ResourceNotFoundException if story is not found or not published
     */
    @Transactional(readOnly = true)
    fun getPublishedStoryBySlug(slug: String): PublicStoryDetailDto {
        val story = repository.findByPublicationSlugAndStatus(slug, StoryStatus.PUBLISHED)
            ?: throw ResourceNotFoundException("Story with slug '$slug' not found")

        // Resolve author name
        val authorName = userProfileQueryService.findDisplayName(story.authorId) ?: "Anonymous"

        // Resolve location name
        val locationName = story.relatedPlaceId?.let { placeId ->
            directoryEntryQueryService.findEntryName(placeId)
        }

        logger.debug { "Retrieved published story by slug: $slug" }
        return story.toPublicDetailDto(authorName, locationName)
    }

    /**
     * Extension function to convert StorySubmission entity to public list DTO.
     */
    private fun StorySubmission.toPublicListDto(
        authorName: String,
        locationName: String?,
    ) = PublicStoryListDto(
        id = this.id!!,
        slug = this.publicationSlug ?: this.id.toString(),
        title = this.title,
        excerpt = this.content.take(200) + if (this.content.length > 200) "..." else "",
        author = authorName,
        storyType = this.storyType,
        templateType = this.templateType,
        location = locationName,
        isFeatured = this.isFeatured,
        createdAt = this.createdAt,
    )

    /**
     * Extension function to convert StorySubmission entity to public detail DTO.
     */
    private fun StorySubmission.toPublicDetailDto(
        authorName: String,
        locationName: String?,
    ) = PublicStoryDetailDto(
        id = this.id!!,
        slug = this.publicationSlug ?: this.id.toString(),
        title = this.title,
        content = this.content,
        author = authorName,
        storyType = this.storyType,
        templateType = this.templateType,
        location = locationName,
        isFeatured = this.isFeatured,
        createdAt = this.createdAt,
    )
}
