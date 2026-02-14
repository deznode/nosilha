package com.nosilha.core.stories.events

import com.nosilha.core.shared.events.ApplicationModuleEvent
import com.nosilha.core.stories.domain.StoryStatus
import java.time.Instant
import java.util.UUID

/**
 * Event published when a story's status changes during moderation.
 *
 * <p>This event notifies other modules that a story has been reviewed
 * and its status has changed. Consuming modules can react by triggering
 * notifications or updating related data.</p>
 *
 * @property storyId Unique identifier for the story
 * @property previousStatus Status before the change
 * @property newStatus Status after the change
 * @property reviewedBy Supabase user ID of the admin who reviewed (nullable for system changes)
 * @property adminNotes Optional notes from the reviewer
 * @property occurredAt Timestamp when the status changed
 */
data class StoryStatusChangedEvent(
    val storyId: UUID,
    val previousStatus: StoryStatus,
    val newStatus: StoryStatus,
    val reviewedBy: UUID?,
    val adminNotes: String?,
    override val occurredAt: Instant = Instant.now(),
) : ApplicationModuleEvent
