package com.nosilha.core.auth.api.dto

import com.nosilha.core.auth.domain.NotificationPreferences
import com.nosilha.core.auth.domain.PreferredLanguage
import com.nosilha.core.auth.domain.UserProfile
import com.nosilha.core.engagement.domain.ReactionType
import com.nosilha.core.feedback.domain.SuggestionStatus
import com.nosilha.core.feedback.domain.SuggestionType
import com.nosilha.core.stories.domain.StoryStatus
import com.nosilha.core.stories.domain.StoryType
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

/**
 * Response DTO for user profile information.
 *
 * <p>Returned from GET /api/v1/profiles/me endpoint with the authenticated user's
 * profile data including preferences and display information.</p>
 *
 * @property id UUID of the user profile
 * @property userId Supabase auth user ID
 * @property displayName Optional display name (1-100 characters)
 * @property location Optional location text (1-255 characters)
 * @property preferredLanguage User's preferred UI language (EN, PT, KEA)
 * @property notificationPreferences User's notification settings
 * @property createdAt Timestamp when profile was created
 * @property updatedAt Timestamp when profile was last updated
 */
data class ProfileDto(
    val id: UUID,
    val userId: String,
    val displayName: String?,
    val location: String?,
    val preferredLanguage: PreferredLanguage,
    val notificationPreferences: NotificationPreferences,
    val createdAt: Instant,
    val updatedAt: Instant,
) {
    companion object {
        /**
         * Converts a UserProfile entity to ProfileDto.
         *
         * @param profile The UserProfile entity to convert
         * @return ProfileDto mapped from the entity
         */
        fun fromEntity(profile: UserProfile): ProfileDto =
            ProfileDto(
                id = profile.id!!,
                userId = profile.userId,
                displayName = profile.displayName,
                location = profile.location,
                preferredLanguage = profile.preferredLanguage,
                notificationPreferences = profile.notificationPreferences,
                createdAt = profile.createdAt,
                updatedAt = profile.updatedAt,
            )
    }
}

/**
 * DTO aggregating all user contributions across the platform.
 *
 * <p>Provides a comprehensive view of user engagement including reactions,
 * content suggestions, and story submissions. Used in GET /api/v1/profiles/me/contributions
 * endpoint.</p>
 *
 * @property reactionCounts Map of reaction types to their counts (e.g., {"LOVE": 42, "CELEBRATE": 15})
 * @property suggestions List of user's content suggestions with summary information
 * @property stories List of user's story submissions with summary information
 * @property totalReactions Total count of all reactions across all types
 * @property totalSuggestions Total count of suggestions submitted
 * @property totalStories Total count of stories submitted
 */
data class ContributionsDto(
    val reactionCounts: Map<ReactionType, Int>,
    val suggestions: List<SuggestionSummaryDto>,
    val stories: List<StorySummaryDto>,
    val totalReactions: Int,
    val totalSuggestions: Int,
    val totalStories: Int,
)

/**
 * Summary DTO for a user's content suggestion.
 *
 * <p>Provides essential information about a suggestion without the full details
 * like email, IP address, or admin notes. Used in contribution aggregations.</p>
 *
 * @property id UUID of the suggestion
 * @property contentId UUID of the content page the suggestion relates to
 * @property suggestionType Type of suggestion (CORRECTION, ADDITION, FEEDBACK)
 * @property status Current moderation status (PENDING, APPROVED, REJECTED)
 * @property createdAt Timestamp when the suggestion was submitted
 */
data class SuggestionSummaryDto(
    val id: UUID,
    val contentId: UUID,
    val suggestionType: SuggestionType,
    val status: SuggestionStatus,
    val createdAt: Instant,
)

/**
 * Summary DTO for a user's story submission.
 *
 * <p>Provides essential information about a story without the full content
 * or admin moderation details. Used in contribution aggregations.</p>
 *
 * @property id UUID of the story submission
 * @property title The title of the story
 * @property storyType Type of story (QUICK, FULL, GUIDED)
 * @property status Current moderation status (PENDING, APPROVED, REJECTED, NEEDS_REVISION, PUBLISHED)
 * @property createdAt Timestamp when the story was submitted
 */
data class StorySummaryDto(
    val id: UUID,
    val title: String,
    val storyType: StoryType,
    val status: StoryStatus,
    val createdAt: Instant,
)

/**
 * DTO for reaction type counts.
 *
 * <p>Simple wrapper for a reaction type and its count, useful for
 * displaying reaction statistics in various formats.</p>
 *
 * @property reactionType The type of reaction (LOVE, CELEBRATE, INSIGHTFUL, SUPPORT)
 * @property count Number of times this reaction was used
 */
data class ReactionCountDto(
    val reactionType: ReactionType,
    val count: Int,
)

/**
 * Request DTO for updating user profile.
 *
 * <p>All fields are optional to support partial updates. Only non-null fields
 * will be applied to the user's profile. Validation rules are enforced via
 * Bean Validation annotations.</p>
 *
 * <p><strong>Validation Rules</strong>:
 * <ul>
 *   <li>displayName: 2-100 characters if provided</li>
 *   <li>location: max 255 characters if provided</li>
 *   <li>preferredLanguage: must be valid PreferredLanguage enum (EN, PT, KEA)</li>
 *   <li>notificationPreferences: full replacement if provided</li>
 * </ul>
 *
 * @property displayName Optional display name (2-100 characters)
 * @property location Optional location text (max 255 characters)
 * @property preferredLanguage Optional preferred UI language (EN, PT, KEA)
 * @property notificationPreferences Optional notification settings (replaces existing)
 */
data class ProfileUpdateRequest(
    @field:Size(min = 2, max = 100, message = "Display name must be 2-100 characters")
    val displayName: String? = null,
    @field:Size(max = 255, message = "Location must be less than 255 characters")
    val location: String? = null,
    val preferredLanguage: PreferredLanguage? = null,
    val notificationPreferences: NotificationPreferences? = null,
)
