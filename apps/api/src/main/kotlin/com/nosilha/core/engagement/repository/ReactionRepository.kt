package com.nosilha.core.engagement.repository

import com.nosilha.core.engagement.domain.Reaction
import com.nosilha.core.engagement.domain.ReactionType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

/**
 * Spring Data JPA repository for the Reaction entity.
 *
 * <p>Provides standard CRUD operations and custom queries for:
 * <ul>
 *   <li>Finding reactions by content ID (for displaying aggregated counts)</li>
 *   <li>Finding user's reaction to specific content (for highlighting selected reaction)</li>
 *   <li>Counting reactions by type for a content page (for aggregation)</li>
 *   <li>Deleting user's reaction (for reaction removal/change)</li>
 * </ul>
 */
@Repository
interface ReactionRepository : JpaRepository<Reaction, UUID> {
    /**
     * Finds all reactions for a specific content page.
     *
     * <p>Used for displaying reaction counts and analyzing emotional responses
     * to cultural heritage content.</p>
     *
     * @param contentId UUID of the heritage page/content
     * @return List of all reactions to the content
     */
    fun findByContentId(contentId: UUID): List<Reaction>

    /**
     * Finds a user's reaction to specific content.
     *
     * <p>Used to check if a user has already reacted and to highlight their
     * selected reaction in the UI. Enforces the unique constraint: one reaction
     * per user per content page.</p>
     *
     * @param userId UUID of the authenticated user
     * @param contentId UUID of the heritage page/content
     * @return The user's reaction if it exists, null otherwise
     */
    fun findByUserIdAndContentId(
        userId: UUID,
        contentId: UUID,
    ): Reaction?

    /**
     * Counts reactions of a specific type for a content page.
     *
     * <p>Used for aggregating reaction counts by type (e.g., "42 Love reactions")
     * for display in the UI.</p>
     *
     * @param contentId UUID of the heritage page/content
     * @param reactionType Type of reaction to count
     * @return Number of reactions of the specified type
     */
    fun countByContentIdAndReactionType(
        contentId: UUID,
        reactionType: ReactionType,
    ): Long

    /**
     * Deletes all reactions by a specific user for a content page.
     *
     * <p>Used when a user removes their reaction or changes to a different
     * reaction type (delete old, insert new).</p>
     *
     * @param userId UUID of the authenticated user
     * @param contentId UUID of the heritage page/content
     */
    fun deleteByUserIdAndContentId(
        userId: UUID,
        contentId: UUID,
    )

    /**
     * Gets aggregated reaction counts for a content page.
     *
     * <p>Returns a map of reaction types to their counts, optimized with a single
     * database query instead of multiple countBy calls.</p>
     *
     * @param contentId UUID of the heritage page/content
     * @return Map of reaction type to count (e.g., {LOVE=42, CELEBRATE=15})
     */
    @Query(
        """
        SELECT r.reactionType as type, COUNT(r) as count
        FROM Reaction r
        WHERE r.contentId = :contentId
        GROUP BY r.reactionType
    """,
    )
    fun getReactionCountsByContentId(
        @Param("contentId") contentId: UUID,
    ): List<ReactionCount>

    /**
     * Gets aggregated reaction counts grouped by reaction type for a specific user.
     *
     * <p>Returns a list of reaction counts grouped by type for all reactions
     * made by the user. Used for user profile contribution history to display
     * how many reactions of each type (Love, Celebrate, Insightful, Support)
     * the user has made across all content.</p>
     *
     * @param userId UUID of the authenticated user
     * @return List of reaction counts grouped by type
     */
    @Query(
        """
        SELECT r.reactionType as type, COUNT(r) as count
        FROM Reaction r
        WHERE r.userId = :userId
        GROUP BY r.reactionType
    """,
    )
    fun countByUserIdGroupByReactionType(
        @Param("userId") userId: UUID,
    ): List<ReactionCount>
}

/**
 * Projection interface for aggregated reaction counts.
 *
 * <p>Used by getReactionCountsByContentId query to return grouped results.</p>
 */
interface ReactionCount {
    val type: ReactionType
    val count: Long
}
