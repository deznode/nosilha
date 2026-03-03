package com.nosilha.core.feedback.api

import com.nosilha.core.feedback.domain.Suggestion
import com.nosilha.core.feedback.domain.SuggestionStatus
import com.nosilha.core.feedback.domain.SuggestionType
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

/**
 * DTO for suggestion list view in admin panel.
 *
 * <p>Used in GET /api/v1/admin/suggestions endpoint. Provides a compact view
 * for displaying suggestions in a table or list format.</p>
 *
 * @property id Unique identifier of the suggestion
 * @property name Submitter's name
 * @property email Submitter's email address
 * @property suggestionType Type of suggestion (CORRECTION, ADDITION, FEEDBACK)
 * @property status Current moderation status (PENDING, APPROVED, REJECTED)
 * @property createdAt Timestamp when the suggestion was created
 */
data class SuggestionListDto(
    val id: UUID,
    val name: String,
    val email: String,
    val suggestionType: SuggestionType,
    val status: SuggestionStatus,
    val createdAt: Instant?,
)

/**
 * DTO for suggestion detail view in admin panel.
 *
 * <p>Used in GET /api/v1/admin/suggestions/{id} endpoint. Provides complete
 * information for reviewing and moderating a suggestion.</p>
 *
 * @property id Unique identifier of the suggestion
 * @property contentId UUID of the content/page this suggestion relates to
 * @property name Submitter's name
 * @property email Submitter's email address
 * @property suggestionType Type of suggestion (CORRECTION, ADDITION, FEEDBACK)
 * @property message Detailed suggestion message from the submitter
 * @property pageTitle Title of the page where suggestion was made
 * @property pageUrl URL of the page where suggestion was made
 * @property contentType Type of content (e.g., "heritage-site", "restaurant")
 * @property status Current moderation status (PENDING, APPROVED, REJECTED)
 * @property adminNotes Internal notes added by the reviewing admin
 * @property reviewedBy Username/email of the admin who reviewed this suggestion
 * @property reviewedAt Timestamp when the suggestion was reviewed
 * @property createdAt Timestamp when the suggestion was created
 */
data class SuggestionDetailDto(
    val id: UUID,
    val contentId: UUID,
    val name: String,
    val email: String,
    val suggestionType: SuggestionType,
    val message: String,
    val pageTitle: String?,
    val pageUrl: String?,
    val contentType: String?,
    val status: SuggestionStatus,
    val adminNotes: String?,
    val reviewedBy: UUID?,
    val reviewedAt: Instant?,
    val createdAt: Instant?,
)

/**
 * Moderation action enum for approve/reject operations.
 *
 * <p>Used in the request body for updating suggestion status.</p>
 */
enum class ModerationAction {
    /** Approve the suggestion and mark it as accepted */
    APPROVE,

    /** Reject the suggestion and mark it as declined */
    REJECT,
}

/**
 * Request DTO for updating suggestion status.
 *
 * <p>Used in PUT /api/v1/admin/suggestions/{id}/status endpoint.
 * Allows admins to approve or reject suggestions with optional notes.</p>
 *
 * @property action The moderation action to take (APPROVE or REJECT)
 * @property adminNotes Optional internal notes about the review decision
 */
data class UpdateSuggestionStatusRequest(
    @field:NotNull(message = "Action is required")
    val action: ModerationAction,
    @field:Size(max = 5000, message = "Admin notes cannot exceed 5000 characters")
    val adminNotes: String? = null,
)

/**
 * Extension function to convert Suggestion entity to list DTO.
 *
 * <p>Maps domain entity to compact list view for admin panel tables.</p>
 *
 * @return SuggestionListDto with essential fields for list display
 */
fun Suggestion.toListDto() =
    SuggestionListDto(
        id = this.id!!,
        name = this.name,
        email = this.email,
        suggestionType = this.suggestionType,
        status = this.status,
        createdAt = this.createdAt,
    )

/**
 * Extension function to convert Suggestion entity to detail DTO.
 *
 * <p>Maps domain entity to complete detail view for admin review panel.</p>
 *
 * @return SuggestionDetailDto with all fields for detailed review
 */
fun Suggestion.toDetailDto() =
    SuggestionDetailDto(
        id = this.id!!,
        contentId = this.contentId,
        name = this.name,
        email = this.email,
        suggestionType = this.suggestionType,
        message = this.message,
        pageTitle = this.pageTitle,
        pageUrl = this.pageUrl,
        contentType = this.contentType,
        status = this.status,
        adminNotes = this.adminNotes,
        reviewedBy = this.reviewedBy,
        reviewedAt = this.reviewedAt,
        createdAt = this.createdAt,
    )
