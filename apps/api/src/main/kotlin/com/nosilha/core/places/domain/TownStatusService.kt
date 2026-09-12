package com.nosilha.core.places.domain

import com.nosilha.core.gallery.api.MediaQueryService
import com.nosilha.core.places.repository.DirectoryEntryRepository
import com.nosilha.core.places.repository.TownRepository
import com.nosilha.core.shared.api.SettlementStatus
import com.nosilha.core.shared.api.TownStatusDto
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * Derives documentation status for each settlement.
 *
 * Spec 033-archive-redesign, FR-005. Status is a *derived* view of how much the
 * archive holds about a place, not a stored category — there is no `status` column on
 * `towns` and there should not be one. Thirteen of the island's settlements have
 * nothing recorded, and the redesign states that plainly rather than padding it out.
 *
 * <p>"Has a photograph" is deliberately answered by the gallery module through
 * [MediaQueryService] rather than reimplemented here: whether a photograph counts
 * depends on moderation state, which is gallery's rule to define.</p>
 */
@Service
@Transactional(readOnly = true)
class TownStatusService(
    private val townRepository: TownRepository,
    private val directoryEntryRepository: DirectoryEntryRepository,
    private val mediaQueryService: MediaQueryService,
) {
    /**
     * Returns every settlement with its derived documentation status and counts.
     *
     * Counts are live aggregates. The redesign forbids literals anywhere a number is
     * shown as fact, including the filter-chip counts this feeds.
     */
    fun getAllWithStatus(): List<TownStatusDto> {
        val towns = townRepository.findAllByOrderByNameAsc()

        // (townId, entryCount, photographCount) — entries carrying their own image.
        val aggregates: Map<UUID, Pair<Long, Long>> =
            directoryEntryRepository
                .countByTownIdGroupByTownIdPublished()
                .mapNotNull { row ->
                    val townId = row[0] as? UUID ?: return@mapNotNull null
                    townId to Pair((row[1] as Number).toLong(), (row[2] as Number).toLong())
                }.toMap()

        // Settlements whose entries have gallery media, asked once for the whole island
        // rather than once per settlement.
        val entryIdsByTown: Map<UUID, List<UUID>> = towns
            .mapNotNull { town -> town.id?.let { it to directoryEntryRepository.findPublishedEntryIdsByTownId(it) } }
            .toMap()
        val entryIdsWithMedia = mediaQueryService.findEntryIdsWithActiveMedia(
            entryIdsByTown.values.flatten(),
        )

        return towns.map { town ->
            val townId = town.id
            val (entryCount, entriesWithOwnImage) = aggregates[townId] ?: Pair(0L, 0L)
            val hasGalleryPhotograph = entryIdsByTown[townId].orEmpty().any { it in entryIdsWithMedia }
            val hasPhotograph = entriesWithOwnImage > 0 || hasGalleryPhotograph

            TownStatusDto(
                id = townId,
                slug = town.slug,
                name = town.name,
                entryCount = entryCount,
                hasPhotograph = hasPhotograph,
                status = deriveStatus(entryCount, hasPhotograph),
            )
        }
    }

    private fun deriveStatus(
        entryCount: Long,
        hasPhotograph: Boolean
    ): SettlementStatus =
        when {
            entryCount > 0 && hasPhotograph -> SettlementStatus.DOCUMENTED
            entryCount > 0 -> SettlementStatus.PARTIAL
            else -> SettlementStatus.NAME_ONLY
        }
}
