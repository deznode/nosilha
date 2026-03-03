package com.nosilha.core.ai

import org.springframework.modulith.ApplicationModule
import org.springframework.modulith.PackageInfo

/**
 * AI module for image analysis, content moderation, and text AI operations.
 *
 * Image AI: Orchestrates Cloud Vision (labels, OCR, landmarks) and Gemini (cultural context,
 * alt text, descriptions, tags) with graceful degradation and monthly quota enforcement.
 *
 * Text AI: Provides content polishing, translation, story prompt generation, and directory
 * content generation via Gemini ChatClient with separate "gemini-text" quota tracking.
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
