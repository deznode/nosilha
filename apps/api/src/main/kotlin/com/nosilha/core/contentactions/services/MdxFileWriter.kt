package com.nosilha.core.contentactions.services

import com.nosilha.core.contentactions.events.MdxCommittedEvent
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.modulith.events.ApplicationModuleListener
import org.springframework.stereotype.Component
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardOpenOption
import kotlin.io.path.notExists

private val logger = KotlinLogging.logger {}

/**
 * Event listener that writes MDX content to the filesystem.
 *
 * <p>This component is part of the Spring Modulith event-driven architecture for MDX
 * archival. It listens for {@link MdxCommittedEvent} and writes the MDX content to
 * the filesystem at the configured content directory.</p>
 *
 * <p><strong>Event-Driven File Writing:</strong></p>
 * <p>Using {@code @ApplicationModuleListener} decouples the database transaction from
 * file I/O operations. This ensures that database commits succeed even if file writing
 * fails, enabling retry logic and preventing database rollbacks due to filesystem errors.</p>
 *
 * <p><strong>Filesystem Storage:</strong></p>
 * <ul>
 *   <li>Base path: Configured via {@code nosilha.content.path} (default: content/stories)</li>
 *   <li>File naming: {@code {slug}.mdx}</li>
 *   <li>Example: {@code content/stories/my-family-story.mdx}</li>
 *   <li>Directory creation: Parent directories are created if they don't exist</li>
 *   <li>File handling: Existing files are overwritten (updates supported)</li>
 * </ul>
 *
 * <p><strong>Error Handling:</strong></p>
 * <p>Errors during file writing are logged but do not throw exceptions. This prevents
 * event processing failures and allows for manual intervention or retry logic.</p>
 *
 * @property contentPath Base directory for MDX content files (configurable)
 */
@Component
class MdxFileWriter(
    @Value("\${nosilha.content.path:content/stories}")
    private val contentPath: String,
) {
    companion object {
        /**
         * Valid slug pattern: lowercase alphanumeric with hyphens only.
         * Examples: "my-story", "story-2024", "a-b-c"
         * Invalid: "../etc/passwd", "my_story", "My-Story"
         */
        private val SLUG_PATTERN = Regex("^[a-z0-9]+(?:-[a-z0-9]+)*$")
    }

    /**
     * Event listener for MDX commit events.
     *
     * <p>Triggered asynchronously when an {@link MdxCommittedEvent} is published.
     * Writes the MDX content to the filesystem at {@code {contentPath}/{slug}.mdx}.</p>
     *
     * <p><strong>File Writing Process:</strong></p>
     * <ol>
     *   <li>Resolve filesystem path from slug</li>
     *   <li>Create parent directories if they don't exist</li>
     *   <li>Write MDX content to file (overwrite if exists)</li>
     *   <li>Log success or failure</li>
     * </ol>
     *
     * @param event The MDX committed event containing slug and content
     */
    @ApplicationModuleListener
    fun on(event: MdxCommittedEvent) {
        try {
            val filePath = resolveMdxPath(event.slug)
            writeMdxFile(filePath, event.mdxContent)
            logger.info { "Successfully wrote MDX file for story ${event.storyId} at path: $filePath" }
        } catch (e: Exception) {
            logger.error(e) { "Failed to write MDX file for story ${event.storyId} with slug ${event.slug}: ${e.message}" }
            // Don't rethrow - allow event processing to continue
            // Failed writes can be retried manually or via admin UI
        }
    }

    /**
     * Resolves the full filesystem path for an MDX file with path traversal protection.
     *
     * <p><strong>Security:</strong> This method implements multiple layers of defense against
     * path traversal attacks:</p>
     * <ol>
     *   <li>Whitelist validation: Slug must match [a-z0-9]+(?:-[a-z0-9]+)* pattern</li>
     *   <li>Path normalization: Resolves symbolic links and removes . and .. components</li>
     *   <li>Containment check: Verifies final path remains within base directory</li>
     * </ol>
     *
     * @param slug URL-friendly slug for the content
     * @return Path object pointing to {contentPath}/{slug}.mdx
     * @throws IllegalArgumentException if slug format is invalid
     * @throws SecurityException if path traversal is detected
     */
    private fun resolveMdxPath(slug: String): Path {
        // 1. Validate slug format (whitelist approach - most secure)
        if (!SLUG_PATTERN.matches(slug)) {
            throw IllegalArgumentException(
                "Invalid slug format: $slug. Must be lowercase alphanumeric with hyphens only.",
            )
        }

        // 2. Normalize base path to absolute form
        val basePath = Path.of(contentPath).toAbsolutePath().normalize()

        // 3. Resolve and normalize target path
        val targetPath = basePath.resolve("$slug.mdx").normalize()

        // 4. Verify target is within base directory (defense in depth)
        if (!targetPath.startsWith(basePath)) {
            throw SecurityException("Path traversal attempt detected for slug: $slug")
        }

        return targetPath
    }

    /**
     * Writes MDX content to the filesystem.
     *
     * <p>Creates parent directories if they don't exist. Overwrites the file
     * if it already exists (supports updates).</p>
     *
     * @param path Target file path
     * @param content MDX file content (frontmatter + markdown)
     */
    private fun writeMdxFile(
        path: Path,
        content: String,
    ) {
        // Create parent directories if they don't exist
        if (path.parent.notExists()) {
            Files.createDirectories(path.parent)
            logger.debug { "Created directory: ${path.parent}" }
        }

        // Write content to file (overwrite if exists)
        Files.writeString(
            path,
            content,
            StandardOpenOption.CREATE,
            StandardOpenOption.TRUNCATE_EXISTING,
        )
    }
}
