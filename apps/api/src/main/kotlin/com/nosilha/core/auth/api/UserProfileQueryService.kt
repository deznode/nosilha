package com.nosilha.core.auth.api

import java.util.UUID

/**
 * Public query service for user profile information.
 *
 * <p>This interface is part of the auth module's public API, allowing other modules
 * to query user profile data without directly accessing the repository.</p>
 *
 * <p><strong>Spring Modulith Compliance:</strong> This interface enables cross-module
 * queries while respecting module boundaries. Other modules should inject this
 * service interface, not the UserProfileRepository directly.</p>
 *
 * @see com.nosilha.core.auth.UserProfileQueryServiceImpl
 */
interface UserProfileQueryService {
    /**
     * Finds display names for a collection of user IDs.
     *
     * <p>Used for batch lookups when displaying content with author information,
     * such as stories or directory entries.</p>
     *
     * @param userIds Collection of user IDs from authentication system (Supabase)
     * @return Map of userId to displayName. Users without profiles or display names
     *         will not be included in the result.
     */
    fun findDisplayNames(userIds: Collection<UUID>): Map<UUID, String>

    /**
     * Finds the display name for a single user.
     *
     * <p>Convenience method for single-user lookups.</p>
     *
     * @param userId User ID from authentication system (Supabase)
     * @return Display name if the user has a profile with a display name, null otherwise
     */
    fun findDisplayName(userId: UUID): String?
}
