package com.nosilha.core.gallery.api.dto

import jakarta.validation.constraints.Size

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
    @field:Size(max = 2048, message = "Description cannot exceed 2048 characters")
    val description: String? = null,
    @field:Size(max = 100, message = "Category cannot exceed 100 characters")
    val category: String? = null,
    @field:Size(max = 100, message = "Author cannot exceed 100 characters")
    val author: String? = null,
    @field:Size(max = 255, message = "Photographer credit cannot exceed 255 characters")
    val photographerCredit: String? = null,
    val showInGallery: Boolean? = null,
)
