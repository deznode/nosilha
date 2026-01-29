package com.nosilha.core.feedback

import com.nosilha.core.auth.api.UserProfileQueryService
import com.nosilha.core.feedback.api.AdminStatsResponse
import com.nosilha.core.feedback.api.ContributorResponse
import com.nosilha.core.feedback.api.DashboardCountsResponse
import com.nosilha.core.feedback.api.TownCoverageData
import com.nosilha.core.feedback.api.WeeklyActivityData
import com.nosilha.core.feedback.domain.ContactStatus
import com.nosilha.core.feedback.domain.SuggestionStatus
import com.nosilha.core.feedback.repository.ContactMessageRepository
import com.nosilha.core.feedback.repository.SuggestionRepository
import com.nosilha.core.gallery.api.MediaQueryService
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.places.api.PlacesQueryService
import com.nosilha.core.places.domain.DirectoryEntryStatus
import com.nosilha.core.stories.api.StoriesQueryService
import com.nosilha.core.stories.domain.StoryStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneOffset
import java.time.format.TextStyle
import java.time.temporal.ChronoUnit
import java.util.Locale

/**
 * Service for aggregating dashboard metrics and statistics.
 *
 * <p>Provides summary counts, activity trends, and contributor insights for the admin
 * dashboard, enabling quick visibility into pending moderation tasks, user engagement,
 * and geographic coverage. All counts are retrieved using optimized COUNT queries.</p>
 *
 * <h3>Current Metrics:</h3>
 * <ul>
 *   <li>Pending suggestions awaiting moderation</li>
 *   <li>Pending story submissions awaiting moderation</li>
 *   <li>Pending contact messages awaiting review</li>
 *   <li>Pending directory submissions awaiting moderation</li>
 *   <li>Active users (contributors in last 30 days)</li>
 *   <li>Geographic coverage (distinct towns)</li>
 *   <li>Weekly activity trends (last 7 days)</li>
 *   <li>Top contributors leaderboard</li>
 * </ul>
 *
 * <h3>Performance Considerations:</h3>
 * <ul>
 *   <li>Uses COUNT queries instead of fetching entities for efficiency</li>
 *   <li>Read-only transactions for optimal database performance</li>
 *   <li>Consider caching if dashboard is accessed frequently</li>
 * </ul>
 *
 * @property suggestionRepository Local repository for suggestion counts (feedback module)
 * @property contactMessageRepository Local repository for contact message counts (feedback module)
 * @property storiesQueryService Cross-module query service for story statistics
 * @property mediaQueryService Cross-module query service for media statistics
 * @property directoryEntryQueryService Cross-module query service for directory entry data (includes pending submissions)
 * @property userProfileQueryService Cross-module query service for user profile information
 */
@Service
class DashboardService(
    // Local repositories (feedback module)
    private val suggestionRepository: SuggestionRepository,
    private val contactMessageRepository: ContactMessageRepository,
    // Cross-module query services
    private val storiesQueryService: StoriesQueryService,
    private val mediaQueryService: MediaQueryService,
    private val directoryEntryQueryService: PlacesQueryService,
    private val userProfileQueryService: UserProfileQueryService,
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
     *   <li>Contact messages with status UNREAD</li>
     *   <li>Directory submissions with status PENDING</li>
     *   <li>Total of all pending items</li>
     * </ul>
     *
     * @return DashboardCountsResponse containing all pending item counts
     */
    @Transactional(readOnly = true)
    fun getPendingCounts(): DashboardCountsResponse {
        val pendingSuggestions = suggestionRepository.countByStatus(SuggestionStatus.PENDING)
        val pendingStories = storiesQueryService.countByStatus(StoryStatus.PENDING)
        val pendingMessages = contactMessageRepository.countByStatus(ContactStatus.UNREAD)
        val pendingDirectory = directoryEntryQueryService.countByStatus(DirectoryEntryStatus.PENDING)
        val totalPending = pendingSuggestions + pendingStories + pendingMessages + pendingDirectory

        return DashboardCountsResponse(
            pendingSuggestions = pendingSuggestions,
            pendingStories = pendingStories,
            pendingMessages = pendingMessages,
            pendingDirectory = pendingDirectory,
            totalPending = totalPending,
        )
    }

    /**
     * Retrieves comprehensive admin dashboard statistics.
     *
     * <p>Aggregates metrics from multiple sources to provide a complete overview
     * of platform activity, including pending moderation tasks, user engagement,
     * geographic coverage, and activity trends.</p>
     *
     * <h4>Included Statistics:</h4>
     * <ul>
     *   <li>Pending counts across all moderation queues</li>
     *   <li>Active users (unique contributors in last 30 days)</li>
     *   <li>Geographic coverage (distinct towns in directory)</li>
     *   <li>Weekly activity trends (last 7 days of suggestions and stories)</li>
     *   <li>Top 6 towns by directory entry count</li>
     * </ul>
     *
     * @return AdminStatsResponse containing comprehensive dashboard statistics
     */
    @Transactional(readOnly = true)
    fun getAdminStats(): AdminStatsResponse {
        val pendingSuggestions = suggestionRepository.countByStatus(SuggestionStatus.PENDING)
        val pendingStories = storiesQueryService.countByStatus(StoryStatus.PENDING)
        val pendingMessages = contactMessageRepository.countByStatus(ContactStatus.UNREAD)
        val pendingDirectory = directoryEntryQueryService.countByStatus(DirectoryEntryStatus.PENDING)

        // Media pending: count of PENDING_REVIEW and FLAGGED media
        val pendingReviewMedia = mediaQueryService.countByStatus(GalleryMediaStatus.PENDING_REVIEW)
        val flaggedMedia = mediaQueryService.countByStatus(GalleryMediaStatus.FLAGGED)
        val mediaPending = pendingReviewMedia + flaggedMedia

        // Active users: count of unique story authors in the last 30 days
        val thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS)
        val activeUsers = storiesQueryService.countDistinctAuthorsByCreatedAtAfter(thirtyDaysAgo)

        // Locations covered: count of distinct towns in directory entries
        val locationsCovered = directoryEntryQueryService.countDistinctTowns()

        // Weekly activity: last 7 days of suggestions and stories
        val weeklyActivity = buildWeeklyActivity()

        // Coverage by town: top 6 towns with most directory entries
        val coverageByTown = buildTownCoverage()

        return AdminStatsResponse(
            newSuggestions = pendingSuggestions,
            storySubmissions = pendingStories,
            contactInquiries = pendingMessages,
            directorySubmissions = pendingDirectory,
            mediaPending = mediaPending,
            activeUsers = activeUsers,
            locationsCovered = locationsCovered,
            weeklyActivity = weeklyActivity,
            coverageByTown = coverageByTown,
        )
    }

    /**
     * Retrieves top contributors ranked by contribution points.
     *
     * <p>Calculates contributor rankings based on a points system where:
     * <ul>
     *   <li>Story submission: 10 points</li>
     *   <li>Suggestion: 5 points</li>
     * </ul>
     *
     * <p>Returns the top 5 contributors with their display names, roles, and total points.</p>
     *
     * @return List of top 5 contributors ordered by points (highest first)
     */
    @Transactional(readOnly = true)
    fun getTopContributors(): List<ContributorResponse> {
        // Get all story authors with their story counts
        val storyContributions = storiesQueryService.findTopContributorsByStoryCount()

        // Calculate points: stories=10, suggestions=5
        // For now, we'll use story count as the primary metric (simplified)
        val topContributors = storyContributions.take(5).map { row ->
            val authorId = row[0] as String
            val storyCount = row[1] as Long
            val displayName = userProfileQueryService.findDisplayName(authorId) ?: "Anonymous"
            val points = storyCount * 10 // 10 points per story

            ContributorResponse(
                id = authorId,
                name = displayName,
                role = "Contributor",
                points = points,
                avatar = null, // Avatar support can be added later
            )
        }

        return topContributors
    }

    /**
     * Builds weekly activity data for the last 7 days.
     *
     * Returns a list of daily activity counts (suggestions and stories) for the
     * past 7 days, with day names abbreviated (e.g., "Mon", "Tue").
     *
     * @return List of WeeklyActivityData for the last 7 days
     */
    private fun buildWeeklyActivity(): List<WeeklyActivityData> {
        val today = LocalDate.now()

        return (6 downTo 0).map { daysAgo ->
            val date = today.minusDays(daysAgo.toLong())
            val dayStart = date.atStartOfDay().toInstant(ZoneOffset.UTC)
            val dayEnd = date.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC)

            WeeklyActivityData(
                day = date.dayOfWeek.getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                suggestions = suggestionRepository.countByCreatedAtBetween(dayStart, dayEnd),
                stories = storiesQueryService.countByCreatedAtBetween(dayStart, dayEnd),
            )
        }
    }

    /**
     * Builds town coverage data for the top 6 towns.
     *
     * <p>Returns a list of towns ranked by the number of directory entries,
     * with color codes for chart visualization.</p>
     *
     * @return List of TownCoverageData for the top 6 towns
     */
    private fun buildTownCoverage(): List<TownCoverageData> {
        val townCounts = directoryEntryQueryService.getEntryCountsByTown()
        val colors = listOf("#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1")

        return townCounts.take(6).mapIndexed { index, row ->
            val town = row[0] as String
            val count = row[1] as Long
            TownCoverageData(
                name = town,
                value = count,
                fill = colors.getOrElse(index) { "#3b82f6" },
            )
        }
    }
}
