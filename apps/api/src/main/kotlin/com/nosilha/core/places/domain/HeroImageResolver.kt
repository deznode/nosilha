package com.nosilha.core.places.domain

import com.nosilha.core.gallery.api.HeroMediaRef
import com.nosilha.core.gallery.api.MediaQueryService
import org.springframework.stereotype.Component
import java.util.UUID

/**
 * Resolves directory entries' hero images from the gallery module (spec 034 FR-023, ADR-001).
 *
 * <p>An entry stores no image. Every reader asks here once for the whole set it is about to map
 * and passes each hero into [toDto]; resolving entry by entry would query once per row.</p>
 */
@Component
class HeroImageResolver(
    private val mediaQueryService: MediaQueryService,
) {
    /**
     * Heroes of [entries], keyed by entry id, omitting entries without one.
     *
     * @param forModeration Also resolve heroes awaiting review or flagged, for admin views
     */
    fun resolve(
        entries: Collection<DirectoryEntry>,
        forModeration: Boolean = false,
    ): Map<UUID, HeroMediaRef> = mediaQueryService.findHeroMedia(entries.mapNotNull { it.id }, forModeration)

    /** Public hero image URLs of [entries], for callers outside places that need only the image. */
    fun heroUrls(entries: Collection<DirectoryEntry>): Map<UUID, String> = resolve(entries).mapValues { it.value.url }
}
