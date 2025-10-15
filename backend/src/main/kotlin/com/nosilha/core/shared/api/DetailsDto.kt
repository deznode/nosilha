package com.nosilha.core.shared.api

import com.fasterxml.jackson.annotation.JsonTypeName

/**
 * Sealed interface for category-specific details.
 * The category discriminator is handled at the parent DirectoryEntry level,
 * so details objects contain only their specific data without redundant type information.
 */
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
