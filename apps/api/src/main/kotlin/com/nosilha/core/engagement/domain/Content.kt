package com.nosilha.core.engagement.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.Instant
import java.util.UUID

/**
 * Represents registered content in the system for tracking reactions and interactions.
 *
 * <p>Content is automatically registered when first accessed. The slug serves as the
 * unique identifier for MDX articles and pages, while the generated UUID is used for
 * database relationships (e.g., reactions).</p>
 *
 * <p><strong>Content Types:</strong></p>
 * <ul>
 *   <li>ARTICLE: Content from /articles/ routes (MDX articles)</li>
 *   <li>PAGE: Content from top-level routes like /history (MDX pages)</li>
 *   <li>DIRECTORY_ENTRY: Content from /directory/ routes (legacy)</li>
 * </ul>
 *
 * @see ContentType
 */
@Entity
@Table(
    name = "content",
    uniqueConstraints = [
        UniqueConstraint(name = "uq_content_slug_type", columnNames = ["slug", "content_type"]),
    ],
    indexes = [
        Index(name = "idx_content_slug", columnList = "slug"),
        Index(name = "idx_content_type", columnList = "content_type"),
    ],
)
data class Content(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    val id: UUID? = null,
    @NotBlank
    @Size(min = 3, max = 100)
    @Column(name = "slug", nullable = false, length = 100)
    val slug: String,
    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false, length = 20)
    val contentType: ContentType,
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant? = null,
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    val updatedAt: Instant? = null,
)

/**
 * Enum representing the types of content that can be registered.
 */
enum class ContentType {
    /** MDX article from /articles/ routes */
    ARTICLE,

    /** MDX page from top-level routes (/history, /people) */
    PAGE,

    /** Legacy directory entry from /directory/ routes */
    DIRECTORY_ENTRY,
}
