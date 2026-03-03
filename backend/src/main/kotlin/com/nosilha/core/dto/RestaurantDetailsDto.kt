package com.nosilha.core.dto

/**
 * DTO for carrying restaurant-specific details.
 *
 * @param phoneNumber The contact phone number.
 * @param openingHours A string describing the hours of operation.
 * @param cuisine A list of cuisine types offered (e.g., ["Cape Verdean", "Seafood"]).
 */
data class RestaurantDetailsDto(
  val phoneNumber: String,
  val openingHours: String,
  val cuisine: List<String>
) : DetailsDto