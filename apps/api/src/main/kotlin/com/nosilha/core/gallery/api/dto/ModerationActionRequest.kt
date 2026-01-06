package com.nosilha.core.gallery.api.dto

import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

/**
 * Unified request DTO for gallery media moderation actions.
 *
 * This DTO replaces the separate UpdateMediaStatusRequest and is used
 * for all moderation actions on both user-uploaded and external media.
 *
 * Moderation Actions:
 * - APPROVE: Mark media as approved and make it publicly visible (status: ACTIVE)
 * - FLAG: Flag media for further review with optional severity (status: FLAGGED, requires reason)
 * - REJECT: Reject media and soft delete it (status: REJECTED, requires reason)
 *
 * Validation Rules:
 * - Action is required (APPROVE, FLAG, or REJECT)
 * - Reason is required for FLAG and REJECT actions (max 1024 characters)
 * - Severity is optional for FLAG action (0=normal, 1=low, 2=medium, 3=high)
 *
 * Example Usage:
 * PATCH /api/v1/admin/gallery/{id}/status
 * {
 *   "action": "APPROVE"
 * }
 *
 * PATCH /api/v1/admin/gallery/{id}/status
 * {
 *   "action": "REJECT",
 *   "reason": "Inappropriate content"
 * }
 *
 * PATCH /api/v1/admin/gallery/{id}/status
 * {
 *   "action": "FLAG",
 *   "reason": "Needs verification",
 *   "severity": 2
 * }
 */
data class ModerationActionRequest(
    @field:NotNull(message = "Action is required")
    val action: GalleryModerationAction,
    @field:Size(max = 1024, message = "Reason cannot exceed 1024 characters")
    val reason: String? = null,
    val severity: Int? = null,
)

/**
 * Gallery media moderation action enum.
 *
 * Used in the request body for updating gallery media status.
 */
enum class GalleryModerationAction {
    /** Approve the media and make it publicly available */
    APPROVE,

    /** Flag the media for further review with severity */
    FLAG,

    /** Reject the media and soft delete it */
    REJECT,
}
