package com.nosilha.core.stories.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.Table
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

/**
 * Represents an archived story in MDX format for Velite content processing.
 *
 * <p>MDX archives store metadata in the database while the actual MDX file content
 * is stored on the filesystem at the path specified in {@code mdxPath}. This hybrid
 * storage approach enables efficient querying of archive metadata while keeping the
 * content system decoupled.</p>
 *
 * <p><strong>Storage Strategy:</strong></p>
 * <ul>
 *   <li>Database: Metadata (frontmatter, schema validation status, commit info)</li>
 *   <li>Filesystem: Complete MDX content at {@code content/stories/{slug}.mdx}</li>
 * </ul>
 *
 * <p><strong>Schema Validation:</strong></p>
 * <p>The {@code schemaValid} field tracks whether the frontmatter complies with Velite's
 * schema requirements. Invalid schemas are allowed to be committed to enable iterative
 * refinement, but should be fixed before content deployment.</p>
 *
 * @property id Unique identifier for the archive entry
 * @property storyId Reference to the original story submission
 * @property slug URL-friendly identifier used in the filesystem path
 * @property mdxPath Filesystem path where the MDX file is stored
 * @property frontmatter Parsed frontmatter metadata stored as JSONB for querying
 * @property schemaValid Whether the frontmatter passes Velite schema validation
 * @property committedBy Admin user who committed the MDX to the archive
 * @property committedAt Timestamp when the commit occurred
 */
@Entity
@Table(
    name = "mdx_archives",
    indexes = [
        Index(name = "idx_mdx_archives_story_id", columnList = "story_id"),
        Index(name = "idx_mdx_archives_slug", columnList = "slug"),
        Index(name = "idx_mdx_archives_committed_at", columnList = "committed_at"),
    ],
)
data class MdxArchive(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    val id: UUID? = null,
    @Column(name = "story_id", nullable = false)
    val storyId: UUID,
    @Column(nullable = false, unique = true, length = 255)
    val slug: String,
    @Column(name = "mdx_path", nullable = false, length = 500)
    val mdxPath: String,
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    val frontmatter: Map<String, Any>,
    @Column(name = "schema_valid", nullable = false)
    val schemaValid: Boolean = false,
    @Column(name = "committed_by", length = 255)
    val committedBy: String? = null,
    @CreationTimestamp
    @Column(name = "committed_at", nullable = false, updatable = false)
    val committedAt: Instant? = null,
)
