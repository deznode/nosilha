package com.nosilha.core.shared.api

/**
 * DTO for creating a new directory entry. It contains core fields
 * and category-specific details in a structured object.
 *
 * The heritage fields are top-level rather than a details subtype: [DetailsDto] carries
 * no type information to deserialize by. They are stored only for categories that may
 * carry them (Heritage and Church), per `FieldGuard` (spec 034 FR-016).
 */
data class CreateEntryRequestDto(
    val name: String,
    val description: String,
    val category: String, // e.g., "Restaurant", "Hotel", "Beach", "Landmark"
    val town: String,
    val latitude: Double,
    val longitude: Double,
    val imageUrl: String?,
    val tags: List<String>? = null,
    val contentActions: ContentActionSettingsDto? = null,
    val details: DetailsDto? = null, // Category-specific details object
    val established: String? = null,
    val conditionStatus: String? = null,
    val festival: String? = null,
    val architect: String? = null,
)
