package com.nosilha.core.ai

import org.springframework.modulith.ApplicationModule
import org.springframework.modulith.PackageInfo

/**
 * AI Module
 *
 * <p>This module is responsible for AI-powered image analysis for gallery media
 * in the Nos Ilha cultural heritage platform.</p>
 *
 * <p><strong>Responsibilities:</strong></p>
 * <ul>
 *   <li>Image analysis via Google Cloud Vision (labels, OCR, landmarks)</li>
 *   <li>Cultural context generation via Google Gemini (alt text, descriptions, tags)</li>
 *   <li>Provider orchestration with graceful degradation</li>
 *   <li>Analysis execution tracking and audit trail</li>
 *   <li>AI content moderation workflow (approve/reject/edit)</li>
 *   <li>API usage metering with monthly quota enforcement</li>
 * </ul>
 *
 * <p><strong>Module Boundaries:</strong></p>
 * <ul>
 *   <li>Depends on: shared :: api, shared :: domain, shared :: events, shared :: exception</li>
 *   <li>Exposes: AdminAiController (REST API), AI events</li>
 *   <li>Internal: ImageAnalysisOrchestrator, providers, repositories</li>
 * </ul>
 *
 * <p><strong>Event Communication:</strong></p>
 * <ul>
 *   <li>Listens to: MediaAnalysisRequestedEvent (from gallery module)</li>
 *   <li>Publishes: MediaAnalysisCompletedEvent, MediaAnalysisFailedEvent</li>
 * </ul>
 *
 * @since 1.0
 */
@PackageInfo
@ApplicationModule(
    displayName = "AI Module",
    allowedDependencies = ["shared :: api", "shared :: domain", "shared :: events", "shared :: exception"],
    type = ApplicationModule.Type.OPEN,
)
class AiModuleMetadata
