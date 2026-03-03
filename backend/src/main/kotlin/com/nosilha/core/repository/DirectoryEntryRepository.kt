package com.nosilha.core.repository

import com.nosilha.core.domain.DirectoryEntry
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

/**
 * Spring Data JPA repository for the DirectoryEntry entity hierarchy.
 *
 * This repository manages all entities that extend DirectoryEntry, providing
 * polymorphic access to the data. It provides standard CRUD operations and
 * allows for custom queries against the entire `directory_entries` table.
 */
@Repository
interface DirectoryEntryRepository : JpaRepository<DirectoryEntry, UUID> {

  /**
   * Finds all DirectoryEntry instances that match the given category.
   *
   * This query leverages the discriminator column (`category`) from the
   * SINGLE_TABLE inheritance strategy. For example, calling this method with
   * the string "Restaurant" will return a list of objects that are instances
   * of the Restaurant subclass.
   *
   * @param category The category name to filter by (e.g., "Restaurant", "Hotel").
   * @return A list of DirectoryEntry entities matching the specified category.
   */
  fun findByCategory(category: String): List<DirectoryEntry>
}