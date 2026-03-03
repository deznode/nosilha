package com.nosilha.core.feedback.api

import com.nosilha.core.feedback.DashboardService
import com.nosilha.core.shared.api.ApiResult
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * Admin REST controller for dashboard metrics and statistics.
 *
 * <p>Provides administrative endpoints for retrieving dashboard summary data.
 * Used to display notification badges, summary cards, activity trends, and
 * contributor leaderboards in the admin interface.</p>
 *
 * <h3>Endpoints:</h3>
 * <ul>
 *   <li>GET /api/v1/admin/dashboard/counts - Get pending item counts for badges</li>
 *   <li>GET /api/v1/admin/dashboard/stats - Get comprehensive dashboard statistics</li>
 *   <li>GET /api/v1/admin/dashboard/contributors - Get top contributors leaderboard</li>
 * </ul>
 *
 * <h3>Security:</h3>
 * <ul>
 *   <li>Authentication required: ADMIN role</li>
 *   <li>All requests are read-only and do not modify data</li>
 * </ul>
 *
 * @property dashboardService Service for aggregating dashboard metrics
 */
@RestController
@RequestMapping("/api/v1/admin/dashboard")
@Tag(name = "Admin Dashboard", description = "Admin dashboard metrics and statistics")
class DashboardController(
    private val dashboardService: DashboardService,
) {
    /**
     * Retrieves pending item counts for the admin dashboard.
     *
     * <p>Returns counts of all items awaiting moderation, enabling the frontend
     * to display notification badges and summary cards. Optimized for frequent
     * polling with lightweight COUNT queries.</p>
     *
     * <h4>Response:</h4>
     * <ul>
     *   <li>pendingSuggestions: Number of suggestions with PENDING status</li>
     *   <li>pendingStories: Number of story submissions with PENDING status</li>
     *   <li>pendingMessages: Number of contact messages with UNREAD status</li>
     *   <li>pendingDirectory: Number of directory submissions with PENDING status</li>
     *   <li>totalPending: Combined total of all pending items</li>
     * </ul>
     *
     * <h4>Use Cases:</h4>
     * <ul>
     *   <li>Display badge counts on admin navigation menu items</li>
     *   <li>Show summary metrics on admin dashboard home page</li>
     *   <li>Enable polling for real-time count updates</li>
     * </ul>
     *
     * @return ResponseEntity with ApiResult containing DashboardCountsResponse
     */
    @GetMapping("/counts")
    @Operation(summary = "Get pending item counts", description = "Retrieves counts of all items awaiting admin attention")
    fun getCounts(): ResponseEntity<ApiResult<DashboardCountsResponse>> {
        val counts = dashboardService.getPendingCounts()
        return ResponseEntity.ok(ApiResult(data = counts, status = HttpStatus.OK.value()))
    }

    /**
     * Retrieves comprehensive admin dashboard statistics.
     *
     * <p>Returns a complete overview of platform activity including pending counts,
     * user engagement metrics, geographic coverage, and activity trends over the
     * past week.</p>
     *
     * <h4>Response Includes:</h4>
     * <ul>
     *   <li>Pending counts across all moderation queues</li>
     *   <li>Active users (unique contributors in last 30 days)</li>
     *   <li>Geographic coverage (distinct towns represented)</li>
     *   <li>Weekly activity trends (last 7 days of suggestions and stories)</li>
     *   <li>Top 6 towns by directory entry count</li>
     * </ul>
     *
     * <h4>Use Cases:</h4>
     * <ul>
     *   <li>Display comprehensive dashboard overview page</li>
     *   <li>Show activity trends in charts</li>
     *   <li>Visualize geographic distribution of content</li>
     *   <li>Track platform growth and engagement</li>
     * </ul>
     *
     * @return ResponseEntity with ApiResult containing AdminStatsResponse
     */
    @GetMapping("/stats")
    @Operation(summary = "Get admin dashboard statistics", description = "Retrieves comprehensive dashboard metrics and trends")
    fun getAdminStats(): ResponseEntity<ApiResult<AdminStatsResponse>> {
        val stats = dashboardService.getAdminStats()
        return ResponseEntity.ok(ApiResult(data = stats, status = HttpStatus.OK.value()))
    }

    /**
     * Retrieves top contributors leaderboard.
     *
     * <p>Returns the top 5 contributors ranked by contribution points, where:
     * <ul>
     *   <li>Story submission: 10 points</li>
     *   <li>Suggestion: 5 points</li>
     * </ul>
     *
     * <h4>Response Includes:</h4>
     * <ul>
     *   <li>User ID from authentication system</li>
     *   <li>Display name (or "Anonymous" if not set)</li>
     *   <li>Role badge (e.g., "Contributor")</li>
     *   <li>Total contribution points</li>
     *   <li>Avatar URL (if available)</li>
     * </ul>
     *
     * <h4>Use Cases:</h4>
     * <ul>
     *   <li>Display top contributors widget on dashboard</li>
     *   <li>Recognize active community members</li>
     *   <li>Encourage user engagement through gamification</li>
     * </ul>
     *
     * @return ResponseEntity with ApiResult containing list of ContributorResponse
     */
    @GetMapping("/contributors")
    @Operation(summary = "Get top contributors", description = "Retrieves top 5 contributors ranked by contribution points")
    fun getTopContributors(): ResponseEntity<ApiResult<List<ContributorResponse>>> {
        val contributors = dashboardService.getTopContributors()
        return ResponseEntity.ok(ApiResult(data = contributors, status = HttpStatus.OK.value()))
    }
}
