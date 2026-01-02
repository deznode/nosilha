package com.nosilha.core.contentactions.repository

import com.nosilha.core.contentactions.domain.MdxArchive
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

/**
 * Spring Data JPA repository for the MdxArchive entity.
 *
 * <p>Provides standard CRUD operations and custom queries for:
 * <ul>
 *   <li>Finding MDX archives by story ID</li>
 *   <li>Finding MDX archives by slug</li>
 *   <li>Checking if an archive exists for a story</li>
 * </ul>
 *
 * <p><strong>Archive Workflow:</strong></p>
 * <p>When an admin commits a story to MDX format:
 * <ol>
 *   <li>The service checks if an archive already exists ({@code findByStoryId})</li>
 *   <li>Metadata is saved to the database</li>
 *   <li>An event is published to trigger file writing via Spring Modulith</li>
 *   <li>The file writer listener creates the MDX file on the filesystem</li>
 * </ol>
 * </p>
 */
@Repository
interface MdxArchiveRepository : JpaRepository<MdxArchive, UUID> {
    /**
     * Finds an MDX archive by the associated story submission ID.
     *
     * <p>Used to check if a story has already been archived and to retrieve
     * the existing archive for updates.</p>
     *
     * @param storyId UUID of the story submission
     * @return The MDX archive if it exists, null otherwise
     */
    fun findByStoryId(storyId: UUID): MdxArchive?

    /**
     * Finds an MDX archive by its URL-friendly slug.
     *
     * <p>Used for querying archives by their slug, which is used in both
     * the database and filesystem path.</p>
     *
     * @param slug URL-friendly identifier
     * @return The MDX archive if it exists, null otherwise
     */
    fun findBySlug(slug: String): MdxArchive?

    /**
     * Checks if an MDX archive exists for a given story ID.
     *
     * <p>Used to determine if a story has already been archived before
     * attempting to create a new archive.</p>
     *
     * @param storyId UUID of the story submission
     * @return True if an archive exists for this story, false otherwise
     */
    fun existsByStoryId(storyId: UUID): Boolean
}
