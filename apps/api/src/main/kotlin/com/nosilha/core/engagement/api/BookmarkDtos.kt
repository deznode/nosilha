package com.nosilha.core.engagement.api

import com.nosilha.core.directory.domain.DirectoryEntry
import com.nosilha.core.engagement.domain.Bookmark
import jakarta.validation.constraints.NotNull
import java.time.Instant
import java.util.UUID

/**
 * Request DTO for creating a new bookmark.
 *
 * <p>Used in POST /api/v1/bookmarks endpoint. Requires authentication.
 * Allows users to save directory entries for quick access later.</p>
 *
 * <p><strong>Validation Rules:</strong></p>
 * <ul>
 *   <li>Entry ID: Required UUID of the directory entry to bookmark</li>
 * </ul>
 *
 * @property entryId UUID of the directory entry to bookmark
 */
data class BookmarkCreateRequest(
    @field:NotNull(message = "Entry ID is required")
    val entryId: UUID,
)

/**
 * Basic bookmark response DTO.
 *
 * <p>Used in POST /api/v1/bookmarks endpoint response.
 * Provides essential bookmark information after creation.</p>
 *
 * @property id Unique identifier of the bookmark
 * @property entryId UUID of the bookmarked directory entry
 * @property createdAt Timestamp when the bookmark was created
 */
data class BookmarkDto(
    val id: UUID,
    val entryId: UUID,
    val createdAt: Instant?,
)

/**
 * Bookmark with entry details for listing.
 *
 * <p>Used in GET /api/v1/bookmarks endpoint to list all user bookmarks
 * with complete directory entry information for display.</p>
 *
 * @property id Unique identifier of the bookmark
 * @property entry Summary of the bookmarked directory entry
 * @property createdAt Timestamp when the bookmark was created
 */
data class BookmarkWithEntryDto(
    val id: UUID,
    val entry: DirectoryEntrySummaryDto,
    val createdAt: Instant?,
)

/**
 * Summary of a directory entry for bookmark listings.
 *
 * <p>Provides essential information about a directory entry without
 * including the full details. Used in bookmark lists and other contexts
 * where a lightweight representation is needed.</p>
 *
 * @property id Unique identifier of the directory entry
 * @property name Name of the entry
 * @property category Category/type of entry (Restaurant, Hotel, Landmark, Beach)
 * @property slug URL-friendly identifier
 * @property description Short description of the entry (null if not set)
 * @property town Town where the entry is located
 * @property averageRating Average rating (null if no ratings yet)
 * @property thumbnailUrl Thumbnail image URL for the entry (null if no image)
 */
data class DirectoryEntrySummaryDto(
    val id: UUID,
    val name: String,
    val category: String,
    val slug: String,
    val description: String?,
    val town: String?,
    val averageRating: Double?,
    val thumbnailUrl: String?,
)

/**
 * Response DTO for checking if an entry is bookmarked.
 *
 * <p>Used in GET /api/v1/bookmarks/status/{entryId} endpoint.
 * Provides quick bookmark status check for a specific entry.</p>
 *
 * @property isBookmarked Whether the entry is currently bookmarked by the user
 * @property bookmarkId ID of the bookmark if it exists (null if not bookmarked)
 */
data class BookmarkStatusDto(
    val isBookmarked: Boolean,
    val bookmarkId: UUID?,
)

/**
 * Extension function to convert Bookmark entity to basic DTO.
 *
 * <p>Maps domain entity to simple bookmark response without entry details.</p>
 *
 * @return BookmarkDto with essential bookmark fields
 */
fun Bookmark.toDto() =
    BookmarkDto(
        id = this.id!!,
        entryId = this.entryId,
        createdAt = this.createdAt,
    )

/**
 * Extension function to convert Bookmark entity and DirectoryEntry to detailed DTO.
 *
 * <p>Maps domain entity to bookmark with full entry summary for list display.</p>
 *
 * @param entry The directory entry associated with this bookmark
 * @return BookmarkWithEntryDto with bookmark and entry summary
 */
fun Bookmark.toWithEntryDto(entry: DirectoryEntry) =
    BookmarkWithEntryDto(
        id = this.id!!,
        entry = entry.toSummaryDto(),
        createdAt = this.createdAt,
    )

/**
 * Extension function to convert DirectoryEntry to summary DTO.
 *
 * <p>Maps directory entry to lightweight summary representation.</p>
 *
 * @return DirectoryEntrySummaryDto with essential entry fields
 */
fun DirectoryEntry.toSummaryDto() =
    DirectoryEntrySummaryDto(
        id = this.id!!,
        name = this.name,
        category = this.category,
        slug = this.slug,
        description = this.description,
        town = this.town,
        averageRating = this.rating,
        thumbnailUrl = this.imageUrl,
    )
