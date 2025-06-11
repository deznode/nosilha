package com.nosilha.core.service

import com.nosilha.core.dto.DirectoryEntryDto
import com.nosilha.core.dto.toDto
import com.nosilha.core.exception.ResourceNotFoundException
import com.nosilha.core.repository.DirectoryEntryRepository
import org.springframework.stereotype.Service
import java.util.UUID

/**
 * Service class for handling business logic related to directory entries.
 *
 * This service acts as an intermediary between the controller and the repository,
 * orchestrating data retrieval and transformation from entities to DTOs.
 *
 * @param repository The repository for accessing directory entry data.
 */
@Service
class DirectoryEntryService(
  private val repository: DirectoryEntryRepository
) {

  /**
   * Retrieves all directory entries from the database and maps them to DTOs.
   *
   * @return A list of [DirectoryEntryDto] representing all entries.
   */
  fun getAllEntries(): List<DirectoryEntryDto> {
    return repository.findAll().map { it.toDto() }
  }

  /**
   * Retrieves all directory entries of a specific category and maps them to DTOs.
   *
   * @param category The category to filter by (e.g., "Restaurant", "Hotel").
   * @return A list of [DirectoryEntryDto] for the given category.
   */
  fun getEntriesByCategory(category: String): List<DirectoryEntryDto> {
    return repository.findByCategory(category).map { it.toDto() }
  }

  /**
   * Finds a single directory entry by its unique ID.
   *
   * @param id The UUID of the entry to find.
   * @return The corresponding [DirectoryEntryDto].
   * @throws ResourceNotFoundException if no entry with the given ID exists.
   */
  fun getEntryById(id: UUID): DirectoryEntryDto {
    return repository.findById(id)
      .map { it.toDto() }
      .orElseThrow { ResourceNotFoundException("Directory entry with ID '$id' not found.") }
  }

  /**
   * Finds a single directory entry by its unique slug.
   *
   * @param slug The unique slug of the entry to find.
   * @return The corresponding [DirectoryEntryDto].
   * @throws ResourceNotFoundException if no entry with the given slug exists.
   */
  fun getEntryBySlug(slug: String): DirectoryEntryDto {
    return repository.findBySlug(slug)?.toDto()
      ?: throw ResourceNotFoundException("Directory entry with slug '$slug' not found.")
  }
}