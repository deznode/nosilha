package com.nosilha.core.directory.repository

import com.nosilha.core.directory.domain.DirectoryEntry
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
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
interface DirectoryEntryRepository : JpaRepository<DirectoryEntry, UUID> {
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
    fun findByCategoryIgnoreCase(category: String, pageable: Pageable): Page<DirectoryEntry>

    /**
     * Finds all DirectoryEntry instances that match the given town with pagination.
     *
     * @param town The town name to filter by.
     * @param pageable Pagination parameters.
     * @return A page of DirectoryEntry entities matching the specified town.
     */
    fun findByTownIgnoreCase(town: String, pageable: Pageable): Page<DirectoryEntry>

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
        pageable: Pageable
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
}
