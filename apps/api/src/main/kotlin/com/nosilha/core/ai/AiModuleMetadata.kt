package com.nosilha.core.ai

import org.springframework.modulith.ApplicationModule
import org.springframework.modulith.PackageInfo

/**
 * AI module for image analysis and content moderation of gallery media.
 *
 * Orchestrates Cloud Vision (labels, OCR, landmarks) and Gemini (cultural context,
 * alt text, descriptions, tags) with graceful degradation and monthly quota enforcement.
 *
 * Listens to: [MediaAnalysisRequestedEvent], [MediaAnalysisBatchRequestedEvent]
 * Publishes: [MediaAnalysisCompletedEvent], [MediaAnalysisFailedEvent], [AiResultsApprovedEvent]
 */
@PackageInfo
@ApplicationModule(
    displayName = "AI Module",
    allowedDependencies = ["shared :: api", "shared :: domain", "shared :: events", "shared :: exception"],
    type = ApplicationModule.Type.OPEN,
)
class AiModuleMetadata
