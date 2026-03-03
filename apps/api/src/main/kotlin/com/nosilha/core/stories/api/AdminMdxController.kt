package com.nosilha.core.stories.api

import com.nosilha.core.shared.api.ApiResult
import com.nosilha.core.shared.exception.BusinessException
import com.nosilha.core.shared.exception.ResourceNotFoundException
import com.nosilha.core.stories.domain.MdxArchive
import com.nosilha.core.stories.domain.StoryStatus
import com.nosilha.core.stories.events.MdxCommittedEvent
import com.nosilha.core.stories.repository.MdxArchiveRepository
import com.nosilha.core.stories.repository.StorySubmissionRepository
import com.nosilha.core.stories.services.MdxGenerationService
import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.validation.Valid
import org.springframework.context.ApplicationEventPublisher
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.yaml.snakeyaml.LoaderOptions
import org.yaml.snakeyaml.Yaml
import org.yaml.snakeyaml.constructor.SafeConstructor
import java.util.UUID

private val logger = KotlinLogging.logger {}

/**
 * Admin REST controller for MDX archival operations.
 *
 * <p>Provides administrative endpoints for converting approved story submissions into
 * MDX format for the Velite content system. This controller enables admins to preview
 * generated MDX content and commit it to the archive.</p>
 *
 * <h3>Endpoints:</h3>
 * <ul>
 *   <li>POST /api/v1/admin/stories/{id}/generate-mdx - Generate MDX preview</li>
 *   <li>POST /api/v1/admin/stories/{id}/commit-mdx - Commit MDX to archive</li>
 * </ul>
 *
 * <h3>Workflow:</h3>
 * <ol>
 *   <li>Admin approves a story submission (status: APPROVED)</li>
 *   <li>Admin generates MDX preview to review frontmatter and formatting</li>
 *   <li>Admin commits MDX to archive (saves metadata + publishes event)</li>
 *   <li>MdxFileWriter listener writes MDX file to filesystem</li>
 *   <li>Story is now available for Velite content processing</li>
 * </ol>
 *
 * <h3>Security:</h3>
 * <ul>
 *   <li>Authentication required: ADMIN role</li>
 *   <li>Only APPROVED stories can be archived</li>
 *   <li>All commits are logged with admin user ID</li>
 * </ul>
 *
 * @property storySubmissionRepository Repository for story submissions
 * @property mdxArchiveRepository Repository for MDX archives
 * @property mdxGenerationService Service for generating MDX content
 * @property eventPublisher Spring event publisher for Spring Modulith events
 */
@RestController
@RequestMapping("/api/v1/admin/stories")
class AdminMdxController(
    private val storySubmissionRepository: StorySubmissionRepository,
    private val mdxArchiveRepository: MdxArchiveRepository,
    private val mdxGenerationService: MdxGenerationService,
    private val eventPublisher: ApplicationEventPublisher,
) {
    companion object {
        /**
         * Valid slug pattern: lowercase alphanumeric with hyphens only.
         * Prevents path traversal and injection attacks via slug field.
         */
        private val SLUG_PATTERN = Regex("^[a-z0-9]+(?:-[a-z0-9]+)*$")
    }

    /**
     * Generates an MDX preview for a story submission.
     *
     * <p>Generates MDX content from an approved story without saving to the archive.
     * This allows admins to review the generated frontmatter and markdown formatting
     * before committing to the archive.</p>
     *
     * <h4>Business Rules:</h4>
     * <ul>
     *   <li>Story must exist</li>
     *   <li>Story must have APPROVED status (ready for archival)</li>
     *   <li>Generation can be customized via request options</li>
     * </ul>
     *
     * <h4>Generation Options:</h4>
     * <ul>
     *   <li>includeTranslations: Include translation fields in frontmatter</li>
     *   <li>targetLanguage: Target language code for translation</li>
     * </ul>
     *
     * <h4>Response:</h4>
     * Returns generated MDX content with:
     * <ul>
     *   <li>Complete MDX source (frontmatter + markdown body)</li>
     *   <li>Parsed frontmatter metadata</li>
     *   <li>Schema validation status</li>
     *   <li>Validation errors (if any)</li>
     * </ul>
     *
     * @param id UUID of the story submission
     * @param request Optional generation options
     * @return ResponseEntity with ApiResult containing MdxContentDto
     * @throws ResourceNotFoundException if story is not found
     * @throws BusinessException if story is not in APPROVED status
     */
    @PostMapping("/{id}/generate-mdx")
    fun generateMdx(
        @PathVariable id: UUID,
        @RequestBody(required = false) request: GenerateMdxRequest?,
    ): ResponseEntity<ApiResult<MdxContentDto>> {
        logger.debug { "Generating MDX preview for story $id" }

        // Retrieve story
        val story =
            storySubmissionRepository
                .findById(id)
                .orElseThrow { ResourceNotFoundException("Story with id $id not found") }

        // Validate story is approved or published (both are moderated states suitable for archival)
        val archivableStatuses = setOf(StoryStatus.APPROVED, StoryStatus.PUBLISHED)
        if (story.status !in archivableStatuses) {
            throw BusinessException(
                "Only approved or published stories can be archived. Current status: ${story.status}. " +
                    "Please approve the story before generating MDX.",
            )
        }

        // Generate MDX content
        val mdxContent = mdxGenerationService.generate(story, request)

        logger.info { "Generated MDX preview for story $id with slug '${mdxContent.slug}'" }

        return ResponseEntity.ok(
            ApiResult(
                data = mdxContent,
                status = HttpStatus.OK.value(),
            ),
        )
    }

    /**
     * Commits MDX content to the archive.
     *
     * <p>Saves MDX metadata to the database and publishes an event to trigger file writing
     * via Spring Modulith. The event-driven approach decouples the database transaction from
     * file I/O operations, ensuring database commits succeed even if file writing fails.</p>
     *
     * <h4>Business Rules:</h4>
     * <ul>
     *   <li>Story must exist</li>
     *   <li>Story must have APPROVED status</li>
     *   <li>MDX source must be provided in request</li>
     *   <li>Archives can be updated (existing archives are replaced)</li>
     * </ul>
     *
     * <h4>Event Flow:</h4>
     * <ol>
     *   <li>Save metadata to mdx_archives table</li>
     *   <li>Publish MdxCommittedEvent</li>
     *   <li>MdxFileWriter listener writes file to filesystem</li>
     *   <li>Return commit result</li>
     * </ol>
     *
     * <h4>Frontmatter Extraction:</h4>
     * <p>The frontmatter is extracted from the MDX source by parsing the YAML section
     * between the first two '---' delimiters. The parsed frontmatter is stored as JSONB
     * for efficient querying.</p>
     *
     * <h4>Response:</h4>
     * Returns commit result with:
     * <ul>
     *   <li>Story ID</li>
     *   <li>Generated slug</li>
     *   <li>Filesystem path where MDX will be written</li>
     *   <li>Commit timestamp</li>
     *   <li>Admin who performed the commit</li>
     * </ul>
     *
     * @param id UUID of the story submission
     * @param request Commit request containing MDX source and optional commit message
     * @param authentication Spring Security authentication context (provides admin ID)
     * @return ResponseEntity with ApiResult containing MdxCommitResultDto
     * @throws ResourceNotFoundException if story is not found
     * @throws BusinessException if story is not in APPROVED status or MDX is invalid
     */
    @PostMapping("/{id}/commit-mdx")
    @Transactional
    fun commitMdx(
        @PathVariable id: UUID,
        @Valid @RequestBody request: CommitMdxRequest,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<MdxCommitResultDto>> {
        logger.debug { "Committing MDX for story $id" }

        // Retrieve story
        val story =
            storySubmissionRepository
                .findById(id)
                .orElseThrow { ResourceNotFoundException("Story with id $id not found") }

        // Validate story is approved or published (both are moderated states suitable for archival)
        val archivableStatuses = setOf(StoryStatus.APPROVED, StoryStatus.PUBLISHED)
        if (story.status !in archivableStatuses) {
            throw BusinessException(
                "Only approved or published stories can be archived. Current status: ${story.status}. " +
                    "Please approve the story before committing MDX.",
            )
        }

        // Extract frontmatter and slug from MDX source
        val (frontmatter, slug) = extractFrontmatter(request.mdxSource)

        // Check if archive already exists (update scenario)
        val existingArchive = mdxArchiveRepository.findByStoryId(id)
        val mdxPath = "content/stories/$slug.mdx"
        val adminId = UUID.fromString(authentication.name)

        val archive =
            if (existingArchive != null) {
                // Update existing archive
                logger.info { "Updating existing MDX archive for story $id" }
                existingArchive.slug = slug
                existingArchive.mdxPath = mdxPath
                existingArchive.frontmatter = frontmatter
                existingArchive.schemaValid = true
                existingArchive
            } else {
                // Create new archive
                MdxArchive(
                    storyId = id,
                    slug = slug,
                    mdxPath = mdxPath,
                    frontmatter = frontmatter,
                    schemaValid = true,
                )
            }

        // Save archive metadata
        val savedArchive = mdxArchiveRepository.save(archive)

        // Publish event to trigger file writing
        val event =
            MdxCommittedEvent(
                storyId = id,
                slug = slug,
                mdxContent = request.mdxSource,
            )
        eventPublisher.publishEvent(event)

        logger.info { "Committed MDX for story $id with slug '$slug' by admin $adminId" }

        // Build response
        val result =
            MdxCommitResultDto(
                storyId = id,
                slug = slug,
                mdxPath = mdxPath,
                committedAt = savedArchive.createdAt,
                committedBy = adminId,
            )

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(
                ApiResult(
                    data = result,
                    status = HttpStatus.CREATED.value(),
                ),
            )
    }

    /**
     * Extracts frontmatter and slug from MDX source with security protections.
     *
     * <p>Parses the YAML frontmatter section (between '---' delimiters) using SnakeYAML's
     * SafeConstructor to prevent deserialization attacks (CVE-2022-1471).</p>
     *
     * <p><strong>Security:</strong></p>
     * <ul>
     *   <li>Uses SafeConstructor to prevent arbitrary object instantiation</li>
     *   <li>Limits alias expansion to prevent billion laughs attacks</li>
     *   <li>Validates slug format against whitelist pattern</li>
     * </ul>
     *
     * <h4>MDX Format:</h4>
     * <pre>
     * ---
     * title: "Story Title"
     * slug: "story-slug"
     * author: "author-id"
     * date: "2024-01-01"
     * ...
     * ---
     * Story content...
     * </pre>
     *
     * @param mdxSource Complete MDX file content
     * @return Pair of (frontmatter map, slug)
     * @throws BusinessException if MDX format is invalid, slug is missing, or slug format is invalid
     */
    private fun extractFrontmatter(mdxSource: String): Pair<Map<String, Any>, String> {
        // Extract YAML frontmatter between --- delimiters
        val frontmatterRegex = Regex("^---\\s*\\n(.*?)\\n---", RegexOption.DOT_MATCHES_ALL)
        val match =
            frontmatterRegex.find(mdxSource)
                ?: throw BusinessException("Invalid MDX format: frontmatter not found")

        val yamlContent = match.groupValues[1]

        // Configure SafeConstructor to prevent deserialization attacks (CVE-2022-1471)
        val loaderOptions =
            LoaderOptions().apply {
                maxAliasesForCollections = 50 // Prevent billion laughs attack
            }
        val yaml = Yaml(SafeConstructor(loaderOptions))

        // Parse YAML safely - only allows basic types (String, Number, Boolean, List, Map)
        @Suppress("UNCHECKED_CAST")
        val frontmatter: Map<String, Any> =
            try {
                yaml.load<Map<String, Any>>(yamlContent)
                    ?: throw BusinessException("Invalid YAML frontmatter: empty content")
            } catch (e: Exception) {
                when (e) {
                    is BusinessException -> throw e
                    else ->
                        throw BusinessException(
                            "Invalid YAML frontmatter: ${e.message?.take(100) ?: "parse error"}",
                        )
                }
            }

        // Extract and validate slug
        val slug =
            frontmatter["slug"] as? String
                ?: throw BusinessException("MDX frontmatter must contain a 'slug' field")

        // Validate slug format (whitelist approach - prevents path traversal)
        if (!SLUG_PATTERN.matches(slug)) {
            throw BusinessException(
                "Invalid slug format: '$slug'. Must be lowercase alphanumeric with hyphens only (e.g., 'my-story-title').",
            )
        }

        return Pair(frontmatter, slug)
    }
}
