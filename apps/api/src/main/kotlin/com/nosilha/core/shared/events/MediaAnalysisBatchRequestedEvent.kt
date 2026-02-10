package com.nosilha.core.shared.events

import java.time.Instant
import java.util.UUID

/**
 * Event published when an admin requests a batch AI analysis.
 *
 * The AI module creates the batch tracking entity when it receives this event.
 */
data class MediaAnalysisBatchRequestedEvent(
    val batchId: UUID,
    val totalItems: Int,
    val requestedBy: UUID,
    override val occurredAt: Instant = Instant.now(),
) : ApplicationModuleEvent
