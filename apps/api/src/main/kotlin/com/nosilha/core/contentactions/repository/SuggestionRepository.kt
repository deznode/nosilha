package com.nosilha.core.contentactions.repository

import com.nosilha.core.contentactions.domain.Suggestion
import com.nosilha.core.contentactions.domain.SuggestionStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.Instant
import java.util.UUID

/**
 * Spring Data JPA repository for the Suggestion entity.
 *
 * <p>Provides standard CRUD operations and custom queries for:
 * <ul>
 *   <li>Finding suggestions by content ID (for administrative review)</li>
 *   <li>Filtering by moderation status (for admin workflows)</li>
 * </ul>
 *
 * <p><strong>Rate Limiting:</strong> The service layer uses Bucket4j token bucket
 * algorithm for atomic, race-condition-free rate limiting (5 suggestions per hour per IP).</p>
 *
 * <p><strong>Note:</strong> Suggestions are immutable once created and never deleted,
 * maintaining a complete audit trail of community contributions.</p>
 */
@Repository
interface SuggestionRepository : JpaRepository<Suggestion, UUID> {
    /**
     * Finds all suggestions for a specific content page.
     *
     * <p>Used for administrative review of community contributions to improve
     * cultural heritage content accuracy and completeness.</p>
     *
     * @param contentId UUID of the heritage page/content
     * @return List of all suggestions for the content
     */
    fun findByContentId(contentId: UUID): List<Suggestion>

    /**
     * Finds the most recent suggestions ordered by creation timestamp.
     *
     * <p>Used for displaying recent community contributions in the admin dashboard.</p>
     *
     * @return List of all suggestions ordered by creation time (newest first)
     */
    fun findAllByOrderByCreatedAtDesc(): List<Suggestion>

    /**
     * Finds all suggestions for a specific content page, ordered by creation time.
     *
     * <p>Used for administrative review of community contributions.</p>
     *
     * @param contentId UUID of the heritage page/content
     * @return List of suggestions ordered by creation time (newest first)
     */
    fun findByContentIdOrderByCreatedAtDesc(contentId: UUID): List<Suggestion>

    /**
     * Finds all suggestions with a specific status, with pagination support.
     *
     * <p>Used for filtering suggestions by moderation status (PENDING, APPROVED, REJECTED).</p>
     *
     * @param status The moderation status to filter by
     * @param pageable Pagination parameters
     * @return Page of suggestions with the specified status
     */
    fun findByStatus(
        status: SuggestionStatus,
        pageable: Pageable,
    ): Page<Suggestion>

    /**
     * Finds all suggestions with pagination support.
     *
     * <p>Used for displaying all suggestions in the admin dashboard with pagination.</p>
     *
     * @param pageable Pagination parameters
     * @return Page of all suggestions
     */
    fun findAllBy(pageable: Pageable): Page<Suggestion>

    /**
     * Counts the number of suggestions with a specific status.
     *
     * <p>Used for displaying metrics in the admin dashboard (e.g., pending count badge).</p>
     *
     * @param status The moderation status to count
     * @return Number of suggestions with the specified status
     */
    fun countByStatus(status: SuggestionStatus): Long

    /**
     * Counts the number of suggestions created between two timestamps.
     *
     * <p>Used for weekly activity charts to show daily suggestion counts.</p>
     *
     * @param startDate Start of time range (inclusive)
     * @param endDate End of time range (exclusive)
     * @return Number of suggestions created in the time range
     */
    fun countByCreatedAtBetween(
        startDate: Instant,
        endDate: Instant,
    ): Long

    // TODO: Add findByUserId method once Suggestion entity has userId field
    // fun findByUserId(userId: String): List<Suggestion>
}
