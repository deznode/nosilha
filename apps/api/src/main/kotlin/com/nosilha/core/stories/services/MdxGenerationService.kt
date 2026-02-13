package com.nosilha.core.stories.services

import com.nosilha.core.shared.exception.BusinessException
import com.nosilha.core.stories.api.GenerateMdxRequest
import com.nosilha.core.stories.api.MdxContentDto
import com.nosilha.core.stories.api.MdxFrontmatter
import com.nosilha.core.stories.domain.StorySubmission
import com.nosilha.core.stories.repository.MdxArchiveRepository
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

private val logger = KotlinLogging.logger {}

/**
 * Service for generating MDX content from story submissions.
 *
 * <p>This service transforms story submissions into MDX format suitable for Velite content
 * processing. It generates frontmatter metadata and markdown body content following the
 * Velite schema requirements.</p>
 *
 * <h3>Generated MDX Format</h3>
 * <pre>
 * ---
 * title: "Story Title"
 * slug: "story-slug"
 * author: "author-uuid"
 * date: "2024-01-01"
 * language: "pt"
 * storyType: "FULL"
 * tags: ["full", "family"]
 * excerpt: "Story excerpt..."
 * ---
 *
 * Story content in markdown format...
 * </pre>
 *
 * <h3>Key Features</h3>
 * <ul>
 *   <li>Generates URL-friendly slugs with uniqueness guarantees</li>
 *   <li>Creates Velite-compatible YAML frontmatter</li>
 *   <li>Extracts tags from story metadata</li>
 *   <li>Generates word-boundary-aware excerpts</li>
 *   <li>Properly escapes YAML special characters</li>
 * </ul>
 *
 * <p>All processing is performed locally without external API dependencies.</p>
 *
 * @see MdxContentDto
 * @see MdxFrontmatter
 */
@Service
class MdxGenerationService(
    private val mdxArchiveRepository: MdxArchiveRepository,
) {
    companion object {
        private val DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE.withZone(ZoneId.of("UTC"))

        /**
         * Maximum slug length to ensure filesystem compatibility and URL friendliness.
         */
        private const val MAX_SLUG_LENGTH = 100

        /**
         * Maximum counter iterations before failing (prevents infinite loops).
         */
        private const val MAX_SLUG_COUNTER = 1000
    }

    /**
     * Generates MDX content from a story submission.
     *
     * <p>This implementation:
     * <ul>
     *   <li>Generates a URL-friendly slug from the title</li>
     *   <li>Creates frontmatter with all required Velite fields</li>
     *   <li>Formats the story content as markdown</li>
     *   <li>Combines frontmatter and content into complete MDX</li>
     *   <li>Marks the content as schema-valid</li>
     * </ul>
     * </p>
     *
     * @param story The source story submission
     * @param options Optional generation parameters (reserved for future use)
     * @return MDX content DTO with valid frontmatter and markdown body
     */
    fun generate(
        story: StorySubmission,
        options: GenerateMdxRequest?,
    ): MdxContentDto {
        logger.debug { "Generating MDX for story ${story.id} (type: ${story.storyType})" }

        // Generate URL-friendly unique slug from title
        val baseSlug = generateSlug(story.title)
        val slug = ensureUniqueSlug(baseSlug, story.id!!)

        // Build frontmatter
        val frontmatter =
            MdxFrontmatter(
                title = story.title,
                slug = slug,
                author = story.authorId.toString(),
                date = formatDate(story.createdAt),
                language = "pt", // Default to Portuguese for Brava Island stories
                location = null, // Could be enhanced with related place name lookup
                storyType = story.storyType.name,
                tags = generateTags(story),
                excerpt = generateExcerpt(story.content),
            )

        // Build complete MDX source
        val mdxSource = buildMdxSource(frontmatter, story.content)

        logger.debug { "Generated MDX for story ${story.id} with slug '$slug'" }

        return MdxContentDto(
            storyId = story.id!!,
            slug = slug,
            mdxSource = mdxSource,
            frontmatter = frontmatter,
            schemaValid = true,
            validationErrors = null,
            generatedAt = Instant.now(),
        )
    }

    /**
     * Generates a URL-friendly slug from a title.
     *
     * <p>Converts the title to lowercase and replaces all non-alphanumeric
     * characters with hyphens. Multiple consecutive hyphens are collapsed
     * to a single hyphen, and leading/trailing hyphens are removed.</p>
     *
     * <p>The slug is truncated to MAX_SLUG_LENGTH to ensure filesystem
     * compatibility and URL friendliness.</p>
     *
     * @param title The story title
     * @return URL-friendly base slug (may need uniqueness suffix)
     */
    private fun generateSlug(title: String): String =
        title
            .lowercase()
            .replace(Regex("[^a-z0-9]+"), "-")
            .trim('-')
            .take(MAX_SLUG_LENGTH)
            .trimEnd('-') // Remove trailing hyphen if truncation created one

    /**
     * Ensures the slug is unique by appending a counter suffix if necessary.
     *
     * <p>This method provides application-level uniqueness by checking existing slugs
     * in the database. Combined with the database unique constraint (V31 migration),
     * this provides defense-in-depth against duplicate slugs.</p>
     *
     * <p><strong>Algorithm:</strong></p>
     * <ol>
     *   <li>Check if base slug is already taken by a different story</li>
     *   <li>If not, return base slug</li>
     *   <li>Otherwise, append counter suffix (-1, -2, etc.) until unique</li>
     *   <li>Fail after MAX_SLUG_COUNTER attempts to prevent infinite loops</li>
     * </ol>
     *
     * <p><strong>Note:</strong> If the story already has an archive with this slug,
     * we return the existing slug to support updates.</p>
     *
     * @param baseSlug The base slug generated from the title
     * @param storyId The story ID to check for existing archives
     * @return A unique slug
     * @throws BusinessException if unable to generate a unique slug
     */
    private fun ensureUniqueSlug(
        baseSlug: String,
        storyId: java.util.UUID,
    ): String {
        // Check if this story already has an archive - reuse its slug for updates
        val existingArchive = mdxArchiveRepository.findByStoryId(storyId)
        if (existingArchive != null) {
            logger.debug { "Story $storyId already has archive with slug '${existingArchive.slug}', reusing" }
            return existingArchive.slug
        }

        // Check if base slug is available
        if (!mdxArchiveRepository.existsBySlug(baseSlug)) {
            return baseSlug
        }

        // Find unique slug with counter suffix
        var counter = 1
        var candidateSlug: String
        do {
            candidateSlug = "$baseSlug-$counter"
            counter++
        } while (mdxArchiveRepository.existsBySlug(candidateSlug) && counter < MAX_SLUG_COUNTER)

        if (counter >= MAX_SLUG_COUNTER) {
            throw BusinessException(
                "Unable to generate unique slug for title. Please try a different title or contact support.",
            )
        }

        logger.info { "Generated unique slug '$candidateSlug' for story $storyId (base slug '$baseSlug' was taken)" }
        return candidateSlug
    }

    /**
     * Formats an Instant timestamp to ISO date string (YYYY-MM-DD).
     *
     * @param instant The timestamp to format
     * @return ISO date string in UTC
     */
    private fun formatDate(instant: Instant): String = DATE_FORMATTER.format(instant)

    /**
     * Generates tags based on story metadata.
     *
     * <p>Creates tags from:
     * <ul>
     *   <li>Story type (quick, full, guided)</li>
     *   <li>Template type (if applicable)</li>
     * </ul>
     * </p>
     *
     * @param story The story submission
     * @return List of tags
     */
    private fun generateTags(story: StorySubmission): List<String> {
        val tags = mutableListOf<String>()

        // Add story type tag
        tags.add(story.storyType.name.lowercase())

        // Add template type tag if present
        story.templateType?.let { templateType ->
            tags.add(templateType.name.lowercase())
        }

        return tags
    }

    /**
     * Generates an excerpt from the story content.
     *
     * <p>Takes the first 150 characters of the content and adds ellipsis if truncated.
     * Ensures the excerpt doesn't cut in the middle of a word.</p>
     *
     * @param content The story content
     * @return Brief excerpt for preview/SEO
     */
    private fun generateExcerpt(content: String): String {
        val maxLength = 150
        if (content.length <= maxLength) {
            return content
        }

        // Truncate and find last space to avoid cutting words
        val truncated = content.substring(0, maxLength)
        val lastSpace = truncated.lastIndexOf(' ')
        return if (lastSpace > 0) {
            truncated.substring(0, lastSpace) + "..."
        } else {
            "$truncated..."
        }
    }

    /**
     * Builds complete MDX source with frontmatter and content.
     *
     * <p>Format:</p>
     * <pre>
     * ---
     * title: "Story Title"
     * slug: "story-slug"
     * author: "author-id"
     * date: "2024-01-01"
     * language: "pt"
     * storyType: "FULL"
     * tags: ["full", "family"]
     * excerpt: "Story excerpt..."
     * ---
     *
     * Story content in markdown format...
     * </pre>
     *
     * @param frontmatter The frontmatter metadata
     * @param content The story content
     * @return Complete MDX file content
     */
    private fun buildMdxSource(
        frontmatter: MdxFrontmatter,
        content: String,
    ): String {
        val yaml =
            buildString {
                appendLine("---")
                appendLine("title: \"${escapeYaml(frontmatter.title)}\"")
                appendLine("slug: \"${frontmatter.slug}\"")
                appendLine("author: \"${frontmatter.author}\"")
                appendLine("date: \"${frontmatter.date}\"")
                appendLine("language: \"${frontmatter.language}\"")
                frontmatter.location?.let { appendLine("location: \"${escapeYaml(it)}\"") }
                appendLine("storyType: \"${frontmatter.storyType}\"")
                if (frontmatter.tags.isNotEmpty()) {
                    appendLine("tags: [${frontmatter.tags.joinToString(", ") { "\"$it\"" }}]")
                }
                frontmatter.excerpt?.let { appendLine("excerpt: \"${escapeYaml(it)}\"") }
                appendLine("---")
            }

        return yaml + "\n" + content
    }

    /**
     * Escapes special characters in YAML strings.
     *
     * <p>Handles quotes and backslashes to prevent YAML parsing errors.</p>
     *
     * @param text The text to escape
     * @return Escaped text safe for YAML
     */
    private fun escapeYaml(text: String): String = text.replace("\\", "\\\\").replace("\"", "\\\"")
}
