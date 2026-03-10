package com.nosilha.core.shared.events

import java.time.Instant
import java.util.UUID

/**
 * Event published when an admin requests AI analysis for a gallery media item.
 *
 * <p>This event is triggered when an admin triggers analysis via the gallery
 * admin endpoints. The AI module listens to this event and orchestrates
 * provider execution.</p>
 *
 * <p><strong>Published by:</strong> {@code GalleryModerationService.triggerAnalysis()} in the Gallery module</p>
 *
 * <p><strong>Consumed by:</strong></p>
 * <ul>
 *   <li>AI module - Orchestrates Cloud Vision and Gemini providers</li>
 * </ul>
 *
 * @property mediaId the gallery media ID to analyze
 * @property imageUrl publicly accessible URL of the image
 * @property mediaTitle optional title for cultural context
 * @property locationContext optional location hint (e.g., "Nova Sintra, Brava")
 * @property category optional media category (e.g., "heritage", "nature", "food")
 * @property approximateDate optional free-text historical date (e.g., "circa 1960s")
 * @property requestedBy admin user ID who triggered the analysis
 * @property analysisRunId ID of the AnalysisRun tracking record
 * @property batchId optional batch ID if part of a batch request
 * @property occurredAt timestamp when the event occurred
 */
data class MediaAnalysisRequestedEvent(
    val mediaId: UUID,
    val imageUrl: String,
    val mediaTitle: String? = null,
    val locationContext: String? = null,
    val category: String? = null,
    val approximateDate: String? = null,
    val requestedBy: UUID,
    val analysisRunId: UUID,
    val batchId: UUID? = null,
    override val occurredAt: Instant = Instant.now(),
) : ApplicationModuleEvent
