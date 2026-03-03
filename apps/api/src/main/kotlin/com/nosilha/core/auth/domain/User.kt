package com.nosilha.core.auth.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

/**
 * Represents a user in the system, linked to Supabase Auth.
 *
 * <p>This entity maps to the `users` table which stores profile information
 * that complements the private user data in Supabase's `auth.users` table.
 * The user ID must match the corresponding user's ID from Supabase Auth.</p>
 *
 * <p>This table is referenced by foreign keys in other tables (e.g., `media.reviewed_by`)
 * to track which user performed certain actions.</p>
 *
 * <p><strong>JIT Provisioning:</strong> User records are created just-in-time when
 * an authenticated user makes their first API request. The email and role are
 * extracted from the JWT claims.</p>
 *
 * @property id Primary key matching the Supabase Auth user ID (not auto-generated)
 * @property email User's email address from Supabase Auth (required, unique)
 * @property fullName User's full name (optional)
 * @property role User's role within the application (defaults to USER)
 * @property createdAt Timestamp when the user record was created
 * @see UserRole
 */
@Entity
@Table(name = "users")
class User(
    @Id
    var id: UUID,
    @Column(name = "email", nullable = false, unique = true)
    var email: String,
    @Column(name = "full_name")
    var fullName: String? = null,
    @Column(name = "role", nullable = false)
    @Enumerated(EnumType.STRING)
    var role: UserRole = UserRole.USER,
    @Column(name = "created_at")
    var createdAt: Instant = Instant.now(),
)

/**
 * Application-specific user roles.
 *
 * <p>These roles are stored in the `users` table and can be used for
 * authorization decisions independent of Supabase Auth roles.</p>
 */
enum class UserRole {
    /** Regular user with standard permissions */
    USER,

    /** Administrator with elevated permissions */
    ADMIN,
}
