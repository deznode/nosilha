/**
 * Types for Reaction feature (User Story 2 - Emotional Connection to Heritage Content)
 *
 * These types match the backend API contracts defined in:
 * - backend/src/main/kotlin/com/nosilha/core/contentactions/api/ReactionDto.kt
 * - backend/src/main/kotlin/com/nosilha/core/contentactions/domain/Reaction.kt
 */

/**
 * Reaction types representing emotional responses to cultural heritage content.
 *
 * LinkedIn-style semantic naming pattern (hybrid mix of emotions and content qualities):
 * - LOVE: Deep appreciation, personal connection to cultural content (emotion)
 * - CELEBRATE: Excitement, joy, and celebration of cultural discoveries (action/emotion)
 * - INSIGHTFUL: New learning, discovery, and understanding (content quality)
 * - SUPPORT: Appreciation, encouragement, and recognition (action/emotion)
 */
export type ReactionType = "LOVE" | "CELEBRATE" | "INSIGHTFUL" | "SUPPORT";

/**
 * UI-friendly reaction identifiers (lowercase).
 * Used in component props and page data.
 */
export type ReactionId = "love" | "celebrate" | "insightful" | "support";

/**
 * Emoji mapping for reaction types.
 * Used for UI display in ReactionButton component.
 */
export const REACTION_EMOJIS: Record<ReactionType, string> = {
  LOVE: "❤️",
  CELEBRATE: "🎉",
  INSIGHTFUL: "💡",
  SUPPORT: "👏",
};

/**
 * Mapping helpers for converting between UI IDs and backend API types.
 */
export const reactionIdToType: Record<ReactionId, ReactionType> = {
  love: "LOVE",
  celebrate: "CELEBRATE",
  insightful: "INSIGHTFUL",
  support: "SUPPORT",
};

export const reactionTypeToId: Record<ReactionType, ReactionId> = {
  LOVE: "love",
  CELEBRATE: "celebrate",
  INSIGHTFUL: "insightful",
  SUPPORT: "support",
};

/**
 * Label mapping for reaction types.
 * Used for accessibility (ARIA labels) and tooltips.
 */
export const REACTION_LABELS: Record<ReactionType, string> = {
  LOVE: "Love",
  CELEBRATE: "Celebrate",
  INSIGHTFUL: "Insightful",
  SUPPORT: "Support",
};

/**
 * Description mapping for reaction types.
 * Used for tooltips and accessibility descriptions.
 */
export const REACTION_DESCRIPTIONS: Record<ReactionType, string> = {
  LOVE: "Deep appreciation, personal connection",
  CELEBRATE: "Excitement, joy, and celebration",
  INSIGHTFUL: "New learning, discovery, and understanding",
  SUPPORT: "Appreciation, encouragement, and recognition",
};

/**
 * DTO for creating a new reaction.
 * Sent in POST /api/v1/reactions request.
 */
export interface ReactionCreateDto {
  /**
   * UUID of the heritage page/content being reacted to
   */
  contentId: string;

  /**
   * Type of emotional response
   */
  reactionType: ReactionType;
}

/**
 * DTO for reaction response after successful submission.
 * Returned from POST /api/v1/reactions endpoint.
 */
export interface ReactionResponseDto {
  /**
   * UUID of the created/updated reaction
   */
  id: string;

  /**
   * UUID of the heritage page/content
   */
  contentId: string;

  /**
   * Type of emotional response
   */
  reactionType: ReactionType;

  /**
   * Updated aggregated count for this reaction type on this content
   */
  count: number;
}

/**
 * DTO for aggregated reaction counts for a specific content page.
 * Returned from GET /api/v1/reactions/content/{contentId} endpoint.
 */
export interface ReactionCountsDto {
  /**
   * UUID of the heritage page/content
   */
  contentId: string;

  /**
   * Map of reaction types to their aggregated counts
   * All reaction types are always present (with 0 if no reactions)
   * Example: { "LOVE": 42, "CELEBRATE": 15, "INSIGHTFUL": 8, "SUPPORT": 23 }
   */
  reactions: Record<ReactionType, number>;

  /**
   * Current user's reaction, if any.
   * - null for unauthenticated users
   * - null for authenticated users who haven't reacted
   * - ReactionType for authenticated users who have reacted
   */
  userReaction: ReactionType | null;
}

/**
 * Error response from reaction API endpoints.
 * Used for error handling in ReactionButton component.
 */
export interface ReactionErrorResponse {
  /**
   * HTTP status code
   */
  status: number;

  /**
   * Error message from backend
   */
  message: string;

  /**
   * Error type (for programmatic handling)
   */
  error?: "RateLimitExceeded" | "Unauthorized" | "NotFound" | "ServerError";
}
