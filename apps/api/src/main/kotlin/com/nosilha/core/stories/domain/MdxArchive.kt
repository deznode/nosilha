package com.nosilha.core.stories.domain

import com.nosilha.core.shared.domain.CreatableEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.util.UUID

/**
 * Represents an archived story in MDX format for Velite content processing.
 *
 * <p>MDX archives store metadata in the database while the actual MDX file content
 * is stored on the filesystem at the path specified in {@code mdxPath}. This hybrid
 * storage approach enables efficient querying of archive metadata while keeping the
 * content system decoupled.</p>
 *
 * <p>Extends CreatableEntity to inherit {@code createdAt} and {@code createdBy}
 * which map to the former {@code committed_at} and {@code committed_by} columns
 * (renamed in V16 migration).</p>
 *
 * @see com.nosilha.core.stories.domain.StorySubmission
 */
@Entity
@Table(
    name = "mdx_archives",
    indexes = [
        Index(name = "idx_mdx_archives_story_id", columnList = "story_id"),
        Index(name = "idx_mdx_archives_slug", columnList = "slug"),
        Index(name = "idx_mdx_archives_created_at", columnList = "created_at"),
    ],
)
class MdxArchive(
    @Column(name = "story_id", nullable = false)
    val storyId: UUID,
    @Column(nullable = false, unique = true, length = 255)
    var slug: String,
    @Column(name = "mdx_path", nullable = false, length = 500)
    var mdxPath: String,
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    var frontmatter: Map<String, Any>,
    @Column(name = "schema_valid", nullable = false)
    var schemaValid: Boolean = false,
) : CreatableEntity() {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    var id: UUID? = null
}
