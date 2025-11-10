package com.nosilha.core.contentactions.api

import com.nosilha.core.contentactions.domain.SuggestionType
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.util.UUID

/**
 * DTO for submitting a suggestion for content improvement.
 *
 * <p>Used in POST /api/v1/suggestions endpoint. Does not require authentication.</p>
 *
 * <p><strong>Validation Rules:</strong></p>
 * <ul>
 *   <li>Name: 2-255 characters</li>
 *   <li>Email: Valid email format</li>
 *   <li>Message: 10-5000 characters</li>
 *   <li>Honeypot field must be empty (spam protection)</li>
 * </ul>
 *
 * @property contentId UUID of the heritage page/content to improve
 * @property name Submitter's name
 * @property email Submitter's email (for follow-up)
 * @property suggestionType Type of suggestion (CORRECTION, ADDITION, FEEDBACK)
 * @property message Detailed suggestion message
 * @property honeypot Honeypot field for spam protection (should be empty)
 */
data class SuggestionCreateDto(
    @field:NotNull(message = "Content ID is required")
    val contentId: UUID,
    @field:NotBlank(message = "Name is required")
    @field:Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters")
    val name: String,
    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Invalid email format")
    @field:Size(max = 255, message = "Email must not exceed 255 characters")
    val email: String,
    @field:NotNull(message = "Suggestion type is required")
    val suggestionType: SuggestionType,
    @field:NotBlank(message = "Message is required")
    @field:Size(min = 10, max = 5000, message = "Message must be between 10 and 5000 characters")
    val message: String,
    // Honeypot field for spam protection (should be empty)
    val honeypot: String? = null,
)

/**
 * DTO for suggestion response after successful submission.
 *
 * <p>Returned from POST /api/v1/suggestions endpoint with a confirmation message.</p>
 *
 * @property id UUID of the created suggestion (null for spam or errors)
 * @property message Confirmation message thanking the user for their contribution
 */
data class SuggestionResponseDto(
    val id: UUID?,
    val message: String = "Thank you for helping preserve our cultural heritage. Your suggestion has been received.",
)
