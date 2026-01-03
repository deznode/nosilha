package com.nosilha.core.auth

import com.nosilha.core.auth.domain.User
import com.nosilha.core.auth.domain.UserRole
import com.nosilha.core.auth.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * Service for Just-in-Time (JIT) user provisioning.
 *
 * <p>Ensures that users authenticated via Supabase Auth have corresponding
 * records in the local `users` table. This is necessary because:</p>
 * <ul>
 *   <li>Supabase Auth manages authentication but not application user data</li>
 *   <li>Other tables have foreign key references to `users.id` (e.g., media.reviewed_by)</li>
 *   <li>Application-specific user data needs to be stored locally</li>
 * </ul>
 *
 * <p><strong>JIT Provisioning Pattern:</strong></p>
 * <ol>
 *   <li>User authenticates via Supabase Auth (JWT token)</li>
 *   <li>JWT filter validates token and extracts claims</li>
 *   <li>This service is called to ensure user exists in local DB</li>
 *   <li>If user doesn't exist, a new record is created</li>
 *   <li>Request proceeds with guaranteed user record</li>
 * </ol>
 *
 * <p><strong>Thread Safety:</strong> Uses database-level unique constraints
 * to handle concurrent first-requests from the same user safely.</p>
 *
 * @property userRepository Repository for user entity operations
 */
@Service
class UserSyncService(
    private val userRepository: UserRepository,
) {
    private val logger = LoggerFactory.getLogger(UserSyncService::class.java)

    /**
     * Ensures a user record exists in the local database.
     *
     * <p>If the user doesn't exist, creates a new record with the provided information.
     * This method is idempotent - calling it multiple times with the same userId
     * will only create one record.</p>
     *
     * <p><strong>Concurrency Handling:</strong> If two requests arrive simultaneously
     * for the same new user, one will succeed in creating the record and the other
     * will catch the constraint violation and return the existing user.</p>
     *
     * @param userId UUID from Supabase Auth JWT claims
     * @param email User's email from JWT claims
     * @param fullName User's full name (optional, from JWT claims)
     * @param role Application role to assign (defaults to USER)
     * @return The existing or newly created User entity
     */
    @Transactional
    fun ensureUserExists(
        userId: UUID,
        email: String,
        fullName: String? = null,
        role: UserRole = UserRole.USER,
    ): User {
        // Check if user already exists (most common case)
        val existingUser = userRepository.findById(userId).orElse(null)
        if (existingUser != null) {
            logger.debug("User already exists: id={}", userId)
            return existingUser
        }

        // User doesn't exist - create new record
        logger.info("Creating new user record via JIT provisioning: id={}, email={}", userId, email)

        return try {
            val newUser = User(
                id = userId,
                email = email,
                fullName = fullName,
                role = role,
            )
            userRepository.save(newUser)
        } catch (e: Exception) {
            // Handle race condition: another request may have created the user
            logger.debug("Concurrent user creation detected, fetching existing record: id={}", userId)
            userRepository.findById(userId).orElseThrow {
                logger.error("Failed to create or find user: id={}, email={}", userId, email, e)
                IllegalStateException("Failed to sync user to local database", e)
            }
        }
    }

    /**
     * Extracts role from JWT claims based on app_metadata or direct role claim.
     *
     * <p>Supabase typically stores custom roles in app_metadata.role or app_metadata.roles.
     * This method checks both patterns and returns ADMIN if the user has admin role,
     * otherwise USER.</p>
     *
     * @param appMetadata Map of app_metadata from JWT claims
     * @param directRole Direct role claim from JWT (if present)
     * @return UserRole.ADMIN if admin role detected, UserRole.USER otherwise
     */
    fun determineRole(
        appMetadata: Map<String, Any>?,
        directRole: String?,
    ): UserRole {
        // Check direct role claim
        if (directRole?.equals("ADMIN", ignoreCase = true) == true) {
            return UserRole.ADMIN
        }

        // Check app_metadata.role
        val appRole = appMetadata?.get("role") as? String
        if (appRole?.equals("ADMIN", ignoreCase = true) == true) {
            return UserRole.ADMIN
        }

        // Check app_metadata.roles array
        @Suppress("UNCHECKED_CAST")
        val roles = appMetadata?.get("roles") as? List<String>
        if (roles?.any { it.equals("ADMIN", ignoreCase = true) } == true) {
            return UserRole.ADMIN
        }

        return UserRole.USER
    }
}
