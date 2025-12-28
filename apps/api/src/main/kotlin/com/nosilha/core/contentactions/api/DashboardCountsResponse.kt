package com.nosilha.core.contentactions.api

/**
 * Response DTO containing pending item counts for the admin dashboard.
 *
 * <p>Provides badge counts for the admin dashboard navigation, allowing admins
 * to quickly see how many items require their attention without navigating to
 * each individual section.</p>
 *
 * <h3>Use Cases:</h3>
 * <ul>
 *   <li>Display notification badges on admin navigation menu</li>
 *   <li>Show summary counts on admin dashboard home page</li>
 *   <li>Enable quick prioritization of moderation tasks</li>
 * </ul>
 *
 * @property pendingSuggestions Count of suggestions awaiting moderation (status = PENDING)
 * @property pendingStories Count of story submissions awaiting moderation (status = PENDING)
 * @property pendingMessages Count of contact messages awaiting review (status = UNREAD)
 * @property pendingDirectory Count of directory submissions awaiting moderation (status = PENDING)
 * @property totalPending Combined total of all pending items requiring attention
 */
data class DashboardCountsResponse(
    val pendingSuggestions: Long,
    val pendingStories: Long,
    val pendingMessages: Long,
    val pendingDirectory: Long,
    val totalPending: Long,
)
