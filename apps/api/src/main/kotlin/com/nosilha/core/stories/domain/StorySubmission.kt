package com.nosilha.core.stories.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.Table
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.Instant
import java.util.UUID

/**
 * Represents a community-submitted story about Brava Island cultural heritage.
 *
 * <p>Story submissions are user-generated content that contribute to the living memory
 * of Brava Island. They can be brief memories (QUICK), complete narratives (FULL), or
 * template-guided stories (GUIDED) following structured prompts for specific themes.</p>
 *
 * <p><strong>Moderation Workflow:</strong></p>
 * <ul>
 *   <li>PENDING: Awaiting admin review (default state)</li>
 *   <li>APPROVED: Accepted by admin, ready for publication</li>
 *   <li>REJECTED: Declined by admin with optional admin notes</li>
 *   <li>NEEDS_REVISION: Returned to author for edits (future feature)</li>
 *   <li>PUBLISHED: Published and publicly visible with unique slug</li>
 * </ul>
 *
 * <p><strong>Validation Rules:</strong></p>
 * <ul>
 *   <li>Title: 1-255 characters</li>
 *   <li>Content: 10-5000 characters (minimum substance, maximum prevent abuse)</li>
 *   <li>Story type: QUICK, FULL, or GUIDED</li>
 *   <li>Template type: Required for GUIDED stories (FAMILY, CHILDHOOD, DIASPORA, TRADITIONS, FOOD)</li>
 *   <li>Rate limiting: Maximum 5 submissions per hour per IP address (enforced in service layer)</li>
 * </ul>
 *
 * <p><strong>Featured Stories:</strong> Admins can mark approved/published stories as featured
 * for special display on the platform.</p>
 *
 * @see StoryType
 * @see TemplateType
 * @see StoryStatus
 */
@Entity
@Table(
    name = "story_submissions",
    indexes = [
        Index(name = "idx_story_submissions_status", columnList = "status"),
        Index(name = "idx_story_submissions_author", columnList = "author_id"),
        Index(name = "idx_story_submissions_created", columnList = "created_at"),
        Index(name = "idx_story_submissions_featured", columnList = "is_featured, status"),
        Index(name = "idx_story_submissions_ip", columnList = "ip_address, created_at"),
    ],
)
data class StorySubmission(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    val id: UUID? = null,
    @field:NotBlank
    @field:Size(min = 1, max = 255)
    @Column(nullable = false)
    val title: String,
    @field:NotBlank
    @field:Size(min = 10, max = 5000)
    @Column(nullable = false, columnDefinition = "TEXT")
    val content: String,
    @Enumerated(EnumType.STRING)
    @Column(name = "story_type", nullable = false, length = 20)
    val storyType: StoryType,
    @Enumerated(EnumType.STRING)
    @Column(name = "template_type", length = 20)
    val templateType: TemplateType? = null,
    @Column(name = "author_id", nullable = false)
    val authorId: String,
    @Column(name = "related_place_id")
    val relatedPlaceId: UUID? = null,
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var status: StoryStatus = StoryStatus.PENDING,
    @Column(name = "is_featured", nullable = false)
    var isFeatured: Boolean = false,
    @Column(name = "admin_notes", columnDefinition = "TEXT")
    var adminNotes: String? = null,
    @Column(name = "reviewed_by")
    var reviewedBy: String? = null,
    @Column(name = "reviewed_at")
    var reviewedAt: Instant? = null,
    @Column(name = "publication_slug", unique = true)
    var publicationSlug: String? = null,
    @Column(name = "ip_address", length = 45)
    val ipAddress: String? = null,
    @Column(name = "archived_at")
    var archivedAt: Instant? = null,
    @Column(name = "archived_slug", length = 255)
    var archivedSlug: String? = null,
    @Column(name = "archived_by", length = 255)
    var archivedBy: String? = null,
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant? = null,
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant? = null,
)
