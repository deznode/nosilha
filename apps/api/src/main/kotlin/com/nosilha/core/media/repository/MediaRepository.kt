package com.nosilha.core.media.repository

import com.nosilha.core.media.domain.Media
import com.nosilha.core.media.domain.MediaStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

/**
 * Spring Data JPA repository for managing Media entities.
 *
 * Provides standard CRUD operations plus custom query methods for
 * finding media by directory entry association, category, and status.
 */
@Repository
interface MediaRepository : JpaRepository<Media, UUID> {
    /**
     * Finds all media associated with a directory entry, ordered by display order.
     *
     * @param entryId The UUID of the directory entry
     * @return List of media entities sorted by displayOrder ascending
     */
    fun findByEntryIdOrderByDisplayOrderAsc(entryId: UUID): List<Media>

    /**
     * Finds all media in a specific category.
     *
     * @param category The media category (e.g., "hero", "gallery")
     * @return List of media entities in the category
     */
    fun findByCategory(category: String): List<Media>

    /**
     * Finds all media with a specific content type prefix.
     *
     * @param contentTypePrefix The content type prefix (e.g., "image/")
     * @return List of matching media entities
     */
    fun findByContentTypeStartingWith(contentTypePrefix: String): List<Media>

    /**
     * Counts media associated with a directory entry.
     *
     * @param entryId The UUID of the directory entry
     * @return Number of media files associated with the entry
     */
    fun countByEntryId(entryId: UUID): Long

    /**
     * Finds all media with a specific status.
     *
     * @param status The media status to filter by
     * @return List of media entities with the specified status
     */
    fun findByStatus(status: MediaStatus): List<Media>

    /**
     * Finds media by status with pagination, ordered by creation date descending.
     *
     * Used for admin moderation list (PENDING_REVIEW status).
     *
     * @param status The media status to filter by
     * @param pageable Pagination parameters
     * @return Page of media entities with the specified status
     */
    fun findByStatusOrderByCreatedAtDesc(
        status: MediaStatus,
        pageable: Pageable,
    ): Page<Media>

    /**
     * Finds all AVAILABLE media associated with a directory entry.
     *
     * Used for public-facing media display.
     *
     * @param entryId The UUID of the directory entry
     * @param status The media status (typically AVAILABLE)
     * @return List of media entities sorted by displayOrder ascending
     */
    fun findByEntryIdAndStatusOrderByDisplayOrderAsc(
        entryId: UUID,
        status: MediaStatus,
    ): List<Media>
}
