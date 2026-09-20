package com.nosilha.core.gallery.domain

import com.nosilha.core.gallery.api.dto.GalleryFacetsDto
import com.nosilha.core.gallery.repository.GalleryArchiveQueries
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Archive counts, answered by one query over the list's own predicate (spec 034 FR-018).
 *
 * Counting in the database removes the 26-versus-24 drift at its source: no screen
 * counts the records it happens to have loaded (FR-025).
 */
@Service
class GalleryFacetsService(
    private val archiveQueries: GalleryArchiveQueries,
) {
    @Transactional(readOnly = true)
    fun facets(): GalleryFacetsDto = archiveQueries.countFacets()
}
