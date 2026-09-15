package com.nosilha.core.places.domain

import com.github.benmanes.caffeine.cache.Cache
import com.github.benmanes.caffeine.cache.Caffeine
import com.nosilha.core.places.api.AdminDirectoryEntryDto
import com.nosilha.core.places.api.CreateDirectoryEntrySubmissionRequest
import com.nosilha.core.places.api.DirectoryEntrySubmissionConfirmationDto
import com.nosilha.core.places.repository.DirectoryEntryRepository
import com.nosilha.core.places.repository.TownRepository
import com.nosilha.core.shared.api.CoincidentRefDto
import com.nosilha.core.shared.api.CreateEntryRequestDto
import com.nosilha.core.shared.api.CreateHotelDetailsDto
import com.nosilha.core.shared.api.CreateRestaurantDetailsDto
import com.nosilha.core.shared.api.DirectoryEntryDto
import com.nosilha.core.shared.events.DirectoryEntryCreatedEvent
import com.nosilha.core.shared.events.DirectoryEntryDeletedEvent
import com.nosilha.core.shared.events.DirectoryEntryUpdatedEvent
import com.nosilha.core.shared.events.EntryImageSubmittedEvent
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
    private val townRepository: TownRepository,
    private val eventPublisher: ApplicationEventPublisher,
    private val revalidationService: FrontendRevalidationService,
    private val heroImageResolver: HeroImageResolver,
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
     * <p>An image URL in the request becomes the entry's hero in the gallery module once this
     * transaction commits, so the returned DTO does not show it yet (spec 034 FR-023).</p>
     *
     * @param request The DTO containing all necessary data for the new entry.
     * @return The DTO of the newly created and saved entry.
     * @throws IllegalArgumentException if the category in the request is invalid.
     */
    @Transactional
    fun createEntry(request: CreateEntryRequestDto): DirectoryEntryDto {
        val newEntry = createEntityForCategory(request.category)

        // Apply category-specific details
        when (newEntry) {
            is Restaurant -> {
                val restaurantDetails = request.details as? CreateRestaurantDetailsDto
                newEntry.phoneNumber = restaurantDetails?.phoneNumber
                newEntry.openingHours = restaurantDetails?.openingHours
                newEntry.cuisine = restaurantDetails?.cuisine?.joinToString(",")
            }
            is Hotel -> {
                val hotelDetails = request.details as? CreateHotelDetailsDto
                newEntry.phoneNumber = hotelDetails?.phoneNumber
                newEntry.amenities = hotelDetails?.amenities?.joinToString(",")
            }
        }

        newEntry.applyHeritageFields(request)

        newEntry.apply {
            this.name = request.name
            this.description = request.description
            this.town = request.town
            this.townId = resolveTownId(request.town)
            this.latitude = request.latitude
            this.longitude = request.longitude
            this.tags = request.tags?.joinToString(",")
            this.contentActions =
                request.contentActions?.let {
                    metadataObjectMapper.writeValueAsString(it)
                }
            this.slug = generateSlugFromName(request.name)
        }

        val savedEntry = repository.save(newEntry)

        eventPublisher.publishEvent(
            DirectoryEntryCreatedEvent(
                entryId = savedEntry.id!!,
                category = savedEntry.getCategoryValue(),
                name = savedEntry.name,
            ),
        )

        if (!request.imageUrl.isNullOrBlank()) submitImage(savedEntry, request.imageUrl)

        return savedEntry.toDtoWithHero()
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
        toDtos(repository.findByStatus(DirectoryEntryStatus.PUBLISHED, Pageable.unpaged()).content)

    /**
     * Retrieves PUBLISHED directory entries with pagination support.
     *
     * @param pageable Pagination parameters (page, size, sort)
     * @return A page of [DirectoryEntryDto] representing the requested published entries.
     */
    fun getEntriesPage(pageable: Pageable): Page<DirectoryEntryDto> =
        toDtoPage(repository.findByStatus(DirectoryEntryStatus.PUBLISHED, pageable))

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
    ): Page<DirectoryEntryDto> = toDtoPage(repository.findByStatusAndCategoryIgnoreCase(DirectoryEntryStatus.PUBLISHED, category, pageable))

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
    ): Page<DirectoryEntryDto> = toDtoPage(repository.findByStatusAndTownIgnoreCase(DirectoryEntryStatus.PUBLISHED, town, pageable))

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
        toDtoPage(
            repository.findByStatusAndCategoryIgnoreCaseAndTownIgnoreCase(
                DirectoryEntryStatus.PUBLISHED,
                category,
                town,
                pageable,
            ),
        )

    /**
     * Retrieves all PUBLISHED directory entries of a specific category and maps them to DTOs.
     *
     * @param category The category to filter by (e.g., "Restaurant", "Hotel").
     * @return A list of [DirectoryEntryDto] for the given category.
     */
    fun getEntriesByCategory(category: String): List<DirectoryEntryDto> =
        toDtos(repository.findByStatusAndCategoryIgnoreCase(DirectoryEntryStatus.PUBLISHED, category, Pageable.unpaged()).content)

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
            .orElseThrow { ResourceNotFoundException("Directory entry with ID '$id' not found.") }
            .toDtoWithHero()

    /**
     * Lists PUBLISHED entries in a settlement by its canonical id.
     *
     * Preferred over [getEntriesByTownPage]: matching on a UUID removes the accent and
     * case hazards the free-text town column carries (spec 033 FR-001).
     */
    fun getEntriesByTownIdPage(
        townId: UUID,
        pageable: Pageable,
    ): Page<DirectoryEntryDto> = toDtoPage(repository.findByStatusAndTownId(DirectoryEntryStatus.PUBLISHED, townId, pageable))

    /** Lists all PUBLISHED entries in a settlement, unpaged, for the settlement detail page. */
    fun getEntriesByTownId(townId: UUID): List<DirectoryEntryDto> =
        toDtos(repository.findByStatusAndTownIdOrderByNameAsc(DirectoryEntryStatus.PUBLISHED, townId))

    /**
     * Finds a single directory entry by its unique slug.
     *
     * @param slug The unique slug of the entry to find.
     * @return The corresponding [DirectoryEntryDto].
     * @throws ResourceNotFoundException if no entry with the given slug exists.
     */
    fun getEntryBySlug(slug: String): DirectoryEntryDto {
        val entry = repository.findBySlug(slug)
            ?: throw ResourceNotFoundException("Directory entry with slug '$slug' not found.")
        return entry.toDtoWithHero(coincidentWith = entry.findCoincidentRef())
    }

    /**
     * Looks up another record sharing this one's exact coordinates.
     *
     * Only called on the detail path — list views would pay a query per row for a note
     * they do not render. Returns the first match; the archive holds exactly one such
     * pair today, and showing one neighbour is enough to state the duplication.
     */
    private fun DirectoryEntry.findCoincidentRef(): CoincidentRefDto? {
        val entryId = this.id ?: return null
        return repository
            .findByLatitudeAndLongitudeAndIdNot(latitude, longitude, entryId)
            .firstOrNull()
            ?.toCoincidentRef()
    }

    /**
     * Updates an existing directory entry.
     *
     * <p>Publishes {@link DirectoryEntryUpdatedEvent} after successful update.</p>
     *
     * <p>The request's image URL replaces the entry's hero, and a null or blank one removes it,
     * once this transaction commits (spec 034 FR-023).</p>
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

        val newSlug = generateSlugFromName(request.name)

        if (newSlug != existingEntry.slug && repository.findBySlug(newSlug) != null) {
            throw BusinessException("A directory entry with slug '$newSlug' already exists.")
        }

        existingEntry.apply {
            name = request.name
            slug = newSlug
            description = request.description
            town = request.town
            townId = resolveTownId(request.town)
            latitude = request.latitude
            longitude = request.longitude
            tags = request.tags?.joinToString(",")
            contentActions =
                request.contentActions?.let {
                    metadataObjectMapper.writeValueAsString(it)
                }
        }

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
        }

        existingEntry.applyHeritageFields(request)

        val updatedEntry = repository.save(existingEntry)

        eventPublisher.publishEvent(
            DirectoryEntryUpdatedEvent(
                entryId = updatedEntry.id!!,
                category = updatedEntry.getCategoryValue(),
            ),
        )

        submitImage(updatedEntry, request.imageUrl)

        return updatedEntry.toDtoWithHero()
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

        eventPublisher.publishEvent(
            DirectoryEntryDeletedEvent(entryId = id),
        )
    }

    /**
     * Refreshes an entry's cached pages when an admin promotes a gallery image to its hero.
     *
     * <p>The hero lives in the gallery module (spec 034 FR-023, ADR-001), so there is nothing
     * to store here. If the entry is gone, the event is logged and dropped.</p>
     *
     * @param event The HeroImagePromotedEvent naming the entry and its new hero
     */
    @ApplicationModuleListener
    fun onHeroImagePromoted(event: HeroImagePromotedEvent) {
        logger.info { "Received HeroImagePromotedEvent for entry ${event.entryId}, media ${event.mediaId}" }

        val entry = repository.findById(event.entryId).orElse(null)
        if (entry == null) {
            logger.warn { "Directory entry not found for hero image promotion: ${event.entryId}" }
            return
        }

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
        userId: UUID,
        ipAddress: String?,
    ): DirectoryEntrySubmissionConfirmationDto {
        logger.info { "Processing directory submission from user: $userId, IP: $ipAddress" }

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

        val sanitizedName = ContentSanitizer.sanitizeStrict(request.name.trim())
        val sanitizedDescription = ContentSanitizer.sanitize(request.description.trim())
        val sanitizedTags = request.tags.map { ContentSanitizer.sanitizeStrict(it.trim()) }

        val newEntry = createEntityForCategory(request.category)

        val baseSlug = generateSlugFromName(sanitizedName)

        newEntry.apply {
            this.name = sanitizedName
            this.slug = "$baseSlug-${UUID.randomUUID().toString().substring(0, 8)}"
            this.description = sanitizedDescription
            this.town = request.customTown?.trim() ?: request.town.trim()
            this.townId = resolveTownId(this.town)
            this.latitude = request.latitude?.toDouble() ?: 0.0
            this.longitude = request.longitude?.toDouble() ?: 0.0
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

        // A submitted image waits for review, like the entry itself (spec 034 FR-023)
        if (!request.imageUrl.isNullOrBlank()) submitImage(savedEntry, request.imageUrl)

        return DirectoryEntrySubmissionConfirmationDto(
            id = savedEntry.id!!,
            name = savedEntry.name,
            status = savedEntry.status.name,
        )
    }

    // =====================================================
    // HERO IMAGES (owned by the gallery module)
    // =====================================================

    /**
     * Maps entries to DTOs, resolving every entry's hero in one gallery query.
     *
     * <p>Every entry read maps through here, [toDtoPage] or [toDtoWithHero]. An entry stores no
     * image, and resolving heroes entry by entry would query once per row (spec 034 FR-023).</p>
     */
    fun toDtos(entries: List<DirectoryEntry>): List<DirectoryEntryDto> {
        val heroes = heroImageResolver.resolve(entries)
        return entries.map { it.toDto(heroes[it.id]) }
    }

    /** [toDtos] for a page of entries. */
    fun toDtoPage(page: Page<DirectoryEntry>): Page<DirectoryEntryDto> {
        val heroes = heroImageResolver.resolve(page.content)
        return page.map { it.toDto(heroes[it.id]) }
    }

    private fun DirectoryEntry.toDtoWithHero(coincidentWith: CoincidentRefDto? = null): DirectoryEntryDto =
        toDto(heroImageResolver.resolve(listOf(this))[id], coincidentWith)

    /** A moderator sees a hero awaiting review or flagged, so editing the entry keeps it. */
    private fun DirectoryEntry.toAdminDto(): AdminDirectoryEntryDto =
        AdminDirectoryEntryDto.fromEntity(this, heroImageResolver.resolve(listOf(this), forModeration = true)[id])

    /**
     * Hands an entry write's image to the gallery module, which owns heroes (ADR-001).
     *
     * <p>A null or blank URL removes the hero. The gallery writes the hero after this
     * transaction commits.</p>
     */
    private fun submitImage(
        entry: DirectoryEntry,
        imageUrl: String?,
    ) {
        eventPublisher.publishEvent(
            EntryImageSubmittedEvent(
                entryId = entry.id!!,
                imageUrl = imageUrl?.takeIf { it.isNotBlank() },
                entryPublished = entry.status == DirectoryEntryStatus.PUBLISHED,
            ),
        )
    }

    /**
     * Copies the heritage fields from a create or update request onto a category that may
     * carry them. For any other category the request's values are ignored and existing
     * values are left alone (spec 034 FR-016).
     */
    private fun DirectoryEntry.applyHeritageFields(request: CreateEntryRequestDto) {
        if (supports(PracticalField.ESTABLISHED)) established = request.established
        if (supports(PracticalField.CONDITION_STATUS)) conditionStatus = request.conditionStatus
        if (supports(PracticalField.FESTIVAL)) festival = request.festival
        if (supports(PracticalField.ARCHITECT)) architect = request.architect
    }

    /**
     * Resolves a free-text settlement name to its canonical `towns` row.
     *
     * <p>Mirrors the backfill predicate so an entry created through the API links the
     * same way the migration would have linked it. Returns null for a name no
     * settlement covers — that entry keeps its free-text `town` and `custom_town`, and
     * is exactly what `town_backfill_exceptions` is there to surface (spec 033
     * FR-001).</p>
     */
    private fun resolveTownId(townName: String): UUID? = townRepository.findByNameIgnoringCaseAndAccents(townName)?.id

    /**
     * Creates the correct DirectoryEntry subclass for a given category name.
     * Accepts any case (e.g., "Restaurant", "RESTAURANT", "restaurant").
     */
    private fun createEntityForCategory(category: String): DirectoryEntry =
        when (category.lowercase()) {
            "restaurant" -> Restaurant()
            "hotel" -> Hotel()
            "beach" -> Beach()
            "heritage" -> Heritage()
            "nature" -> Nature()
            "viewpoint" -> Viewpoint()
            "trail" -> Trail()
            "church" -> Church()
            "port" -> Port()
            else -> throw IllegalArgumentException("Invalid category: $category")
        }

    /**
     * Generates a URL-friendly slug from a name.
     *
     * Converts to lowercase, replaces whitespace with hyphens, and removes
     * non-alphanumeric characters (except hyphens).
     */
    private fun generateSlugFromName(name: String): String =
        name
            .lowercase()
            .replace(Regex("\\s+"), "-")
            .replace(Regex("[^a-z0-9-]"), "")

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
        val heroes = heroImageResolver.resolve(entries.content, forModeration = true)
        return entries.map { AdminDirectoryEntryDto.fromEntity(it, heroes[it.id]) }
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
        return entry.toAdminDto()
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
        reviewedBy: UUID,
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

        if (status == DirectoryEntryStatus.PUBLISHED) {
            revalidationService.revalidateDirectoryEntry(
                category = saved.getCategoryValue(),
                slug = saved.slug,
            )
        }

        return saved.toAdminDto()
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
