package com.nosilha.core.contentactions

import com.nosilha.core.contentactions.api.ModerationAction
import com.nosilha.core.contentactions.api.SuggestionCreateDto
import com.nosilha.core.contentactions.api.SuggestionDetailDto
import com.nosilha.core.contentactions.api.SuggestionListDto
import com.nosilha.core.contentactions.api.SuggestionResponseDto
import com.nosilha.core.contentactions.api.toDetailDto
import com.nosilha.core.contentactions.api.toListDto
import com.nosilha.core.contentactions.domain.Suggestion
import com.nosilha.core.contentactions.domain.SuggestionStatus
import com.nosilha.core.contentactions.events.SuggestionStatusChangedEvent
import com.nosilha.core.contentactions.repository.SuggestionRepository
import com.nosilha.core.shared.exception.RateLimitExceededException
import com.nosilha.core.shared.exception.ResourceNotFoundException
import com.nosilha.core.shared.util.ContentSanitizer
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.*

/**
 * Service for managing content improvement suggestions from community members.
 *
 * Implements rate limiting (5 submissions per hour per IP address) and honeypot
 * spam protection to maintain content quality while allowing unauthenticated contributions.
 *
 * @property suggestionRepository Repository for persisting suggestions
 */
@Service
class SuggestionService(
    private val suggestionRepository: SuggestionRepository,
    private val eventPublisher: ApplicationEventPublisher,
) {
    private val logger = LoggerFactory.getLogger(SuggestionService::class.java)

    companion object {
        const val MAX_SUBMISSIONS_PER_HOUR = 5
    }

    /**
     * Submits a new content improvement suggestion.
     *
     * @param dto Suggestion data from the form submission
     * @param ipAddress IP address of the submitter (for rate limiting)
     * @return Response DTO with confirmation message
     * @throws RateLimitExceededException if user has exceeded submission limit
     * @throws HoneypotSpamDetectedException if honeypot field is filled
     */
    @Transactional
    fun submitSuggestion(
        dto: SuggestionCreateDto,
        ipAddress: String?,
    ): SuggestionResponseDto {
        logger.info("Processing suggestion submission for content ${dto.contentId} from IP: $ipAddress")

        // Honeypot spam protection
        if (!dto.honeypot.isNullOrBlank()) {
            logger.warn("Honeypot field detected - potential spam from IP: $ipAddress")
            throw HoneypotSpamDetectedException("Spam submission detected")
        }

        // Rate limiting by IP address
        if (ipAddress != null && isRateLimitExceeded(ipAddress)) {
            logger.warn("Rate limit exceeded for IP: $ipAddress")
            throw RateLimitExceededException(
                "You have exceeded the maximum number of submissions ($MAX_SUBMISSIONS_PER_HOUR per hour). " +
                    "Please try again later.",
            )
        }

        // Sanitize user input to prevent XSS
        val sanitizedPageTitle = ContentSanitizer.sanitizeStrict(dto.pageTitle.trim())
        val sanitizedName = ContentSanitizer.sanitizeStrict(dto.name.trim())
        val sanitizedMessage = ContentSanitizer.sanitize(dto.message.trim())

        // Create and persist suggestion
        val suggestion =
            Suggestion(
                contentId = dto.contentId,
                pageTitle = sanitizedPageTitle,
                pageUrl = dto.pageUrl.trim(),
                contentType = dto.contentType.trim().lowercase(),
                name = sanitizedName,
                email = dto.email.trim().lowercase(),
                suggestionType = dto.suggestionType,
                message = sanitizedMessage,
                ipAddress = ipAddress,
            )

        val savedSuggestion = suggestionRepository.save(suggestion)
        logger.info("Suggestion ${savedSuggestion.id} created successfully for content ${dto.contentId}")

        // TODO: Send email notification to administrators
        // This will be implemented when email service is available
        logger.info("Email notification would be sent for suggestion ${savedSuggestion.id}")

        return SuggestionResponseDto(
            id = savedSuggestion.id!!,
            message =
                "Thank you for helping preserve our cultural heritage. Your suggestion has been received " +
                    "and will be reviewed by our team.",
        )
    }

    /**
     * Checks if the IP address has exceeded the rate limit.
     *
     * Rate limit: 5 submissions per hour per IP address
     *
     * @param ipAddress IP address to check
     * @return true if rate limit is exceeded, false otherwise
     */
    private fun isRateLimitExceeded(ipAddress: String): Boolean {
        val oneHourAgo = Instant.now().minus(1, ChronoUnit.HOURS)
        val recentSubmissions = suggestionRepository.countByIpAddressAndCreatedAtAfter(ipAddress, oneHourAgo)

        logger.debug("IP $ipAddress has $recentSubmissions submissions in the last hour")
        return recentSubmissions >= MAX_SUBMISSIONS_PER_HOUR
    }

    /**
     * Gets all suggestions for a specific content page.
     *
     * This method is for future admin functionality to review suggestions.
     *
     * @param contentId UUID of the content page
     * @return List of suggestions for the content
     */
    @Transactional(readOnly = true)
    fun getSuggestionsForContent(contentId: UUID): List<Suggestion> = suggestionRepository.findByContentIdOrderByCreatedAtDesc(contentId)

    /**
     * Lists suggestions with optional status filtering and pagination.
     *
     * Admin endpoint to view all suggestions with support for filtering by moderation status.
     * Page size is capped at 100 to prevent excessive data transfer.
     *
     * @param status Optional status filter (PENDING, APPROVED, REJECTED). If null, returns all suggestions.
     * @param page Zero-based page number
     * @param size Number of items per page (max 100)
     * @return Paginated list of suggestions as list DTOs
     */
    @Transactional(readOnly = true)
    fun listSuggestions(
        status: SuggestionStatus?,
        page: Int,
        size: Int,
    ): Page<SuggestionListDto> {
        val pageable = PageRequest.of(page, minOf(size, 100))
        val suggestions =
            if (status != null) {
                suggestionRepository.findByStatus(status, pageable)
            } else {
                suggestionRepository.findAllBy(pageable)
            }

        logger.debug("Retrieved ${suggestions.numberOfElements} suggestions (page $page, size $size, status: $status)")
        return suggestions.map { it.toListDto() }
    }

    /**
     * Lists suggestions with full details for admin queue display.
     *
     * Returns complete suggestion data including message and page context,
     * enabling admins to make moderation decisions without loading individual details.
     *
     * @param status Optional status filter (PENDING, APPROVED, REJECTED). If null, returns all suggestions.
     * @param page Zero-based page number
     * @param size Number of items per page (max 100)
     * @return Paginated list of suggestions as detail DTOs
     */
    @Transactional(readOnly = true)
    fun listSuggestionsWithDetails(
        status: SuggestionStatus?,
        page: Int,
        size: Int,
    ): Page<SuggestionDetailDto> {
        val pageable = PageRequest.of(page, minOf(size, 100))
        val suggestions =
            if (status != null) {
                suggestionRepository.findByStatus(status, pageable)
            } else {
                suggestionRepository.findAllBy(pageable)
            }

        logger.debug("Retrieved ${suggestions.numberOfElements} suggestions with details (page $page, size $size, status: $status)")
        return suggestions.map { it.toDetailDto() }
    }

    /**
     * Gets detailed information for a specific suggestion.
     *
     * Admin endpoint to view complete suggestion details for review.
     *
     * @param id UUID of the suggestion
     * @return Suggestion detail DTO with all fields
     * @throws ResourceNotFoundException if suggestion is not found
     */
    @Transactional(readOnly = true)
    fun getSuggestion(id: UUID): SuggestionDetailDto {
        val suggestion =
            suggestionRepository
                .findById(id)
                .orElseThrow { ResourceNotFoundException("Suggestion with id $id not found") }

        logger.debug("Retrieved suggestion $id for admin review")
        return suggestion.toDetailDto()
    }

    /**
     * Updates the status of a suggestion based on admin moderation action.
     *
     * Admin endpoint to approve or reject suggestions. Publishes a status change event
     * for potential email notifications or audit logging.
     *
     * @param id UUID of the suggestion
     * @param action Moderation action (APPROVE or REJECT)
     * @param notes Optional admin notes about the review decision
     * @param adminId Supabase user ID of the admin performing the review
     * @return Updated suggestion detail DTO
     * @throws ResourceNotFoundException if suggestion is not found
     */
    @Transactional
    fun updateSuggestionStatus(
        id: UUID,
        action: ModerationAction,
        notes: String?,
        adminId: String,
    ): SuggestionDetailDto {
        val suggestion =
            suggestionRepository
                .findById(id)
                .orElseThrow { ResourceNotFoundException("Suggestion with id $id not found") }

        val previousStatus = suggestion.status
        val newStatus =
            when (action) {
                ModerationAction.APPROVE -> SuggestionStatus.APPROVED
                ModerationAction.REJECT -> SuggestionStatus.REJECTED
            }

        // Sanitize admin notes if provided
        val sanitizedNotes = notes?.let { ContentSanitizer.sanitizeStrict(it) }

        val updatedSuggestion =
            suggestion.copy(
                status = newStatus,
                adminNotes = sanitizedNotes,
                reviewedBy = adminId,
                reviewedAt = Instant.now(),
            )

        val savedSuggestion = suggestionRepository.save(updatedSuggestion)
        logger.info("Suggestion $id status changed from $previousStatus to $newStatus by admin $adminId")

        // Publish event for potential email notifications
        val event =
            SuggestionStatusChangedEvent(
                suggestionId = id,
                previousStatus = previousStatus,
                newStatus = newStatus,
                reviewedBy = adminId,
                adminNotes = notes,
            )
        eventPublisher.publishEvent(event)
        logger.debug("Published SuggestionStatusChangedEvent for suggestion $id")

        return savedSuggestion.toDetailDto()
    }

    /**
     * Deletes a suggestion from the system.
     *
     * Admin endpoint to remove spam or invalid suggestions. This operation is permanent
     * and should be used sparingly as it breaks the audit trail.
     *
     * @param id UUID of the suggestion to delete
     * @throws ResourceNotFoundException if suggestion is not found
     */
    @Transactional
    fun deleteSuggestion(id: UUID) {
        val suggestion =
            suggestionRepository
                .findById(id)
                .orElseThrow { ResourceNotFoundException("Suggestion with id $id not found") }

        suggestionRepository.delete(suggestion)
        logger.warn("Suggestion $id deleted by admin (content: ${suggestion.contentId}, type: ${suggestion.suggestionType})")
    }
}

/**
 * Exception thrown when honeypot spam protection is triggered.
 */
class HoneypotSpamDetectedException(
    message: String
) : RuntimeException(message)
