package com.nosilha.core.engagement.services

import com.nosilha.core.engagement.api.BookmarkDto
import com.nosilha.core.engagement.api.BookmarkStatusDto
import com.nosilha.core.engagement.api.BookmarkWithEntryDto
import com.nosilha.core.engagement.api.toDto
import com.nosilha.core.engagement.api.toWithEntryDto
import com.nosilha.core.engagement.domain.Bookmark
import com.nosilha.core.engagement.repository.BookmarkRepository
import com.nosilha.core.places.repository.DirectoryEntryRepository
import com.nosilha.core.shared.exception.BusinessException
import com.nosilha.core.shared.exception.ResourceNotFoundException
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

private val logger = KotlinLogging.logger {}

/**
 * Service for managing user bookmarks for directory entries.
 *
 * <p>Implements business logic for:
 * <ul>
 *   <li>Creating bookmarks with validation (entry exists, no duplicates, under 100 limit)</li>
 *   <li>Deleting bookmarks</li>
 *   <li>Retrieving paginated bookmarks with entry details</li>
 *   <li>Checking bookmark status for a specific entry</li>
 * </ul>
 *
 * <p><strong>Business Rules:</strong>
 * <ul>
 *   <li>Maximum 100 bookmarks per user (FR-010)</li>
 *   <li>No duplicate bookmarks (FR-008) - enforced by unique constraint</li>
 *   <li>Directory entry must exist before bookmarking</li>
 * </ul>
 */
@Service
@Transactional
class BookmarkService(
    private val bookmarkRepository: BookmarkRepository,
    private val directoryEntryRepository: DirectoryEntryRepository,
) {
    companion object {
        private const val MAX_BOOKMARKS_PER_USER = 100
    }

    /**
     * Creates a new bookmark for a user, or returns existing if already bookmarked.
     *
     * <p>This operation is idempotent: calling it multiple times with the same
     * parameters will return the same result without error. This handles race
     * conditions and simplifies client-side logic.</p>
     *
     * <p><strong>Validation Rules:</strong>
     * <ul>
     *   <li>Directory entry must exist (throws ResourceNotFoundException)</li>
     *   <li>User must be under 100 bookmark limit (throws BusinessException)</li>
     * </ul>
     *
     * @param userId User ID from authentication system (Supabase)
     * @param entryId UUID of the directory entry to bookmark
     * @return BookmarkDto with created or existing bookmark details
     * @throws ResourceNotFoundException if directory entry doesn't exist
     * @throws BusinessException if bookmark limit reached
     */
    fun createBookmark(
        userId: UUID,
        entryId: UUID,
    ): BookmarkDto {
        logger.debug { "Creating bookmark for user $userId on entry $entryId" }

        // Check if directory entry exists
        if (!directoryEntryRepository.existsById(entryId)) {
            logger.warn { "Directory entry not found: $entryId" }
            throw ResourceNotFoundException("Directory entry with ID $entryId not found")
        }

        // Check if already bookmarked - return existing instead of throwing (idempotent operation)
        val existingBookmark = bookmarkRepository.findByUserIdAndEntryId(userId, entryId)
        if (existingBookmark != null) {
            logger.info { "Bookmark already exists for user $userId on entry $entryId, returning existing" }
            return existingBookmark.toDto()
        }

        // Check bookmark limit (maximum 100 per user)
        val currentCount = bookmarkRepository.countByUserId(userId)
        if (currentCount >= MAX_BOOKMARKS_PER_USER) {
            logger.warn { "User $userId exceeded bookmark limit ($currentCount/$MAX_BOOKMARKS_PER_USER)" }
            throw BusinessException(
                "Maximum $MAX_BOOKMARKS_PER_USER bookmarks reached. Please remove some bookmarks before adding new ones.",
            )
        }

        // Create and save bookmark
        val bookmark =
            Bookmark(
                userId = userId,
                entryId = entryId,
            )

        val savedBookmark = bookmarkRepository.save(bookmark)
        logger.info { "Bookmark created successfully: ${savedBookmark.id} for user $userId on entry $entryId" }

        return savedBookmark.toDto()
    }

    /**
     * Deletes a user's bookmark for a directory entry.
     *
     * <p>Used when a user unbookmarks an entry. The bookmark must exist for the
     * deletion to succeed.</p>
     *
     * @param userId User ID from authentication system (Supabase)
     * @param entryId UUID of the directory entry to unbookmark
     * @throws ResourceNotFoundException if bookmark doesn't exist
     */
    fun deleteBookmark(
        userId: UUID,
        entryId: UUID,
    ) {
        logger.debug { "Deleting bookmark for user $userId on entry $entryId" }

        // Check if bookmark exists before deleting
        val bookmark = bookmarkRepository.findByUserIdAndEntryId(userId, entryId)
            ?: throw ResourceNotFoundException(
                "Bookmark not found for user $userId on entry $entryId",
            )

        bookmarkRepository.delete(bookmark)
        logger.info { "Bookmark deleted successfully for user $userId on entry $entryId" }
    }

    /**
     * Gets all bookmarks for a user with full directory entry details.
     *
     * <p>Returns a paginated list of bookmarks with complete entry information
     * for display in the user's bookmark list. The results are ordered by
     * creation date (newest first) unless a different sort is specified in
     * the pageable parameter.</p>
     *
     * @param userId User ID from authentication system (Supabase)
     * @param pageable Pagination parameters (page number, size, sort)
     * @return Page of bookmarks with entry details
     */
    @Transactional(readOnly = true)
    fun getBookmarks(
        userId: UUID,
        pageable: Pageable,
    ): Page<BookmarkWithEntryDto> {
        logger.debug { "Fetching bookmarks for user $userId (page: ${pageable.pageNumber})" }

        val bookmarksPage = bookmarkRepository.findByUserId(userId, pageable)

        // Batch fetch all entries in a single query (instead of N queries)
        val entryIds = bookmarksPage.content.map { it.entryId }
        val entriesById = if (entryIds.isNotEmpty()) {
            directoryEntryRepository.findAllById(entryIds).associateBy { it.id }
        } else {
            emptyMap()
        }

        // Map to DTOs with entry details
        return bookmarksPage.map { bookmark ->
            val entry = entriesById[bookmark.entryId]
                ?: run {
                    // This should not happen due to foreign key constraints, but handle gracefully
                    logger.error { "Directory entry ${bookmark.entryId} not found for bookmark ${bookmark.id}" }
                    throw ResourceNotFoundException("Directory entry with ID ${bookmark.entryId} not found")
                }
            bookmark.toWithEntryDto(entry)
        }
    }

    /**
     * Checks if a user has bookmarked a specific directory entry.
     *
     * <p>Used for UI state management to show/hide the bookmark button
     * and display the correct bookmark status. If the entry is bookmarked,
     * returns the bookmark ID for potential future operations.</p>
     *
     * @param userId User ID from authentication system (Supabase)
     * @param entryId UUID of the directory entry to check
     * @return BookmarkStatusDto with isBookmarked flag and optional bookmarkId
     */
    @Transactional(readOnly = true)
    fun isBookmarked(
        userId: UUID,
        entryId: UUID,
    ): BookmarkStatusDto {
        logger.debug { "Checking bookmark status for user $userId on entry $entryId" }

        val bookmark = bookmarkRepository.findByUserIdAndEntryId(userId, entryId)

        return BookmarkStatusDto(
            isBookmarked = bookmark != null,
            bookmarkId = bookmark?.id,
        )
    }
}
