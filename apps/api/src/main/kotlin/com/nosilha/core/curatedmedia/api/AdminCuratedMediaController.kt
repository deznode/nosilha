package com.nosilha.core.curatedmedia.api

import com.nosilha.core.curatedmedia.CuratedMediaService
import com.nosilha.core.shared.api.ApiResult
import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

private val logger = KotlinLogging.logger {}

/**
 * Admin REST controller for managing curated media in the Nos Ilha gallery.
 *
 * <p>Provides CRUD operations for curated media content. All endpoints
 * require ADMIN role authentication.</p>
 *
 * <h3>Endpoints:</h3>
 * <ul>
 *   <li>POST /api/v1/admin/curated-media - Create new media item</li>
 *   <li>PUT /api/v1/admin/curated-media/{id} - Update existing media item</li>
 *   <li>DELETE /api/v1/admin/curated-media/{id} - Archive media item</li>
 * </ul>
 *
 * <h3>Security:</h3>
 * <ul>
 *   <li>All endpoints require ADMIN role (configured in SecurityConfig)</li>
 *   <li>Admin user ID is extracted from authentication for audit tracking</li>
 *   <li>Delete operation performs soft delete (sets status to ARCHIVED)</li>
 * </ul>
 *
 * @property service Service for curated media business logic
 */
@RestController
@RequestMapping("/api/v1/admin/curated-media")
class AdminCuratedMediaController(
    private val service: CuratedMediaService,
) {
    /**
     * Create a new curated media item.
     *
     * <p>Admin-only endpoint. Creates a new media item with ACTIVE status.
     * The curatedBy field is automatically set to the authenticated admin's user ID.</p>
     *
     * <h4>Request Body Validation:</h4>
     * <ul>
     *   <li>Title: Required, 1-255 characters</li>
     *   <li>Description: Optional, max 2048 characters</li>
     *   <li>Category: Optional, max 50 characters</li>
     *   <li>Author: Optional, max 100 characters</li>
     *   <li>External ID: Optional, max 100 characters</li>
     *   <li>URLs: Optional, max 1024 characters</li>
     *   <li>Display Order: 0-9999</li>
     * </ul>
     *
     * <h4>Example Request:</h4>
     * <pre>
     * POST /api/v1/admin/curated-media
     * Authorization: Bearer {admin-jwt-token}
     * Content-Type: application/json
     *
     * {
     *   "mediaType": "VIDEO",
     *   "platform": "YOUTUBE",
     *   "externalId": "dQw4w9WgXcQ",
     *   "title": "Aerial View: Nova Sintra Gardens",
     *   "description": "Drone footage of the flower capital of Cape Verde in full bloom.",
     *   "author": "Community Upload",
     *   "category": "Nature",
     *   "displayOrder": 1
     * }
     * </pre>
     *
     * <h4>Example Response (201 Created):</h4>
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
     *     "createdAt": "2025-12-27T10:30:00"
     *   },
     *   "timestamp": "2025-12-27T10:30:00Z",
     *   "status": 201
     * }
     * </pre>
     *
     * @param request Create request with media details
     * @param authentication Spring Security authentication (contains admin user ID)
     * @return ApiResult containing the created CuratedMediaDto (201 Created)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createMedia(
        @Valid @RequestBody request: CreateCuratedMediaRequest,
        authentication: Authentication,
    ): ApiResult<CuratedMediaDto> {
        val adminId = authentication.name

        logger.info { "Admin $adminId creating curated media - type: ${request.mediaType}, title: '${request.title}'" }

        val media = service.create(request, adminId)

        logger.info { "Admin $adminId created curated media: ${media.id}" }

        return ApiResult(data = media, status = HttpStatus.CREATED.value())
    }

    /**
     * Update an existing curated media item.
     *
     * <p>Admin-only endpoint. Supports partial updates - only provided
     * fields will be updated. Returns 404 if media item not found.</p>
     *
     * <h4>Example Request:</h4>
     * <pre>
     * PUT /api/v1/admin/curated-media/550e8400-e29b-41d4-a716-446655440000
     * Authorization: Bearer {admin-jwt-token}
     * Content-Type: application/json
     *
     * {
     *   "title": "Updated Title",
     *   "description": "Updated description",
     *   "displayOrder": 5
     * }
     * </pre>
     *
     * <h4>Example Response (200 OK):</h4>
     * <pre>
     * {
     *   "data": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "mediaType": "VIDEO",
     *     "platform": "YOUTUBE",
     *     "url": null,
     *     "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
     *     "title": "Updated Title",
     *     "description": "Updated description",
     *     "author": "Community Upload",
     *     "category": "Nature",
     *     "displayOrder": 5,
     *     "embedUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
     *     "createdAt": "2025-12-27T10:30:00"
     *   },
     *   "timestamp": "2025-12-27T12:00:00Z",
     *   "status": 200
     * }
     * </pre>
     *
     * @param id UUID of the media item to update
     * @param request Update request with fields to modify
     * @param authentication Spring Security authentication (contains admin user ID)
     * @return ApiResult containing the updated CuratedMediaDto
     * @throws ResourceNotFoundException if media not found (results in 404 Not Found)
     */
    @PutMapping("/{id}")
    fun updateMedia(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateCuratedMediaRequest,
        authentication: Authentication,
    ): ApiResult<CuratedMediaDto> {
        val adminId = authentication.name

        logger.info { "Admin $adminId updating curated media: $id" }

        val media = service.update(id, request)

        logger.info { "Admin $adminId updated curated media: $id" }

        return ApiResult(data = media)
    }

    /**
     * Delete (archive) a curated media item.
     *
     * <p>Admin-only endpoint. Performs soft delete by setting status to ARCHIVED.
     * This preserves the record for audit purposes while hiding it from public view.
     * Returns 404 if media item not found.</p>
     *
     * <h4>Example Request:</h4>
     * <pre>
     * DELETE /api/v1/admin/curated-media/550e8400-e29b-41d4-a716-446655440000
     * Authorization: Bearer {admin-jwt-token}
     * </pre>
     *
     * <h4>Example Response (204 No Content):</h4>
     * <pre>
     * (Empty response body)
     * </pre>
     *
     * @param id UUID of the media item to delete
     * @param authentication Spring Security authentication (contains admin user ID)
     * @throws ResourceNotFoundException if media not found (results in 404 Not Found)
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteMedia(
        @PathVariable id: UUID,
        authentication: Authentication,
    ) {
        val adminId = authentication.name

        logger.info { "Admin $adminId archiving curated media: $id" }

        service.delete(id)

        logger.info { "Admin $adminId archived curated media: $id" }
    }
}
