package com.nosilha.core.directory.domain

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.nosilha.core.shared.api.TownDto
import com.nosilha.core.shared.exception.ResourceNotFoundException
import com.nosilha.core.directory.repository.TownRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

/**
 * Service class for handling business logic related to town entities.
 *
 * This service acts as an intermediary between the controller and the repository,
 * orchestrating data retrieval and transformation from Town entities to DTOs.
 * It handles JSON serialization for highlights and gallery arrays.
 *
 * @param repository The repository for accessing town data.
 */
@Service
class TownService(
    private val repository: TownRepository,
) {
    private val objectMapper = jacksonObjectMapper()

    /**
     * Retrieves all towns from the database and maps them to DTOs, ordered by name.
     *
     * @return A list of [TownDto] representing all towns ordered by name.
     */
    fun getAllTowns(): List<TownDto> {
        return repository.findAllByOrderByNameAsc().map { it.toDto() }
    }

    /**
     * Retrieves towns with pagination support.
     *
     * @param pageable Pagination parameters (page, size, sort)
     * @return A page of [TownDto] representing the requested towns.
     */
    fun getTownsPage(pageable: Pageable): Page<TownDto> {
        return repository.findAll(pageable).map { it.toDto() }
    }

    /**
     * Finds a single town by its unique ID.
     *
     * @param id The UUID of the town to find.
     * @return The corresponding [TownDto].
     * @throws ResourceNotFoundException if no town with the given ID exists.
     */
    fun getTownById(id: UUID): TownDto {
        return repository.findById(id)
            .map { it.toDto() }
            .orElseThrow { ResourceNotFoundException("Town with ID '$id' not found.") }
    }

    /**
     * Finds a single town by its unique slug.
     *
     * @param slug The unique slug of the town to find.
     * @return The corresponding [TownDto].
     * @throws ResourceNotFoundException if no town with the given slug exists.
     */
    fun getTownBySlug(slug: String): TownDto {
        return repository.findBySlug(slug)?.toDto()
            ?: throw ResourceNotFoundException("Town with slug '$slug' not found.")
    }

    /**
     * Creates a new town entity.
     *
     * @param name The name of the town.
     * @param description A description of the town.
     * @param latitude The latitude coordinate.
     * @param longitude The longitude coordinate.
     * @param population The population information (optional).
     * @param elevation The elevation information (optional).
     * @param founded The founding information (optional).
     * @param highlights List of highlights for the town (optional).
     * @param heroImage The hero image URL (optional).
     * @param gallery List of gallery image URLs (optional).
     * @return The [TownDto] of the newly created town.
     */
    @Transactional
    fun createTown(
        name: String,
        description: String,
        latitude: Double,
        longitude: Double,
        population: String? = null,
        elevation: String? = null,
        founded: String? = null,
        highlights: List<String> = emptyList(),
        heroImage: String? = null,
        gallery: List<String> = emptyList()
    ): TownDto {
        val town = Town().apply {
            this.name = name
            this.description = description
            this.latitude = latitude
            this.longitude = longitude
            this.population = population
            this.elevation = elevation
            this.founded = founded
            this.heroImage = heroImage

            // Generate a simple, URL-friendly slug
            this.slug = name.lowercase()
                .replace(Regex("\\s+"), "-") // Replace spaces with hyphens
                .replace(Regex("[^a-z0-9-]"), "") // Remove non-alphanumeric characters (except hyphens)

            // Serialize arrays to JSON
            this.highlights = if (highlights.isNotEmpty()) {
                objectMapper.writeValueAsString(highlights)
            } else null

            this.gallery = if (gallery.isNotEmpty()) {
                objectMapper.writeValueAsString(gallery)
            } else null
        }

        val savedTown = repository.save(town)
        return savedTown.toDto()
    }

    /**
     * Updates an existing town entity.
     *
     * @param id The UUID of the town to update.
     * @param name The updated name.
     * @param description The updated description.
     * @param latitude The updated latitude.
     * @param longitude The updated longitude.
     * @param population The updated population information.
     * @param elevation The updated elevation information.
     * @param founded The updated founding information.
     * @param highlights The updated list of highlights.
     * @param heroImage The updated hero image URL.
     * @param gallery The updated list of gallery images.
     * @return The updated [TownDto].
     * @throws ResourceNotFoundException if no town with the given ID exists.
     */
    @Transactional
    fun updateTown(
        id: UUID,
        name: String,
        description: String,
        latitude: Double,
        longitude: Double,
        population: String? = null,
        elevation: String? = null,
        founded: String? = null,
        highlights: List<String> = emptyList(),
        heroImage: String? = null,
        gallery: List<String> = emptyList()
    ): TownDto {
        val existingTown = repository.findById(id)
            .orElseThrow { ResourceNotFoundException("Town with ID '$id' not found.") }

        existingTown.apply {
            this.name = name
            this.description = description
            this.latitude = latitude
            this.longitude = longitude
            this.population = population
            this.elevation = elevation
            this.founded = founded
            this.heroImage = heroImage

            // Update slug if name changed
            this.slug = name.lowercase()
                .replace(Regex("\\s+"), "-")
                .replace(Regex("[^a-z0-9-]"), "")

            // Update JSON arrays
            this.highlights = if (highlights.isNotEmpty()) {
                objectMapper.writeValueAsString(highlights)
            } else null

            this.gallery = if (gallery.isNotEmpty()) {
                objectMapper.writeValueAsString(gallery)
            } else null
        }

        val updatedTown = repository.save(existingTown)
        return updatedTown.toDto()
    }

    /**
     * Deletes a town by its ID.
     *
     * @param id The UUID of the town to delete.
     * @throws ResourceNotFoundException if no town with the given ID exists.
     */
    @Transactional
    fun deleteTown(id: UUID) {
        if (!repository.existsById(id)) {
            throw ResourceNotFoundException("Town with ID '$id' not found.")
        }
        repository.deleteById(id)
    }

    /**
     * Checks if a town with the given slug exists.
     *
     * @param slug The slug to check.
     * @return True if a town with this slug exists, false otherwise.
     */
    fun existsBySlug(slug: String): Boolean {
        return repository.existsBySlug(slug)
    }
}
