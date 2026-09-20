package com.nosilha.core.gallery.domain

import com.nosilha.core.gallery.api.dto.PhotoSequenceDto
import com.nosilha.core.gallery.repository.GalleryArchiveQueries
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import com.nosilha.core.shared.exception.ResourceNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * Previous and next among located archive photographs, wrapping at both ends
 * (spec 034 FR-021). Its `total` counts the records the "with a place" facet counts.
 */
@Service
class PhotoSequenceService(
    private val archiveQueries: GalleryArchiveQueries,
    private val repository: GalleryMediaRepository,
) {
    /**
     * @throws ResourceNotFoundException when no publicly visible record has this id,
     *   the same rule as `GET /api/v1/gallery/{id}`
     */
    @Transactional(readOnly = true)
    fun sequenceOf(id: UUID): PhotoSequenceDto {
        val media = repository.findById(id).orElse(null)
        if (media == null || media.status != GalleryMediaStatus.ACTIVE) {
            throw ResourceNotFoundException("Gallery media not found: $id")
        }

        val ids = archiveQueries.findLocatedArchiveIdsInSequence()
        val index = ids.indexOf(id)
        if (index < 0) {
            return PhotoSequenceDto(id = id, position = null, total = ids.size, previousId = null, nextId = null)
        }

        return PhotoSequenceDto(
            id = id,
            position = index + 1,
            total = ids.size,
            previousId = ids[(index - 1 + ids.size) % ids.size],
            nextId = ids[(index + 1) % ids.size],
        )
    }
}
