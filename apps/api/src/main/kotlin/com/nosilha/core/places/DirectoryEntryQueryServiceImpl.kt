package com.nosilha.core.places

import com.nosilha.core.places.api.PlacesQueryService
import com.nosilha.core.places.domain.DirectoryEntryStatus
import com.nosilha.core.places.repository.DirectoryEntryRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * Implementation of PlacesQueryService.
 *
 * <p>Provides read-only access to places information for cross-module queries.
 * This implementation is internal to the places module and uses the repository directly.</p>
 *
 * @property repository DirectoryEntry repository for database access
 */
@Service
class DirectoryEntryQueryServiceImpl(
    private val repository: DirectoryEntryRepository,
) : PlacesQueryService {
    /**
     * Finds entry names for a collection of entry IDs.
     *
     * <p>Performs a batch lookup using JpaRepository's findAllById and returns
     * a map of entryId to entry name.</p>
     *
     * @param entryIds Collection of entry UUIDs to look up
     * @return Map of entryId to entry name
     */
    @Transactional(readOnly = true)
    override fun findEntryNames(entryIds: Collection<UUID>): Map<UUID, String> {
        if (entryIds.isEmpty()) {
            return emptyMap()
        }

        return repository
            .findAllById(entryIds)
            .mapNotNull { entry -> entry.id?.let { it to entry.name } }
            .toMap()
    }

    /**
     * Finds the name for a single directory entry.
     *
     * @param entryId UUID of the entry to look up
     * @return Entry name or null if not found
     */
    @Transactional(readOnly = true)
    override fun findEntryName(entryId: UUID): String? = repository.findById(entryId).orElse(null)?.name

    /**
     * Counts the number of distinct towns in the directory.
     *
     * <p>Only counts PUBLISHED entries to avoid inflating geographic coverage
     * statistics with pending submissions.</p>
     *
     * @return Number of distinct towns with published content
     */
    @Transactional(readOnly = true)
    override fun countDistinctTowns(): Long = repository.countDistinctTownsPublished()

    /**
     * Gets entry counts grouped by town.
     *
     * <p>Only counts PUBLISHED entries to avoid inflating town coverage
     * statistics with pending submissions.</p>
     *
     * @return List of arrays where each array contains [townName: String, count: Long]
     */
    @Transactional(readOnly = true)
    override fun getEntryCountsByTown(): List<Array<Any>> = repository.countByTownGroupByTownPublished()

    /**
     * Counts directory entries by status.
     *
     * @param status The status to count
     * @return Number of entries with the specified status
     */
    @Transactional(readOnly = true)
    override fun countByStatus(status: DirectoryEntryStatus): Long = repository.countByStatus(status)
}
