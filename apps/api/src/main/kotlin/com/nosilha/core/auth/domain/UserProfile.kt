package com.nosilha.core.auth.domain

import com.nosilha.core.shared.domain.AuditableEntity
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.util.UUID

/**
 * Represents a user's profile information and preferences.
 *
 * <p>User profiles store customizable information and settings separate from
 * authentication data. The userId links to the Supabase auth user via JWT claims.</p>
 *
 * <p><strong>Constraints:</strong></p>
 * <ul>
 *   <li>One profile per user (unique constraint on user_id)</li>
 *   <li>Display name: Optional, 1-100 characters</li>
 *   <li>Location: Optional, 1-255 characters</li>
 *   <li>Preferred language: Required, defaults to EN (English)</li>
 *   <li>Notification preferences: Stored as JSONB with default opt-in values</li>
 * </ul>
 *
 * <p><strong>Audit Trail:</strong></p>
 * <ul>
 *   <li>Extends AuditableEntity for automatic createdAt/updatedAt timestamps</li>
 * </ul>
 *
 * @see AuditableEntity
 * @see PreferredLanguage
 * @see NotificationPreferences
 */
@Entity
@Table(
    name = "user_profiles",
    uniqueConstraints = [
        UniqueConstraint(name = "uq_user_profile_user_id", columnNames = ["user_id"]),
    ],
    indexes = [
        Index(name = "idx_user_profiles_user_id", columnList = "user_id"),
    ],
)
class UserProfile : AuditableEntity() {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    var id: UUID? = null

    @Column(name = "user_id", nullable = false, unique = true)
    var userId: UUID? = null

    @Column(name = "display_name", length = 100)
    var displayName: String? = null

    @Column(length = 255)
    var location: String? = null

    @Column(name = "preferred_language", nullable = false, length = 3)
    @Enumerated(EnumType.STRING)
    var preferredLanguage: PreferredLanguage = PreferredLanguage.EN

    @Column(name = "notification_preferences", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    var notificationPreferences: NotificationPreferences = NotificationPreferences()
}
