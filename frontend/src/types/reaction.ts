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
 * Each reaction type has a specific meaning for diaspora engagement:
 * - LOVE: Deep appreciation, personal connection to cultural content
 * - HELPFUL: Educational value, useful information for learning
 * - INTERESTING: Intellectually engaging, sparked curiosity
 * - THANKYOU: Gratitude for sharing, cultural appreciation
 */
export type ReactionType = "LOVE" | "HELPFUL" | "INTERESTING" | "THANKYOU";

/**
 * Emoji mapping for reaction types.
 * Used for UI display in ReactionButton component.
 */
export const REACTION_EMOJIS: Record<ReactionType, string> = {
  LOVE: "❤️",
  HELPFUL: "👍",
  INTERESTING: "🤔",
  THANKYOU: "🙏",
};

/**
 * Label mapping for reaction types.
 * Used for accessibility (ARIA labels) and tooltips.
 */
export const REACTION_LABELS: Record<ReactionType, string> = {
  LOVE: "Love",
  HELPFUL: "Helpful",
  INTERESTING: "Interesting",
  THANKYOU: "Thank you",
};

/**
 * Description mapping for reaction types.
 * Used for tooltips and accessibility descriptions.
 */
export const REACTION_DESCRIPTIONS: Record<ReactionType, string> = {
  LOVE: "Deep appreciation, personal connection",
  HELPFUL: "Educational value, useful information",
  INTERESTING: "Intellectually engaging, sparked curiosity",
  THANKYOU: "Gratitude for sharing, cultural appreciation",
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
   * Example: { "LOVE": 42, "HELPFUL": 15, "INTERESTING": 8, "THANKYOU": 23 }
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
