package com.nosilha.core.feedback.api

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.util.UUID

/**
 * DTO for submitting a correction to an existing public gallery media item (spec 039).
 *
 * <p>Used in POST /api/v1/feedback/media-corrections. Requires authentication; name and
 * email come from the authenticated principal, not the request body.</p>
 *
 * @property mediaId UUID of the public gallery media item being corrected
 * @property message The correction, 1..2000 characters
 */
data class MediaCorrectionCreateDto(
    @field:NotNull(message = "Media ID is required")
    val mediaId: UUID,
    @field:NotBlank(message = "Message is required")
    @field:Size(max = 2000, message = "Message must not exceed 2000 characters")
    val message: String,
)
