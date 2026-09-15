package com.nosilha.core.places.domain

import com.nosilha.core.gallery.api.GeoPoint
import com.nosilha.core.gallery.api.MediaQueryService
import com.nosilha.core.places.repository.DirectoryEntryRepository
import com.nosilha.core.places.repository.TownRepository
import com.nosilha.core.shared.api.SettlementStatus
import com.nosilha.core.shared.api.TownStatusDto
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * Derives documentation status and aggregates for each settlement.
 *
 * Spec 033-archive-redesign, FR-005; spec 034-media-map-redesign, FR-017. Status is a
 * *derived* view of how much the archive holds about a place, not a stored category —
 * there is no `status` column on `towns` and there should not be one. Thirteen of the
 * island's settlements have nothing recorded, and the redesign states that plainly
 * rather than padding it out.
 *
 * <p>Photographs are counted by the gallery module through [MediaQueryService] rather
 * than reimplemented here: whether a photograph counts depends on moderation state,
 * which is gallery's rule to define, and an entry's hero lives there too (spec 034 FR-023).</p>
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
     * shown as fact, including the filter-chip counts and standfirsts this feeds. The
     * whole island is answered in a fixed number of queries however many settlements
     * there are.
     */
    fun getAllWithStatus(): List<TownStatusDto> {
        val towns = townRepository.findAllByOrderByNameAsc()

        // (townId, entryCount) in one grouped query.
        val entryCounts: Map<UUID, Long> =
            directoryEntryRepository
                .countByTownIdGroupByTownIdPublished()
                .mapNotNull { row ->
                    val townId = row[0] as? UUID ?: return@mapNotNull null
                    townId to (row[1] as Number).toLong()
                }.toMap()

        // Every published entry's settlement, then every entry's photograph count and hero in
        // one gallery call each.
        val townIdByEntryId: Map<UUID, UUID> =
            directoryEntryRepository
                .findPublishedEntryIdsWithTownId()
                .associate { row -> row[0] as UUID to row[1] as UUID }
        val photographsByTown: Map<UUID, Long> =
            mediaQueryService
                .countActiveMediaByEntryIds(townIdByEntryId.keys)
                .entries
                .mapNotNull { (entryId, count) -> townIdByEntryId[entryId]?.let { it to count } }
                .groupBy({ it.first }, { it.second })
                .mapValues { (_, counts) -> counts.sum() }
        val townsWithHero: Set<UUID> =
            mediaQueryService
                .findHeroMedia(townIdByEntryId.keys)
                .keys
                .mapNotNull { townIdByEntryId[it] }
                .toSet()

        // Photographs near each settlement that no record claims yet, in one gallery call.
        val unconfirmedByTown: Map<UUID, Int> =
            mediaQueryService.countUnplacedNear(
                towns
                    .mapNotNull { town -> town.id?.let { it to GeoPoint(town.latitude, town.longitude) } }
                    .toMap(),
            )

        return towns.map { town ->
            val townId = town.id
            val entryCount = entryCounts[townId] ?: 0L
            val photographCount = photographsByTown[townId] ?: 0L
            // A record's hero documents it, but heads the record rather than being a photograph
            // of the settlement, so it is not counted (decided 2026-09-15).
            val hasPhotograph = (townId != null && townId in townsWithHero) || photographCount > 0

            TownStatusDto(
                id = townId,
                slug = town.slug,
                name = town.name,
                description = town.description,
                latitude = town.latitude,
                longitude = town.longitude,
                entryCount = entryCount,
                hasPhotograph = hasPhotograph,
                status = deriveStatus(entryCount, hasPhotograph),
                population = town.population,
                elevation = town.elevation,
                photographCount = photographCount,
                unconfirmedPhotographCount = unconfirmedByTown[townId] ?: 0,
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
