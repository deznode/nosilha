package com.nosilha.core.auth.repository

import com.nosilha.core.auth.domain.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

/**
 * Spring Data JPA repository for the User entity.
 *
 * <p>Provides standard CRUD operations for managing user records in the `users` table.
 * This table is used for:
 * <ul>
 *   <li>Foreign key references from other tables (e.g., media.reviewed_by)</li>
 *   <li>Storing application-specific user data beyond Supabase Auth</li>
 *   <li>Just-in-time user provisioning during authentication</li>
 * </ul>
 *
 * <p><strong>Note:</strong> User IDs are not auto-generated; they must match
 * the corresponding Supabase Auth user ID from JWT claims.</p>
 */
@Repository
interface UserRepository : JpaRepository<User, UUID> {
    /**
     * Finds a user by their email address.
     *
     * <p>Useful for lookup operations when only email is known,
     * such as during user sync or admin operations.</p>
     *
     * @param email User's email address
     * @return The user if found, null otherwise
     */
    fun findByEmail(email: String): User?

    // Note: existsById(id: UUID) is inherited from JpaRepository
    // No need to redeclare it here
}
