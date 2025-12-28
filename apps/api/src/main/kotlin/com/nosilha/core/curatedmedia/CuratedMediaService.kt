package com.nosilha.core.curatedmedia

import com.nosilha.core.curatedmedia.api.CreateCuratedMediaRequest
import com.nosilha.core.curatedmedia.api.CuratedMediaDto
import com.nosilha.core.curatedmedia.api.UpdateCuratedMediaRequest
import com.nosilha.core.curatedmedia.api.toDto
import com.nosilha.core.curatedmedia.domain.CuratedMedia
import com.nosilha.core.curatedmedia.domain.CuratedMediaStatus
import com.nosilha.core.curatedmedia.domain.MediaType
import com.nosilha.core.curatedmedia.repository.CuratedMediaRepository
import com.nosilha.core.shared.exception.ResourceNotFoundException
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * Service for managing curated media in the Nos Ilha gallery.
 *
 * <p>Provides business logic for retrieving, creating, updating, and deleting
 * admin-curated media content. Handles filtering by media type and category,
 * pagination, and validation.</p>
 *
 * <p><strong>Public Operations:</strong></p>
 * <ul>
 *   <li>List active media with optional filters</li>
 *   <li>Get single media item by ID</li>
 *   <li>Get list of available categories</li>
 * </ul>
 *
 * <p><strong>Admin Operations:</strong></p>
 * <ul>
 *   <li>Create new media items</li>
 *   <li>Update existing media items</li>
 *   <li>Delete media items (soft delete via ARCHIVED status)</li>
 * </ul>
 *
 * @property repository Repository for curated media persistence
 */
@Service
@Transactional(readOnly = true)
class CuratedMediaService(
    private val repository: CuratedMediaRepository,
) {
    private val logger = LoggerFactory.getLogger(CuratedMediaService::class.java)

    /**
     * Lists active curated media with optional filtering and pagination.
     *
     * <p>Supports filtering by media type (IMAGE, VIDEO, AUDIO) and/or category.
     * Only returns ACTIVE media items. Results are ordered by displayOrder ascending.</p>
     *
     * <h4>Query Combinations:</h4>
     * <ul>
     *   <li>No filters: Returns all active media</li>
     *   <li>mediaType only: Returns all active media of specified type</li>
     *   <li>category only: Returns all active media in specified category</li>
     *   <li>Both filters: Returns active media matching both criteria</li>
     * </ul>
     *
     * @param mediaType Optional media type filter (IMAGE, VIDEO, AUDIO)
     * @param category Optional category filter (e.g., "Historical", "Nature")
     * @param pageable Pagination parameters (page number, size, sort)
     * @return Page of CuratedMediaDto objects
     */
    fun listActiveMedia(
        mediaType: MediaType? = null,
        category: String? = null,
        pageable: Pageable,
    ): Page<CuratedMediaDto> {
        logger.debug(
            "Listing active media - type: {}, category: {}, page: {}",
            mediaType,
            category,
            pageable.pageNumber
        )

        val page =
            when {
                mediaType != null && category != null -> {
                    repository.findByMediaTypeAndCategoryAndStatusOrderByDisplayOrderAsc(
                        mediaType = mediaType,
                        category = category,
                        status = CuratedMediaStatus.ACTIVE,
                        pageable = pageable,
                    )
                }
                mediaType != null -> {
                    repository.findByMediaTypeAndStatusOrderByDisplayOrderAsc(
                        mediaType = mediaType,
                        status = CuratedMediaStatus.ACTIVE,
                        pageable = pageable,
                    )
                }
                category != null -> {
                    repository.findByCategoryAndStatusOrderByDisplayOrderAsc(
                        category = category,
                        status = CuratedMediaStatus.ACTIVE,
                        pageable = pageable,
                    )
                }
                else -> {
                    repository.findByStatusOrderByDisplayOrderAsc(
                        status = CuratedMediaStatus.ACTIVE,
                        pageable = pageable,
                    )
                }
            }

        return page.map { it.toDto() }
    }

    /**
     * Retrieves a single curated media item by its ID.
     *
     * <p>Returns the media item if it exists and is ACTIVE.
     * Throws ResourceNotFoundException if not found or archived.</p>
     *
     * @param id UUID of the media item to retrieve
     * @return CuratedMediaDto with full media details
     * @throws ResourceNotFoundException if media not found or not active
     */
    fun getById(id: UUID): CuratedMediaDto {
        logger.debug("Fetching curated media by ID: {}", id)

        val media =
            repository.findById(id).orElseThrow {
                logger.warn("Curated media not found: {}", id)
                ResourceNotFoundException("Curated media not found with id: $id")
            }

        // Only return ACTIVE media to public
        if (media.status != CuratedMediaStatus.ACTIVE) {
            logger.warn("Attempted to access non-active curated media: {}", id)
            throw ResourceNotFoundException("Curated media not found with id: $id")
        }

        return media.toDto()
    }

    /**
     * Retrieves a distinct list of all categories used by active curated media.
     *
     * <p>Returns categories sorted alphabetically. Useful for populating
     * category filter dropdowns in the UI. Only includes categories from
     * ACTIVE media items.</p>
     *
     * @return List of distinct category names, sorted alphabetically
     */
    fun getCategories(): List<String> {
        logger.debug("Fetching distinct categories for active curated media")
        return repository.findDistinctCategories(CuratedMediaStatus.ACTIVE)
    }

    /**
     * Creates a new curated media item.
     *
     * <p>Admin-only operation. Validates the request and persists a new
     * media item with ACTIVE status. The curatedBy field is set to the
     * admin's user ID for audit purposes.</p>
     *
     * @param request Create request with all media details
     * @param adminId User ID of the admin creating the media
     * @return CuratedMediaDto of the newly created media item
     */
    @Transactional
    fun create(
        request: CreateCuratedMediaRequest,
        adminId: String,
    ): CuratedMediaDto {
        logger.info(
            "Creating curated media - type: {}, title: '{}', admin: {}",
            request.mediaType,
            request.title,
            adminId
        )

        val media =
            CuratedMedia().apply {
                mediaType = request.mediaType
                platform = request.platform
                externalId = request.externalId
                url = request.url
                thumbnailUrl = request.thumbnailUrl
                title = request.title
                description = request.description
                author = request.author
                category = request.category
                displayOrder = request.displayOrder
                status = CuratedMediaStatus.ACTIVE
                curatedBy = adminId
            }

        val saved = repository.save(media)
        logger.info("Created curated media: {}", saved.id)

        return saved.toDto()
    }

    /**
     * Updates an existing curated media item.
     *
     * <p>Admin-only operation. Supports partial updates - only provided
     * fields in the request will be updated. Throws ResourceNotFoundException
     * if the media item does not exist.</p>
     *
     * @param id UUID of the media item to update
     * @param request Update request with fields to modify
     * @return CuratedMediaDto of the updated media item
     * @throws ResourceNotFoundException if media not found
     */
    @Transactional
    fun update(
        id: UUID,
        request: UpdateCuratedMediaRequest,
    ): CuratedMediaDto {
        logger.info("Updating curated media: {}", id)

        val media =
            repository.findById(id).orElseThrow {
                logger.warn("Curated media not found for update: {}", id)
                ResourceNotFoundException("Curated media not found with id: $id")
            }

        // Apply updates for non-null fields
        request.mediaType?.let { media.mediaType = it }
        request.platform?.let { media.platform = it }
        request.externalId?.let { media.externalId = it }
        request.url?.let { media.url = it }
        request.thumbnailUrl?.let { media.thumbnailUrl = it }
        request.title?.let { media.title = it }
        request.description?.let { media.description = it }
        request.author?.let { media.author = it }
        request.category?.let { media.category = it }
        request.displayOrder?.let { media.displayOrder = it }

        val updated = repository.save(media)
        logger.info("Updated curated media: {}", updated.id)

        return updated.toDto()
    }

    /**
     * Deletes a curated media item.
     *
     * <p>Admin-only operation. Performs soft delete by setting status to
     * ARCHIVED. This preserves the record for audit purposes while hiding
     * it from public view.</p>
     *
     * @param id UUID of the media item to delete
     * @throws ResourceNotFoundException if media not found
     */
    @Transactional
    fun delete(id: UUID) {
        logger.info("Archiving curated media: {}", id)

        val media =
            repository.findById(id).orElseThrow {
                logger.warn("Curated media not found for deletion: {}", id)
                ResourceNotFoundException("Curated media not found with id: $id")
            }

        media.status = CuratedMediaStatus.ARCHIVED
        repository.save(media)

        logger.info("Archived curated media: {}", id)
    }
}
