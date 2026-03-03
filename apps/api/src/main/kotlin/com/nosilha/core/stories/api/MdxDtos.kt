package com.nosilha.core.stories.api

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

/**
 * Request DTO for generating MDX preview from a story submission.
 *
 * <p>Used in POST /api/v1/admin/stories/{id}/generate-mdx endpoint.
 * Allows optional customization of MDX generation without modifying the original story.</p>
 *
 * @property includeTranslations Whether to include translation fields in frontmatter
 * @property targetLanguage Target language code for translation (e.g., "pt", "en")
 */
data class GenerateMdxRequest(
    val includeTranslations: Boolean? = null,
    val targetLanguage: String? = null,
)

/**
 * Frontmatter metadata for MDX content following Velite schema.
 *
 * <p>This structure mirrors the expected frontmatter schema for Velite content processing.
 * All fields are serialized to YAML format in the MDX file header.</p>
 *
 * @property title Story title
 * @property slug URL-friendly identifier
 * @property author Author identifier (matches story_submissions.author_id)
 * @property date Publication date in ISO 8601 format
 * @property language Story language code (e.g., "pt", "en")
 * @property location Geographic location of the story (town, region)
 * @property storyType Type of story (QUICK, FULL, GUIDED)
 * @property tags List of categorization tags
 * @property excerpt Brief summary for preview/SEO
 */
data class MdxFrontmatter(
    val title: String,
    val slug: String,
    val author: String,
    val date: String,
    val language: String = "pt",
    val location: String? = null,
    val storyType: String,
    val tags: List<String> = emptyList(),
    val excerpt: String? = null,
)

/**
 * Response DTO containing generated MDX content and metadata.
 *
 * <p>Used as response for POST /api/v1/admin/stories/{id}/generate-mdx endpoint.
 * Provides the complete MDX content preview with validation status.</p>
 *
 * @property storyId ID of the source story submission
 * @property slug Generated URL-friendly slug
 * @property mdxSource Complete MDX file content (frontmatter + markdown)
 * @property frontmatter Parsed frontmatter metadata
 * @property schemaValid Whether the frontmatter passes Velite schema validation
 * @property validationErrors List of validation errors (null if valid)
 * @property generatedAt Timestamp when the MDX was generated
 */
data class MdxContentDto(
    val storyId: UUID,
    val slug: String,
    val mdxSource: String,
    val frontmatter: MdxFrontmatter,
    val schemaValid: Boolean,
    val validationErrors: List<String>? = null,
    val generatedAt: Instant,
)

/**
 * Request DTO for committing MDX content to the archive.
 *
 * <p>Used in POST /api/v1/admin/stories/{id}/commit-mdx endpoint.
 * Allows admin to save the MDX content to filesystem and database.</p>
 *
 * @property mdxSource Complete MDX file content to commit
 * @property commitMessage Optional message describing the commit
 */
data class CommitMdxRequest(
    @field:NotBlank(message = "MDX source is required")
    val mdxSource: String,
    @field:Size(max = 500, message = "Commit message cannot exceed 500 characters")
    val commitMessage: String? = null,
)

/**
 * Response DTO for MDX commit operation.
 *
 * <p>Used as response for POST /api/v1/admin/stories/{id}/commit-mdx endpoint.
 * Confirms successful commit with metadata.</p>
 *
 * @property storyId ID of the source story submission
 * @property slug URL-friendly slug of the archived content
 * @property mdxPath Filesystem path where the MDX file is stored
 * @property committedAt Timestamp when the commit occurred
 * @property committedBy Admin user who performed the commit
 */
data class MdxCommitResultDto(
    val storyId: UUID,
    val slug: String,
    val mdxPath: String,
    val committedAt: Instant,
    val committedBy: String,
)
