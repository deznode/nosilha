package com.nosilha.core.gallery.services

import com.nosilha.core.gallery.api.GeoPoint
import com.nosilha.core.gallery.api.HeroMediaRef
import com.nosilha.core.gallery.api.MediaQueryService
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.gallery.domain.MediaRole
import com.nosilha.core.gallery.domain.PhotoProximityService
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/** A hero the public sees has been approved. */
private val PUBLIC_HERO_STATUSES = listOf(GalleryMediaStatus.ACTIVE)

/** A moderator also sees a hero awaiting review, such as a public submission's image. */
private val MODERATION_HERO_STATUSES = listOf(GalleryMediaStatus.ACTIVE, GalleryMediaStatus.PENDING_REVIEW)

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

    override fun findHeroMedia(
        entryIds: Collection<UUID>,
        forModeration: Boolean,
    ): Map<UUID, HeroMediaRef> {
        if (entryIds.isEmpty()) return emptyMap()
        val statuses = if (forModeration) MODERATION_HERO_STATUSES else PUBLIC_HERO_STATUSES
        return mediaRepository
            .findByEntryIdInAndRoleAndStatusIn(entryIds, MediaRole.HERO, statuses)
            // An identifiable person without confirmed provenance stays out of public hero slots (FR-022)
            .filter { forModeration || !it.identifiablePerson }
            .mapNotNull { hero ->
                val entryId = hero.entryId ?: return@mapNotNull null
                val url = hero.publicUrl?.takeIf { it.isNotBlank() } ?: return@mapNotNull null
                entryId to
                    HeroMediaRef(
                        mediaId = hero.id!!,
                        url = url,
                        photographerCredit = hero.photographerCredit,
                        archiveSource = hero.archiveSource,
                    )
            }.toMap()
    }
}
