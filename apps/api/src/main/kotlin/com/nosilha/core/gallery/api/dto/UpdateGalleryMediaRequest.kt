package com.nosilha.core.gallery.api.dto

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Size
import java.util.UUID

/**
 * Request DTO for updating gallery media metadata.
 *
 * PATCH semantics — only non-null fields are applied to the entity.
 * Accepts metadata fields common to all media types plus type-specific
 * attribution fields (author for ExternalMedia, photographerCredit for UserUploadedMedia).
 */
data class UpdateGalleryMediaRequest(
    @field:Size(max = 255, message = "Title cannot exceed 255 characters")
    val title: String? = null,
    /** Null leaves it unchanged; blank clears it. */
    @field:Size(max = 2048, message = "Description cannot exceed 2048 characters")
    val description: String? = null,
    /** Null leaves it unchanged; blank clears it. */
    @field:Size(max = 100, message = "Category cannot exceed 100 characters")
    val category: String? = null,
    @field:Size(max = 100, message = "Author cannot exceed 100 characters")
    val author: String? = null,
    @field:Size(max = 255, message = "Photographer credit cannot exceed 255 characters")
    val photographerCredit: String? = null,
    val showInGallery: Boolean? = null,
    /** Shows an identifiable person without confirmed provenance (spec 034 FR-022). */
    val identifiablePerson: Boolean? = null,
    val featured: Boolean? = null,
    @field:Min(value = 0, message = "Duration must be non-negative")
    val durationSeconds: Int? = null,
    /** Curated film title (spec 038). Null leaves it unchanged; blank clears it. External media only. */
    @field:Size(max = 255, message = "Display title cannot exceed 255 characters")
    val displayTitle: String? = null,
    /** Settlement (towns.id) a film was made near (spec 038). Null leaves it unchanged. External media only. */
    val placeId: UUID? = null,
    /** True clears [placeId]; PATCH treats a null placeId as "no change" (spec 038). External media only. */
    val clearPlace: Boolean? = null,
)
