package com.nosilha.core.directory.domain

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.nosilha.core.directory.repository.DirectoryEntryRepository
import com.nosilha.core.shared.api.CreateEntryRequestDto
import com.nosilha.core.shared.api.CreateHotelDetailsDto
import com.nosilha.core.shared.api.CreateRestaurantDetailsDto
import com.nosilha.core.shared.api.DirectoryEntryDto
import com.nosilha.core.shared.events.DirectoryEntryCreatedEvent
import com.nosilha.core.shared.events.DirectoryEntryDeletedEvent
import com.nosilha.core.shared.events.DirectoryEntryUpdatedEvent
import com.nosilha.core.shared.exception.BusinessException
import com.nosilha.core.shared.exception.ResourceNotFoundException
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

/**
 * Service class for handling business logic related to directory entries.
 *
 * <p>This service acts as an intermediary between the controller and the repository,
 * orchestrating data retrieval, transformation from entities to DTOs, and publishing
 * domain events for cross-module communication.</p>
 *
 * @param repository The repository for accessing directory entry data
 * @param eventPublisher Spring event publisher for module events
 */
@Service
class DirectoryEntryService(
    private val repository: DirectoryEntryRepository,
    private val eventPublisher: ApplicationEventPublisher,
) {
    private val metadataObjectMapper = jacksonObjectMapper()

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
                "Landmark" -> Landmark()
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
                request.name.lowercase()
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

    /**
     * Retrieves all directory entries from the database and maps them to DTOs.
     *
     * @return A list of [DirectoryEntryDto] representing all entries.
     */
    fun getAllEntries(): List<DirectoryEntryDto> {
        return repository.findAll().map { it.toDto() }
    }

    /**
     * Retrieves directory entries with pagination support.
     *
     * @param pageable Pagination parameters (page, size, sort)
     * @return A page of [DirectoryEntryDto] representing the requested entries.
     */
    fun getEntriesPage(pageable: Pageable): Page<DirectoryEntryDto> {
        return repository.findAll(pageable).map { it.toDto() }
    }

    /**
     * Retrieves directory entries filtered by category with pagination support.
     *
     * @param category The category to filter by (e.g., "Restaurant", "Hotel")
     * @param pageable Pagination parameters (page, size, sort)
     * @return A page of [DirectoryEntryDto] for the given category.
     */
    fun getEntriesByCategoryPage(
        category: String,
        pageable: Pageable,
    ): Page<DirectoryEntryDto> {
        return repository.findByCategoryIgnoreCase(category, pageable).map { it.toDto() }
    }

    /**
     * Retrieves directory entries filtered by town with pagination support.
     *
     * @param town The town to filter by
     * @param pageable Pagination parameters (page, size, sort)
     * @return A page of [DirectoryEntryDto] for the given town.
     */
    fun getEntriesByTownPage(
        town: String,
        pageable: Pageable,
    ): Page<DirectoryEntryDto> {
        return repository.findByTownIgnoreCase(town, pageable).map { it.toDto() }
    }

    /**
     * Retrieves directory entries filtered by both category and town with pagination support.
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
    ): Page<DirectoryEntryDto> {
        return repository.findByCategoryIgnoreCaseAndTownIgnoreCase(category, town, pageable).map { it.toDto() }
    }

    /**
     * Retrieves all directory entries of a specific category and maps them to DTOs.
     *
     * @param category The category to filter by (e.g., "Restaurant", "Hotel").
     * @return A list of [DirectoryEntryDto] for the given category.
     */
    fun getEntriesByCategory(category: String): List<DirectoryEntryDto> {
        return repository.findByCategoryIgnoreCase(category).map { it.toDto() }
    }

    /**
     * Finds a single directory entry by its unique ID.
     *
     * @param id The UUID of the entry to find.
     * @return The corresponding [DirectoryEntryDto].
     * @throws ResourceNotFoundException if no entry with the given ID exists.
     */
    fun getEntryById(id: UUID): DirectoryEntryDto {
        return repository.findById(id)
            .map { it.toDto() }
            .orElseThrow { ResourceNotFoundException("Directory entry with ID '$id' not found.") }
    }

    /**
     * Finds a single directory entry by its unique slug.
     *
     * @param slug The unique slug of the entry to find.
     * @return The corresponding [DirectoryEntryDto].
     * @throws ResourceNotFoundException if no entry with the given slug exists.
     */
    fun getEntryBySlug(slug: String): DirectoryEntryDto {
        return repository.findBySlug(slug)?.toDto()
            ?: throw ResourceNotFoundException("Directory entry with slug '$slug' not found.")
    }

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
            repository.findById(id)
                .orElseThrow { ResourceNotFoundException("Directory entry with ID '$id' not found.") }

        // Check if slug is being changed and if it would create a duplicate
        val newSlug =
            request.name.lowercase()
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
            // Beach and Landmark don't have specific fields to update
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
}
