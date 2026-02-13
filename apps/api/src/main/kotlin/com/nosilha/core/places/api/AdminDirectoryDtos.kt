package com.nosilha.core.places.api

import com.nosilha.core.places.domain.DirectoryEntry
import com.nosilha.core.places.domain.DirectoryEntryStatus
import com.nosilha.core.places.domain.getCategoryValue
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

/**
 * DTO for admin directory entry listing and detail views.
 *
 * <p>Used in admin moderation queue to display entry information
 * and allow status updates with admin notes. Includes both public
 * directory entry data and moderation metadata.</p>
 */
data class AdminDirectoryEntryDto(
    val id: UUID,
    val name: String,
    val slug: String,
    val category: String,
    val town: String,
    val customTown: String?,
    val description: String,
    val tags: List<String>,
    val imageUrl: String?,
    val priceLevel: String?,
    val latitude: Double,
    val longitude: Double,
    val status: String,
    val submittedBy: String?,
    val submittedByEmail: String?,
    val submittedAt: Instant?,
    val adminNotes: String?,
    val reviewedBy: String?,
    val reviewedAt: Instant?,
    val createdAt: Instant?,
    val updatedAt: Instant?,
) {
    companion object {
        /**
         * Maps a DirectoryEntry entity to AdminDirectoryEntryDto.
         */
        fun fromEntity(entity: DirectoryEntry): AdminDirectoryEntryDto =
            AdminDirectoryEntryDto(
                id = entity.id!!,
                name = entity.name,
                slug = entity.slug,
                category = entity.getCategoryValue(),
                town = entity.town,
                customTown = entity.customTown,
                description = entity.description,
                tags = entity.tags
                    ?.split(",")
                    ?.map { it.trim() }
                    ?.filter { it.isNotBlank() } ?: emptyList(),
                imageUrl = entity.imageUrl,
                priceLevel = entity.priceLevel,
                latitude = entity.latitude,
                longitude = entity.longitude,
                status = entity.status.name,
                submittedBy = entity.submittedBy,
                submittedByEmail = entity.submittedByEmail,
                submittedAt = entity.createdAt,
                adminNotes = entity.adminNotes,
                reviewedBy = entity.reviewedBy,
                reviewedAt = entity.reviewedAt,
                createdAt = entity.createdAt,
                updatedAt = entity.updatedAt,
            )
    }
}

/**
 * Request DTO for updating directory entry status.
 *
 * <p>Used by admins to change entry lifecycle status with optional notes.</p>
 */
data class UpdateDirectoryEntryStatusRequest(
    @field:NotNull(message = "Status is required")
    val status: DirectoryEntryStatus,
    @field:Size(max = 1000, message = "Admin notes cannot exceed 1000 characters")
    val adminNotes: String? = null,
)

/**
 * Request DTO for creating a directory entry submission (public).
 *
 * <p>Used by community members to submit new directory entries for review.
 * Category is an enum string matching DirectoryEntry subclasses.</p>
 */
data class CreateDirectoryEntrySubmissionRequest(
    @field:jakarta.validation.constraints.NotBlank(message = "Name is required")
    @field:Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    val name: String,
    @field:jakarta.validation.constraints.NotBlank(message = "Category is required")
    val category: String, // RESTAURANT, HOTEL, BEACH, HERITAGE, NATURE
    @field:jakarta.validation.constraints.NotBlank(message = "Town is required")
    @field:Size(min = 1, max = 100, message = "Town must be between 1 and 100 characters")
    val town: String,
    @field:Size(max = 100, message = "Custom town cannot exceed 100 characters")
    val customTown: String? = null,
    @field:jakarta.validation.constraints.NotBlank(message = "Description is required")
    @field:Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    val description: String,
    val tags: List<String> = emptyList(),
    val imageUrl: String? = null,
    val priceLevel: String? = null,
    val latitude: BigDecimal? = null,
    val longitude: BigDecimal? = null,
)

/**
 * DTO for public directory submission confirmation response.
 *
 * <p>Returned after a successful submission to confirm the entry was received.
 * Frontend derives success message from HTTP 201 status.</p>
 */
data class DirectoryEntrySubmissionConfirmationDto(
    val id: UUID,
    val name: String,
    val status: String,
)
