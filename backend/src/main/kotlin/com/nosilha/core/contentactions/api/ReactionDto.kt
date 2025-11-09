package com.nosilha.core.contentactions.api

import com.nosilha.core.contentactions.domain.ReactionType
import jakarta.validation.constraints.NotNull
import java.util.UUID

/**
 * DTO for creating a new reaction to cultural heritage content.
 *
 * <p>Used in POST /api/v1/reactions endpoint. Requires authentication.</p>
 *
 * @property contentId UUID of the heritage page/content being reacted to
 * @property reactionType Type of emotional response (LOVE, HELPFUL, INTERESTING, THANKYOU)
 */
data class ReactionCreateDto(
    @field:NotNull(message = "Content ID is required")
    val contentId: UUID,

    @field:NotNull(message = "Reaction type is required")
    val reactionType: ReactionType
)

/**
 * DTO for reaction response after successful submission.
 *
 * <p>Returned from POST /api/v1/reactions endpoint with the created reaction details
 * and the updated aggregated count for this reaction type.</p>
 *
 * @property id UUID of the created reaction
 * @property contentId UUID of the heritage page/content
 * @property reactionType Type of emotional response
 * @property count Aggregated count for this reaction type on this content
 */
data class ReactionResponseDto(
    val id: UUID,
    val contentId: UUID,
    val reactionType: ReactionType,
    val count: Int
)

/**
 * DTO for aggregated reaction counts for a specific content page.
 *
 * <p>Used in GET /api/v1/reactions/content/{contentId} endpoint to display
 * all reaction counts and the current user's reaction (if any).</p>
 *
 * @property contentId UUID of the heritage page/content
 * @property reactions Map of reaction types to their counts (e.g., {"love": 42, "helpful": 15})
 * @property userReaction Current user's reaction, if any (null for unauthenticated users)
 */
data class ReactionCountsDto(
    val contentId: UUID,
    val reactions: Map<ReactionType, Int>,
    val userReaction: ReactionType? = null
)
