package com.nosilha.core.gallery.api.dto

import jakarta.validation.constraints.Size
import java.util.UUID

/**
 * Request body for batch AI analysis trigger.
 */
data class AnalyzeBatchRequest(
    @field:Size(min = 1, max = 50, message = "Batch size must be between 1 and 50")
    val mediaIds: List<UUID>,
)
