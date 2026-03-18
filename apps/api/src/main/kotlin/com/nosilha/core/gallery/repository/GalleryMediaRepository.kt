package com.nosilha.core.gallery.repository

import com.nosilha.core.gallery.domain.ExternalMedia
import com.nosilha.core.gallery.domain.ExternalPlatform
import com.nosilha.core.gallery.domain.GalleryMedia
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.gallery.domain.UserUploadedMedia
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
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
     * Finds media by status where showInGallery is true, with pagination and display order.
     *
     * Used for public gallery display (ACTIVE + gallery-visible only).
     *
     * @param status The media status to filter by
     * @param pageable Pagination parameters
     * @return Page of gallery-visible media entities
     */
    fun findByStatusAndShowInGalleryTrueOrderByDisplayOrderAsc(
        status: GalleryMediaStatus,
        pageable: Pageable,
    ): Page<GalleryMedia>

    /**
     * Finds all media by status where showInGallery is true.
     *
     * Used for category extraction from gallery-visible items.
     *
     * @param status The media status to filter by
     * @return List of gallery-visible media entities
     */
    fun findByStatusAndShowInGalleryTrue(status: GalleryMediaStatus): List<GalleryMedia>

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
     * Finds a user-uploaded media item by its R2 storage key.
     *
     * Used for orphan linking/deletion safety checks.
     *
     * @param storageKey The R2 object key
     * @return The matching entity, or null if no record exists for this key
     */
    @Query("SELECT m FROM UserUploadedMedia m WHERE m.storageKey = :storageKey")
    fun findByStorageKey(storageKey: String): UserUploadedMedia?

    /**
     * Returns all non-null storage keys from user-uploaded media.
     *
     * Used for orphan detection set comparison against R2 bucket listing.
     * Returns only the key column (projection) for efficiency.
     *
     * @return List of storage key strings
     */
    @Query("SELECT m.storageKey FROM UserUploadedMedia m WHERE m.storageKey IS NOT NULL")
    fun findAllStorageKeys(): List<String>

    /**
     * Finds all user-uploaded media items.
     * Type-specific query for UserUploadedMedia.
     *
     * @return List of all user uploaded media entities
     */
    @Query("SELECT m FROM UserUploadedMedia m")
    fun findAllUserUploads(): List<UserUploadedMedia>

    /**
     * Finds the currently featured video.
     * Returns the most recently updated featured ACTIVE external media item.
     *
     * @return The featured video, or null if none is set
     */
    @Query(
        "SELECT m FROM ExternalMedia m " +
            "WHERE m.featured = true " +
            "AND m.status = :status " +
            "ORDER BY m.updatedAt DESC",
    )
    fun findFeaturedVideo(
        @Param("status") status: GalleryMediaStatus = GalleryMediaStatus.ACTIVE,
    ): ExternalMedia?

    /**
     * Clears the featured flag on all external media.
     * Used to enforce single-featured-video exclusivity before setting a new one.
     */
    @Modifying
    @Query(
        "UPDATE ExternalMedia m SET m.featured = false " +
            "WHERE m.featured = true",
    )
    fun clearAllFeaturedVideos()

    /**
     * Finds an external media item by platform and external ID.
     *
     * Used for duplicate detection during YouTube channel sync to avoid
     * creating duplicate records on repeated sync operations.
     *
     * @param platform The external platform (e.g., YOUTUBE)
     * @param externalId The platform-specific identifier (e.g., YouTube video ID)
     * @return The matching entity, or null if no record exists
     */
    @Query("SELECT m FROM ExternalMedia m WHERE m.platform = :platform AND m.externalId = :externalId")
    fun findExternalMediaByPlatformAndExternalId(
        @Param("platform") platform: ExternalPlatform,
        @Param("externalId") externalId: String,
    ): ExternalMedia?

    /**
     * Batch lookup of existing external IDs for a given platform.
     *
     * Used for efficient duplicate detection during YouTube channel sync —
     * fetches all matching IDs in a single query instead of per-video lookups.
     *
     * @param platform The external platform (e.g., YOUTUBE)
     * @param externalIds List of platform-specific identifiers to check
     * @return Set of external IDs that already exist in the database
     */
    @Query("SELECT m.externalId FROM ExternalMedia m WHERE m.platform = :platform AND m.externalId IN :externalIds")
    fun findExternalIdsByPlatformAndExternalIds(
        @Param("platform") platform: ExternalPlatform,
        @Param("externalIds") externalIds: List<String>,
    ): Set<String>

    /**
     * Finds all external media items.
     * Type-specific query for ExternalMedia.
     *
     * @return List of all external media entities
     */
    @Query("SELECT m FROM ExternalMedia m")
    fun findAllExternalMedia(): List<ExternalMedia>

    /**
     * Counts external media items by platform.
     *
     * Used for dashboard statistics (e.g., YouTube video count).
     *
     * @param platform The external platform to count
     * @return Number of external media records for the given platform
     */
    @Query("SELECT COUNT(m) FROM ExternalMedia m WHERE m.platform = :platform")
    fun countByPlatform(
        @Param("platform") platform: ExternalPlatform,
    ): Long

    /**
     * Returns IDs of all active gallery-visible media.
     *
     * Lightweight projection query for random selection — avoids loading
     * full entity graphs into memory. Only returns the UUID primary key.
     *
     * @param status The media status to filter by (typically ACTIVE)
     * @return List of media UUIDs matching the criteria
     */
    @Query("SELECT gm.id FROM GalleryMedia gm WHERE gm.status = :status AND gm.showInGallery = true")
    fun findIdsByStatusAndShowInGalleryTrue(
        @Param("status") status: GalleryMediaStatus,
    ): List<UUID>

    /**
     * Finds gallery media filtered by AI moderation status (read-model query spanning gallery + AI tables).
     *
     * Uses a native SQL subquery against ai_analysis_log to filter by AI moderation status.
     * NOT_ANALYZED returns media with no analysis runs; other statuses check the latest run's moderation_status.
     * Optionally filters by gallery media status as well.
     *
     * @param status Optional gallery media status filter
     * @param aiModerationStatus AI moderation status: NOT_ANALYZED, PENDING_REVIEW, APPROVED, or REJECTED
     * @param pageable Pagination parameters
     * @return Page of gallery media matching the criteria
     */
    @Query(
        value = """
        SELECT gm.* FROM gallery_media gm
        WHERE (:status IS NULL OR gm.status = CAST(:status AS gallery_media_status))
        AND (
            CASE :aiModerationStatus
                WHEN 'NOT_ANALYZED' THEN
                    NOT EXISTS (SELECT 1 FROM ai_analysis_log a WHERE a.media_id = gm.id)
                ELSE
                    EXISTS (
                        SELECT 1 FROM ai_analysis_log a
                        WHERE a.media_id = gm.id
                        AND a.moderation_status = :aiModerationStatus
                        AND a.created_at = (
                            SELECT MAX(a2.created_at) FROM ai_analysis_log a2 WHERE a2.media_id = gm.id
                        )
                    )
            END
        )
        ORDER BY gm.created_at DESC
        """,
        countQuery = """
        SELECT COUNT(*) FROM gallery_media gm
        WHERE (:status IS NULL OR gm.status = CAST(:status AS gallery_media_status))
        AND (
            CASE :aiModerationStatus
                WHEN 'NOT_ANALYZED' THEN
                    NOT EXISTS (SELECT 1 FROM ai_analysis_log a WHERE a.media_id = gm.id)
                ELSE
                    EXISTS (
                        SELECT 1 FROM ai_analysis_log a
                        WHERE a.media_id = gm.id
                        AND a.moderation_status = :aiModerationStatus
                        AND a.created_at = (
                            SELECT MAX(a2.created_at) FROM ai_analysis_log a2 WHERE a2.media_id = gm.id
                        )
                    )
            END
        )
        """,
        nativeQuery = true,
    )
    fun findByAiModerationStatus(
        @Param("status") status: String?,
        @Param("aiModerationStatus") aiModerationStatus: String,
        pageable: Pageable,
    ): Page<GalleryMedia>

    /**
     * Full-text search across gallery media using Portuguese text search config.
     * Searches title (weight A), description (B), and location_name (C).
     * Results ranked by ts_rank relevance score.
     * Only returns ACTIVE, gallery-visible items.
     */
    @Query(
        value = """
        SELECT * FROM gallery_media
        WHERE search_vector @@ plainto_tsquery('portuguese', :query)
        AND status = 'ACTIVE' AND show_in_gallery = true
        ORDER BY ts_rank(search_vector, plainto_tsquery('portuguese', :query)) DESC
        """,
        countQuery = """
        SELECT COUNT(*) FROM gallery_media
        WHERE search_vector @@ plainto_tsquery('portuguese', :query)
        AND status = 'ACTIVE' AND show_in_gallery = true
        """,
        nativeQuery = true,
    )
    fun searchGallery(
        @Param("query") query: String,
        pageable: Pageable,
    ): Page<GalleryMedia>
}
