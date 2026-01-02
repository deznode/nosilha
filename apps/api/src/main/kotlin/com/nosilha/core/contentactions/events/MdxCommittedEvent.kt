package com.nosilha.core.contentactions.events

import com.nosilha.core.shared.events.ApplicationModuleEvent
import java.time.Instant
import java.util.UUID

/**
 * Event published when an MDX archive is committed to the archive system.
 *
 * <p>This event is part of the Spring Modulith event-driven architecture for
 * MDX file generation. When an admin commits a story to MDX format, the metadata
 * is saved to the database and this event is published to trigger the file writing
 * operation.</p>
 *
 * <p><strong>Event Flow:</strong></p>
 * <ol>
 *   <li>Admin commits MDX via POST /api/v1/admin/stories/{id}/commit-mdx</li>
 *   <li>Service saves metadata to mdx_archives table</li>
 *   <li>Service publishes MdxCommittedEvent</li>
 *   <li>MdxFileWriter listener receives event via @ApplicationModuleListener</li>
 *   <li>Listener writes MDX file to filesystem at content/stories/{slug}.mdx</li>
 * </ol>
 *
 * <p><strong>Separation of Concerns:</strong></p>
 * <p>The event-driven approach decouples the database transaction from the file I/O
 * operation, ensuring that database commits succeed even if file writing fails. This
 * enables retry logic and prevents database rollbacks due to filesystem errors.</p>
 *
 * @property storyId Unique identifier for the source story submission
 * @property slug URL-friendly slug used in the filesystem path
 * @property mdxContent Complete MDX file content (frontmatter + markdown body)
 * @property occurredAt Timestamp when the commit occurred
 */
data class MdxCommittedEvent(
    val storyId: UUID,
    val slug: String,
    val mdxContent: String,
    override val occurredAt: Instant = Instant.now(),
) : ApplicationModuleEvent
