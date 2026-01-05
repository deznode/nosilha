package com.nosilha.core.stories.api

import com.nosilha.core.stories.domain.StoryStatus
import java.time.Instant

/**
 * Query service interface for cross-module story statistics.
 * Used by feedback module's DashboardService for admin dashboard.
 */
interface StoriesQueryService {
    fun countByStatus(status: StoryStatus): Long

    fun countDistinctAuthorsByCreatedAtAfter(since: Instant): Long

    fun countByCreatedAtBetween(
        start: Instant,
        end: Instant
    ): Long

    fun findTopContributorsByStoryCount(): List<Array<Any>>
}
