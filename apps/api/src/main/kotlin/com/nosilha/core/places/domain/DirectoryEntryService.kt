package com.nosilha.core.places.domain

import com.github.benmanes.caffeine.cache.Cache
import com.github.benmanes.caffeine.cache.Caffeine
import com.nosilha.core.places.api.AdminDirectoryEntryDto
import com.nosilha.core.places.api.CreateDirectoryEntrySubmissionRequest
import com.nosilha.core.places.api.DirectoryEntrySubmissionConfirmationDto
import com.nosilha.core.places.repository.DirectoryEntryRepository
import com.nosilha.core.shared.api.CreateEntryRequestDto
import com.nosilha.core.shared.api.CreateHotelDetailsDto
import com.nosilha.core.shared.api.CreateRestaurantDetailsDto
import com.nosilha.core.shared.api.DirectoryEntryDto
import com.nosilha.core.shared.events.DirectoryEntryCreatedEvent
import com.nosilha.core.shared.events.DirectoryEntryDeletedEvent
import com.nosilha.core.shared.events.DirectoryEntryUpdatedEvent
import com.nosilha.core.shared.events.HeroImagePromotedEvent
import com.nosilha.core.shared.exception.BusinessException
import com.nosilha.core.shared.exception.RateLimitExceededException
import com.nosilha.core.shared.exception.ResourceNotFoundException
import com.nosilha.core.shared.service.FrontendRevalidationService
import com.nosilha.core.shared.util.ContentSanitizer
import io.github.bucket4j.Bucket
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.modulith.events.ApplicationModuleListener
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import tools.jackson.module.kotlin.jacksonObjectMapper
import java.time.Duration
import java.time.Instant
import java.util.*
import java.util.concurrent.TimeUnit

private val logger = KotlinLogging.logger {}

/**
 * Service class for handling business logic related to directory entries.
 *
 * <p>This service acts as an intermediary between the controller and the repository,
 * orchestrating data retrieval, transformation from entities to DTOs, and publishing
 * domain events for cross-module communication.</p>
 *
 * <p>Following DDD aggregate pattern, a DirectoryEntry is the aggregate root that
 * transitions through lifecycle states: DRAFT → PENDING → APPROVED → PUBLISHED → ARCHIVED.</p>
 *
 * <p><strong>Rate Limiting:</strong> Submissions are rate-limited to 3 per hour per IP address
 * using Bucket4j's token bucket algorithm.</p>
 *
 * @param repository The repository for accessing directory entry data
 * @param eventPublisher Spring event publisher for module events
 */
@Service
class DirectoryEntryService(
    private val repository: DirectoryEntryRepository,
    private val eventPublisher: ApplicationEventPublisher,
    private val revalidationService: FrontendRevalidationService,
) {
    companion object {
        /** Maximum directory submissions per hour per IP address */
        const val MAX_SUBMISSIONS_PER_HOUR = 3L
    }

    private val metadataObjectMapper = jacksonObjectMapper()

    /**
     * Caffeine cache for rate limiting by IP address.
     *
     * <p>Uses Bucket4j's token bucket algorithm for atomic, race-condition-free
     * rate limiting. Each IP gets a bucket that refills 3 tokens per hour.</p>
     */
    private val rateLimitBuckets: Cache<String, Bucket> = Caffeine
        .newBuilder()
        .maximumSize(10_000)
        .expireAfterAccess(1, TimeUnit.HOURS)
        .build()

    /**
     * Creates a new directory entry based on the provided request data.
     *
     * <p>Publishes {@link DirectoryEntryCreatedEvent} after successful creation.</p>
     *
     * @param request The DTO containing all necessary data for the new entry.
     * @return The DTO of the newly created and saved entry.
     * @throws IllegalArgumentException if the category in the request is invalid.
     */
    @Transactional
    fun createEntry(request: CreateEntryRequestDto): DirectoryEntryDto {
        val newEntry =
            when (request.category) {
                "Restaurant" -> {
                    val restaurantDetails = request.details as? CreateRestaurantDetailsDto
                    Restaurant().apply {
                        this.phoneNumber = restaurantDetails?.phoneNumber
                        this.openingHours = restaurantDetails?.openingHours
                        this.cuisine = restaurantDetails?.cuisine?.joinToString(",")
                    }
                }

                "Hotel" -> {
                    val hotelDetails = request.details as? CreateHotelDetailsDto
                    Hotel().apply {
                        this.phoneNumber = hotelDetails?.phoneNumber
                        this.amenities = hotelDetails?.amenities?.joinToString(",")
                    }
                }

                "Beach" -> Beach()
                "Heritage" -> Heritage()
                "Nature" -> Nature()
                else -> throw IllegalArgumentException("Invalid category provided: ${request.category}")
            }

        newEntry.apply {
            this.name = request.name
            this.description = request.description
            this.town = request.town
            this.latitude = request.latitude
            this.longitude = request.longitude
            this.imageUrl = request.imageUrl
            this.tags = request.tags?.joinToString(",")
            this.contentActions =
                request.contentActions?.let {
                    metadataObjectMapper.writeValueAsString(it)
                }
            // Generate a simple, URL-friendly slug
            this.slug =
                request.name
                    .lowercase()
                    .replace(Regex("\\s+"), "-") // Replace spaces with hyphens
                    .replace(Regex("[^a-z0-9-]$"), "") // Remove non-alphanumeric characters (except hyphens)
        }

        val savedEntry = repository.save(newEntry)

        // Publish DirectoryEntryCreatedEvent for other modules to react
        eventPublisher.publishEvent(
            DirectoryEntryCreatedEvent(
                entryId = savedEntry.id!!,
                category = savedEntry.getCategoryValue(),
                name = savedEntry.name,
            ),
        )

        return savedEntry.toDto()
    }

    // =====================================================
    // PUBLIC DIRECTORY QUERIES (PUBLISHED entries only)
    // =====================================================

    /**
     * Retrieves all PUBLISHED directory entries from the database and maps them to DTOs.
     *
     * @return A list of [DirectoryEntryDto] representing all published entries.
     */
    fun getAllEntries(): List<DirectoryEntryDto> =
        repository
            .findByStatus(DirectoryEntryStatus.PUBLISHED, Pageable.unpaged())
            .map { it.toDto() }
            .content

    /**
     * Retrieves PUBLISHED directory entries with pagination support.
     *
     * @param pageable Pagination parameters (page, size, sort)
     * @return A page of [DirectoryEntryDto] representing the requested published entries.
     */
    fun getEntriesPage(pageable: Pageable): Page<DirectoryEntryDto> =
        repository.findByStatus(DirectoryEntryStatus.PUBLISHED, pageable).map { it.toDto() }

    /**
     * Retrieves PUBLISHED directory entries filtered by category with pagination support.
     *
     * @param category The category to filter by (e.g., "Restaurant", "Hotel")
     * @param pageable Pagination parameters (page, size, sort)
     * @return A page of [DirectoryEntryDto] for the given category.
     */
    fun getEntriesByCategoryPage(
        category: String,
        pageable: Pageable,
    ): Page<DirectoryEntryDto> =
        repository
            .findByStatusAndCategoryIgnoreCase(DirectoryEntryStatus.PUBLISHED, category, pageable)
            .map { it.toDto() }

    /**
     * Retrieves PUBLISHED directory entries filtered by town with pagination support.
     *
     * @param town The town to filter by
     * @param pageable Pagination parameters (page, size, sort)
     * @return A page of [DirectoryEntryDto] for the given town.
     */
    fun getEntriesByTownPage(
        town: String,
        pageable: Pageable,
    ): Page<DirectoryEntryDto> =
        repository
            .findByStatusAndTownIgnoreCase(DirectoryEntryStatus.PUBLISHED, town, pageable)
            .map { it.toDto() }

    /**
     * Retrieves PUBLISHED directory entries filtered by both category and town with pagination support.
     *
     * @param category The category to filter by
     * @param town The town to filter by
     * @param pageable Pagination parameters (page, size, sort)
     * @return A page of [DirectoryEntryDto] for the given filters.
     */
    fun getEntriesByCategoryAndTownPage(
        category: String,
        town: String,
        pageable: Pageable,
    ): Page<DirectoryEntryDto> =
        repository
            .findByStatusAndCategoryIgnoreCaseAndTownIgnoreCase(
                DirectoryEntryStatus.PUBLISHED,
                category,
                town,
                pageable,
            ).map { it.toDto() }

    /**
     * Retrieves all PUBLISHED directory entries of a specific category and maps them to DTOs.
     *
     * @param category The category to filter by (e.g., "Restaurant", "Hotel").
     * @return A list of [DirectoryEntryDto] for the given category.
     */
    fun getEntriesByCategory(category: String): List<DirectoryEntryDto> =
        repository
            .findByStatusAndCategoryIgnoreCase(DirectoryEntryStatus.PUBLISHED, category, Pageable.unpaged())
            .map { it.toDto() }
            .content

    /**
     * Finds a single directory entry by its unique ID.
     *
     * @param id The UUID of the entry to find.
     * @return The corresponding [DirectoryEntryDto].
     * @throws ResourceNotFoundException if no entry with the given ID exists.
     */
    fun getEntryById(id: UUID): DirectoryEntryDto =
        repository
            .findById(id)
            .map { it.toDto() }
            .orElseThrow { ResourceNotFoundException("Directory entry with ID '$id' not found.") }

    /**
     * Finds a single directory entry by its unique slug.
     *
     * @param slug The unique slug of the entry to find.
     * @return The corresponding [DirectoryEntryDto].
     * @throws ResourceNotFoundException if no entry with the given slug exists.
     */
    fun getEntryBySlug(slug: String): DirectoryEntryDto =
        repository.findBySlug(slug)?.toDto()
            ?: throw ResourceNotFoundException("Directory entry with slug '$slug' not found.")

    /**
     * Updates an existing directory entry.
     *
     * <p>Publishes {@link DirectoryEntryUpdatedEvent} after successful update.</p>
     *
     * @param id The UUID of the entry to update.
     * @param request The DTO containing updated data for the entry.
     * @return The updated [DirectoryEntryDto].
     * @throws ResourceNotFoundException if no entry with the given ID exists.
     * @throws BusinessException if the update violates business rules.
     */
    @Transactional
    fun updateEntry(
        id: UUID,
        request: CreateEntryRequestDto,
    ): DirectoryEntryDto {
        val existingEntry =
            repository
                .findById(id)
                .orElseThrow { ResourceNotFoundException("Directory entry with ID '$id' not found.") }

        // Check if slug is being changed and if it would create a duplicate
        val newSlug =
            request.name
                .lowercase()
                .replace(Regex("\\s+"), "-")
                .replace(Regex("[^a-z0-9-]$"), "")

        if (newSlug != existingEntry.slug && repository.findBySlug(newSlug) != null) {
            throw BusinessException("A directory entry with slug '$newSlug' already exists.")
        }

        // Update basic fields
        existingEntry.apply {
            name = request.name
            slug = newSlug
            description = request.description
            town = request.town
            latitude = request.latitude
            longitude = request.longitude
            imageUrl = request.imageUrl
            tags = request.tags?.joinToString(",")
            contentActions =
                request.contentActions?.let {
                    metadataObjectMapper.writeValueAsString(it)
                }
        }

        // Update type-specific fields based on the existing entity type
        when (existingEntry) {
            is Restaurant -> {
                val restaurantDetails = request.details as? CreateRestaurantDetailsDto
                existingEntry.phoneNumber = restaurantDetails?.phoneNumber
                existingEntry.openingHours = restaurantDetails?.openingHours
                existingEntry.cuisine = restaurantDetails?.cuisine?.joinToString(",")
            }
            is Hotel -> {
                val hotelDetails = request.details as? CreateHotelDetailsDto
                existingEntry.phoneNumber = hotelDetails?.phoneNumber
                existingEntry.amenities = hotelDetails?.amenities?.joinToString(",")
            }
            // Beach, Heritage, and Nature don't have specific fields to update
        }

        val updatedEntry = repository.save(existingEntry)

        // Publish DirectoryEntryUpdatedEvent for other modules to react
        eventPublisher.publishEvent(
            DirectoryEntryUpdatedEvent(
                entryId = updatedEntry.id!!,
                category = updatedEntry.getCategoryValue(),
            ),
        )

        return updatedEntry.toDto()
    }

    /**
     * Deletes a directory entry by its ID.
     *
     * <p>Publishes {@link DirectoryEntryDeletedEvent} after successful deletion.</p>
     *
     * @param id The UUID of the entry to delete.
     * @throws ResourceNotFoundException if no entry with the given ID exists.
     */
    @Transactional
    fun deleteEntry(id: UUID) {
        if (!repository.existsById(id)) {
            throw ResourceNotFoundException("Directory entry with ID '$id' not found.")
        }

        repository.deleteById(id)

        // Publish DirectoryEntryDeletedEvent for other modules to react
        eventPublisher.publishEvent(
            DirectoryEntryDeletedEvent(entryId = id),
        )
    }

    /**
     * Handles HeroImagePromotedEvent from the Gallery module.
     *
     * <p>Updates the directory entry's imageUrl to the promoted gallery image.
     * This listener maintains Spring Modulith module boundaries by consuming
     * events from the Gallery module rather than accepting direct imports.</p>
     *
     * <p>If the directory entry is not found (race condition), the event is
     * logged but no exception is thrown since the event has already been committed.</p>
     *
     * @param event The HeroImagePromotedEvent containing entryId and imageUrl
     */
    @ApplicationModuleListener
    fun onHeroImagePromoted(event: HeroImagePromotedEvent) {
        logger.info { "Received HeroImagePromotedEvent for entry ${event.entryId}, media ${event.mediaId}" }

        val entry = repository.findById(event.entryId).orElse(null)
        if (entry == null) {
            logger.warn { "Directory entry not found for hero image promotion: ${event.entryId}" }
            return
        }

        val previousImageUrl = entry.imageUrl
        entry.imageUrl = event.imageUrl
        repository.save(entry)

        logger.info {
            "Updated hero image for entry ${event.entryId} (${entry.name}): " +
                "previous='$previousImageUrl', new='${event.imageUrl}'"
        }

        // Trigger frontend cache revalidation so users see the update immediately
        revalidationService.revalidateDirectoryEntry(
            category = entry.getCategoryValue(),
            slug = entry.slug,
        )
    }

    // =====================================================
    // PUBLIC SUBMISSION METHODS
    // =====================================================

    /**
     * Submits a new directory entry for review.
     *
     * <p>Performs rate limiting checks before persisting the entry.
     * Entries are stored with PENDING status for admin review.</p>
     *
     * @param request Directory submission data
     * @param userId Authenticated user ID (from Supabase JWT)
     * @param ipAddress IP address of the submitter (for rate limiting)
     * @return DirectoryEntrySubmissionConfirmationDto
     * @throws RateLimitExceededException if user has exceeded submission limit
     */
    @Transactional
    fun submitDirectoryEntry(
        request: CreateDirectoryEntrySubmissionRequest,
        userId: String,
        ipAddress: String?,
    ): DirectoryEntrySubmissionConfirmationDto {
        logger.info { "Processing directory submission from user: $userId, IP: $ipAddress" }

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

        // Create the appropriate entry type based on category
        val newEntry = when (request.category.uppercase()) {
            "RESTAURANT" -> Restaurant()
            "HOTEL" -> Hotel()
            "BEACH" -> Beach()
            "HERITAGE" -> Heritage()
            "NATURE" -> Nature()
            else -> throw IllegalArgumentException("Invalid category: ${request.category}")
        }

        // Generate a unique slug
        val baseSlug = sanitizedName
            .lowercase()
            .replace(Regex("[^a-z0-9\\s-]"), "")
            .replace(Regex("\\s+"), "-")

        newEntry.apply {
            this.name = sanitizedName
            this.slug = "$baseSlug-${UUID.randomUUID().toString().substring(0, 8)}"
            this.description = sanitizedDescription
            this.town = request.customTown?.trim() ?: request.town.trim()
            this.latitude = request.latitude?.toDouble() ?: 0.0
            this.longitude = request.longitude?.toDouble() ?: 0.0
            this.imageUrl = request.imageUrl
            this.tags = sanitizedTags.joinToString(",").takeIf { it.isNotBlank() }
            this.status = DirectoryEntryStatus.PENDING
            this.submittedBy = userId
            this.submittedByEmail = null
            this.ipAddress = ipAddress
            this.priceLevel = request.priceLevel
            this.customTown = request.customTown?.trim()
        }

        val savedEntry = repository.saveAndFlush(newEntry)
        logger.info { "Directory submission ${savedEntry.id} created successfully" }

        return DirectoryEntrySubmissionConfirmationDto(
            id = savedEntry.id!!,
            name = savedEntry.name,
            status = savedEntry.status.name,
        )
    }

    /**
     * Gets or creates a rate limit bucket for the given IP address.
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

    // =====================================================
    // ADMIN MODERATION METHODS
    // =====================================================

    /**
     * Lists directory entries with optional status filtering and pagination.
     *
     * <p>Used by admin panel for moderation queue. Entries are sorted by creation date (newest first).</p>
     *
     * @param status Optional status filter (PENDING, APPROVED, PUBLISHED, ARCHIVED)
     * @param page Zero-based page number (default: 0)
     * @param size Number of items per page (default: 20, max: 100)
     * @return Page of AdminDirectoryEntryDto
     */
    @Transactional(readOnly = true)
    fun getAdminEntries(
        status: DirectoryEntryStatus?,
        page: Int,
        size: Int,
    ): Page<AdminDirectoryEntryDto> {
        val pageable = PageRequest.of(page, size.coerceAtMost(100))

        val entries = if (status != null) {
            repository.findByStatusOrderByCreatedAtDesc(status, pageable)
        } else {
            repository.findAllByOrderByCreatedAtDesc(pageable)
        }

        logger.debug { "Found ${entries.totalElements} directory entries (status=$status, page=$page)" }
        return entries.map { AdminDirectoryEntryDto.fromEntity(it) }
    }

    /**
     * Gets a single directory entry by ID (admin view with moderation fields).
     *
     * @param id UUID of the directory entry
     * @return AdminDirectoryEntryDto
     * @throws ResourceNotFoundException if entry is not found
     */
    @Transactional(readOnly = true)
    fun getAdminEntry(id: UUID): AdminDirectoryEntryDto {
        val entry = repository.findById(id).orElseThrow {
            ResourceNotFoundException("Directory entry not found: $id")
        }
        return AdminDirectoryEntryDto.fromEntity(entry)
    }

    /**
     * Updates the status of a directory entry.
     *
     * <p>Allows admins to change entry lifecycle status with optional notes.</p>
     *
     * @param id UUID of the directory entry
     * @param status New status
     * @param adminNotes Optional notes explaining the decision
     * @param reviewedBy User ID of the admin performing the review
     * @return Updated AdminDirectoryEntryDto
     * @throws ResourceNotFoundException if entry is not found
     */
    @Transactional
    fun updateEntryStatus(
        id: UUID,
        status: DirectoryEntryStatus,
        adminNotes: String?,
        reviewedBy: String,
    ): AdminDirectoryEntryDto {
        val entry = repository.findById(id).orElseThrow {
            ResourceNotFoundException("Directory entry not found: $id")
        }

        logger.info { "Updating directory entry $id status from ${entry.status} to $status" }

        entry.status = status
        entry.adminNotes = adminNotes
        entry.reviewedBy = reviewedBy
        entry.reviewedAt = Instant.now()

        val saved = repository.save(entry)

        // If entry is being published, trigger cache revalidation
        if (status == DirectoryEntryStatus.PUBLISHED) {
            revalidationService.revalidateDirectoryEntry(
                category = saved.getCategoryValue(),
                slug = saved.slug,
            )
        }

        return AdminDirectoryEntryDto.fromEntity(saved)
    }

    /**
     * Counts directory entries by status.
     *
     * <p>Used for dashboard pending counts.</p>
     *
     * @param status Directory entry status to count
     * @return Number of entries with the specified status
     */
    @Transactional(readOnly = true)
    fun countByStatus(status: DirectoryEntryStatus): Long = repository.countByStatus(status)
}
