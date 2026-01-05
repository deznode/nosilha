package com.nosilha.core.feedback.domain

import com.nosilha.core.shared.domain.AuditableEntity
import jakarta.persistence.*
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.util.UUID

/**
 * Represents a visitor contact form submission for admin review.
 *
 * <p>Contact messages are submitted by visitors (authenticated or anonymous) and stored
 * for admin review. Messages are categorized by subject and tracked with status updates.</p>
 *
 * <p><strong>Validation Rules:</strong></p>
 * <ul>
 *   <li>Name: 2-100 characters</li>
 *   <li>Email: Valid email format (RFC 5322)</li>
 *   <li>Subject category: GENERAL_INQUIRY, CONTENT_SUGGESTION, TECHNICAL_ISSUE, or PARTNERSHIP</li>
 *   <li>Message: 10-5000 characters (minimum substance, maximum prevent abuse)</li>
 *   <li>IP address: Stored for rate limiting and abuse prevention (max 45 chars for IPv6)</li>
 * </ul>
 *
 * <p><strong>Retention Policy:</strong></p>
 * <ul>
 *   <li>Messages older than 1 year may be automatically deleted</li>
 *   <li>Implement via scheduled job or database trigger</li>
 * </ul>
 *
 * <p><strong>State Transitions:</strong></p>
 * <ul>
 *   <li>UNREAD → READ → ARCHIVED</li>
 *   <li>UNREAD → ARCHIVED (direct archive allowed)</li>
 *   <li>All transitions are admin-initiated only</li>
 * </ul>
 *
 * @see ContactSubject
 * @see ContactStatus
 * @see AuditableEntity
 */
@Entity
@Table(
    name = "contact_messages",
    indexes = [
        Index(name = "idx_contact_messages_status", columnList = "status"),
        Index(name = "idx_contact_messages_created_at", columnList = "created_at"),
        Index(name = "idx_contact_messages_ip_address", columnList = "ip_address"),
    ],
)
data class ContactMessage(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    val id: UUID? = null,
    @NotBlank
    @Size(min = 2, max = 100)
    @Column(name = "name", nullable = false, length = 100)
    val name: String,
    @NotBlank
    @Email
    @Column(name = "email", nullable = false, length = 255)
    val email: String,
    @Enumerated(EnumType.STRING)
    @Column(name = "subject_category", nullable = false, length = 50)
    val subjectCategory: ContactSubject,
    @NotBlank
    @Size(min = 10, max = 5000)
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    val message: String,
    @Column(name = "ip_address", nullable = false, length = 45)
    val ipAddress: String,
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    val status: ContactStatus = ContactStatus.UNREAD,
) : AuditableEntity()
