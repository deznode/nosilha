package com.nosilha.core.dto

import com.nosilha.core.domain.Beach
import com.nosilha.core.domain.DirectoryEntry
import com.nosilha.core.domain.Hotel
import com.nosilha.core.domain.Landmark
import com.nosilha.core.domain.Restaurant
import java.lang.IllegalStateException

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
  val entityId = this.id ?: throw IllegalStateException("Cannot map an entity with a null ID to a DTO.")

  return when (this) {
    is Restaurant -> RestaurantDto(
      id = entityId,
      name = this.name,
      description = this.description,
      town = this.town,
      imageUrl = this.imageUrl,
      rating = this.rating,
      reviewCount = this.reviewCount,
      details = RestaurantDetailsDto(
        phoneNumber = this.phoneNumber ?: "",
        openingHours = this.openingHours ?: "",
        cuisine = this.cuisine?.split(',')?.map { it.trim() }?.filter { it.isNotBlank() } ?: emptyList()
      )
    )
    is Hotel -> HotelDto(
      id = entityId,
      name = this.name,
      description = this.description,
      town = this.town,
      imageUrl = this.imageUrl,
      rating = this.rating,
      reviewCount = this.reviewCount,
      details = HotelDetailsDto(
        amenities = this.amenities?.split(',')?.map { it.trim() }?.filter { it.isNotBlank() } ?: emptyList()
      )
    )
    is Beach -> BeachDto(
      id = entityId,
      name = this.name,
      description = this.description,
      town = this.town,
      imageUrl = this.imageUrl,
      rating = this.rating,
      reviewCount = this.reviewCount
      // The `details` field is null by default in the BeachDto constructor.
    )
    is Landmark -> LandmarkDto(
      id = entityId,
      name = this.name,
      description = this.description,
      town = this.town,
      imageUrl = this.imageUrl,
      rating = this.rating,
      reviewCount = this.reviewCount
      // The `details` field is null by default in the LandmarkDto constructor.
    )
  }
}