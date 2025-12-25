package com.nosilha.core.contentactions

import com.nosilha.core.contentactions.api.DashboardCountsResponse
import com.nosilha.core.contentactions.domain.StoryStatus
import com.nosilha.core.contentactions.domain.SuggestionStatus
import com.nosilha.core.contentactions.repository.StorySubmissionRepository
import com.nosilha.core.contentactions.repository.SuggestionRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Service for aggregating dashboard metrics and statistics.
 *
 * <p>Provides summary counts for the admin dashboard, enabling quick visibility
 * into pending moderation tasks. All counts are retrieved in a single database
 * round-trip using repository count queries.</p>
 *
 * <h3>Current Metrics:</h3>
 * <ul>
 *   <li>Pending suggestions awaiting moderation</li>
 *   <li>Pending story submissions awaiting moderation</li>
 *   <li>Total pending items (combined count)</li>
 * </ul>
 *
 * <h3>Performance Considerations:</h3>
 * <ul>
 *   <li>Uses COUNT queries instead of fetching entities for efficiency</li>
 *   <li>Read-only transactions for optimal database performance</li>
 *   <li>Consider caching if dashboard is accessed frequently</li>
 * </ul>
 *
 * @property suggestionRepository Repository for accessing suggestion counts
 * @property storySubmissionRepository Repository for accessing story submission counts
 */
@Service
class DashboardService(
    private val suggestionRepository: SuggestionRepository,
    private val storySubmissionRepository: StorySubmissionRepository,
) {
    /**
     * Retrieves counts of all pending items requiring admin attention.
     *
     * <p>Aggregates pending counts from all moderation queues to provide
     * a summary view for the admin dashboard. Used to display badge counts
     * on navigation items and summary cards.</p>
     *
     * <h4>Included Counts:</h4>
     * <ul>
     *   <li>Suggestions with status PENDING</li>
     *   <li>Story submissions with status PENDING</li>
     *   <li>Total of all pending items</li>
     * </ul>
     *
     * @return DashboardCountsResponse containing all pending item counts
     */
    @Transactional(readOnly = true)
    fun getPendingCounts(): DashboardCountsResponse {
        val pendingSuggestions = suggestionRepository.countByStatus(SuggestionStatus.PENDING)
        val pendingStories = storySubmissionRepository.countByStatus(StoryStatus.PENDING)
        val totalPending = pendingSuggestions + pendingStories

        return DashboardCountsResponse(
            pendingSuggestions = pendingSuggestions,
            pendingStories = pendingStories,
            totalPending = totalPending,
        )
    }
}
