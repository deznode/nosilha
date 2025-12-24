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
    private val directoryEntryRepository: DirectoryEntryRepository,
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
    fun findRelatedContent(
        contentId: UUID,
        limit: Int = 5,
    ): List<DirectoryEntry> {
        require(limit in 3..5) { "Limit must be between 3 and 5" }

        logger.debug("Finding related content for contentId={}, limit={}", contentId, limit)

        // 1. Fetch the current content item
        val currentEntry = directoryEntryRepository.findById(contentId).orElse(null)
        if (currentEntry == null) {
            logger.warn("Content ID {} not found, returning empty related content", contentId)
            return emptyList()
        }

        val relatedEntries = mutableListOf<DirectoryEntry>()

        val currentTags = currentEntry.parseTags()

        // Priority 1: Tag-based matching (multiple shared tags outrank single matches)
        if (currentTags.isNotEmpty()) {
            logger.debug("Attempting tag-based matching for entry {} with tags {}", currentEntry.id, currentTags)
            val tagMatchedEntries =
                findTagMatches(currentEntry, currentTags)
                    .filterNot { it.id == contentId }
                    .filterNot { relatedEntries.contains(it) }
                    .take(limit)

            relatedEntries.addAll(tagMatchedEntries)
            logger.debug("Found {} tag-based matches", tagMatchedEntries.size)
        }

        // Priority 2: Same category + town (geographic relevance)
        if (relatedEntries.size < limit) {
            val sameCategoryTown =
                directoryEntryRepository
                    .findByCategoryIgnoreCaseAndTownIgnoreCase(
                        currentEntry.category,
                        currentEntry.town,
                        PageRequest.of(0, limit + 1),
                    ).content
                    .filter { it.id != contentId }
                    .filterNot { relatedEntries.contains(it) }
                    .take(limit - relatedEntries.size)

            relatedEntries.addAll(sameCategoryTown)
            logger.debug(
                "Added {} same category + town matches (total: {})",
                sameCategoryTown.size,
                relatedEntries.size,
            )
        }

        // Priority 3: Cuisine affinity for restaurants
        if (currentEntry.category.equals("RESTAURANT", ignoreCase = true) &&
            !currentEntry.cuisine.isNullOrBlank() &&
            relatedEntries.size < limit
        ) {
            val cuisineKeywords = currentEntry.cuisine!!.split(",").map { it.trim().lowercase() }

            val sameCategoryCuisine =
                directoryEntryRepository
                    .findByCategoryIgnoreCase(
                        currentEntry.category,
                        PageRequest.of(0, limit * 2),
                    ).content
                    .filter { entry ->
                        entry.id != contentId &&
                            !entry.cuisine.isNullOrBlank() &&
                            !relatedEntries.contains(entry) &&
                            hasSharedCuisine(entry.cuisine!!, cuisineKeywords)
                    }.take(limit - relatedEntries.size)

            relatedEntries.addAll(sameCategoryCuisine)
            logger.debug(
                "Added {} cuisine-based matches (total: {})",
                sameCategoryCuisine.size,
                relatedEntries.size,
            )
        }

        // Priority 4: Same category fallback
        if (relatedEntries.size < limit) {
            val sameCategoryOnly =
                directoryEntryRepository
                    .findByCategoryIgnoreCase(
                        currentEntry.category,
                        PageRequest.of(0, limit * 2),
                    ).content
                    .filter { entry ->
                        entry.id != contentId &&
                            !relatedEntries.contains(entry)
                    }.take(limit - relatedEntries.size)

            relatedEntries.addAll(sameCategoryOnly)
            logger.debug(
                "Added {} same-category fallback matches (total: {})",
                sameCategoryOnly.size,
                relatedEntries.size,
            )
        }

        val finalResults = relatedEntries.take(limit)
        logger.info(
            "Returning {} related content items for contentId={}",
            finalResults.size,
            contentId,
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
    private fun hasSharedCuisine(
        cuisine1: String,
        keywords: List<String>,
    ): Boolean {
        val cuisines1 = cuisine1.split(",").map { it.trim().lowercase() }
        return cuisines1.any { c1 -> keywords.any { keyword -> c1.contains(keyword) || keyword.contains(c1) } }
    }

    private fun findTagMatches(
        currentEntry: DirectoryEntry,
        currentTags: List<String>,
    ): List<DirectoryEntry> {
        val tagSet = currentTags.map { it.lowercase() }.toSet()
        val sameCategoryEntries =
            directoryEntryRepository.findByCategoryIgnoreCase(
                currentEntry.category,
            )

        return sameCategoryEntries
            .filter { it.id != currentEntry.id }
            .map { entry ->
                val entryTags = entry.parseTags()
                val sharedCount = entryTags.map { it.lowercase() }.count { tagSet.contains(it) }
                TagScore(entry, sharedCount)
            }.filter { it.score > 0 }
            .sortedWith(compareByDescending<TagScore> { it.score }.thenBy { it.entry.name })
            .map { it.entry }
    }

    private fun DirectoryEntry.parseTags(): List<String> =
        this.tags
            ?.split(',')
            ?.map { it.trim() }
            ?.filter { it.isNotEmpty() }
            ?: emptyList()

    private data class TagScore(
        val entry: DirectoryEntry,
        val score: Int,
    )
}
