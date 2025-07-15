package com.nosilha.core.dto

/**
 * DTO for creating a new directory entry. It contains core fields
 * and category-specific details in a structured object.
 */
data class CreateEntryRequestDto(
    val name: String,
    val description: String,
    val category: String, // e.g., "Restaurant", "Hotel", "Beach", "Landmark"
    val town: String,
    val latitude: Double,
    val longitude: Double,
    val imageUrl: String?,
    val details: DetailsDto?, // Category-specific details object
)
