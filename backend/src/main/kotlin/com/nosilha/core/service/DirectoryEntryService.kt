package com.nosilha.core.service

import com.nosilha.core.domain.Beach
import com.nosilha.core.domain.Hotel
import com.nosilha.core.domain.Landmark
import com.nosilha.core.domain.Restaurant
import com.nosilha.core.dto.CreateEntryRequestDto
import com.nosilha.core.dto.CreateRestaurantDetailsDto
import com.nosilha.core.dto.CreateHotelDetailsDto
import com.nosilha.core.dto.DirectoryEntryDto
import com.nosilha.core.dto.toDto
import com.nosilha.core.exception.ResourceNotFoundException
import com.nosilha.core.repository.jpa.DirectoryEntryRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

/**
 * Service class for handling business logic related to directory entries.
 *
 * This service acts as an intermediary between the controller and the repository,
 * orchestrating data retrieval and transformation from entities to DTOs.
 *
 * @param repository The repository for accessing directory entry data.
 */
@Service
class DirectoryEntryService(
    private val repository: DirectoryEntryRepository,
) {
    /**
     * Creates a new directory entry based on the provided request data.
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
            // Generate a simple, URL-friendly slug
            this.slug =
                request.name.lowercase()
                    .replace(Regex("\\s+"), "-") // Replace spaces with hyphens
                    .replace(Regex("[^a-z0-9-]$"), "") // Remove non-alphanumeric characters (except hyphens)
        }

        val savedEntry = repository.save(newEntry)
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
}
