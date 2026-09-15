package com.nosilha.core.gallery.services

import com.nosilha.core.gallery.api.GeoPoint
import com.nosilha.core.gallery.api.MediaQueryService
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.gallery.domain.MediaRole
import com.nosilha.core.gallery.domain.PhotoProximityService
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional(readOnly = true)
class MediaQueryServiceImpl(
    private val mediaRepository: GalleryMediaRepository,
    private val photoProximityService: PhotoProximityService,
) : MediaQueryService {
    override fun countByStatus(status: GalleryMediaStatus): Long = mediaRepository.countByStatus(status)

    override fun countActiveMediaByEntryIds(entryIds: Collection<UUID>): Map<UUID, Long> {
        if (entryIds.isEmpty()) return emptyMap()
        return mediaRepository
            .countByEntryIdInAndStatusAndRoleGroupByEntryId(entryIds, GalleryMediaStatus.ACTIVE, MediaRole.ARCHIVE)
            .associate { row -> row[0] as UUID to (row[1] as Number).toLong() }
    }

    override fun countUnplacedNear(points: Map<UUID, GeoPoint>): Map<UUID, Int> = photoProximityService.countUnplacedNear(points)
}
