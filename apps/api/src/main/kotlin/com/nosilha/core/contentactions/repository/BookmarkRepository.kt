package com.nosilha.core.contentactions.repository

import com.nosilha.core.contentactions.domain.Bookmark
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

/**
 * Spring Data JPA repository for the Bookmark entity.
 *
 * <p>Provides standard CRUD operations and custom queries for:
 * <ul>
 *   <li>Finding bookmarks by user ID (for displaying user's saved entries)</li>
 *   <li>Finding a user's bookmark for a specific entry (for checking saved status)</li>
 *   <li>Checking bookmark existence (for UI state management)</li>
 *   <li>Counting user's bookmarks (for enforcing 100 bookmark limit)</li>
 *   <li>Deleting user's bookmark (for unbookmark action)</li>
 *   <li>Pagination support for bookmark listings</li>
 * </ul>
 *
 * <p><strong>Business Rules:</strong>
 * <ul>
 *   <li>Maximum 100 bookmarks per user (enforced by service layer using countByUserId)</li>
 *   <li>One bookmark per user per directory entry (unique constraint on user_id + entry_id)</li>
 *   <li>User ID matches Supabase external authentication ID (String type)</li>
 * </ul>
 */
@Repository
interface BookmarkRepository : JpaRepository<Bookmark, UUID> {
    /**
     * Finds all bookmarks for a specific user (paginated).
     *
     * <p>Used for displaying a user's saved directory entries with pagination
     * support for efficient loading when users have many bookmarks.</p>
     *
     * @param userId User ID from authentication system (Supabase)
     * @param pageable Pagination parameters (page number, size, sort)
     * @return Page of bookmarks for the user
     */
    fun findByUserId(
        userId: String,
        pageable: Pageable,
    ): Page<Bookmark>

    /**
     * Finds a user's bookmark for a specific directory entry.
     *
     * <p>Used to check if a user has bookmarked a specific entry and to retrieve
     * the bookmark for deletion. Enforces the unique constraint: one bookmark
     * per user per entry.</p>
     *
     * @param userId User ID from authentication system (Supabase)
     * @param entryId UUID of the directory entry (Restaurant, Hotel, Landmark, Beach)
     * @return The bookmark if it exists, null otherwise
     */
    fun findByUserIdAndEntryId(
        userId: String,
        entryId: UUID,
    ): Bookmark?

    /**
     * Checks if a bookmark exists for a user and directory entry.
     *
     * <p>Used for efficient UI state management to show/hide the bookmark button
     * without retrieving the full bookmark entity.</p>
     *
     * @param userId User ID from authentication system (Supabase)
     * @param entryId UUID of the directory entry
     * @return true if the user has bookmarked this entry, false otherwise
     */
    fun existsByUserIdAndEntryId(
        userId: String,
        entryId: UUID,
    ): Boolean

    /**
     * Counts the total number of bookmarks for a user.
     *
     * <p>Used for enforcing the business rule: maximum 100 bookmarks per user.
     * The service layer checks this count before allowing new bookmarks.</p>
     *
     * @param userId User ID from authentication system (Supabase)
     * @return Total number of bookmarks for the user
     */
    fun countByUserId(userId: String): Long

    /**
     * Deletes a user's bookmark for a specific directory entry.
     *
     * <p>Used when a user unbookmarks an entry. This is the primary method for
     * bookmark removal.</p>
     *
     * @param userId User ID from authentication system (Supabase)
     * @param entryId UUID of the directory entry to unbookmark
     */
    fun deleteByUserIdAndEntryId(
        userId: String,
        entryId: UUID,
    )
}
