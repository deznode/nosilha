package com.nosilha.core.curatedmedia.api

import com.nosilha.core.curatedmedia.CuratedMediaService
import com.nosilha.core.curatedmedia.domain.MediaType
import com.nosilha.core.shared.api.ApiResult
import com.nosilha.core.shared.api.PagedApiResult
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.data.domain.PageRequest
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

private val logger = KotlinLogging.logger {}

/**
 * Public REST controller for accessing curated media in the Nos Ilha gallery.
 *
 * <p>Provides read-only public access to curated media content including
 * photos, videos, and audio. No authentication required for these endpoints.</p>
 *
 * <h3>Endpoints:</h3>
 * <ul>
 *   <li>GET /api/v1/curated-media - List active media with optional filters</li>
 *   <li>GET /api/v1/curated-media/{id} - Get single media item by ID</li>
 *   <li>GET /api/v1/curated-media/categories - Get distinct categories for filtering</li>
 * </ul>
 *
 * <h3>Security:</h3>
 * <ul>
 *   <li>All endpoints are public (no authentication required)</li>
 *   <li>Only ACTIVE media is returned to public consumers</li>
 *   <li>Configured in SecurityConfig to permit all GET requests</li>
 * </ul>
 *
 * @property service Service for curated media business logic
 */
@RestController
@RequestMapping("/api/v1/curated-media")
class CuratedMediaController(
    private val service: CuratedMediaService,
) {
    /**
     * List active curated media with optional filtering and pagination.
     *
     * <p>Returns all ACTIVE curated media items ordered by displayOrder.
     * Supports filtering by media type and/or category.</p>
     *
     * <h4>Query Parameters:</h4>
     * <ul>
     *   <li>mediaType: Optional filter (IMAGE, VIDEO, AUDIO)</li>
     *   <li>category: Optional category filter (e.g., "Historical", "Nature")</li>
     *   <li>page: Page number (default: 0)</li>
     *   <li>size: Items per page (default: 20, max: 100)</li>
     * </ul>
     *
     * <h4>Example Requests:</h4>
     * <pre>
     * GET /api/v1/curated-media?page=0&size=20
     * GET /api/v1/curated-media?mediaType=VIDEO
     * GET /api/v1/curated-media?category=Historical
     * GET /api/v1/curated-media?mediaType=IMAGE&category=Nature&page=1
     * </pre>
     *
     * <h4>Example Response:</h4>
     * <pre>
     * {
     *   "data": [
     *     {
     *       "id": "550e8400-e29b-41d4-a716-446655440000",
     *       "mediaType": "VIDEO",
     *       "platform": "YOUTUBE",
     *       "url": null,
     *       "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
     *       "title": "Aerial View: Nova Sintra Gardens",
     *       "description": "Drone footage of the flower capital...",
     *       "author": "Community Upload",
     *       "category": "Nature",
     *       "displayOrder": 1,
     *       "embedUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
     *       "createdAt": "2025-01-15T10:30:00"
     *     }
     *   ],
     *   "pageable": {
     *     "page": 0,
     *     "size": 20,
     *     "totalElements": 10,
     *     "totalPages": 1,
     *     "first": true,
     *     "last": true
     *   },
     *   "timestamp": "2025-12-27T12:00:00Z",
     *   "status": 200
     * }
     * </pre>
     *
     * @param mediaType Optional media type filter (IMAGE, VIDEO, AUDIO)
     * @param category Optional category filter
     * @param page Page number (default: 0)
     * @param size Items per page (default: 20, max: 100)
     * @return PagedApiResult containing list of CuratedMediaDto
     */
    @GetMapping
    fun listMedia(
        @RequestParam(required = false) mediaType: MediaType? = null,
        @RequestParam(required = false) category: String? = null,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): PagedApiResult<CuratedMediaDto> {
        logger.debug { "Listing curated media - type: $mediaType, category: $category, page: $page, size: $size" }

        val pageable = PageRequest.of(page, size.coerceAtMost(100))
        val result = service.listActiveMedia(mediaType, category, pageable)

        return PagedApiResult.from(result)
    }

    /**
     * Get a single curated media item by its ID.
     *
     * <p>Returns full details of an ACTIVE media item.
     * Returns 404 if media not found or not active.</p>
     *
     * <h4>Example Request:</h4>
     * <pre>
     * GET /api/v1/curated-media/550e8400-e29b-41d4-a716-446655440000
     * </pre>
     *
     * <h4>Example Response:</h4>
     * <pre>
     * {
     *   "data": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "mediaType": "VIDEO",
     *     "platform": "YOUTUBE",
     *     "url": null,
     *     "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
     *     "title": "Aerial View: Nova Sintra Gardens",
     *     "description": "Drone footage of the flower capital of Cape Verde in full bloom.",
     *     "author": "Community Upload",
     *     "category": "Nature",
     *     "displayOrder": 1,
     *     "embedUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
     *     "createdAt": "2025-01-15T10:30:00"
     *   },
     *   "timestamp": "2025-12-27T12:00:00Z",
     *   "status": 200
     * }
     * </pre>
     *
     * @param id UUID of the media item to retrieve
     * @return ApiResult containing CuratedMediaDto
     * @throws ResourceNotFoundException if media not found or not active (results in 404 Not Found)
     */
    @GetMapping("/{id}")
    fun getById(
        @PathVariable id: UUID,
    ): ApiResult<CuratedMediaDto> {
        logger.debug { "Fetching curated media by ID: $id" }
        val media = service.getById(id)
        return ApiResult(data = media)
    }

    /**
     * Get distinct list of categories used by active curated media.
     *
     * <p>Returns all unique categories from ACTIVE media items,
     * sorted alphabetically. Useful for populating category filter
     * dropdowns in the frontend.</p>
     *
     * <h4>Example Request:</h4>
     * <pre>
     * GET /api/v1/curated-media/categories
     * </pre>
     *
     * <h4>Example Response:</h4>
     * <pre>
     * {
     *   "data": [
     *     "Culture",
     *     "Event",
     *     "Historical",
     *     "Interview",
     *     "Landmark",
     *     "Nature"
     *   ],
     *   "timestamp": "2025-12-27T12:00:00Z",
     *   "status": 200
     * }
     * </pre>
     *
     * @return ApiResult containing list of category names
     */
    @GetMapping("/categories")
    fun getCategories(): ApiResult<List<String>> {
        logger.debug { "Fetching curated media categories" }
        val categories = service.getCategories()
        return ApiResult(data = categories)
    }
}
