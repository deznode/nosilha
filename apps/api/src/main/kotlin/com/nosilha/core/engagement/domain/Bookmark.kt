package com.nosilha.core.engagement.domain

import com.nosilha.core.shared.domain.CreatableEntity
import jakarta.persistence.*
import jakarta.validation.constraints.NotNull
import java.util.UUID

/**
 * Represents a user's saved directory entry for quick access.
 *
 * <p>Bookmarks are immutable once created - users can only add or remove them.
 * This is a simple save/unsave feature for directory entries like restaurants,
 * hotels, landmarks, and beaches.</p>
 *
 * <p><strong>Constraints:</strong></p>
 * <ul>
 *   <li>One bookmark per user per directory entry (unique constraint on user_id + entry_id)</li>
 *   <li>User ID matches Supabase external authentication ID (String type)</li>
 *   <li>Entry ID references a DirectoryEntry UUID</li>
 * </ul>
 */
@Entity
@Table(
    name = "bookmarks",
    uniqueConstraints = [
        UniqueConstraint(name = "uq_user_entry", columnNames = ["user_id", "entry_id"]),
    ],
    indexes = [
        Index(name = "idx_bookmarks_user", columnList = "user_id"),
        Index(name = "idx_bookmarks_entry", columnList = "entry_id"),
        Index(name = "idx_bookmarks_created", columnList = "created_at"),
    ],
)
class Bookmark(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    val id: UUID? = null,
    @NotNull
    @Column(name = "user_id", nullable = false)
    val userId: UUID,
    @NotNull
    @Column(name = "entry_id", nullable = false)
    val entryId: UUID,
) : CreatableEntity() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as Bookmark
        return id != null && id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 31

    override fun toString(): String = "Bookmark(id=$id, userId=$userId, entryId=$entryId)"
}
