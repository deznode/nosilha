package com.nosilha.core.feedback.domain

import jakarta.persistence.CollectionTable
import jakarta.persistence.Column
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.JoinColumn
import jakarta.persistence.Table
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

/**
 * Represents a community-submitted directory entry for Brava Island.
 *
 * <p>Directory submissions allow community members to suggest new places
 * (restaurants, hotels, beaches, heritage sites, nature sites) to be added to
 * the directory. Submissions go through an admin moderation workflow before
 * being approved and added to the main directory.</p>
 *
 * <p><strong>Moderation Workflow:</strong></p>
 * <ul>
 *   <li>PENDING: Awaiting admin review (default state)</li>
 *   <li>APPROVED: Accepted by admin, entry will be added to directory</li>
 *   <li>REJECTED: Declined by admin with optional admin notes</li>
 * </ul>
 *
 * <p><strong>Validation Rules:</strong></p>
 * <ul>
 *   <li>Name: 1-255 characters (required)</li>
 *   <li>Description: 10-2000 characters (required)</li>
 *   <li>Category: RESTAURANT, HOTEL, BEACH, HERITAGE, or NATURE</li>
 *   <li>Town: Required field</li>
 *   <li>Rate limiting: Maximum 3 submissions per hour per IP address</li>
 * </ul>
 *
 * @see DirectorySubmissionStatus
 * @see DirectorySubmissionCategory
 */
@Entity
@Table(
    name = "directory_submissions",
    indexes = [
        Index(name = "idx_directory_submissions_status", columnList = "status"),
        Index(name = "idx_directory_submissions_category", columnList = "category"),
        Index(name = "idx_directory_submissions_created", columnList = "created_at"),
        Index(name = "idx_directory_submissions_ip", columnList = "ip_address, created_at"),
    ],
)
data class DirectorySubmission(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    val id: UUID? = null,
    @field:NotBlank
    @field:Size(min = 1, max = 255)
    @Column(nullable = false)
    val name: String,
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    val category: DirectorySubmissionCategory,
    @field:NotBlank
    @field:Size(min = 1, max = 100)
    @Column(nullable = false, length = 100)
    val town: String,
    @Column(name = "custom_town", length = 100)
    val customTown: String? = null,
    @field:NotBlank
    @field:Size(min = 10, max = 2000)
    @Column(nullable = false, columnDefinition = "TEXT")
    val description: String,
    @ElementCollection
    @CollectionTable(
        name = "directory_submission_tags",
        joinColumns = [JoinColumn(name = "submission_id")],
    )
    @Column(name = "tag", length = 50)
    val tags: List<String> = emptyList(),
    @Column(name = "image_url", length = 500)
    val imageUrl: String? = null,
    @Column(name = "price_level", length = 5)
    val priceLevel: String? = null,
    @Column(precision = 10, scale = 7)
    val latitude: BigDecimal? = null,
    @Column(precision = 10, scale = 7)
    val longitude: BigDecimal? = null,
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var status: DirectorySubmissionStatus = DirectorySubmissionStatus.PENDING,
    @field:NotBlank
    @Column(name = "submitted_by", nullable = false)
    val submittedBy: String,
    @Column(name = "submitted_by_email", length = 255)
    val submittedByEmail: String? = null,
    @Column(name = "admin_notes", columnDefinition = "TEXT")
    var adminNotes: String? = null,
    @Column(name = "reviewed_by")
    var reviewedBy: String? = null,
    @Column(name = "reviewed_at")
    var reviewedAt: Instant? = null,
    @Column(name = "ip_address", length = 45)
    val ipAddress: String? = null,
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant? = null,
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant? = null,
)
