package com.nosilha.core.engagement.repository

import com.nosilha.core.engagement.domain.Content
import com.nosilha.core.engagement.domain.ContentType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

/**
 * Spring Data JPA repository for the Content entity.
 *
 * <p>Provides operations for:
 * <ul>
 *   <li>Finding content by slug and type (for registration lookup)</li>
 *   <li>Checking content existence (for validation)</li>
 *   <li>Standard CRUD operations</li>
 * </ul>
 */
@Repository
interface ContentRepository : JpaRepository<Content, UUID> {
    /**
     * Finds content by its slug and type.
     *
     * <p>Used during content registration to check if content already exists
     * and return its ID, or to create a new entry.</p>
     *
     * @param slug URL-safe identifier for the content
     * @param contentType Type of content (ARTICLE, PAGE, DIRECTORY_ENTRY)
     * @return The content if found, null otherwise
     */
    fun findBySlugAndContentType(
        slug: String,
        contentType: ContentType
    ): Content?

    /**
     * Checks if content with the given slug and type exists.
     *
     * @param slug URL-safe identifier for the content
     * @param contentType Type of content
     * @return true if content exists, false otherwise
     */
    fun existsBySlugAndContentType(
        slug: String,
        contentType: ContentType,
    ): Boolean
}
