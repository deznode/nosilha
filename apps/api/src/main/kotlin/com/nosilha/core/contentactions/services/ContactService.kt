package com.nosilha.core.contentactions.services

import com.nosilha.core.contentactions.api.AdminContactMessageDto
import com.nosilha.core.contentactions.api.ContactConfirmationDto
import com.nosilha.core.contentactions.api.ContactCreateRequest
import com.nosilha.core.contentactions.api.toAdminDto
import com.nosilha.core.contentactions.api.toConfirmationDto
import com.nosilha.core.contentactions.domain.ContactMessage
import com.nosilha.core.contentactions.domain.ContactStatus
import com.nosilha.core.contentactions.repository.ContactMessageRepository
import com.nosilha.core.shared.exception.RateLimitExceededException
import com.nosilha.core.shared.exception.ResourceNotFoundException
import com.nosilha.core.shared.util.ContentSanitizer
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.UUID

/**
 * Service for managing contact form submissions.
 *
 * <p>Implements rate limiting (3 submissions per hour per IP address) to prevent spam
 * while allowing unauthenticated visitors to submit contact messages.</p>
 *
 * <p><strong>Business Rules:</strong></p>
 * <ul>
 *   <li>Rate limit: 3 submissions per hour per IP address</li>
 *   <li>All submissions start with UNREAD status</li>
 *   <li>IP addresses are stored for rate limiting and abuse prevention</li>
 * </ul>
 *
 * @property contactMessageRepository Repository for persisting contact messages
 */
@Service
class ContactService(
    private val contactMessageRepository: ContactMessageRepository,
) {
    private val logger = LoggerFactory.getLogger(ContactService::class.java)

    companion object {
        /** Maximum contact submissions per hour per IP address */
        const val MAX_SUBMISSIONS_PER_HOUR = 3
    }

    /**
     * Submits a new contact form message.
     *
     * <p>Performs rate limiting checks before persisting the message. Messages are stored
     * with UNREAD status for admin review.</p>
     *
     * @param request Contact form data from the submission
     * @param ipAddress IP address of the submitter (for rate limiting)
     * @return Confirmation DTO with message ID and success message
     * @throws RateLimitExceededException if user has exceeded submission limit
     */
    @Transactional
    fun submitContact(
        request: ContactCreateRequest,
        ipAddress: String?,
    ): ContactConfirmationDto {
        logger.info("Processing contact form submission from IP: $ipAddress")

        // Rate limiting by IP address
        if (ipAddress != null && isRateLimitExceeded(ipAddress)) {
            logger.warn("Rate limit exceeded for IP: $ipAddress")
            throw RateLimitExceededException(
                "You have exceeded the maximum number of contact submissions ($MAX_SUBMISSIONS_PER_HOUR per hour). " +
                    "Please try again later.",
            )
        }

        // Sanitize user input to prevent XSS
        val sanitizedName = ContentSanitizer.sanitizeStrict(request.name.trim())
        val sanitizedMessage = ContentSanitizer.sanitize(request.message.trim())

        // Create and persist contact message
        val contactMessage = ContactMessage(
            name = sanitizedName,
            email = request.email.trim().lowercase(),
            subjectCategory = request.subjectCategory,
            message = sanitizedMessage,
            ipAddress = ipAddress ?: "unknown",
            status = ContactStatus.UNREAD,
        )

        val savedMessage = contactMessageRepository.save(contactMessage)
        logger.info("Contact message ${savedMessage.id} created successfully")

        return savedMessage.toConfirmationDto()
    }

    /**
     * Checks if the IP address has exceeded the rate limit.
     *
     * <p>Rate limit: 3 submissions per hour per IP address</p>
     *
     * @param ipAddress IP address to check
     * @return true if rate limit is exceeded, false otherwise
     */
    private fun isRateLimitExceeded(ipAddress: String): Boolean {
        val oneHourAgo = LocalDateTime.now().minusHours(1)
        val recentSubmissions = contactMessageRepository.countByIpAddressAndCreatedAtAfter(ipAddress, oneHourAgo)

        logger.debug("IP $ipAddress has $recentSubmissions contact submissions in the last hour")
        return recentSubmissions >= MAX_SUBMISSIONS_PER_HOUR
    }

    // ================================
    // ADMIN METHODS
    // ================================

    /**
     * Lists contact messages with optional status filtering and pagination.
     *
     * <p>Used by admin panel for moderation queue. Messages are sorted by creation date (newest first).</p>
     *
     * @param status Optional status filter (UNREAD, READ, ARCHIVED)
     * @param page Zero-based page number (default: 0)
     * @param size Number of items per page (default: 20, max: 100)
     * @return Page of AdminContactMessageDto
     */
    @Transactional(readOnly = true)
    fun listMessages(
        status: ContactStatus?,
        page: Int,
        size: Int,
    ): Page<AdminContactMessageDto> {
        val pageable = PageRequest.of(page, size.coerceAtMost(100))

        val messages =
            if (status != null) {
                contactMessageRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
            } else {
                contactMessageRepository.findAllByOrderByCreatedAtDesc(pageable)
            }

        logger.debug("Found ${messages.totalElements} contact messages (status=$status, page=$page)")
        return messages.map { it.toAdminDto() }
    }

    /**
     * Gets a single contact message by ID.
     *
     * @param id UUID of the contact message
     * @return AdminContactMessageDto
     * @throws ResourceNotFoundException if message is not found
     */
    @Transactional(readOnly = true)
    fun getMessage(id: UUID): AdminContactMessageDto {
        val message =
            contactMessageRepository.findById(id).orElseThrow {
                ResourceNotFoundException("Contact message not found: $id")
            }
        return message.toAdminDto()
    }

    /**
     * Updates the status of a contact message.
     *
     * <p>Allows admins to mark messages as READ or ARCHIVED.</p>
     *
     * @param id UUID of the contact message
     * @param status New status (READ or ARCHIVED)
     * @return Updated AdminContactMessageDto
     * @throws ResourceNotFoundException if message is not found
     */
    @Transactional
    fun updateStatus(
        id: UUID,
        status: ContactStatus,
    ): AdminContactMessageDto {
        val message =
            contactMessageRepository.findById(id).orElseThrow {
                ResourceNotFoundException("Contact message not found: $id")
            }

        logger.info("Updating contact message $id status from ${message.status} to $status")

        val updatedMessage = message.copy(status = status)
        val saved = contactMessageRepository.save(updatedMessage)

        return saved.toAdminDto()
    }

    /**
     * Deletes a contact message.
     *
     * <p>Permanently removes a message from the database. This operation cannot be undone.</p>
     *
     * @param id UUID of the contact message to delete
     * @throws ResourceNotFoundException if message is not found
     */
    @Transactional
    fun deleteMessage(id: UUID) {
        if (!contactMessageRepository.existsById(id)) {
            throw ResourceNotFoundException("Contact message not found: $id")
        }

        logger.info("Deleting contact message $id")
        contactMessageRepository.deleteById(id)
    }

    /**
     * Counts contact messages by status.
     *
     * <p>Used for dashboard pending counts.</p>
     *
     * @param status Contact message status to count
     * @return Number of messages with the specified status
     */
    @Transactional(readOnly = true)
    fun countByStatus(status: ContactStatus): Long = contactMessageRepository.countByStatus(status)
}
