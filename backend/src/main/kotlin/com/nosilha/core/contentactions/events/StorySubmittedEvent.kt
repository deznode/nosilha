package com.nosilha.core.contentactions.events

import com.nosilha.core.contentactions.domain.StoryType
import com.nosilha.core.shared.events.ApplicationModuleEvent
import java.time.Instant
import java.util.UUID

/**
 * Event published when a new story is submitted.
 *
 * <p>This event notifies other modules that a user has submitted a story
 * for review. Consuming modules can react by triggering notifications or
 * updating analytics.</p>
 *
 * @property storyId Unique identifier for the story submission
 * @property authorId Supabase user ID of the story author
 * @property storyType Type of story (QUICK, FULL, GUIDED)
 * @property relatedPlaceId Optional reference to a directory entry
 * @property occurredAt Timestamp when the story was submitted
 */
data class StorySubmittedEvent(
    val storyId: UUID,
    val authorId: String,
    val storyType: StoryType,
    val relatedPlaceId: UUID?,
    override val occurredAt: Instant = Instant.now(),
) : ApplicationModuleEvent
