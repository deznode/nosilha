package com.nosilha.core.contentactions.api

import com.nosilha.core.contentactions.domain.StoryType
import com.nosilha.core.contentactions.domain.TemplateType
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
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
