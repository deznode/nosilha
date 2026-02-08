package com.nosilha.core.shared.events

import java.time.Instant
import java.util.UUID

/**
 * Event published when AI analysis fails for a gallery media item.
 *
 * <p>This event is published when all providers fail to analyze the image.
 * Partial results (one provider succeeds, other fails) publish
 * {@link MediaAnalysisCompletedEvent} instead.</p>
 *
 * <p><strong>Published by:</strong> {@code ImageAnalysisOrchestrator} in the AI module</p>
 *
 * <p><strong>Consumed by:</strong></p>
 * <ul>
 *   <li>Gallery module - Logs failure for admin visibility</li>
 * </ul>
 *
 * @property mediaId the gallery media ID that failed analysis
 * @property analysisRunId ID of the AnalysisRun tracking record
 * @property errorMessage description of the failure
 * @property provider optional provider that failed (null if all failed)
 * @property occurredAt timestamp when the event occurred
 */
data class MediaAnalysisFailedEvent(
    val mediaId: UUID,
    val analysisRunId: UUID,
    val errorMessage: String,
    val provider: String? = null,
    override val occurredAt: Instant = Instant.now(),
) : ApplicationModuleEvent
