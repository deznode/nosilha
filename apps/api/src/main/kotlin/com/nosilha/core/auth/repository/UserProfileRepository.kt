package com.nosilha.core.auth.repository

import com.nosilha.core.auth.domain.UserProfile
import org.springframework.data.jpa.repository.JpaRepository
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
}
