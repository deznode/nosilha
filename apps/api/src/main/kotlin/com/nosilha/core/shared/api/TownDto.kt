package com.nosilha.core.shared.api

import com.fasterxml.jackson.annotation.JsonFormat
import java.time.LocalDateTime
import java.util.*

/**
 * DTO for a Town entity representing geographic/administrative information
 * about towns and villages on Brava Island.
 *
 * Towns are separate from DirectoryEntry entities as they represent geographic
 * containers rather than visitable businesses/attractions.
 */
data class TownDto(
    val id: UUID,
    val name: String,
    val slug: String,
    val description: String,
    val latitude: Double,
    val longitude: Double,
    val population: String?,
    val elevation: String?,
    val founded: String?,
    val highlights: List<String>,
    val heroImage: String?,
    val gallery: List<String>,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    val createdAt: LocalDateTime,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    val updatedAt: LocalDateTime,
)
