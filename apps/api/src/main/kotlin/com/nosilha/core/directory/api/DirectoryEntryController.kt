package com.nosilha.core.directory.api

import com.nosilha.core.contentactions.api.BookmarkStatusDto
import com.nosilha.core.contentactions.services.BookmarkService
import com.nosilha.core.directory.domain.DirectoryEntryService
import com.nosilha.core.directory.domain.toDto
import com.nosilha.core.directory.services.SearchService
import com.nosilha.core.shared.api.ApiResult
import com.nosilha.core.shared.api.CreateEntryRequestDto
import com.nosilha.core.shared.api.DirectoryEntryDto
import com.nosilha.core.shared.api.PagedApiResult
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * REST controller for accessing the Nos Ilha directory entries.
 *
 * <p>This controller exposes a versioned API (v1) for retrieving information
 * about landmarks, restaurants, hotels, and other points of interest on Brava Island.</p>
 *
 * <p><strong>Public API Endpoints:</strong></p>
 * <ul>
 *   <li>GET /api/v1/directory/entries - List all entries with pagination and filtering</li>
 *   <li>GET /api/v1/directory/entries/{id} - Get entry by UUID</li>
 *   <li>GET /api/v1/directory/entries/{id}/bookmark-status - Check if entry is bookmarked</li>
 *   <li>GET /api/v1/directory/slug/{slug} - Get entry by slug</li>
 *   <li>POST /api/v1/directory/entries - Create new entry (authenticated)</li>
 *   <li>PUT /api/v1/directory/entries/{id} - Update entry (authenticated)</li>
 *   <li>DELETE /api/v1/directory/entries/{id} - Delete entry (authenticated)</li>
 * </ul>
 *
 * @param service The business logic layer for directory entries.
 * @param searchService The search service for full-text search functionality.
 * @param bookmarkService The bookmark service for checking bookmark status.
 */
@RestController
@RequestMapping("/api/v1/directory")
class DirectoryEntryController(
    private val service: DirectoryEntryService,
    private val searchService: SearchService,
    private val bookmarkService: BookmarkService,
) {
    /**
     * Creates a new directory entry.
     *
     * <p>This endpoint handles `POST` requests to `/api/v1/directory/entries`.
     * The `@ResponseStatus(HttpStatus.CREATED)` annotation ensures a 201 status is returned on success.</p>
     *
     * @param request The request body containing the details of the entry to create.
     * @return The ApiResponse wrapping the DTO of the newly created entry.
     */
    @PostMapping("/entries")
    @ResponseStatus(HttpStatus.CREATED)
    fun createNewEntry(
        @RequestBody request: CreateEntryRequestDto,
    ): ApiResult<DirectoryEntryDto> {
        val createdEntry = service.createEntry(request)
        return ApiResult(data = createdEntry, status = HttpStatus.CREATED.value())
    }

    /**
     * Retrieves a list of directory entries with pagination, search, and filtering support.
     *
     * <p>This endpoint supports:</p>
     * <ul>
     *   <li>Full-text search via `q` parameter (min 2 chars, empty returns no results)</li>
     *   <li>Filtering by `category` and `town` parameters</li>
     *   <li>Sorting via `sort` parameter</li>
     *   <li>Pagination with `page` and `size` parameters</li>
     * </ul>
     *
     * <p><strong>Sort Options:</strong></p>
     * <ul>
     *   <li>name_asc - Sort by name ascending</li>
     *   <li>name_desc - Sort by name descending</li>
     *   <li>rating_desc - Sort by rating descending</li>
     *   <li>created_at_desc - Sort by creation date descending (default)</li>
     *   <li>relevance - Sort by search relevance (only valid with q parameter)</li>
     * </ul>
     *
     * @param q Optional search query (minimum 2 characters).
     * @param category An optional string to filter entries by their type (e.g., "Restaurant").
     * @param town An optional string to filter entries by town name.
     * @param sort Sort order (default: created_at_desc).
     * @param page Page number (default: 0).
     * @param size Page size (default: 20).
     * @return A PagedApiResponse with data containing the list of [DirectoryEntryDto] objects.
     */
    @GetMapping("/entries")
    fun getEntries(
        @RequestParam(name = "q", required = false) q: String?,
        @RequestParam(name = "category", required = false) category: String?,
        @RequestParam(name = "town", required = false) town: String?,
        @RequestParam(name = "sort", defaultValue = "created_at_desc") sortParam: String,
        @RequestParam(name = "page", defaultValue = "0") page: Int,
        @RequestParam(name = "size", defaultValue = "20") size: Int,
    ): PagedApiResult<DirectoryEntryDto> {
        // If search query is provided, use search service
        val resultPage =
            if (!q.isNullOrBlank()) {
                // Validate minimum query length - return empty for short queries
                if (q.trim().length < 2) {
                    Page.empty<DirectoryEntryDto>(PageRequest.of(page, size))
                } else {
                    // For search, we sort by relevance (handled in repository query)
                    val pageable = PageRequest.of(page, size)
                    searchService.search(q, category, town, pageable).map { it.toDto() }
                }
            } else {
                // No search query - use existing filter logic with sorting
                val sort =
                    when (sortParam) {
                        "name_asc" -> Sort.by("name").ascending()
                        "name_desc" -> Sort.by("name").descending()
                        "rating_desc" -> Sort.by("rating").descending()
                        else -> Sort.by("createdAt").descending()
                    }

                val pageable: Pageable = PageRequest.of(page, size, sort)

                when {
                    category != null && town != null ->
                        service.getEntriesByCategoryAndTownPage(category, town, pageable)
                    category != null -> service.getEntriesByCategoryPage(category, pageable)
                    town != null -> service.getEntriesByTownPage(town, pageable)
                    else -> service.getEntriesPage(pageable)
                }
            }

        return PagedApiResult.from(resultPage)
    }

    /**
     * Retrieves a single directory entry by its unique identifier.
     *
     * @param id The UUID of the directory entry to retrieve.
     * @return The ApiResponse wrapping [DirectoryEntryDto] with a 200 OK status.
     * @throws ResourceNotFoundException if the entry is not found (results in 404 Not Found).
     */
    @GetMapping("/entries/{id}")
    fun getEntryById(
        @PathVariable id: UUID,
    ): ApiResult<DirectoryEntryDto> {
        val entry = service.getEntryById(id)
        return ApiResult(data = entry)
    }

    /**
     * Retrieves a single directory entry by its unique slug.
     *
     * <p>This endpoint provides a user-friendly way to access directory entries
     * using human-readable slugs instead of UUIDs. For example:
     * GET /api/v1/directory/slug/marias-restaurant-nova-sintra</p>
     *
     * @param slug The unique slug of the directory entry to retrieve.
     * @return The ApiResponse wrapping [DirectoryEntryDto] with a 200 OK status.
     * @throws ResourceNotFoundException if the entry is not found (results in 404 Not Found).
     */
    @GetMapping("/slug/{slug}")
    fun getEntryBySlug(
        @PathVariable slug: String,
    ): ApiResult<DirectoryEntryDto> {
        val entry = service.getEntryBySlug(slug)
        return ApiResult(data = entry)
    }

    /**
     * Updates an existing directory entry.
     *
     * @param id The UUID of the directory entry to update.
     * @param request The request body containing the updated entry data.
     * @return The ApiResponse wrapping the updated [DirectoryEntryDto].
     * @throws ResourceNotFoundException if the entry is not found.
     * @throws BusinessException if the update violates business rules.
     */
    @PutMapping("/entries/{id}")
    fun updateEntry(
        @PathVariable id: UUID,
        @RequestBody request: CreateEntryRequestDto,
    ): ApiResult<DirectoryEntryDto> {
        val updatedEntry = service.updateEntry(id, request)
        return ApiResult(data = updatedEntry)
    }

    /**
     * Deletes a directory entry by its ID.
     *
     * @param id The UUID of the directory entry to delete.
     * @throws ResourceNotFoundException if the entry is not found.
     */
    @DeleteMapping("/entries/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteEntry(
        @PathVariable id: UUID,
    ) {
        service.deleteEntry(id)
    }

    /**
     * Check if a directory entry is bookmarked by the current user.
     *
     * <p>This endpoint is public and returns bookmark status based on authentication state:
     * <ul>
     *   <li>If user is authenticated: returns actual bookmark status from database</li>
     *   <li>If user is not authenticated: returns { "isBookmarked": false, "bookmarkId": null }</li>
     * </ul>
     *
     * <p><strong>Example Request (Authenticated):</strong></p>
     * <pre>
     * GET /api/v1/directory/entries/550e8400-e29b-41d4-a716-446655440000/bookmark-status
     * Authorization: Bearer {jwt-token}
     * </pre>
     *
     * <p><strong>Example Response (Authenticated, Bookmarked):</strong></p>
     * <pre>
     * {
     *   "data": {
     *     "isBookmarked": true,
     *     "bookmarkId": "789e0123-e45b-67c8-d901-234567890abc"
     *   },
     *   "timestamp": "2025-01-15T10:30:00Z",
     *   "status": 200
     * }
     * </pre>
     *
     * <p><strong>Example Request (Unauthenticated):</strong></p>
     * <pre>
     * GET /api/v1/directory/entries/550e8400-e29b-41d4-a716-446655440000/bookmark-status
     * </pre>
     *
     * <p><strong>Example Response (Unauthenticated):</strong></p>
     * <pre>
     * {
     *   "data": {
     *     "isBookmarked": false,
     *     "bookmarkId": null
     *   },
     *   "timestamp": "2025-01-15T10:30:00Z",
     *   "status": 200
     * }
     * </pre>
     *
     * @param id The UUID of the directory entry to check bookmark status for.
     * @param authentication Optional Spring Security authentication (null if not authenticated).
     * @return ApiResponse containing BookmarkStatusDto with bookmark status.
     */
    @GetMapping("/entries/{id}/bookmark-status")
    fun getBookmarkStatus(
        @PathVariable id: UUID,
        authentication: Authentication?,
    ): ApiResult<BookmarkStatusDto> {
        // If user is not authenticated, return false
        if (authentication == null) {
            return ApiResult(
                data = BookmarkStatusDto(isBookmarked = false, bookmarkId = null),
            )
        }

        // User is authenticated, check actual bookmark status
        val userId = authentication.name
        val bookmarkStatus = bookmarkService.isBookmarked(userId, id)

        return ApiResult(data = bookmarkStatus)
    }
}
