package com.nosilha.core.feedback.api

import com.nosilha.core.feedback.domain.ContactMessage
import com.nosilha.core.feedback.domain.ContactSubject
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.util.UUID

/**
 * Request DTO for creating a contact form submission.
 *
 * <p>Validation rules follow the ContactMessage entity constraints:</p>
 * <ul>
 *   <li>Name: 2-100 characters</li>
 *   <li>Email: Valid email format</li>
 *   <li>Subject category: Required, one of GENERAL_INQUIRY, CONTENT_SUGGESTION, TECHNICAL_ISSUE, PARTNERSHIP</li>
 *   <li>Message: 10-5000 characters</li>
 * </ul>
 *
 * @see ContactMessage
 * @see ContactSubject
 */
data class ContactCreateRequest(
    @field:NotBlank(message = "Name is required")
    @field:Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    val name: String,
    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Please provide a valid email address")
    val email: String,
    @field:NotNull(message = "Subject category is required")
    val subjectCategory: ContactSubject,
    @field:NotBlank(message = "Message is required")
    @field:Size(min = 10, max = 5000, message = "Message must be between 10 and 5000 characters")
    val message: String,
)

/**
 * Response DTO confirming successful contact form submission.
 *
 * <p>Returns a unique submission ID and a confirmation message for the user.</p>
 */
data class ContactConfirmationDto(
    val id: UUID,
    val message: String,
)

private const val DEFAULT_CONFIRMATION_MESSAGE =
    "Thank you for your message. We'll get back to you within 2-3 business days."

/**
 * Extension function to convert ContactMessage entity to confirmation DTO.
 */
fun ContactMessage.toConfirmationDto(confirmationMessage: String = DEFAULT_CONFIRMATION_MESSAGE,): ContactConfirmationDto =
    ContactConfirmationDto(
        id = checkNotNull(this.id) { "Contact message must be persisted before conversion" },
        message = confirmationMessage,
    )

// ================================
// ADMIN DTOs
// ================================

/**
 * DTO for displaying contact messages in the admin panel.
 *
 * <p>Contains all fields needed for admin review and moderation.</p>
 */
data class AdminContactMessageDto(
    val id: UUID,
    val name: String,
    val email: String,
    val subject: String,
    val message: String,
    val status: String,
    val createdAt: java.time.Instant,
)

/**
 * Request DTO for updating contact message status.
 *
 * <p>Validation ensures only valid status transitions are allowed.</p>
 */
data class UpdateContactStatusRequest(
    @field:NotNull(message = "Status is required")
    val status: com.nosilha.core.feedback.domain.ContactStatus,
)

/**
 * Extension function to convert ContactMessage entity to admin DTO.
 */
fun ContactMessage.toAdminDto(): AdminContactMessageDto =
    AdminContactMessageDto(
        id = checkNotNull(this.id) { "Contact message must be persisted before conversion" },
        name = this.name,
        email = this.email,
        subject = this.subjectCategory.name,
        message = this.message,
        status = this.status.name,
        createdAt = this.createdAt,
    )
