package com.nosilha.core.directory.api

import com.nosilha.core.directory.domain.DirectoryEntryService
import com.nosilha.core.dto.ApiResponse
import com.nosilha.core.dto.CreateEntryRequestDto
import com.nosilha.core.dto.DirectoryEntryDto
import com.nosilha.core.dto.PagedApiResponse
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
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
 *   <li>GET /api/v1/directory/slug/{slug} - Get entry by slug</li>
 *   <li>POST /api/v1/directory/entries - Create new entry (authenticated)</li>
 *   <li>PUT /api/v1/directory/entries/{id} - Update entry (authenticated)</li>
 *   <li>DELETE /api/v1/directory/entries/{id} - Delete entry (authenticated)</li>
 * </ul>
 *
 * @param service The business logic layer for directory entries.
 */
@RestController
@RequestMapping("/api/v1/directory")
class DirectoryEntryController(
    private val service: DirectoryEntryService,
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
    ): ApiResponse<DirectoryEntryDto> {
        val createdEntry = service.createEntry(request)
        return ApiResponse(data = createdEntry, status = HttpStatus.CREATED.value())
    }

    /**
     * Retrieves a list of directory entries with pagination support.
     *
     * <p>This endpoint can be optionally filtered by `category` and `town` parameters.
     * Supports pagination with `page` and `size` parameters.</p>
     *
     * @param category An optional string to filter entries by their type (e.g., "Restaurant").
     * @param town An optional string to filter entries by town name.
     * @param page Page number (default: 0).
     * @param size Page size (default: 20).
     * @return A PagedApiResponse with data containing the list of [DirectoryEntryDto] objects.
     */
    @GetMapping("/entries")
    fun getEntries(
        @RequestParam(name = "category", required = false) category: String?,
        @RequestParam(name = "town", required = false) town: String?,
        @RequestParam(name = "page", defaultValue = "0") page: Int,
        @RequestParam(name = "size", defaultValue = "20") size: Int,
    ): PagedApiResponse<DirectoryEntryDto> {
        val pageable: Pageable = PageRequest.of(page, size, Sort.by("createdAt").descending())

        val resultPage = when {
            category != null && town != null -> service.getEntriesByCategoryAndTownPage(category, town, pageable)
            category != null -> service.getEntriesByCategoryPage(category, pageable)
            town != null -> service.getEntriesByTownPage(town, pageable)
            else -> service.getEntriesPage(pageable)
        }

        return PagedApiResponse.from(resultPage)
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
    ): ApiResponse<DirectoryEntryDto> {
        val entry = service.getEntryById(id)
        return ApiResponse(data = entry)
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
    ): ApiResponse<DirectoryEntryDto> {
        val entry = service.getEntryBySlug(slug)
        return ApiResponse(data = entry)
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
    ): ApiResponse<DirectoryEntryDto> {
        val updatedEntry = service.updateEntry(id, request)
        return ApiResponse(data = updatedEntry)
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
}
