package com.nosilha.core.stories.events

import com.nosilha.core.shared.events.ApplicationModuleEvent
import java.time.Instant
import java.util.UUID

/**
 * Event published when a story is published and made publicly visible.
 *
 * <p>This event notifies other modules that a story has been published.
 * Consuming modules can react by triggering notifications, updating caches,
 * or generating MDX files for the frontend.</p>
 *
 * @property storyId Unique identifier for the story
 * @property publicationSlug URL-safe slug for the published story
 * @property authorId Supabase user ID of the story author
 * @property title Story title
 * @property occurredAt Timestamp when the story was published
 */
data class StoryPublishedEvent(
    val storyId: UUID,
    val publicationSlug: String,
    val authorId: UUID,
    val title: String,
    override val occurredAt: Instant = Instant.now(),
) : ApplicationModuleEvent
