package com.nosilha.core.dto

/**
 * DTO for creating a new directory entry. It contains all possible fields
 * for any entry type. Fields specific to a category are nullable.
 */
data class CreateEntryRequestDto(
  val name: String,
  val description: String,
  val category: String, // e.g., "Restaurant", "Hotel", "Beach", "Landmark"
  val town: String,
  val latitude: Double,
  val longitude: Double,
  val imageUrl: String?,

  // Restaurant-specific fields
  val phoneNumber: String?,
  val openingHours: String?,
  val cuisine: String?, // Expected as a comma-separated string, e.g., "Cape Verdean,Seafood"

  // Hotel-specific fields
  val amenities: String? // Expected as a comma-separated string, e.g., "Wi-Fi,Pool"
)