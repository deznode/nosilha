package com.nosilha.core.feedback.domain

import jakarta.persistence.*
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import org.hibernate.annotations.CreationTimestamp
import java.time.Instant
import java.util.UUID

/**
 * Represents a community contribution for content improvement (corrections, additions, feedback).
 *
 * <p>Suggestions are immutable once created to maintain an audit trail. They are never
 * updated or deleted, but may be marked as reviewed in the future.</p>
 *
 * <p><strong>Validation Rules:</strong></p>
 * <ul>
 *   <li>Name: 2-255 characters</li>
 *   <li>Email: Valid email format (RFC 5322)</li>
 *   <li>Suggestion type: CORRECTION, ADDITION, or FEEDBACK</li>
 *   <li>Message: 10-5000 characters (minimum substance, maximum prevent abuse)</li>
 *   <li>Rate limiting: Maximum 5 submissions per hour per IP address (enforced in service layer)</li>
 *   <li>Honeypot validation: Client-side field must be empty (enforced in controller)</li>
 * </ul>
 *
 * @see SuggestionType
 */
@Entity
@Table(
    name = "suggestions",
    indexes = [
        Index(name = "idx_suggestions_created", columnList = "created_at"),
        Index(name = "idx_suggestions_content", columnList = "content_id"),
        Index(name = "idx_suggestions_ip", columnList = "ip_address, created_at"),
    ],
)
data class Suggestion(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    val id: UUID? = null,
    @NotNull
    @Column(name = "content_id", nullable = false)
    val contentId: UUID,
    @NotBlank
    @Size(min = 2, max = 255)
    @Column(name = "name", nullable = false, length = 255)
    val name: String,
    @NotBlank
    @Email
    @Size(max = 255)
    @Column(name = "email", nullable = false, length = 255)
    val email: String,
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "suggestion_type", nullable = false, length = 20)
    val suggestionType: SuggestionType,
    @NotBlank
    @Size(min = 10, max = 5000)
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    val message: String,
    @Column(name = "page_title", length = 512)
    val pageTitle: String? = null,
    @Column(name = "page_url", length = 2048)
    val pageUrl: String? = null,
    @Column(name = "content_type", length = 100)
    val contentType: String? = null,
    @Size(max = 45)
    @Column(name = "ip_address", length = 45)
    val ipAddress: String? = null,
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant? = null,
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    val status: SuggestionStatus = SuggestionStatus.PENDING,
    @Size(max = 5000)
    @Column(name = "admin_notes", columnDefinition = "TEXT")
    val adminNotes: String? = null,
    @Size(max = 255)
    @Column(name = "reviewed_by", length = 255)
    val reviewedBy: String? = null,
    @Column(name = "reviewed_at")
    val reviewedAt: Instant? = null,
)

/**
 * Enum representing the types of community suggestions for content improvement.
 *
 * <p>Each suggestion type has a specific purpose:</p>
 * <ul>
 *   <li>CORRECTION: Fix factual errors or inaccuracies in cultural heritage content</li>
 *   <li>ADDITION: Add missing information or context to enrich heritage descriptions</li>
 *   <li>FEEDBACK: General feedback on content quality and presentation</li>
 * </ul>
 */
enum class SuggestionType {
    /** Fix factual errors or inaccuracies */
    CORRECTION,

    /** Add missing information or context */
    ADDITION,

    /** General feedback on content quality */
    FEEDBACK,
}
