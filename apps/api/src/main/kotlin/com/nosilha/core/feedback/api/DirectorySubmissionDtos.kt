package com.nosilha.core.feedback.api

import com.nosilha.core.feedback.domain.DirectorySubmission
import com.nosilha.core.feedback.domain.DirectorySubmissionCategory
import com.nosilha.core.feedback.domain.DirectorySubmissionStatus
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

/**
 * DTO for admin directory submission listing and detail views.
 *
 * <p>Used in admin moderation queue to display submission information
 * and allow status updates with admin notes.</p>
 */
data class AdminDirectorySubmissionDto(
    val id: UUID,
    val name: String,
    val category: String,
    val town: String,
    val customTown: String?,
    val description: String,
    val tags: List<String>,
    val imageUrl: String?,
    val priceLevel: String?,
    val latitude: BigDecimal?,
    val longitude: BigDecimal?,
    val status: String,
    val submittedBy: String,
    val submittedByEmail: String?,
    val submittedAt: Instant,
    val adminNotes: String?,
    val reviewedBy: String?,
    val reviewedAt: Instant?,
) {
    companion object {
        fun fromEntity(entity: DirectorySubmission): AdminDirectorySubmissionDto =
            AdminDirectorySubmissionDto(
                id = entity.id!!,
                name = entity.name,
                category = entity.category.name,
                town = entity.town,
                customTown = entity.customTown,
                description = entity.description,
                tags = entity.tags,
                imageUrl = entity.imageUrl,
                priceLevel = entity.priceLevel,
                latitude = entity.latitude,
                longitude = entity.longitude,
                status = entity.status.name,
                submittedBy = entity.submittedBy,
                submittedByEmail = entity.submittedByEmail,
                submittedAt = entity.createdAt!!,
                adminNotes = entity.adminNotes,
                reviewedBy = entity.reviewedBy,
                reviewedAt = entity.reviewedAt,
            )
    }
}

/**
 * Request DTO for updating directory submission status.
 *
 * <p>Used by admins to approve or reject submissions with optional notes.</p>
 */
data class UpdateDirectorySubmissionStatusRequest(
    @field:NotNull(message = "Status is required")
    val status: DirectorySubmissionStatus,
    @field:Size(max = 1000, message = "Admin notes cannot exceed 1000 characters")
    val adminNotes: String? = null,
)

/**
 * Request DTO for creating a new directory submission (public).
 *
 * <p>Used by community members to submit new directory entries for review.</p>
 */
data class CreateDirectorySubmissionRequest(
    @field:NotBlank(message = "Name is required")
    @field:Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    val name: String,
    @field:NotNull(message = "Category is required")
    val category: DirectorySubmissionCategory,
    @field:NotBlank(message = "Town is required")
    @field:Size(min = 1, max = 100, message = "Town must be between 1 and 100 characters")
    val town: String,
    @field:Size(max = 100, message = "Custom town cannot exceed 100 characters")
    val customTown: String? = null,
    @field:NotBlank(message = "Description is required")
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
data class DirectorySubmissionConfirmationDto(
    val id: UUID,
    val name: String,
    val status: String,
)
