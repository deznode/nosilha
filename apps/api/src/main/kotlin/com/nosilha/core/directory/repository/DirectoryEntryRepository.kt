package com.nosilha.core.directory.repository

import com.nosilha.core.directory.domain.DirectoryEntry
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
}
