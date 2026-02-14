package com.nosilha.core.engagement.domain

import com.nosilha.core.shared.domain.AuditableEntity
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
class Content(
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
) : AuditableEntity() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as Content
        return id != null && id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 31

    override fun toString(): String = "Content(id=$id, slug='$slug', type=$contentType)"
}

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
