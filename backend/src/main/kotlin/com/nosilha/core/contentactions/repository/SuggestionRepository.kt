package com.nosilha.core.contentactions.repository

import com.nosilha.core.contentactions.domain.Suggestion
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
 *   <li>Counting recent suggestions by IP address (for rate limiting)</li>
 * </ul>
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
     * Counts suggestions submitted from a specific IP address after a given timestamp.
     *
     * <p>Used for rate limiting to prevent spam. The service layer enforces a limit
     * of 5 suggestions per hour per IP address.</p>
     *
     * @param ipAddress IPv4 or IPv6 address of the submitter
     * @param after Timestamp threshold (typically 1 hour ago)
     * @return Number of suggestions from this IP since the given timestamp
     */
    fun countByIpAddressAndCreatedAtAfter(
        ipAddress: String,
        after: Instant,
    ): Long

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
}
