package com.nosilha.core.contentactions.repository

import com.nosilha.core.contentactions.domain.ContactMessage
import com.nosilha.core.contentactions.domain.ContactStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.UUID

/**
 * Spring Data JPA repository for the ContactMessage entity.
 *
 * <p>Provides standard CRUD operations and custom queries for:
 * <ul>
 *   <li>Counting recent contact messages by IP address (for rate limiting)</li>
 *   <li>Paginated listing with optional status filtering (for admin moderation)</li>
 *   <li>Counting by status (for dashboard counts)</li>
 * </ul>
 *
 * <p><strong>Business Rules:</strong>
 * <ul>
 *   <li>Rate limiting: 3 contact messages per hour per IP address (enforced by service layer)</li>
 *   <li>Retention: Messages older than 1 year may be automatically deleted</li>
 * </ul>
 */
@Repository
interface ContactMessageRepository : JpaRepository<ContactMessage, UUID> {
    /**
     * Counts contact messages submitted from a specific IP address after a given timestamp.
     *
     * <p>Used for rate limiting to prevent spam. The service layer enforces a limit
     * of 3 contact messages per hour per IP address.</p>
     *
     * @param ipAddress IPv4 or IPv6 address of the submitter
     * @param after Timestamp threshold (typically 1 hour ago)
     * @return Number of contact messages from this IP since the given timestamp
     */
    fun countByIpAddressAndCreatedAtAfter(
        ipAddress: String,
        after: LocalDateTime,
    ): Long

    /**
     * Finds all contact messages with optional status filtering, ordered by creation date (newest first).
     *
     * <p>Used by admin panel for moderation queue. Supports pagination for efficient
     * retrieval of large result sets.</p>
     *
     * @param status Filter by message status (UNREAD, READ, ARCHIVED)
     * @param pageable Pagination parameters (page, size, sort)
     * @return Page of contact messages matching the filter criteria
     */
    fun findByStatusOrderByCreatedAtDesc(
        status: ContactStatus,
        pageable: Pageable,
    ): Page<ContactMessage>

    /**
     * Finds all contact messages ordered by creation date (newest first).
     *
     * <p>Used by admin panel when no status filter is applied.</p>
     *
     * @param pageable Pagination parameters (page, size, sort)
     * @return Page of all contact messages
     */
    fun findAllByOrderByCreatedAtDesc(pageable: Pageable): Page<ContactMessage>

    /**
     * Counts contact messages by status.
     *
     * <p>Used for dashboard pending counts and statistics.</p>
     *
     * @param status Contact message status to count
     * @return Number of messages with the specified status
     */
    fun countByStatus(status: ContactStatus): Long
}
