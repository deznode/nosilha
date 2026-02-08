package com.nosilha.core.shared.events

import java.time.Instant
import java.util.UUID

/**
 * Event published when AI analysis completes for a gallery media item.
 *
 * <p>This event is published by the AI module after all providers have
 * finished processing. Results are stored in the ai_analysis_log table
 * and require moderator approval before being applied to the entity.</p>
 *
 * <p><strong>Published by:</strong> {@code ImageAnalysisOrchestrator} in the AI module</p>
 *
 * <p><strong>Consumed by:</strong></p>
 * <ul>
 *   <li>Gallery module - Logs completion (does NOT auto-apply results)</li>
 * </ul>
 *
 * @property mediaId the gallery media ID that was analyzed
 * @property analysisRunId ID of the AnalysisRun tracking record
 * @property tags generated semantic tags
 * @property labels JSON string of detected labels with confidence scores
 * @property altText generated accessible alt text
 * @property description generated rich description
 * @property providers list of providers that contributed results
 * @property occurredAt timestamp when the event occurred
 */
data class MediaAnalysisCompletedEvent(
    val mediaId: UUID,
    val analysisRunId: UUID,
    val tags: List<String> = emptyList(),
    val labels: String? = null,
    val altText: String? = null,
    val description: String? = null,
    val providers: List<String> = emptyList(),
    override val occurredAt: Instant = Instant.now(),
) : ApplicationModuleEvent
