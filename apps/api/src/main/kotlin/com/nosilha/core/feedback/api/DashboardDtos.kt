package com.nosilha.core.feedback.api

/**
 * Response DTO containing comprehensive admin dashboard statistics.
 *
 * <p>Provides metrics and insights for the admin dashboard, including pending counts,
 * user activity metrics, geographic coverage, and trending activity over time.</p>
 *
 * <h3>Use Cases:</h3>
 * <ul>
 *   <li>Display comprehensive dashboard overview with all key metrics</li>
 *   <li>Show activity trends over the past week</li>
 *   <li>Visualize geographic distribution of content</li>
 *   <li>Track active user engagement</li>
 * </ul>
 *
 * @property newSuggestions Count of suggestions awaiting moderation (status = PENDING)
 * @property storySubmissions Count of story submissions awaiting moderation (status = PENDING)
 * @property contactInquiries Count of contact messages awaiting review (status = UNREAD)
 * @property directorySubmissions Count of directory submissions awaiting moderation (status = PENDING)
 * @property mediaPending Count of media items awaiting review (status = PENDING_REVIEW or FLAGGED)
 * @property activeUsers Count of unique users who contributed in the last 30 days
 * @property locationsCovered Count of distinct towns represented in the directory
 * @property weeklyActivity Activity data for the last 7 days (suggestions and stories per day)
 * @property coverageByTown Top 6 towns ranked by number of directory entries
 */
data class AdminStatsResponse(
    val newSuggestions: Long,
    val storySubmissions: Long,
    val contactInquiries: Long,
    val directorySubmissions: Long,
    val mediaPending: Long,
    val activeUsers: Long,
    val locationsCovered: Long,
    val weeklyActivity: List<WeeklyActivityData>,
    val coverageByTown: List<TownCoverageData>,
)

/**
 * Response DTO representing daily activity counts for the admin dashboard.
 *
 * <p>Provides a breakdown of suggestions and stories submitted on a specific day,
 * enabling visualization of activity trends over time (e.g., weekly chart).</p>
 *
 * @property day Day of the week (e.g., "Mon", "Tue", "Wed")
 * @property suggestions Number of suggestions submitted on this day
 * @property stories Number of stories submitted on this day
 */
data class WeeklyActivityData(
    val day: String,
    val suggestions: Long,
    val stories: Long,
)

/**
 * Response DTO representing geographic coverage metrics for a specific town.
 *
 * <p>Used to display a chart showing which towns have the most directory entries,
 * helping identify areas with good coverage vs. areas needing more content.</p>
 *
 * @property name Town name (e.g., "Vila Nova Sintra", "Fajã d'Água")
 * @property value Number of directory entries for this town
 * @property fill Color code for chart visualization (e.g., "#3b82f6", "#8b5cf6")
 */
data class TownCoverageData(
    val name: String,
    val value: Long,
    val fill: String,
)

/**
 * Response DTO representing a top contributor on the platform.
 *
 * <p>Displays users who have made the most contributions to the platform,
 * calculated based on a points system (stories=10 points, suggestions=5 points).</p>
 *
 * <h3>Points Calculation:</h3>
 * <ul>
 *   <li>Story submission: 10 points each</li>
 *   <li>Suggestion: 5 points each</li>
 * </ul>
 *
 * @property id User ID from authentication system (Supabase)
 * @property name Display name of the contributor
 * @property role User role badge (e.g., "Contributor", "Community Member")
 * @property points Total contribution points earned
 * @property avatar URL to user's avatar image (nullable if not set)
 */
data class ContributorResponse(
    val id: String,
    val name: String,
    val role: String,
    val points: Long,
    val avatar: String?,
)
