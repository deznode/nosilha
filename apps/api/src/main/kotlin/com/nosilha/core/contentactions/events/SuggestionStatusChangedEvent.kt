package com.nosilha.core.contentactions.events

import com.nosilha.core.contentactions.domain.SuggestionStatus
import com.nosilha.core.shared.events.ApplicationModuleEvent
import java.time.Instant
import java.util.UUID

/**
 * Event published when a suggestion's status changes during moderation.
 *
 * <p>This event notifies other modules that a suggestion has been reviewed
 * and its status has changed. Consuming modules can react by triggering
 * notifications or updating related data.</p>
 *
 * @property suggestionId Unique identifier for the suggestion
 * @property previousStatus Status before the change
 * @property newStatus Status after the change
 * @property reviewedBy Supabase user ID of the admin who reviewed
 * @property adminNotes Optional notes from the reviewer
 * @property occurredAt Timestamp when the status changed
 */
data class SuggestionStatusChangedEvent(
    val suggestionId: UUID,
    val previousStatus: SuggestionStatus,
    val newStatus: SuggestionStatus,
    val reviewedBy: String,
    val adminNotes: String?,
    override val occurredAt: Instant = Instant.now(),
) : ApplicationModuleEvent
