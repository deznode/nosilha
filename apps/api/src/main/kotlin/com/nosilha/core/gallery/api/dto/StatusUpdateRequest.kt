package com.nosilha.core.gallery.api.dto

import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

/**
 * Request DTO for updating media status (admin moderation).
 *
 * @property action The moderation action: "approve" or "reject"
 * @property reason Rejection reason (required when action is "reject")
 */
data class StatusUpdateRequest(
    @field:NotNull(message = "Action is required")
    val action: ModerationAction,
    @field:Size(max = 1024, message = "Reason must be at most 1024 characters")
    val reason: String? = null,
)

/**
 * Enum for moderation actions.
 */
enum class ModerationAction {
    APPROVE,
    REJECT,
}
