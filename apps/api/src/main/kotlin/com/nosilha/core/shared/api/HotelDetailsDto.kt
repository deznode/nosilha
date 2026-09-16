package com.nosilha.core.shared.api

/**
 * DTO for carrying hotel-specific details.
 *
 * @param amenities A list of amenities offered (e.g., ["Wi-Fi", "Pool"]).
 * @param openingHours when a visitor can check in, as recorded. Accommodation is
 *   opening-hours eligible in [FieldGuard], so the place record's field grid counts it
 *   and must be able to show it (spec 034 FR-013).
 */
data class HotelDetailsDto(
    val amenities: List<String>,
    val openingHours: String?,
) : DetailsDto
