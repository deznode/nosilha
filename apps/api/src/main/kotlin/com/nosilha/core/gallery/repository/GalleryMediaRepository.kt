package com.nosilha.core.gallery.repository

import com.nosilha.core.gallery.domain.ExternalMedia
import com.nosilha.core.gallery.domain.GalleryMedia
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.gallery.domain.UserUploadedMedia
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID

/**
 * Spring Data JPA repository for managing GalleryMedia entities.
 *
 * Provides standard CRUD operations plus custom query methods for
 * finding media by directory entry association, category, and status.
 * Supports polymorphic queries for both UserUploadedMedia and ExternalMedia.
 */
@Repository
interface GalleryMediaRepository : JpaRepository<GalleryMedia, UUID> {
    /**
     * Finds all media with a specific status.
     * Polymorphic query returns both UserUploadedMedia and ExternalMedia.
     *
     * @param status The media status to filter by
     * @return List of gallery media entities with the specified status
     */
    fun findByStatus(status: GalleryMediaStatus): List<GalleryMedia>

    /**
     * Finds media by status with pagination, ordered by display order ascending.
     *
     * Used for public gallery display (ACTIVE status).
     * Polymorphic query returns both UserUploadedMedia and ExternalMedia.
     *
     * @param status The media status to filter by
     * @param pageable Pagination parameters
     * @return Page of gallery media entities with the specified status
     */
    fun findByStatusOrderByDisplayOrderAsc(
        status: GalleryMediaStatus,
        pageable: Pageable,
    ): Page<GalleryMedia>

    /**
     * Finds media by status with pagination, ordered by creation date descending.
     *
     * Used for admin moderation queue (PENDING_REVIEW status).
     * Polymorphic query returns both UserUploadedMedia and ExternalMedia.
     *
     * @param status The media status to filter by
     * @param pageable Pagination parameters
     * @return Page of gallery media entities with the specified status
     */
    fun findByStatusOrderByCreatedAtDesc(
        status: GalleryMediaStatus,
        pageable: Pageable,
    ): Page<GalleryMedia>

    /**
     * Finds all media in a specific category.
     *
     * @param category The media category (e.g., "hero", "gallery")
     * @return List of gallery media entities in the category
     */
    fun findByCategory(category: String): List<GalleryMedia>

    /**
     * Counts media with a specific status.
     *
     * Used for dashboard statistics to show pending moderation items.
     *
     * @param status The media status to count
     * @return Number of gallery media entities with the specified status
     */
    fun countByStatus(status: GalleryMediaStatus): Long

    /**
     * Finds all ACTIVE media associated with a directory entry.
     *
     * Used for public-facing media display. Only returns UserUploadedMedia
     * since ExternalMedia doesn't have entryId association.
     *
     * @param entryId The UUID of the directory entry
     * @param status The media status (typically ACTIVE)
     * @return List of user uploaded media entities sorted by displayOrder ascending
     */
    @Query("SELECT m FROM UserUploadedMedia m WHERE m.entryId = :entryId AND m.status = :status ORDER BY m.displayOrder ASC")
    fun findByEntryIdAndStatusOrderByDisplayOrderAsc(
        entryId: UUID,
        status: GalleryMediaStatus,
    ): List<UserUploadedMedia>

    /**
     * Finds all media associated with a directory entry, ordered by display order.
     *
     * Only returns UserUploadedMedia since ExternalMedia doesn't have entryId association.
     *
     * @param entryId The UUID of the directory entry
     * @return List of user uploaded media entities sorted by displayOrder ascending
     */
    @Query("SELECT m FROM UserUploadedMedia m WHERE m.entryId = :entryId ORDER BY m.displayOrder ASC")
    fun findByEntryIdOrderByDisplayOrderAsc(entryId: UUID): List<UserUploadedMedia>

    /**
     * Counts media associated with a directory entry.
     *
     * Only counts UserUploadedMedia since ExternalMedia doesn't have entryId association.
     *
     * @param entryId The UUID of the directory entry
     * @return Number of user uploaded media files associated with the entry
     */
    @Query("SELECT COUNT(m) FROM UserUploadedMedia m WHERE m.entryId = :entryId")
    fun countByEntryId(entryId: UUID): Long

    /**
     * Finds all media with a specific content type prefix.
     *
     * Only returns UserUploadedMedia since ExternalMedia doesn't have contentType.
     *
     * @param contentTypePrefix The content type prefix (e.g., "image/")
     * @return List of user uploaded media entities
     */
    @Query("SELECT m FROM UserUploadedMedia m WHERE m.contentType LIKE CONCAT(:contentTypePrefix, '%')")
    fun findByContentTypeStartingWith(contentTypePrefix: String): List<UserUploadedMedia>

    /**
     * Finds media by status and content type prefix with pagination.
     *
     * Used for gallery display with media type filtering (e.g., "image/").
     * Only returns UserUploadedMedia since ExternalMedia doesn't have contentType.
     *
     * @param status The media status to filter by
     * @param contentTypePrefix The content type prefix (e.g., "image/")
     * @param pageable Pagination parameters
     * @return Page of user uploaded media entities matching the criteria
     */
    @Query(
        "SELECT m FROM UserUploadedMedia m WHERE m.status = :status AND m.contentType LIKE CONCAT(:contentTypePrefix, '%') ORDER BY m.displayOrder ASC"
    )
    fun findByStatusAndContentTypeStartingWithOrderByDisplayOrderAsc(
        status: GalleryMediaStatus,
        contentTypePrefix: String,
        pageable: Pageable,
    ): Page<UserUploadedMedia>

    /**
     * Finds all user-uploaded media items.
     * Type-specific query for UserUploadedMedia.
     *
     * @return List of all user uploaded media entities
     */
    @Query("SELECT m FROM UserUploadedMedia m")
    fun findAllUserUploads(): List<UserUploadedMedia>

    /**
     * Finds all external media items.
     * Type-specific query for ExternalMedia.
     *
     * @return List of all external media entities
     */
    @Query("SELECT m FROM ExternalMedia m")
    fun findAllExternalMedia(): List<ExternalMedia>
}
