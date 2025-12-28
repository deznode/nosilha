package com.nosilha.core.contentactions.repository

import com.nosilha.core.contentactions.domain.StoryStatus
import com.nosilha.core.contentactions.domain.StorySubmission
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.Instant
import java.util.UUID

/**
 * Spring Data JPA repository for the StorySubmission entity.
 *
 * <p>Provides standard CRUD operations and custom queries for:
 * <ul>
 *   <li>Finding stories by author ID (for user dashboards)</li>
 *   <li>Finding stories by status (for admin moderation)</li>
 *   <li>Counting recent submissions by IP address (for rate limiting)</li>
 *   <li>Counting stories by status (for admin statistics)</li>
 *   <li>Pagination support for all listing operations</li>
 * </ul>
 *
 * <p><strong>Rate Limiting:</strong> The service layer uses
 * {@code countByIpAddressAndCreatedAtAfter} to enforce a limit of 5 submissions
 * per hour per IP address to prevent spam and abuse.</p>
 *
 * <p><strong>Moderation Workflow:</strong> Admins use {@code findByStatus} to
 * review pending stories, approve for publication, or reject with feedback.</p>
 */
@Repository
interface StorySubmissionRepository : JpaRepository<StorySubmission, UUID> {
    /**
     * Counts story submissions from a specific IP address after a given timestamp.
     *
     * <p>Used for rate limiting to prevent spam. The service layer enforces a limit
     * of 5 submissions per hour per IP address.</p>
     *
     * @param ipAddress IPv4 or IPv6 address of the submitter
     * @param after Timestamp threshold (typically 1 hour ago)
     * @return Number of submissions from this IP since the given timestamp
     */
    fun countByIpAddressAndCreatedAtAfter(
        ipAddress: String,
        after: Instant,
    ): Long

    /**
     * Finds all story submissions by a specific author.
     *
     * <p>Used for user profile contribution history to display all stories
     * submitted by the user.</p>
     *
     * @param authorId User ID from authentication system (Supabase)
     * @return List of stories by the author
     */
    fun findByAuthorId(authorId: String): List<StorySubmission>

    /**
     * Finds all story submissions by a specific author, ordered by creation time.
     *
     * <p>Used for user dashboards to display their submitted stories and
     * moderation status.</p>
     *
     * @param authorId User ID from authentication system (Supabase)
     * @return List of stories ordered by creation time (newest first)
     */
    fun findByAuthorIdOrderByCreatedAtDesc(authorId: String): List<StorySubmission>

    /**
     * Finds all story submissions with a specific status (paginated).
     *
     * <p>Used for admin moderation workflows to review pending stories,
     * manage approved stories, or review rejected submissions.</p>
     *
     * @param status Moderation status (PENDING, APPROVED, REJECTED, NEEDS_REVISION, PUBLISHED)
     * @param pageable Pagination parameters (page number, size, sort)
     * @return Page of stories with the specified status
     */
    fun findByStatus(
        status: StoryStatus,
        pageable: Pageable,
    ): Page<StorySubmission>

    /**
     * Finds all story submissions (paginated).
     *
     * <p>Used for admin dashboards to display all stories across all statuses.</p>
     *
     * @param pageable Pagination parameters (page number, size, sort)
     * @return Page of all story submissions
     */
    fun findAllBy(pageable: Pageable): Page<StorySubmission>

    /**
     * Counts the number of story submissions with a specific status.
     *
     * <p>Used for admin statistics and dashboard metrics to show
     * pending review count, approved count, etc.</p>
     *
     * @param status Moderation status to count
     * @return Number of stories with the specified status
     */
    fun countByStatus(status: StoryStatus): Long

    /**
     * Finds a story by its publication slug and status.
     *
     * <p>Used for public story detail pages to retrieve published stories
     * by their URL-friendly slug.</p>
     *
     * @param publicationSlug The URL-friendly slug of the story
     * @param status The required status (typically PUBLISHED)
     * @return The story if found with matching slug and status, null otherwise
     */
    fun findByPublicationSlugAndStatus(
        publicationSlug: String,
        status: StoryStatus,
    ): StorySubmission?

    /**
     * Finds all published stories ordered by creation date (newest first).
     *
     * <p>Used for public story listing pages to display approved content.</p>
     *
     * @param status The status filter (typically PUBLISHED)
     * @param pageable Pagination parameters
     * @return Page of stories with the specified status, ordered by creation date descending
     */
    fun findByStatusOrderByCreatedAtDesc(
        status: StoryStatus,
        pageable: Pageable,
    ): Page<StorySubmission>

    /**
     * Counts the number of distinct authors who created stories after a given timestamp.
     *
     * <p>Used for dashboard statistics to calculate active users (unique contributors
     * in a time period, typically last 30 days).</p>
     *
     * @param after Timestamp threshold (e.g., 30 days ago)
     * @return Number of distinct authors with submissions since the given timestamp
     */
    @Query("SELECT COUNT(DISTINCT s.authorId) FROM StorySubmission s WHERE s.createdAt >= :after")
    fun countDistinctAuthorsByCreatedAtAfter(after: Instant): Long

    /**
     * Counts the number of story submissions created between two timestamps.
     *
     * <p>Used for weekly activity charts to show daily submission counts.</p>
     *
     * @param startDate Start of time range (inclusive)
     * @param endDate End of time range (exclusive)
     * @return Number of submissions created in the time range
     */
    fun countByCreatedAtBetween(
        startDate: Instant,
        endDate: Instant,
    ): Long

    /**
     * Finds top contributors by story count.
     *
     * <p>Returns a list of author IDs and their story counts, ordered by count descending.
     * Used for contributor leaderboards and dashboard statistics.</p>
     *
     * @return List of pairs (authorId, storyCount) ordered by count descending
     */
    @Query(
        """
        SELECT s.authorId, COUNT(s)
        FROM StorySubmission s
        GROUP BY s.authorId
        ORDER BY COUNT(s) DESC
        """,
    )
    fun findTopContributorsByStoryCount(): List<Array<Any>>
}
