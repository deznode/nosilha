package com.nosilha.core.stories.api

import com.nosilha.core.stories.domain.StoryType
import com.nosilha.core.stories.domain.TemplateType
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

/**
 * Request DTO for submitting a new story.
 *
 * <p>Used in POST /api/v1/stories endpoint. Does not require authentication.
 * Allows community members to share their personal stories and memories
 * of Brava Island.</p>
 *
 * <p><strong>Validation Rules:</strong></p>
 * <ul>
 *   <li>Title: 1-255 characters</li>
 *   <li>Content: 10-5000 characters</li>
 *   <li>Story type: QUICK, FULL, or GUIDED</li>
 *   <li>Template type: Required if storyType is GUIDED</li>
 *   <li>Honeypot field must be empty (spam protection)</li>
 * </ul>
 *
 * @property title The title of the story
 * @property content The main story content/text
 * @property storyType Type of story submission (QUICK, FULL, GUIDED)
 * @property templateType Optional template category for guided stories (FAMILY, CHILDHOOD, DIASPORA, TRADITIONS, FOOD)
 * @property relatedPlaceId Optional UUID of a related place/landmark on the island
 * @property honeypot Honeypot field for spam protection (should be empty)
 */
data class CreateStoryRequest(
    @field:NotBlank(message = "Title is required")
    @field:Size(min = 1, max = 255, message = "Title must be between 1 and 255 characters")
    val title: String,
    @field:NotBlank(message = "Content is required")
    @field:Size(min = 10, max = 5000, message = "Content must be between 10 and 5000 characters")
    val content: String,
    @field:NotNull(message = "Story type is required")
    val storyType: StoryType,
    val templateType: TemplateType? = null,
    val relatedPlaceId: UUID? = null,
    // Honeypot field for spam protection (should be empty)
    val honeypot: String? = null,
)

/**
 * Response DTO for story submission.
 *
 * <p>Returned from POST /api/v1/stories endpoint with a confirmation message.
 * If the story is flagged as spam, the ID will be null.</p>
 *
 * @property id UUID of the created story (null for spam or errors)
 * @property message Confirmation message thanking the user for their contribution
 */
data class StorySubmittedResponse(
    val id: UUID?,
    val message: String = "Thank you for sharing your story. It has been submitted for review.",
)

/**
 * Public DTO for story list view.
 *
 * <p>Used in GET /api/v1/stories endpoint. Provides a compact public view
 * for displaying published stories in a list or grid format.
 * Does not include admin-only fields.</p>
 *
 * @property id Unique identifier of the story
 * @property slug URL-friendly publication slug
 * @property title Title of the story
 * @property excerpt First 200 characters of content for preview
 * @property author Display name of the author
 * @property storyType Type of story (QUICK, FULL, or GUIDED)
 * @property templateType Optional template category for guided stories
 * @property location Location name if the story is related to a place
 * @property isFeatured Whether the story is marked as featured
 * @property createdAt Timestamp when the story was submitted
 */
data class PublicStoryListDto(
    val id: UUID,
    val slug: String,
    val title: String,
    val excerpt: String,
    val author: String,
    val storyType: StoryType,
    val templateType: TemplateType?,
    val location: String?,
    val isFeatured: Boolean,
    val createdAt: Instant?,
)

/**
 * Public DTO for story detail view.
 *
 * <p>Used in GET /api/v1/stories/slug/{slug} endpoint. Provides complete
 * public information for displaying a single published story.
 * Does not include admin-only fields like adminNotes, reviewedBy, etc.</p>
 *
 * @property id Unique identifier of the story
 * @property slug URL-friendly publication slug
 * @property title Title of the story
 * @property content Full story content
 * @property author Display name of the author
 * @property storyType Type of story (QUICK, FULL, or GUIDED)
 * @property templateType Optional template category for guided stories
 * @property location Location name if the story is related to a place
 * @property isFeatured Whether the story is marked as featured
 * @property createdAt Timestamp when the story was submitted
 */
data class PublicStoryDetailDto(
    val id: UUID,
    val slug: String,
    val title: String,
    val content: String,
    val author: String,
    val storyType: StoryType,
    val templateType: TemplateType?,
    val location: String?,
    val isFeatured: Boolean,
    val createdAt: Instant?,
)
