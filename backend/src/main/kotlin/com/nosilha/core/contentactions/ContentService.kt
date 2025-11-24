package com.nosilha.core.contentactions

import com.nosilha.core.contentactions.domain.Content
import com.nosilha.core.contentactions.domain.ContentType
import com.nosilha.core.contentactions.repository.ContentRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * Service for managing content registration.
 *
 * <p>Handles the registration of content (articles, pages) to obtain a stable
 * content ID for reaction tracking. Content is registered on first access
 * and the same ID is returned on subsequent requests.</p>
 */
@Service
class ContentService(
    private val contentRepository: ContentRepository,
) {
    private val logger = LoggerFactory.getLogger(ContentService::class.java)

    /**
     * Registers content and returns its ID.
     *
     * <p>If content with the given slug and type already exists, returns the
     * existing ID. Otherwise, creates a new content entry and returns its ID.</p>
     *
     * @param slug URL-safe identifier for the content
     * @param contentType Type of content (ARTICLE, PAGE)
     * @return UUID of the registered content
     */
    @Transactional
    fun registerContent(
        slug: String,
        contentType: ContentType
    ): UUID {
        // Check if content already exists
        val existingContent = contentRepository.findBySlugAndContentType(slug, contentType)
        if (existingContent != null) {
            logger.debug("Content already registered: {} ({})", slug, contentType)
            return existingContent.id!!
        }

        // Create new content entry
        val content = Content(
            slug = slug,
            contentType = contentType,
        )
        val savedContent = contentRepository.save(content)
        logger.info("Registered new content: {} ({}) with ID {}", slug, contentType, savedContent.id)
        return savedContent.id!!
    }

    /**
     * Gets content by its ID.
     *
     * @param contentId UUID of the content
     * @return Content if found, null otherwise
     */
    fun getContent(contentId: UUID): Content? {
        return contentRepository.findById(contentId).orElse(null)
    }

    /**
     * Gets content by slug and type.
     *
     * @param slug URL-safe identifier for the content
     * @param contentType Type of content
     * @return Content if found, null otherwise
     */
    fun getContentBySlug(
        slug: String,
        contentType: ContentType
    ): Content? {
        return contentRepository.findBySlugAndContentType(slug, contentType)
    }
}
