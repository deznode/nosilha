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

/**
 * Response for a single media AI analysis trigger (202 Accepted).
 */
data class AnalysisTriggerResponse(
    val mediaId: UUID,
    val analysisRunId: UUID,
    val status: String,
)

/**
 * Response for a batch AI analysis trigger (202 Accepted).
 */
data class BatchAnalysisTriggerResponse(
    val batchId: UUID?,
    val accepted: Int,
    val rejected: Int,
    val errors: List<BatchErrorDto>,
)

/**
 * Error detail for a rejected item in a batch analysis trigger.
 */
data class BatchErrorDto(
    val mediaId: UUID,
    val reason: String,
)
