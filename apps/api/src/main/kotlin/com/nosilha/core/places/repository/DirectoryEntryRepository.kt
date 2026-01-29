package com.nosilha.core.places.repository

import com.nosilha.core.places.domain.DirectoryEntry
import com.nosilha.core.places.domain.DirectoryEntryStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

/**
 * Spring Data JPA repository for the DirectoryEntry entity hierarchy.
 *
 * <p>This repository manages all entities that extend DirectoryEntry, providing
 * polymorphic access to the data. It provides standard CRUD operations and
 * allows for custom queries against the entire `directory_entries` table.</p>
 *
 * <p><strong>Single Table Inheritance Support:</strong></p>
 * <p>This repository works with the STI pattern, allowing queries that return
 * mixed types (Restaurant, Hotel, Landmark, Beach) or filtered by discriminator.</p>
 */
@Repository
interface DirectoryEntryRepository :
    JpaRepository<DirectoryEntry, UUID>,
    JpaSpecificationExecutor<DirectoryEntry> {
    /**
     * Finds all DirectoryEntry instances that match the given category.
     *
     * <p>This query leverages the discriminator column (`category`) from the
     * SINGLE_TABLE inheritance strategy. For example, calling this method with
     * the string "Restaurant" will return a list of objects that are instances
     * of the Restaurant subclass.</p>
     *
     * @param category The category name to filter by (e.g., "Restaurant", "Hotel").
     * @return A list of DirectoryEntry entities matching the specified category.
     */
    fun findByCategoryIgnoreCase(category: String): List<DirectoryEntry>

    /**
     * Finds all DirectoryEntry instances that match the given category with pagination.
     *
     * @param category The category name to filter by (e.g., "Restaurant", "Hotel").
     * @param pageable Pagination parameters.
     * @return A page of DirectoryEntry entities matching the specified category.
     */
    fun findByCategoryIgnoreCase(
        category: String,
        pageable: Pageable,
    ): Page<DirectoryEntry>

    /**
     * Finds all DirectoryEntry instances that match the given town with pagination.
     *
     * @param town The town name to filter by.
     * @param pageable Pagination parameters.
     * @return A page of DirectoryEntry entities matching the specified town.
     */
    fun findByTownIgnoreCase(
        town: String,
        pageable: Pageable,
    ): Page<DirectoryEntry>

    /**
     * Finds all DirectoryEntry instances that match both category and town with pagination.
     *
     * @param category The category name to filter by.
     * @param town The town name to filter by.
     * @param pageable Pagination parameters.
     * @return A page of DirectoryEntry entities matching both filters.
     */
    fun findByCategoryIgnoreCaseAndTownIgnoreCase(
        category: String,
        town: String,
        pageable: Pageable,
    ): Page<DirectoryEntry>

    /**
     * Finds a single DirectoryEntry by its unique slug.
     *
     * <p>Since slugs are unique across all directory entries, this method will
     * return at most one entry matching the given slug.</p>
     *
     * @param slug The unique slug to search for.
     * @return The DirectoryEntry if found, null otherwise.
     */
    fun findBySlug(slug: String): DirectoryEntry?

    /**
     * Performs full-text search on directory entries using PostgreSQL's tsvector.
     *
     * <p>This method uses the search_vector column (GIN indexed) for fast full-text search.
     * The search is case-insensitive and ranks results by relevance using ts_rank().</p>
     *
     * <p><strong>Search Behavior:</strong></p>
     * <ul>
     *   <li>Searches across name (weight A) and description (weight B) fields</li>
     *   <li>Results are ordered by relevance score (highest first)</li>
     *   <li>Uses plainto_tsquery for simple query processing (handles multiple words)</li>
     *   <li>Supports pagination through Spring Data Pageable</li>
     * </ul>
     *
     * @param query The search query string (e.g., "restaurant seafood")
     * @param pageable Pagination parameters
     * @return A page of DirectoryEntry entities matching the search query, ordered by relevance
     */
    @Query(
        value = """
        SELECT * FROM directory_entries
        WHERE search_vector @@ plainto_tsquery('english', :query)
        ORDER BY ts_rank(search_vector, plainto_tsquery('english', :query)) DESC
        """,
        countQuery = """
        SELECT COUNT(*) FROM directory_entries
        WHERE search_vector @@ plainto_tsquery('english', :query)
        """,
        nativeQuery = true,
    )
    fun searchByQuery(
        @Param("query") query: String,
        pageable: Pageable,
    ): Page<DirectoryEntry>

    /**
     * Counts the number of distinct towns in the directory.
     *
     * <p>Used for dashboard statistics to show geographic coverage of the platform.</p>
     *
     * @return Number of distinct towns represented in directory entries
     */
    @Query("SELECT COUNT(DISTINCT d.town) FROM DirectoryEntry d")
    fun countDistinctTowns(): Long

    /**
     * Counts directory entries grouped by town, ordered by count descending.
     *
     * <p>Used for dashboard statistics to show which towns have the most content.
     * Returns the results as a list of pairs (town, count).</p>
     *
     * @return List of pairs (town, count) ordered by count descending
     */
    @Query(
        """
        SELECT d.town, COUNT(d)
        FROM DirectoryEntry d
        GROUP BY d.town
        ORDER BY COUNT(d) DESC
        """,
    )
    fun countByTownGroupByTown(): List<Array<Any>>

    // =====================================================
    // PUBLIC DIRECTORY QUERIES (PUBLISHED entries only)
    // =====================================================

    /**
     * Finds all PUBLISHED DirectoryEntry instances with pagination.
     *
     * <p>Used for public directory listings to show only published entries.</p>
     *
     * @param status The status to filter by (typically PUBLISHED)
     * @param pageable Pagination parameters
     * @return A page of DirectoryEntry entities with the specified status
     */
    fun findByStatus(
        status: DirectoryEntryStatus,
        pageable: Pageable,
    ): Page<DirectoryEntry>

    /**
     * Finds PUBLISHED DirectoryEntry instances by category with pagination.
     *
     * <p>Used for public directory listings filtered by category.</p>
     *
     * @param status The status to filter by (typically PUBLISHED)
     * @param category The category name to filter by
     * @param pageable Pagination parameters
     * @return A page of DirectoryEntry entities matching the filters
     */
    fun findByStatusAndCategoryIgnoreCase(
        status: DirectoryEntryStatus,
        category: String,
        pageable: Pageable,
    ): Page<DirectoryEntry>

    /**
     * Finds PUBLISHED DirectoryEntry instances by town with pagination.
     *
     * @param status The status to filter by
     * @param town The town name to filter by
     * @param pageable Pagination parameters
     * @return A page of DirectoryEntry entities matching the filters
     */
    fun findByStatusAndTownIgnoreCase(
        status: DirectoryEntryStatus,
        town: String,
        pageable: Pageable,
    ): Page<DirectoryEntry>

    /**
     * Finds PUBLISHED DirectoryEntry instances by category and town with pagination.
     *
     * @param status The status to filter by
     * @param category The category name to filter by
     * @param town The town name to filter by
     * @param pageable Pagination parameters
     * @return A page of DirectoryEntry entities matching the filters
     */
    fun findByStatusAndCategoryIgnoreCaseAndTownIgnoreCase(
        status: DirectoryEntryStatus,
        category: String,
        town: String,
        pageable: Pageable,
    ): Page<DirectoryEntry>

    /**
     * Performs full-text search on PUBLISHED directory entries.
     *
     * @param query The search query string
     * @param pageable Pagination parameters
     * @return A page of PUBLISHED DirectoryEntry entities matching the search query
     */
    @Query(
        value = """
        SELECT * FROM directory_entries
        WHERE search_vector @@ plainto_tsquery('english', :query)
        AND status = 'PUBLISHED'
        ORDER BY ts_rank(search_vector, plainto_tsquery('english', :query)) DESC
        """,
        countQuery = """
        SELECT COUNT(*) FROM directory_entries
        WHERE search_vector @@ plainto_tsquery('english', :query)
        AND status = 'PUBLISHED'
        """,
        nativeQuery = true,
    )
    fun searchByQueryPublished(
        @Param("query") query: String,
        pageable: Pageable,
    ): Page<DirectoryEntry>

    // =====================================================
    // ADMIN MODERATION QUERIES (all statuses)
    // =====================================================

    /**
     * Finds all directory entries ordered by creation time (newest first).
     *
     * <p>Used for admin dashboards to display all entries across all statuses.</p>
     *
     * @param pageable Pagination parameters (page number, size, sort)
     * @return Page of all directory entries ordered by creation date descending
     */
    fun findAllByOrderByCreatedAtDesc(pageable: Pageable): Page<DirectoryEntry>

    /**
     * Finds directory entries by status, ordered by creation time (newest first).
     *
     * <p>Used for admin moderation queue to show most recent entries first.</p>
     *
     * @param status Moderation status to filter by
     * @param pageable Pagination parameters
     * @return Page of entries with the specified status, ordered by creation date descending
     */
    fun findByStatusOrderByCreatedAtDesc(
        status: DirectoryEntryStatus,
        pageable: Pageable,
    ): Page<DirectoryEntry>

    /**
     * Counts the number of directory entries with a specific status.
     *
     * <p>Used for admin statistics and dashboard metrics to show
     * pending review count, published count, etc.</p>
     *
     * @param status Status to count
     * @return Number of entries with the specified status
     */
    fun countByStatus(status: DirectoryEntryStatus): Long

    /**
     * Counts only PUBLISHED entries for public statistics.
     *
     * @return Number of published directory entries
     */
    @Query("SELECT COUNT(d) FROM DirectoryEntry d WHERE d.status = 'PUBLISHED'")
    fun countPublished(): Long

    /**
     * Counts distinct towns for PUBLISHED entries only.
     *
     * @return Number of distinct towns with published content
     */
    @Query("SELECT COUNT(DISTINCT d.town) FROM DirectoryEntry d WHERE d.status = 'PUBLISHED'")
    fun countDistinctTownsPublished(): Long

    /**
     * Counts PUBLISHED directory entries grouped by town, ordered by count descending.
     *
     * <p>Used for dashboard statistics to show which towns have the most published content.
     * Only includes PUBLISHED entries to avoid inflating counts with pending submissions.</p>
     *
     * @return List of pairs (town, count) for PUBLISHED entries only, ordered by count descending
     */
    @Query(
        """
        SELECT d.town, COUNT(d)
        FROM DirectoryEntry d
        WHERE d.status = 'PUBLISHED'
        GROUP BY d.town
        ORDER BY COUNT(d) DESC
        """,
    )
    fun countByTownGroupByTownPublished(): List<Array<Any>>
}
