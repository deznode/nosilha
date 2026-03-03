package com.nosilha.core.places.services

import com.nosilha.core.places.domain.DirectoryEntry
import com.nosilha.core.places.repository.DirectoryEntryRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

/**
 * Service for searching directory entries with full-text search capabilities.
 *
 * <p>This service orchestrates search operations with filtering and pagination,
 * using PostgreSQL full-text search for fast and relevant results.</p>
 *
 * <p><strong>Search Behavior:</strong></p>
 * <ul>
 *   <li>Empty query returns empty results (not all entries) per FR-014</li>
 *   <li>Search is case-insensitive</li>
 *   <li>Results ordered by relevance (ts_rank)</li>
 *   <li>Pagination supported (default 20 per page)</li>
 * </ul>
 *
 * @param repository The repository for accessing directory entry data
 */
@Service
class SearchService(
    private val repository: DirectoryEntryRepository,
) {
    companion object {
        private const val DEFAULT_PAGE_SIZE = 20
    }

    /**
     * Searches directory entries using full-text search with optional filters.
     *
     * <p>This method performs a full-text search on name and description fields,
     * with results ranked by relevance. If category or town filters are provided,
     * the results are post-filtered after the search (search takes precedence).</p>
     *
     * @param query The search query string (minimum 2 characters recommended)
     * @param category Optional category filter (e.g., "Restaurant", "Hotel")
     * @param town Optional town filter
     * @param pageable Pagination parameters
     * @return A page of DirectoryEntry entities matching the search criteria
     */
    fun search(
        query: String,
        category: String? = null,
        town: String? = null,
        pageable: Pageable = PageRequest.of(0, DEFAULT_PAGE_SIZE),
    ): Page<DirectoryEntry> {
        // FR-014: Empty query returns no results
        if (query.isBlank()) {
            return Page.empty(pageable)
        }

        // Perform full-text search
        val searchResults = repository.searchByQuery(query.trim(), pageable)

        // Post-filter by category and/or town if provided
        return if (category != null || town != null) {
            val filteredResults =
                searchResults.content.filter { entry ->
                    val matchesCategory = category == null || entry.category.equals(category, ignoreCase = true)
                    val matchesTown = town == null || entry.town.equals(town, ignoreCase = true)
                    matchesCategory && matchesTown
                }
            PageImpl(filteredResults, pageable, filteredResults.size.toLong())
        } else {
            searchResults
        }
    }
}
