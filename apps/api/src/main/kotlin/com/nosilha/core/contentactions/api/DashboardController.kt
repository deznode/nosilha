package com.nosilha.core.contentactions.api

import com.nosilha.core.contentactions.DashboardService
import com.nosilha.core.shared.api.ApiResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * Admin REST controller for dashboard metrics and statistics.
 *
 * <p>Provides administrative endpoints for retrieving dashboard summary data.
 * Used to display notification badges, summary cards, and quick-view metrics
 * in the admin interface.</p>
 *
 * <h3>Endpoints:</h3>
 * <ul>
 *   <li>GET /api/v1/admin/dashboard/counts - Get pending item counts for badges</li>
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
     * @return ResponseEntity with ApiResponse containing DashboardCountsResponse
     */
    @GetMapping("/counts")
    fun getCounts(): ResponseEntity<ApiResponse<DashboardCountsResponse>> {
        val counts = dashboardService.getPendingCounts()
        return ResponseEntity.ok(ApiResponse(data = counts, status = HttpStatus.OK.value()))
    }
}
