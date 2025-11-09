package com.nosilha.core.contentactions.domain

import jakarta.persistence.*
import jakarta.validation.constraints.NotNull
import org.hibernate.annotations.CreationTimestamp
import java.time.Instant
import java.util.UUID

/**
 * Represents a user's emotional response to cultural heritage content.
 *
 * <p>Reactions are immutable once created. When a user changes their reaction,
 * the old reaction is deleted and a new one is created (transactional operation).</p>
 *
 * <p><strong>Constraints:</strong></p>
 * <ul>
 *   <li>One reaction per user per content page (unique constraint on user_id + content_id)</li>
 *   <li>Reaction type must be one of: LOVE, HELPFUL, INTERESTING, THANKYOU</li>
 *   <li>Rate limiting: Maximum 10 reactions per minute per user (enforced in service layer)</li>
 * </ul>
 *
 * @see ReactionType
 */
@Entity
@Table(
    name = "reactions",
    uniqueConstraints = [
        UniqueConstraint(name = "uq_user_content", columnNames = ["user_id", "content_id"])
    ],
    indexes = [
        Index(name = "idx_reactions_content", columnList = "content_id"),
        Index(name = "idx_reactions_user", columnList = "user_id"),
        Index(name = "idx_reactions_created", columnList = "created_at")
    ]
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
    val reactionType: ReactionType,

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant? = null
)

/**
 * Enum representing the types of emotional responses to cultural heritage content.
 *
 * <p>Each reaction type corresponds to a specific emoji and emotional intent:</p>
 * <ul>
 *   <li>LOVE (❤️): Deep appreciation, personal connection to cultural heritage</li>
 *   <li>HELPFUL (👍): Educational value, useful information discovered</li>
 *   <li>INTERESTING (🤔): Intellectually engaging, sparked curiosity about culture</li>
 *   <li>THANKYOU (🙏): Gratitude for sharing, cultural appreciation</li>
 * </ul>
 */
enum class ReactionType {
    /** ❤️ Deep appreciation, personal connection */
    LOVE,

    /** 👍 Educational value, useful information */
    HELPFUL,

    /** 🤔 Intellectually engaging, sparked curiosity */
    INTERESTING,

    /** 🙏 Gratitude for sharing, cultural appreciation */
    THANKYOU
}
