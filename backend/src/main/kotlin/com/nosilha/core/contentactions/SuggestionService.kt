package com.nosilha.core.contentactions

import com.nosilha.core.contentactions.api.SuggestionCreateDto
import com.nosilha.core.contentactions.api.SuggestionResponseDto
import com.nosilha.core.contentactions.domain.Suggestion
import com.nosilha.core.contentactions.repository.SuggestionRepository
import org.slf4j.LoggerFactory
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

        // Create and persist suggestion
        val suggestion =
            Suggestion(
                contentId = dto.contentId,
                name = dto.name.trim(),
                email = dto.email.trim().lowercase(),
                suggestionType = dto.suggestionType,
                message = dto.message.trim(),
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
    fun getSuggestionsForContent(contentId: UUID): List<Suggestion> {
        return suggestionRepository.findByContentIdOrderByCreatedAtDesc(contentId)
    }
}

/**
 * Exception thrown when rate limit is exceeded.
 */
class RateLimitExceededException(message: String) : RuntimeException(message)

/**
 * Exception thrown when honeypot spam protection is triggered.
 */
class HoneypotSpamDetectedException(message: String) : RuntimeException(message)
