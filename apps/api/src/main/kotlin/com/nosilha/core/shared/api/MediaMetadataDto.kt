package com.nosilha.core.shared.api

import com.fasterxml.jackson.annotation.JsonFormat
import java.time.LocalDateTime

/**
 * DTO representing metadata for uploaded media files.
 * Provides comprehensive information about the uploaded file including
 * AI processing results and storage details.
 */
data class MediaMetadataDto(
    val id: String,
    val fileName: String,
    val originalName: String,
    val contentType: String,
    val size: Long,
    val url: String,
    val category: String? = null,
    val description: String? = null,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    val uploadedAt: LocalDateTime,
    val uploadedBy: String? = null,
    val aiMetadata: AIMetadataDto? = null,
)

/**
 * DTO representing AI processing metadata for media files.
 * Contains results from Cloud Vision and Gemini providers.
 */
data class AIMetadataDto(
    val labels: List<String> = emptyList(),
    val textDetected: List<String> = emptyList(),
    val landmarks: List<String> = emptyList(),
    val altText: String? = null,
    val description: String? = null,
    val tags: List<String> = emptyList(),
    val providers: List<String> = emptyList(),
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    val processedAt: LocalDateTime? = null,
)
