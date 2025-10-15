package com.nosilha.core.media.events

import com.nosilha.core.shared.events.ApplicationModuleEvent
import java.time.Instant
import java.util.UUID

/**
 * Event published when media processing is complete via Cloud Vision API.
 *
 * <p>This event notifies other modules that AI processing has completed
 * and metadata (labels, text extraction, etc.) is available.
 *
 * @property mediaId Unique identifier for the media asset
 * @property visionApiLabels Labels extracted by Cloud Vision API
 * @property occurredAt Timestamp when processing completed
 */
data class MediaProcessedEvent(
    val mediaId: UUID,
    val visionApiLabels: List<String>,
    override val occurredAt: Instant = Instant.now()
) : ApplicationModuleEvent
