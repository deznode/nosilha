package com.nosilha.core.dto

/**
 * DTO for carrying hotel-specific details.
 *
 * @param amenities A list of amenities offered (e.g., ["Wi-Fi", "Pool"]).
 */
data class HotelDetailsDto(
    val amenities: List<String>,
) : DetailsDto
