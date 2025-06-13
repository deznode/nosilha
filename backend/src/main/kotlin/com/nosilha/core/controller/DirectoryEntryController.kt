package com.nosilha.core.controller

import com.nosilha.core.dto.CreateEntryRequestDto
import com.nosilha.core.dto.DirectoryEntryDto
import com.nosilha.core.service.DirectoryEntryService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * REST controller for accessing the Nosilha directory entries.
 *
 * This controller exposes a versioned API (v1) for retrieving information
 * about landmarks, restaurants, hotels, and other points of interest on Brava.
 *
 * @param service The business logic layer for directory entries.
 */
@RestController
@RequestMapping("/api/v1/directory")
class DirectoryEntryController(
  private val service: DirectoryEntryService
) {

  /**
   * Creates a new directory entry.
   *
   * This endpoint handles `POST` requests to `/api/v1/directory/entries`.
   * The `@ResponseStatus(HttpStatus.CREATED)` annotation ensures a 201 status is returned on success.
   *
   * @param request The request body containing the details of the entry to create.
   * @return The DTO of the newly created entry.
   */
  @PostMapping("/entries")
  @ResponseStatus(HttpStatus.CREATED)
  fun createNewEntry(@RequestBody request: CreateEntryRequestDto): DirectoryEntryDto {
    return service.createEntry(request)
  }

  /**
   * Retrieves a list of directory entries.
   *
   * This endpoint can be optionally filtered by a `category` request parameter.
   * If the `category` is provided, only entries of that type are returned.
   * Otherwise, all directory entries are returned.
   *
   * @param category An optional string to filter entries by their type (e.g., "Restaurant").
   * @return A list of [DirectoryEntryDto] objects.
   */
  @GetMapping("/entries")
  fun getEntries(@RequestParam(name = "category", required = false) category: String?): List<DirectoryEntryDto> {
    return category?.let {
      service.getEntriesByCategory(it)
    } ?: service.getAllEntries()
  }

  /**
   * Retrieves a single directory entry by its unique identifier.
   *
   * @param id The UUID of the directory entry to retrieve.
   * @return The [DirectoryEntryDto] with a 200 OK status.
   * If the entry is not found, the service will throw an exception that results
   * in a 404 Not Found status.
   */
  @GetMapping("/{id}")
  fun getEntryById(@PathVariable id: UUID): DirectoryEntryDto {
    return service.getEntryById(id)
  }

  /**
   * Retrieves a single directory entry by its unique slug.
   *
   * This endpoint provides a user-friendly way to access directory entries
   * using human-readable slugs instead of UUIDs. For example:
   * GET /api/v1/directory/slug/marias-restaurant-nova-sintra
   *
   * @param slug The unique slug of the directory entry to retrieve.
   * @return The [DirectoryEntryDto] with a 200 OK status.
   * If the entry is not found, the service will throw an exception that results
   * in a 404 Not Found status.
   */
  @GetMapping("/slug/{slug}")
  fun getEntryBySlug(@PathVariable slug: String): DirectoryEntryDto {
    return service.getEntryBySlug(slug)
  }
}