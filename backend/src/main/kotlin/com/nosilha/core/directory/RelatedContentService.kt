package com.nosilha.core.directory

import com.nosilha.core.directory.domain.DirectoryEntry
import com.nosilha.core.directory.repository.DirectoryEntryRepository
import org.slf4j.LoggerFactory
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import java.util.UUID

/**
 * Service for discovering related cultural heritage content.
 *
 * Implements content discovery algorithm that helps users explore related heritage
 * sites, restaurants, hotels, and landmarks on Brava Island. Uses category, town,
 * and cuisine matching to find relevant content.
 *
 * **Algorithm Priority**:
 * 1. Same category + same town (highest relevance)
 * 2. Same category + same cuisine (for restaurants)
 * 3. Same category only (fallback)
 * 4. Limit results to 3-5 items maximum
 *
 * **Phase 9 - User Story 5**: Discovering Related Cultural Content
 */
@Service
class RelatedContentService(
    private val directoryEntryRepository: DirectoryEntryRepository
) {

    private val logger = LoggerFactory.getLogger(RelatedContentService::class.java)

    /**
     * Find 3-5 related content items for a given heritage page.
     *
     * **Matching Strategy**:
     * - Excludes the current content item from results
     * - Prioritizes same category + same town
     * - For restaurants, also matches on cuisine similarity
     * - Falls back to same category if no town/cuisine matches
     * - Returns maximum 5 results
     *
     * @param contentId UUID of the current heritage page
     * @return List of 3-5 related DirectoryEntry items, empty list if none found
     */
    fun findRelatedContent(contentId: UUID, limit: Int = 5): List<DirectoryEntry> {
        require(limit in 3..5) { "Limit must be between 3 and 5" }

        logger.debug("Finding related content for contentId={}, limit={}", contentId, limit)

        // 1. Fetch the current content item
        val currentEntry = directoryEntryRepository.findById(contentId).orElse(null)
        if (currentEntry == null) {
            logger.warn("Content ID {} not found, returning empty related content", contentId)
            return emptyList()
        }

        logger.debug(
            "Current entry: id={}, category={}, town={}, cuisine={}",
            currentEntry.id,
            currentEntry.category,
            currentEntry.town,
            currentEntry.cuisine
        )

        // 2. Find related content using prioritized matching
        val relatedEntries = mutableListOf<DirectoryEntry>()

        // Priority 1: Same category + same town
        val sameCategoryTown = directoryEntryRepository.findByCategoryIgnoreCaseAndTownIgnoreCase(
            currentEntry.category,
            currentEntry.town,
            PageRequest.of(0, limit + 1) // +1 to account for excluding current entry
        ).content.filter { it.id != contentId }.take(limit)

        relatedEntries.addAll(sameCategoryTown)
        logger.debug("Found {} same category + same town matches", sameCategoryTown.size)

        // If we have enough results, return early
        if (relatedEntries.size >= limit) {
            return relatedEntries.take(limit)
        }

        // Priority 2: For restaurants, try same category + same cuisine
        if (currentEntry.category.equals("RESTAURANT", ignoreCase = true) &&
            !currentEntry.cuisine.isNullOrBlank() &&
            relatedEntries.size < limit
        ) {
            val cuisineKeywords = currentEntry.cuisine!!.split(",").map { it.trim().lowercase() }

            val sameCategoryCuisine = directoryEntryRepository.findByCategoryIgnoreCase(
                currentEntry.category,
                PageRequest.of(0, limit * 2) // Get more candidates for cuisine filtering
            ).content
                .filter { entry ->
                    entry.id != contentId &&
                        !entry.cuisine.isNullOrBlank() &&
                        !relatedEntries.contains(entry) &&
                        hasSharedCuisine(entry.cuisine!!, cuisineKeywords)
                }
                .take(limit - relatedEntries.size)

            relatedEntries.addAll(sameCategoryCuisine)
            logger.debug(
                "Found {} same category + cuisine matches (total: {})",
                sameCategoryCuisine.size,
                relatedEntries.size
            )
        }

        // Priority 3: Same category fallback (if still need more results)
        if (relatedEntries.size < 3) {
            val sameCategoryOnly = directoryEntryRepository.findByCategoryIgnoreCase(
                currentEntry.category,
                PageRequest.of(0, limit * 2) // Get more candidates
            ).content
                .filter { entry ->
                    entry.id != contentId &&
                        !relatedEntries.contains(entry)
                }
                .take(limit - relatedEntries.size)

            relatedEntries.addAll(sameCategoryOnly)
            logger.debug(
                "Found {} same category fallback matches (total: {})",
                sameCategoryOnly.size,
                relatedEntries.size
            )
        }

        val finalResults = relatedEntries.take(limit)
        logger.info(
            "Returning {} related content items for contentId={}",
            finalResults.size,
            contentId
        )

        return finalResults
    }

    /**
     * Check if two cuisine strings share at least one common cuisine keyword.
     *
     * @param cuisine1 Comma-separated cuisine string (e.g., "Cape Verdean,Seafood,International")
     * @param keywords Preprocessed keywords from the source cuisine
     * @return true if at least one cuisine keyword matches
     */
    private fun hasSharedCuisine(cuisine1: String, keywords: List<String>): Boolean {
        val cuisines1 = cuisine1.split(",").map { it.trim().lowercase() }
        return cuisines1.any { c1 -> keywords.any { keyword -> c1.contains(keyword) || keyword.contains(c1) } }
    }
}
