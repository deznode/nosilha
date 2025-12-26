package com.nosilha.core.contentactions.domain

import jakarta.persistence.*
import jakarta.validation.constraints.NotNull
import org.hibernate.annotations.CreationTimestamp
import java.time.Instant
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
data class Bookmark(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    val id: UUID? = null,
    @NotNull
    @Column(name = "user_id", nullable = false)
    val userId: String,
    @NotNull
    @Column(name = "entry_id", nullable = false)
    val entryId: UUID,
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant? = null,
)
