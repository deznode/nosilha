package com.nosilha.core.auth.repository

import com.nosilha.core.auth.domain.UserProfile
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

/**
 * Spring Data JPA repository for the UserProfile entity.
 *
 * <p>Provides standard CRUD operations and custom queries for:
 * <ul>
 *   <li>Finding user profiles by user ID (for profile management)</li>
 *   <li>Managing user-specific settings and preferences</li>
 * </ul>
 *
 * <p><strong>Note:</strong> User profiles have a unique constraint on user_id,
 * ensuring one profile per authenticated user.</p>
 */
@Repository
interface UserProfileRepository : JpaRepository<UserProfile, UUID> {
    /**
     * Finds a user profile by the associated user ID.
     *
     * <p>The userId field links to the Supabase auth user via JWT claims.
     * Used for retrieving user-specific profile information, preferences,
     * and settings.</p>
     *
     * @param userId User ID from authentication system (Supabase)
     * @return The user's profile if it exists, null otherwise
     */
    fun findByUserId(userId: String): UserProfile?

    /**
     * Finds user profiles by a collection of user IDs.
     *
     * <p>Used for batch lookups when displaying multiple stories
     * with their author names.</p>
     *
     * @param userIds Collection of user IDs from authentication system (Supabase)
     * @return List of user profiles for the given IDs
     */
    fun findByUserIdIn(userIds: Collection<String>): List<UserProfile>

    /**
     * Atomically inserts a new user profile with default values, or does nothing if one already exists.
     *
     * <p>Uses PostgreSQL's ON CONFLICT DO NOTHING to handle race conditions where
     * multiple concurrent requests attempt to create a profile for the same user.
     * This is the most robust solution as it's a single atomic database operation
     * with no race window.</p>
     *
     * <p><strong>Default Values:</strong></p>
     * <ul>
     *   <li>preferred_language: 'EN' (English)</li>
     *   <li>notification_preferences: Default opt-in JSON</li>
     *   <li>created_at/updated_at: Current timestamp</li>
     * </ul>
     *
     * @param userId Supabase auth user ID
     * @return Number of rows inserted (1 if created, 0 if already exists)
     */
    @Modifying
    @Query(
        """
        INSERT INTO user_profiles (id, user_id, preferred_language, notification_preferences, created_at, updated_at)
        VALUES (gen_random_uuid(), :userId, 'EN', '{"storyPublished":true,"suggestionApproved":true,"weeklyDigest":false}'::jsonb, now(), now())
        ON CONFLICT (user_id) DO NOTHING
        """,
        nativeQuery = true,
    )
    fun insertIfNotExists(
        @Param("userId") userId: String,
    ): Int
}
