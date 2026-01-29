package com.nosilha.core.places.api

import com.nosilha.core.places.domain.DirectoryEntryStatus
import java.util.UUID

/**
 * Public query service for places information.
 *
 * <p>This interface is part of the places module's public API, allowing other modules
 * to query places data without directly accessing the repository.</p>
 *
 * <p><strong>Spring Modulith Compliance:</strong> This interface enables cross-module
 * queries while respecting module boundaries. Other modules should inject this
 * service interface, not the DirectoryEntryRepository directly.</p>
 *
 * @see com.nosilha.core.places.DirectoryEntryQueryServiceImpl
 */
interface PlacesQueryService {
    /**
     * Finds entry names for a collection of entry IDs.
     *
     * <p>Used for batch lookups when displaying content with location references,
     * such as stories that reference places.</p>
     *
     * @param entryIds Collection of directory entry UUIDs
     * @return Map of entryId to entry name. Entries that don't exist will not be included.
     */
    fun findEntryNames(entryIds: Collection<UUID>): Map<UUID, String>

    /**
     * Finds the name for a single directory entry.
     *
     * <p>Convenience method for single-entry lookups.</p>
     *
     * @param entryId UUID of the directory entry
     * @return Entry name if found, null otherwise
     */
    fun findEntryName(entryId: UUID): String?

    /**
     * Counts the number of distinct towns in the directory.
     *
     * <p>Used for dashboard statistics to show geographic coverage.</p>
     *
     * @return Number of distinct towns
     */
    fun countDistinctTowns(): Long

    /**
     * Gets entry counts grouped by town.
     *
     * <p>Returns a list of town names with their entry counts, ordered by count descending.
     * Used for dashboard statistics to show town coverage.</p>
     *
     * @return List of arrays where each array contains [townName: String, count: Long]
     */
    fun getEntryCountsByTown(): List<Array<Any>>

    /**
     * Counts directory entries by status.
     *
     * <p>Used for dashboard pending counts (e.g., PENDING submissions awaiting review).</p>
     *
     * @param status The status to count
     * @return Number of entries with the specified status
     */
    fun countByStatus(status: DirectoryEntryStatus): Long
}
