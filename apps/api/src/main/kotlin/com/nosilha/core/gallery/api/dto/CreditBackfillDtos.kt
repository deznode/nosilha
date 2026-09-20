package com.nosilha.core.gallery.api.dto

import jakarta.validation.constraints.Size
import java.util.UUID

/**
 * Which records an admin data tool acts on. With no ids, the tool considers every
 * record it applies to.
 */
data class MediaSelectionRequest(
    @field:Size(max = 500, message = "At most 500 media ids per request")
    val mediaIds: List<UUID>? = null,
)

/**
 * Result of stamping "not known" on uncredited records (spec 034 FR-024).
 *
 * @property updated Records that now carry "not known"
 * @property skippedFlagged Uncredited records left alone because they show an identifiable person (FR-022)
 * @property errors Requested ids that were not found or already carry a credit
 */
data class CreditBackfillResponse(
    val updated: Int,
    val skippedFlagged: Int,
    val errors: List<BatchErrorDto>,
)
