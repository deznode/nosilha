package com.nosilha.core.shared.events

import java.time.Instant
import java.util.UUID

/**
 * Event published when a moderator approves AI-generated results for a gallery media item.
 *
 * <p>This event triggers the gallery module to apply the approved AI fields
 * (alt text, description, tags, labels) to the corresponding [UserUploadedMedia] entity.</p>
 *
 * <p><strong>Published by:</strong> {@code AiModerationService} in the AI module</p>
 *
 * <p><strong>Consumed by:</strong></p>
 * <ul>
 *   <li>Gallery module - Applies approved AI results to the media entity</li>
 * </ul>
 *
 * @property mediaId the gallery media ID to update
 * @property analysisRunId ID of the approved AnalysisRun
 * @property title approved title for the image (possibly admin-edited)
 * @property altText approved alt text (possibly admin-edited)
 * @property description approved description (possibly admin-edited)
 * @property tags approved semantic tags (possibly admin-edited)
 * @property labels JSON string of detected labels with confidence scores
 * @property moderatorId admin who approved the results
 * @property occurredAt timestamp when the event occurred
 */
data class AiResultsApprovedEvent(
    val mediaId: UUID,
    val analysisRunId: UUID,
    val title: String? = null,
    val altText: String? = null,
    val description: String? = null,
    val tags: List<String> = emptyList(),
    val labels: String? = null,
    val moderatorId: UUID,
    override val occurredAt: Instant = Instant.now(),
) : ApplicationModuleEvent
