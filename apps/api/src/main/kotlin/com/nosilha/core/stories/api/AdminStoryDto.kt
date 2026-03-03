package com.nosilha.core.stories.api

import com.nosilha.core.stories.domain.StoryStatus
import com.nosilha.core.stories.domain.StorySubmission
import com.nosilha.core.stories.domain.StoryType
import com.nosilha.core.stories.domain.TemplateType
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

/**
 * DTO for story list view in admin panel.
 *
 * <p>Used in GET /api/v1/admin/stories endpoint. Provides a compact view
 * for displaying story submissions in a table or list format.</p>
 *
 * @property id Unique identifier of the story submission
 * @property title Title of the story
 * @property authorId ID of the authenticated user who submitted the story
 * @property storyType Type of story (QUICK, FULL, or GUIDED)
 * @property status Current moderation status (PENDING, APPROVED, REJECTED, NEEDS_REVISION, PUBLISHED)
 * @property isFeatured Whether the story is marked as featured
 * @property createdAt Timestamp when the story was submitted
 */
data class StoryListDto(
    val id: UUID,
    val title: String,
    val authorId: UUID,
    val storyType: StoryType,
    val status: StoryStatus,
    val isFeatured: Boolean,
    val createdAt: Instant?,
)

/**
 * DTO for story detail view in admin panel.
 *
 * <p>Used in GET /api/v1/admin/stories/{id} endpoint. Provides complete
 * information for reviewing and moderating a story submission.</p>
 *
 * @property id Unique identifier of the story submission
 * @property title Title of the story
 * @property content Story content text
 * @property storyType Type of story (QUICK, FULL, or GUIDED)
 * @property templateType Template type for guided stories (FAMILY, CHILDHOOD, DIASPORA, TRADITIONS, FOOD)
 * @property authorId ID of the authenticated user who submitted the story
 * @property relatedPlaceId Optional UUID of the place/directory entry this story relates to
 * @property status Current moderation status
 * @property isFeatured Whether the story is marked as featured
 * @property adminNotes Internal notes added by the reviewing admin
 * @property reviewedBy Username/email of the admin who reviewed this story
 * @property reviewedAt Timestamp when the story was reviewed
 * @property publicationSlug Unique slug for published stories
 * @property archivedAt Timestamp when the story was archived to MDX
 * @property archivedSlug Slug used in the MDX archive (content/stories/{slug}.mdx)
 * @property archivedBy Username/email of the admin who archived this story
 * @property createdAt Timestamp when the story was submitted
 * @property updatedAt Timestamp when the story was last updated
 */
data class StoryDetailDto(
    val id: UUID,
    val title: String,
    val content: String,
    val storyType: StoryType,
    val templateType: TemplateType?,
    val authorId: UUID,
    val relatedPlaceId: UUID?,
    val status: StoryStatus,
    val isFeatured: Boolean,
    val adminNotes: String?,
    val reviewedBy: UUID?,
    val reviewedAt: Instant?,
    val publicationSlug: String?,
    val archivedAt: Instant?,
    val archivedSlug: String?,
    val archivedBy: UUID?,
    val createdAt: Instant?,
    val updatedAt: Instant?,
)

/**
 * Story moderation action enum.
 *
 * <p>Used in the request body for updating story status.</p>
 */
enum class StoryModerationAction {
    /** Approve the story and mark it as accepted */
    APPROVE,

    /** Reject the story and mark it as declined */
    REJECT,

    /** Request revision from the author with feedback */
    REQUEST_REVISION,

    /** Flag the story for attention */
    FLAG,

    /** Publish the story and make it publicly visible */
    PUBLISH,
}

/**
 * Request DTO for updating story status.
 *
 * <p>Used in PUT /api/v1/admin/stories/{id}/status endpoint.
 * Allows admins to approve, reject, request revisions, or publish stories.</p>
 *
 * @property action The moderation action to take (APPROVE, REJECT, REQUEST_REVISION, or PUBLISH)
 * @property adminNotes Optional internal notes about the review decision
 * @property publicationSlug Required when publishing; unique URL-friendly identifier
 */
data class UpdateStoryStatusRequest(
    @field:NotNull(message = "Action is required")
    val action: StoryModerationAction,
    @field:Size(max = 5000, message = "Admin notes cannot exceed 5000 characters")
    val adminNotes: String? = null,
    @field:Size(max = 255, message = "Publication slug cannot exceed 255 characters")
    val publicationSlug: String? = null,
)

/**
 * Request DTO for toggling featured status.
 *
 * <p>Used in PUT /api/v1/admin/stories/{id}/featured endpoint.
 * Allows admins to mark stories as featured for special display.</p>
 *
 * @property isFeatured Whether the story should be featured
 */
data class ToggleFeaturedRequest(
    @field:NotNull(message = "Featured status is required")
    val isFeatured: Boolean,
)

/**
 * Request DTO for marking a story as archived to MDX.
 *
 * <p>Used in PATCH /api/v1/admin/stories/{id}/archive endpoint.
 * Allows admins to mark stories as archived after MDX commit, linking the
 * story submission to its archived MDX file.</p>
 *
 * @property slug The slug used in the MDX archive (content/stories/{slug}.mdx)
 * @property archivedAt Optional timestamp when the story was archived (defaults to now)
 */
data class MarkArchivedRequest(
    @field:NotNull(message = "Slug is required")
    @field:Size(min = 1, max = 255, message = "Slug must be between 1 and 255 characters")
    val slug: String,
    val archivedAt: Instant? = null,
)

/**
 * Extension function to convert StorySubmission entity to list DTO.
 *
 * <p>Maps domain entity to compact list view for admin panel tables.</p>
 *
 * @return StoryListDto with essential fields for list display
 */
fun StorySubmission.toListDto() =
    StoryListDto(
        id = this.id!!,
        title = this.title,
        authorId = this.authorId,
        storyType = this.storyType,
        status = this.status,
        isFeatured = this.isFeatured,
        createdAt = this.createdAt,
    )

/**
 * Extension function to convert StorySubmission entity to detail DTO.
 *
 * <p>Maps domain entity to complete detail view for admin review panel.</p>
 *
 * @return StoryDetailDto with all fields for detailed review
 */
fun StorySubmission.toDetailDto() =
    StoryDetailDto(
        id = this.id!!,
        title = this.title,
        content = this.content,
        storyType = this.storyType,
        templateType = this.templateType,
        authorId = this.authorId,
        relatedPlaceId = this.relatedPlaceId,
        status = this.status,
        isFeatured = this.isFeatured,
        adminNotes = this.adminNotes,
        reviewedBy = this.reviewedBy,
        reviewedAt = this.reviewedAt,
        publicationSlug = this.publicationSlug,
        archivedAt = this.archivedAt,
        archivedSlug = this.archivedSlug,
        archivedBy = this.archivedBy,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
    )
