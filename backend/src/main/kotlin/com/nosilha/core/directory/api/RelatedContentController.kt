package com.nosilha.core.directory.api

import com.nosilha.core.directory.RelatedContentService
import com.nosilha.core.shared.api.ApiResponse
import com.nosilha.core.shared.api.DirectoryEntryDto
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * REST controller for discovering related cultural heritage content.
 *
 * **Public API Endpoints**:
 * - GET /api/v1/directory/entries/{contentId}/related - Get 3-5 related content items
 *
 * **Phase 9 - User Story 5**: Discovering Related Cultural Content
 *
 * **Algorithm**: Matches content using category, town, and cuisine fields.
 * Returns 3-5 related items prioritized by relevance.
 *
 * @param relatedContentService Business logic for finding related content
 */
@RestController
@RequestMapping("/api/v1/directory")
class RelatedContentController(
    private val relatedContentService: RelatedContentService
) {

    private val logger = LoggerFactory.getLogger(RelatedContentController::class.java)

    /**
     * Get related content items for a specific heritage page.
     *
     * **Endpoint**: GET /api/v1/directory/entries/{contentId}/related
     *
     * **Query Parameters**:
     * - `limit`: Number of results to return (default: 5, min: 3, max: 5)
     *
     * **Response**: ApiResponse containing list of DirectoryEntryDto objects
     *
     * **Matching Algorithm**:
     * 1. Same category + same town (highest priority)
     * 2. Same category + same cuisine (for restaurants)
     * 3. Same category only (fallback)
     *
     * **Example**:
     * ```
     * GET /api/v1/directory/entries/550e8400-e29b-41d4-a716-446655440000/related?limit=5
     * ```
     *
     * @param contentId UUID of the current heritage page
     * @param limit Number of results to return (3-5, default: 5)
     * @return ApiResponse with list of related content items
     */
    @GetMapping("/entries/{contentId}/related")
    fun getRelatedContent(
        @PathVariable contentId: UUID,
        @RequestParam(name = "limit", defaultValue = "5") limit: Int
    ): ApiResponse<List<DirectoryEntryDto>> {
        logger.info("GET /api/v1/directory/entries/{}/related?limit={}", contentId, limit)

        // Validate limit parameter
        val validatedLimit = when {
            limit < 3 -> {
                logger.warn("Limit {} is below minimum, using 3", limit)
                3
            }
            limit > 5 -> {
                logger.warn("Limit {} exceeds maximum, using 5", limit)
                5
            }
            else -> limit
        }

        // Find related content using service
        val relatedEntries = relatedContentService.findRelatedContent(contentId, validatedLimit)

        // Convert to DTOs
        val relatedDtos = relatedEntries.map { entry ->
            DirectoryEntryDto(
                id = entry.id!!,
                name = entry.name,
                slug = entry.slug,
                description = entry.description,
                category = entry.category,
                town = entry.town,
                latitude = entry.latitude,
                longitude = entry.longitude,
                imageUrl = entry.imageUrl,
                rating = entry.rating,
                reviewCount = entry.reviewCount,
                phoneNumber = entry.phoneNumber,
                openingHours = entry.openingHours,
                cuisine = entry.cuisine,
                amenities = entry.amenities,
                createdAt = entry.createdAt,
                updatedAt = entry.updatedAt
            )
        }

        logger.info("Returning {} related content items for contentId={}", relatedDtos.size, contentId)

        return ApiResponse(
            data = relatedDtos,
            status = HttpStatus.OK.value()
        )
    }
}
