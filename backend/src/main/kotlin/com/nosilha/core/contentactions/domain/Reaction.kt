package com.nosilha.core.contentactions.domain

import jakarta.persistence.*
import jakarta.validation.constraints.NotNull
import org.hibernate.annotations.CreationTimestamp
import java.time.Instant
import java.util.UUID

/**
 * Represents a user's emotional response to cultural heritage content.
 *
 * <p>Reactions can be updated when a user changes their reaction type.
 * When switching reactions, the existing entity is updated instead of
 * deleting and creating a new one (avoids unique constraint violations).</p>
 *
 * <p><strong>Constraints:</strong></p>
 * <ul>
 *   <li>One reaction per user per content page (unique constraint on user_id + content_id)</li>
 *   <li>Reaction type must be one of: LOVE, CELEBRATE, INSIGHTFUL, SUPPORT</li>
 *   <li>Rate limiting: Maximum 10 reactions per minute per user (enforced in service layer)</li>
 * </ul>
 *
 * @see ReactionType
 */
@Entity
@Table(
    name = "reactions",
    uniqueConstraints = [
        UniqueConstraint(name = "uq_user_content", columnNames = ["user_id", "content_id"]),
    ],
    indexes = [
        Index(name = "idx_reactions_content", columnList = "content_id"),
        Index(name = "idx_reactions_user", columnList = "user_id"),
        Index(name = "idx_reactions_created", columnList = "created_at"),
    ],
)
data class Reaction(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    val id: UUID? = null,
    @NotNull
    @Column(name = "user_id", nullable = false)
    val userId: UUID,
    @NotNull
    @Column(name = "content_id", nullable = false)
    val contentId: UUID,
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "reaction_type", nullable = false, length = 20)
    var reactionType: ReactionType,
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant? = null,
)

/**
 * Enum representing the types of emotional responses to cultural heritage content.
 *
 * <p>Semantic reaction types combining emotions and content qualities,
 * each corresponds to a specific emoji and emotional intent:</p>
 * <ul>
 *   <li>LOVE (❤️): Deep appreciation and personal connection to cultural heritage</li>
 *   <li>CELEBRATE (🎉): Excitement, joy, and celebration of cultural heritage content</li>
 *   <li>INSIGHTFUL (💡): New learning, discovery, and insightful understanding of culture</li>
 *   <li>SUPPORT (👏): Appreciation, encouragement, and recognition for shared cultural knowledge</li>
 * </ul>
 */
enum class ReactionType {
    /** ❤️ Deep appreciation and personal connection */
    LOVE,

    /** 🎉 Excitement, joy, and celebration */
    CELEBRATE,

    /** 💡 New learning, discovery, and insightful understanding */
    INSIGHTFUL,

    /** 👏 Appreciation, encouragement, and recognition */
    SUPPORT,
}
