package com.nosilha.core.places.repository

import com.nosilha.core.places.domain.Town
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

/**
 * Spring Data JPA repository for the Town entity.
 *
 * This repository provides access to town/village data for Brava Island,
 * offering both standard CRUD operations and custom queries for town-specific
 * use cases like finding by slug or population filtering.
 */
@Repository
interface TownRepository : JpaRepository<Town, UUID> {
    /**
     * Finds a single Town by its unique slug.
     *
     * Since slugs are unique across all towns, this method will
     * return at most one town matching the given slug.
     *
     * @param slug The unique slug to search for.
     * @return The Town if found, null otherwise.
     */
    fun findBySlug(slug: String): Town?

    /**
     * Finds all Town instances with pagination support.
     *
     * @param pageable Pagination parameters.
     * @return A page of Town entities.
     */
    override fun findAll(pageable: Pageable): Page<Town>

    /**
     * Finds all towns ordered by name for consistent listing.
     *
     * @return A list of all Town entities ordered by name.
     */
    fun findAllByOrderByNameAsc(): List<Town>

    /**
     * Checks if a town with the given slug exists.
     *
     * @param slug The unique slug to check.
     * @return True if a town with this slug exists, false otherwise.
     */
    fun existsBySlug(slug: String): Boolean
}
