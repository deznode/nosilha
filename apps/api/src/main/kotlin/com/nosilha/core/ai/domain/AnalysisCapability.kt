package com.nosilha.core.ai.domain

/**
 * Capabilities supported by image analysis providers.
 *
 * Each provider declares which capabilities it supports via [ImageAnalysisProvider.supports].
 * The orchestrator uses these to determine which providers to invoke for a given analysis request.
 */
enum class AnalysisCapability {
    /** Image label/object detection with confidence scores. */
    LABELS,

    /** Optical character recognition (text extraction from images). */
    OCR,

    /** Geographic landmark detection. */
    LANDMARKS,

    /** Culturally-aware context generation (Brava Island heritage). */
    CULTURAL_CONTEXT,

    /** Accessible alt text generation for images. */
    ALT_TEXT,

    /** Rich image description generation. */
    DESCRIPTION,
}
