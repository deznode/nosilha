package com.nosilha.core.directory.domain

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.nosilha.core.shared.api.BeachDto
import com.nosilha.core.shared.api.DirectoryEntryDto
import com.nosilha.core.shared.api.HotelDetailsDto
import com.nosilha.core.shared.api.HotelDto
import com.nosilha.core.shared.api.LandmarkDto
import com.nosilha.core.shared.api.RestaurantDetailsDto
import com.nosilha.core.shared.api.RestaurantDto
import com.nosilha.core.shared.api.TownDto

/**
 * Maps a DirectoryEntry JPA entity to its corresponding public-facing DTO.
 *
 * This extension function handles the polymorphic nature of the DirectoryEntry hierarchy,
 * ensuring that each subclass (Restaurant, Hotel, etc.) is converted to the correct
 * DTO representation (RestaurantDto, HotelDto, etc.).
 *
 * @receiver The DirectoryEntry entity instance to map.
 * @return The corresponding DirectoryEntryDto for the entity.
 * @throws IllegalStateException if the entity's ID is null, as DTOs are meant for persisted entities.
 */
fun DirectoryEntry.toDto(): DirectoryEntryDto {
    // A persisted entity must have an ID. Throw an exception if it's null, as this indicates a logical error.
    val entityId =
        this.id ?: throw IllegalStateException("Cannot map an entity with a null ID to a DTO.")

    return when (this) {
        is Restaurant ->
            RestaurantDto(
                id = entityId,
                name = this.name,
                slug = this.slug,
                description = this.description,
                town = this.town,
                latitude = this.latitude,
                longitude = this.longitude,
                imageUrl = this.imageUrl,
                rating = this.rating,
                reviewCount = this.reviewCount,
                createdAt = this.createdAt,
                updatedAt = this.updatedAt,
                details =
                    RestaurantDetailsDto(
                        phoneNumber = this.phoneNumber ?: "",
                        openingHours = this.openingHours ?: "",
                        cuisine =
                            this.cuisine?.split(',')?.map { it.trim() }?.filter { it.isNotBlank() }
                                ?: emptyList(),
                    ),
            )

        is Hotel ->
            HotelDto(
                id = entityId,
                name = this.name,
                slug = this.slug,
                description = this.description,
                town = this.town,
                latitude = this.latitude,
                longitude = this.longitude,
                imageUrl = this.imageUrl,
                rating = this.rating,
                reviewCount = this.reviewCount,
                createdAt = this.createdAt,
                updatedAt = this.updatedAt,
                details =
                    HotelDetailsDto(
                        amenities =
                            this.amenities?.split(',')?.map { it.trim() }?.filter { it.isNotBlank() }
                                ?: emptyList(),
                    ),
            )

        is Beach ->
            BeachDto(
                id = entityId,
                name = this.name,
                slug = this.slug,
                description = this.description,
                town = this.town,
                latitude = this.latitude,
                longitude = this.longitude,
                imageUrl = this.imageUrl,
                rating = this.rating,
                reviewCount = this.reviewCount,
                createdAt = this.createdAt,
                updatedAt = this.updatedAt,
                // The `details` field is null by default in the BeachDto constructor.
            )

        is Landmark ->
            LandmarkDto(
                id = entityId,
                name = this.name,
                slug = this.slug,
                description = this.description,
                town = this.town,
                latitude = this.latitude,
                longitude = this.longitude,
                imageUrl = this.imageUrl,
                rating = this.rating,
                reviewCount = this.reviewCount,
                createdAt = this.createdAt,
                updatedAt = this.updatedAt,
                // The `details` field is null by default in the LandmarkDto constructor.
            )

        else -> throw IllegalStateException("Unsupported or unknown DirectoryEntry type: ${this::class.simpleName}")
    }
}

/**
 * Maps a Town JPA entity to its corresponding public-facing DTO.
 *
 * This extension function handles JSON parsing for highlights and gallery arrays,
 * ensuring proper conversion from stored JSON strings to List<String> for the DTO.
 *
 * @receiver The Town entity instance to map.
 * @return The corresponding TownDto for the entity.
 * @throws IllegalStateException if the entity's ID is null, as DTOs are meant for persisted entities.
 */
fun Town.toDto(): TownDto {
    // A persisted entity must have an ID. Throw an exception if it's null, as this indicates a logical error.
    val entityId = this.id ?: throw IllegalStateException("Cannot map an entity with a null ID to a DTO.")

    val objectMapper = jacksonObjectMapper()

    // Parse JSON arrays safely, defaulting to empty lists if null or invalid
    val highlightsList =
        try {
            this.highlights?.let { objectMapper.readValue<List<String>>(it) } ?: emptyList()
        } catch (e: com.fasterxml.jackson.core.JsonProcessingException) {
            // Log the error and return empty list as fallback
            println("Failed to parse highlights JSON for town ${this.name}: ${e.message}")
            emptyList<String>()
        }

    val galleryList =
        try {
            this.gallery?.let { objectMapper.readValue<List<String>>(it) } ?: emptyList()
        } catch (e: com.fasterxml.jackson.core.JsonProcessingException) {
            // Log the error and return empty list as fallback
            println("Failed to parse gallery JSON for town ${this.name}: ${e.message}")
            emptyList<String>()
        }

    return TownDto(
        id = entityId,
        name = this.name,
        slug = this.slug,
        description = this.description,
        latitude = this.latitude,
        longitude = this.longitude,
        population = this.population,
        elevation = this.elevation,
        founded = this.founded,
        highlights = highlightsList,
        heroImage = this.heroImage,
        gallery = galleryList,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
    )
}

/**
 * Returns the category value for this DirectoryEntry using polymorphic type checking.
 *
 * This approach is preferred over accessing the discriminator field directly as it:
 * - Avoids lateinit initialization issues with the discriminator column
 * - Leverages Kotlin's polymorphic when expressions for type safety
 * - Decouples business logic from database schema details
 * - Provides consistent behavior regardless of entity state (transient vs persisted)
 *
 * @receiver The DirectoryEntry instance to get the category value for.
 * @return The category string corresponding to the entity's runtime type.
 * @throws IllegalStateException if the entity type is not a known DirectoryEntry subclass.
 */
fun DirectoryEntry.getCategoryValue(): String =
    when (this) {
        is Restaurant -> "Restaurant"
        is Hotel -> "Hotel"
        is Beach -> "Beach"
        is Landmark -> "Landmark"
        else -> throw IllegalStateException("Unknown DirectoryEntry type: ${this::class.simpleName}")
    }
