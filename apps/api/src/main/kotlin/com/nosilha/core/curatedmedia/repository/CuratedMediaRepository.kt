package com.nosilha.core.curatedmedia.repository

import com.nosilha.core.curatedmedia.domain.CuratedMedia
import com.nosilha.core.curatedmedia.domain.CuratedMediaStatus
import com.nosilha.core.curatedmedia.domain.MediaType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

/**
 * Repository for managing [CuratedMedia] entities.
 *
 * <p>Provides CRUD operations and custom query methods for retrieving
 * curated media with filtering and pagination support.</p>
 *
 * <p><strong>Query Methods:</strong></p>
 * <ul>
 *   <li>Find by status (e.g., ACTIVE media only)</li>
 *   <li>Find by media type (e.g., VIDEO, IMAGE)</li>
 *   <li>Find by category (e.g., "Historical", "Nature")</li>
 *   <li>Find distinct categories for filter dropdowns</li>
 * </ul>
 *
 * <p>All query methods return results ordered by displayOrder ascending.</p>
 *
 * @see CuratedMedia
 * @see CuratedMediaStatus
 * @see MediaType
 */
@Repository
interface CuratedMediaRepository : JpaRepository<CuratedMedia, UUID> {
    /**
     * Finds all curated media with the specified status, ordered by display order.
     *
     * @param status The publication status to filter by
     * @param pageable Pagination and sorting parameters
     * @return Page of matching curated media items
     */
    fun findByStatusOrderByDisplayOrderAsc(
        status: CuratedMediaStatus,
        pageable: Pageable
    ): Page<CuratedMedia>

    /**
     * Finds curated media by type and status, ordered by display order.
     *
     * <p>Use this method to get all videos, images, or audio content
     * with a specific publication status.</p>
     *
     * @param mediaType The media type to filter by (IMAGE, VIDEO, AUDIO)
     * @param status The publication status to filter by
     * @param pageable Pagination and sorting parameters
     * @return Page of matching curated media items
     */
    fun findByMediaTypeAndStatusOrderByDisplayOrderAsc(
        mediaType: MediaType,
        status: CuratedMediaStatus,
        pageable: Pageable
    ): Page<CuratedMedia>

    /**
     * Finds curated media by category and status, ordered by display order.
     *
     * @param category The category to filter by (e.g., "Historical", "Nature")
     * @param status The publication status to filter by
     * @param pageable Pagination and sorting parameters
     * @return Page of matching curated media items
     */
    fun findByCategoryAndStatusOrderByDisplayOrderAsc(
        category: String,
        status: CuratedMediaStatus,
        pageable: Pageable
    ): Page<CuratedMedia>

    /**
     * Finds curated media by type, category, and status, ordered by display order.
     *
     * <p>Use this method for precise filtering combining all three criteria.</p>
     *
     * @param mediaType The media type to filter by (IMAGE, VIDEO, AUDIO)
     * @param category The category to filter by (e.g., "Historical", "Nature")
     * @param status The publication status to filter by
     * @param pageable Pagination and sorting parameters
     * @return Page of matching curated media items
     */
    fun findByMediaTypeAndCategoryAndStatusOrderByDisplayOrderAsc(
        mediaType: MediaType,
        category: String,
        status: CuratedMediaStatus,
        pageable: Pageable
    ): Page<CuratedMedia>

    /**
     * Retrieves a distinct list of all categories used by curated media with the specified status.
     *
     * <p>Use this method to populate category filter dropdowns in the UI.
     * Results are sorted alphabetically and exclude null categories.</p>
     *
     * @param status The publication status to filter by
     * @return List of distinct category names, sorted alphabetically
     */
    @Query(
        """
        SELECT DISTINCT c.category FROM CuratedMedia c
        WHERE c.status = :status AND c.category IS NOT NULL
        ORDER BY c.category
        """,
    )
    fun findDistinctCategories(
        @Param("status") status: CuratedMediaStatus,
    ): List<String>
}
