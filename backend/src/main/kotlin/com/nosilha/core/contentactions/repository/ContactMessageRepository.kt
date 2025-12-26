package com.nosilha.core.contentactions.repository

import com.nosilha.core.contentactions.domain.ContactMessage
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.Instant
import java.util.UUID

/**
 * Spring Data JPA repository for the ContactMessage entity.
 *
 * <p>Provides standard CRUD operations and custom queries for:
 * <ul>
 *   <li>Counting recent contact messages by IP address (for rate limiting)</li>
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
        after: Instant,
    ): Long
}
