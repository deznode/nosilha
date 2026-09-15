package com.nosilha.core.gallery.domain

import com.nosilha.core.gallery.repository.GalleryMediaRepository
import com.nosilha.core.shared.events.EntryImageSubmittedEvent
import com.nosilha.core.shared.events.HeroImagePromotedEvent
import com.nosilha.core.shared.exception.BusinessException
import com.nosilha.core.shared.exception.ResourceNotFoundException
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.context.ApplicationEventPublisher
import org.springframework.modulith.events.ApplicationModuleListener
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

private val logger = KotlinLogging.logger {}

/** Statuses in which an entry's existing upload may serve again as its hero. */
private val REUSABLE_HERO_STATUSES = listOf(GalleryMediaStatus.ACTIVE, GalleryMediaStatus.PENDING_REVIEW)

/**
 * Owns directory entries' hero images (spec 034 FR-023, ADR-001).
 *
 * <p>A hero is an upload row with role [MediaRole.HERO], at most one per entry. Entry writes
 * reach this service as [EntryImageSubmittedEvent]; admins promote an archive photograph or
 * remove a hero directly. Replacing or removing a hero demotes the old row to an archive record
 * rather than deleting it, so its credit survives and setting the same image again restores it.</p>
 *
 * <p>A row is demoted with an immediate flush before another is promoted. The unique index
 * `uq_gallery_media_hero_per_entry` is checked per statement, and Hibernate would otherwise be
 * free to write the new hero first.</p>
 */
@Service
class HeroMediaService(
    private val repository: GalleryMediaRepository,
    private val eventPublisher: ApplicationEventPublisher,
) {
    /**
     * Makes an entry write's image the entry's hero, or removes the hero when the image was cleared.
     *
     * <p>A published entry's image is live at once; an unpublished entry's, such as a public
     * submission's, waits for review in the moderation queue.</p>
     */
    @ApplicationModuleListener
    fun onEntryImageSubmitted(event: EntryImageSubmittedEvent) {
        val status = if (event.entryPublished) GalleryMediaStatus.ACTIVE else GalleryMediaStatus.PENDING_REVIEW
        assignHero(event.entryId, event.imageUrl, status)
    }

    /**
     * Sets the hero of [entryId] to the image at [imageUrl], or removes it when [imageUrl] is blank.
     *
     * @param status Status of a hero row created here. An existing row keeps its own, except
     *   that an ACTIVE write approves a hero still awaiting review.
     */
    @Transactional
    fun assignHero(
        entryId: UUID,
        imageUrl: String?,
        status: GalleryMediaStatus,
    ) {
        val url = imageUrl?.trim()?.takeIf { it.isNotEmpty() }
        val current = currentHero(entryId)

        if (url == null) {
            current?.let { demote(it) }
            logger.info { "Entry $entryId image cleared; hero ${current?.id} returned to the archive" }
            return
        }

        if (current != null && current.publicUrl == url) {
            if (status == GalleryMediaStatus.ACTIVE && current.status == GalleryMediaStatus.PENDING_REVIEW) {
                current.status = GalleryMediaStatus.ACTIVE
                repository.save(current)
            }
            return
        }

        current?.let { demote(it) }
        val hero =
            repository.findUploadsByEntryIdAndPublicUrl(entryId, url, REUSABLE_HERO_STATUSES).firstOrNull()
                ?: UserUploadedMedia().apply {
                    this.entryId = entryId
                    publicUrl = url
                    showInGallery = false
                    this.status = status
                }
        hero.role = MediaRole.HERO
        val saved = repository.save(hero)
        logger.info { "Entry $entryId hero is now media ${saved.id}" }
    }

    /**
     * Makes an approved upload linked to an entry that entry's hero, demoting any previous hero
     * in the same transaction.
     *
     * @throws ResourceNotFoundException if the media does not exist
     * @throws BusinessException if the media is not an active, linked upload with a public URL
     */
    @Transactional
    fun promote(
        mediaId: UUID,
        adminId: UUID,
    ) {
        val media = repository.findById(mediaId).orElseThrow { ResourceNotFoundException("Media not found: $mediaId") }

        if (media !is UserUploadedMedia) {
            throw BusinessException("Only user uploads can be promoted to hero image")
        }
        if (media.status != GalleryMediaStatus.ACTIVE) {
            throw BusinessException("Media must be ACTIVE to promote as hero image")
        }
        val entryId = media.entryId ?: throw BusinessException("Media must be linked to a directory entry")
        if (media.publicUrl.isNullOrBlank()) {
            throw BusinessException("Media must have a public URL")
        }
        if (media.role == MediaRole.HERO) return

        currentHero(entryId)?.let { demote(it) }
        media.role = MediaRole.HERO
        repository.save(media)

        eventPublisher.publishEvent(HeroImagePromotedEvent(entryId = entryId, mediaId = mediaId, promotedBy = adminId))
        logger.info { "Admin $adminId promoted media $mediaId to hero of entry $entryId" }
    }

    /**
     * Removes a hero: the row returns to the archive and its entry has no hero.
     *
     * @throws ResourceNotFoundException if the media does not exist
     * @throws BusinessException if the media is not a hero
     */
    @Transactional
    fun removeHero(
        mediaId: UUID,
        adminId: UUID,
    ) {
        val media = repository.findById(mediaId).orElseThrow { ResourceNotFoundException("Media not found: $mediaId") }
        if (media.role != MediaRole.HERO) {
            throw BusinessException("Media $mediaId is not a hero image")
        }
        demote(media)
        logger.info { "Admin $adminId removed hero media $mediaId" }
    }

    private fun currentHero(entryId: UUID): UserUploadedMedia? =
        repository.findUploadsByEntryIdAndRole(entryId, MediaRole.HERO).firstOrNull()

    private fun demote(hero: GalleryMedia) {
        hero.role = MediaRole.ARCHIVE
        repository.saveAndFlush(hero)
    }
}
