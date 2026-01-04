package com.nosilha.core.contentactions.repository

import com.nosilha.core.contentactions.domain.DirectorySubmission
import com.nosilha.core.contentactions.domain.DirectorySubmissionStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

/**
 * Spring Data JPA repository for the DirectorySubmission entity.
 *
 * <p>Provides standard CRUD operations and custom queries for:
 * <ul>
 *   <li>Finding submissions by status (for admin moderation)</li>
 *   <li>Counting submissions by status (for admin statistics)</li>
 *   <li>Pagination support for all listing operations</li>
 * </ul>
 *
 * <p><strong>Rate Limiting:</strong> The service layer uses Bucket4j token bucket
 * algorithm for atomic, race-condition-free rate limiting (3 submissions per hour per IP).</p>
 *
 * <p><strong>Moderation Workflow:</strong> Admins use {@code findByStatus} to
 * review pending submissions, approve or reject with feedback.</p>
 */
@Repository
interface DirectorySubmissionRepository : JpaRepository<DirectorySubmission, UUID> {
    /**
     * Finds all directory submissions with a specific status (paginated).
     *
     * <p>Used for admin moderation workflows to review pending submissions,
     * manage approved entries, or review rejected submissions.</p>
     *
     * @param status Moderation status (PENDING, APPROVED, REJECTED)
     * @param pageable Pagination parameters (page number, size, sort)
     * @return Page of submissions with the specified status
     */
    fun findByStatus(
        status: DirectorySubmissionStatus,
        pageable: Pageable,
    ): Page<DirectorySubmission>

    /**
     * Finds all directory submissions ordered by creation time (newest first).
     *
     * <p>Used for admin dashboards to display all submissions across all statuses.</p>
     *
     * @param pageable Pagination parameters (page number, size, sort)
     * @return Page of all directory submissions ordered by creation date descending
     */
    fun findAllByOrderByCreatedAtDesc(pageable: Pageable): Page<DirectorySubmission>

    /**
     * Finds directory submissions by status, ordered by creation time (newest first).
     *
     * <p>Used for admin moderation queue to show most recent submissions first.</p>
     *
     * @param status Moderation status to filter by
     * @param pageable Pagination parameters
     * @return Page of submissions with the specified status, ordered by creation date descending
     */
    fun findByStatusOrderByCreatedAtDesc(
        status: DirectorySubmissionStatus,
        pageable: Pageable,
    ): Page<DirectorySubmission>

    /**
     * Counts the number of directory submissions with a specific status.
     *
     * <p>Used for admin statistics and dashboard metrics to show
     * pending review count, approved count, etc.</p>
     *
     * @param status Moderation status to count
     * @return Number of submissions with the specified status
     */
    fun countByStatus(status: DirectorySubmissionStatus): Long
}
