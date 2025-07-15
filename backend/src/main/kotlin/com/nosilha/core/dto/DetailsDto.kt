package com.nosilha.core.dto

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName

/**
 * Sealed interface for category-specific details with Jackson polymorphism support.
 * Uses Jackson's polymorphism annotations to handle proper JSON serialization/deserialization
 * based on a 'category' discriminator property for consistency with the parent DirectoryEntry.
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "category")
@JsonSubTypes(
    JsonSubTypes.Type(value = CreateRestaurantDetailsDto::class, name = "Restaurant"),
    JsonSubTypes.Type(value = CreateHotelDetailsDto::class, name = "Hotel"),
)
sealed interface DetailsDto

/**
 * DTO for creating restaurant-specific details.
 *
 * @param phoneNumber The contact phone number.
 * @param openingHours A string describing the hours of operation.
 * @param cuisine A list of cuisine types offered (e.g., ["Cape Verdean", "Seafood"]).
 */
@JsonTypeName("Restaurant")
data class CreateRestaurantDetailsDto(
    val phoneNumber: String?,
    val openingHours: String?,
    val cuisine: List<String>?,
) : DetailsDto

/**
 * DTO for creating hotel-specific details.
 *
 * @param phoneNumber The contact phone number.
 * @param amenities A list of amenities offered (e.g., ["Wi-Fi", "Pool"]).
 */
@JsonTypeName("Hotel")
data class CreateHotelDetailsDto(
    val phoneNumber: String?,
    val amenities: List<String>?,
) : DetailsDto
