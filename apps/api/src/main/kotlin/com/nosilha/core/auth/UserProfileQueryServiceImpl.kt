package com.nosilha.core.auth

import com.nosilha.core.auth.api.UserProfileQueryService
import com.nosilha.core.auth.repository.UserProfileRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * Implementation of UserProfileQueryService.
 *
 * <p>Provides read-only access to user profile display names for cross-module queries.
 * This implementation is internal to the auth module and uses the repository directly.</p>
 *
 * @property repository UserProfile repository for database access
 */
@Service
class UserProfileQueryServiceImpl(
    private val repository: UserProfileRepository,
) : UserProfileQueryService {
    /**
     * Finds display names for a collection of user IDs.
     *
     * <p>Performs a batch lookup and returns a map of userId to displayName.
     * Users without profiles or those with null display names are excluded.</p>
     *
     * @param userIds Collection of user IDs to look up
     * @return Map of userId to displayName
     */
    @Transactional(readOnly = true)
    override fun findDisplayNames(userIds: Collection<UUID>): Map<UUID, String> {
        if (userIds.isEmpty()) {
            return emptyMap()
        }

        return repository
            .findByUserIdIn(userIds)
            .filter { it.displayName != null }
            .associate { it.userId!! to it.displayName!! }
    }

    /**
     * Finds the display name for a single user.
     *
     * @param userId User ID to look up
     * @return Display name or null if not found
     */
    @Transactional(readOnly = true)
    override fun findDisplayName(userId: UUID): String? = repository.findByUserId(userId)?.displayName
}
