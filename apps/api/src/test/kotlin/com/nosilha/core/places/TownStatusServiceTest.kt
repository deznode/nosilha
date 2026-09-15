package com.nosilha.core.places

import com.nosilha.core.gallery.api.GeoPoint
import com.nosilha.core.gallery.api.MediaQueryService
import com.nosilha.core.places.domain.Town
import com.nosilha.core.places.domain.TownStatusService
import com.nosilha.core.places.repository.DirectoryEntryRepository
import com.nosilha.core.places.repository.TownRepository
import com.nosilha.core.shared.api.SettlementStatus
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.check
import org.mockito.kotlin.mock
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.verifyNoMoreInteractions
import org.mockito.kotlin.whenever
import java.util.UUID

/**
 * Unit tests for the settlement aggregates (spec 034, FR-017, T-10).
 *
 * <p>The integration test proves the numbers against real data. This one proves the
 * shape of the work: the island is answered in a fixed number of calls, never one per
 * settlement.</p>
 */
@DisplayName("TownStatusService")
class TownStatusServiceTest {
    private val townRepository = mock<TownRepository>()
    private val directoryEntryRepository = mock<DirectoryEntryRepository>()
    private val mediaQueryService = mock<MediaQueryService>()
    private val service = TownStatusService(townRepository, directoryEntryRepository, mediaQueryService)

    private fun town(
        slug: String,
        population: String? = null,
        elevation: String? = null,
    ): Town =
        Town().apply {
            id = UUID.randomUUID()
            name = slug
            this.slug = slug
            description = "A settlement."
            latitude = 14.85
            longitude = -24.7
            this.population = population
            this.elevation = elevation
        }

    @Test
    fun `answers the whole island in one entry query and two gallery calls`() {
        val documented = town("documented")
        val partial = town("partial")
        val nameOnly = town("name-only")
        val photographed = UUID.randomUUID()
        val alsoPhotographed = UUID.randomUUID()
        val plain = UUID.randomUUID()

        whenever(townRepository.findAllByOrderByNameAsc()).thenReturn(listOf(documented, partial, nameOnly))
        whenever(directoryEntryRepository.countByTownIdGroupByTownIdPublished()).thenReturn(
            listOf(arrayOf<Any>(documented.id!!, 2L, 0L), arrayOf<Any>(partial.id!!, 1L, 0L)),
        )
        whenever(directoryEntryRepository.findPublishedEntryIdsWithTownId()).thenReturn(
            listOf(
                arrayOf<Any>(photographed, documented.id!!),
                arrayOf<Any>(alsoPhotographed, documented.id!!),
                arrayOf<Any>(plain, partial.id!!),
            ),
        )
        whenever(mediaQueryService.countActiveMediaByEntryIds(any())).thenReturn(
            mapOf(photographed to 2L, alsoPhotographed to 1L),
        )
        whenever(mediaQueryService.countUnplacedNear(any())).thenReturn(mapOf(partial.id!! to 2))

        val result = service.getAllWithStatus().associateBy { it.slug }

        verify(directoryEntryRepository, times(1)).findPublishedEntryIdsWithTownId()
        verify(mediaQueryService, times(1)).countActiveMediaByEntryIds(any())
        // Every settlement's point goes to the gallery in the one call.
        verify(mediaQueryService, times(1)).countUnplacedNear(
            check { points ->
                assertThat(points.keys).containsExactlyInAnyOrder(documented.id, partial.id, nameOnly.id)
                assertThat(points.getValue(partial.id!!)).isEqualTo(GeoPoint(14.85, -24.7))
            },
        )
        verifyNoMoreInteractions(mediaQueryService)

        assertThat(result.getValue("partial").unconfirmedPhotographCount).isEqualTo(2)
        assertThat(result.getValue("documented").unconfirmedPhotographCount).isZero()

        assertThat(result.getValue("documented").photographCount).isEqualTo(3)
        assertThat(result.getValue("documented").status).isEqualTo(SettlementStatus.DOCUMENTED)
        assertThat(result.getValue("partial").photographCount).isZero()
        assertThat(result.getValue("partial").status).isEqualTo(SettlementStatus.PARTIAL)
        assertThat(result.getValue("name-only").photographCount).isZero()
        assertThat(result.getValue("name-only").status).isEqualTo(SettlementStatus.NAME_ONLY)
    }

    @Test
    fun `a record's own image still documents its settlement`() {
        // Until heroes move into the gallery (spec 034 Wave 3), an entry image_url is
        // a photograph for status purposes, though not a gallery photograph to count.
        val town = town("furna")
        val entry = UUID.randomUUID()

        whenever(townRepository.findAllByOrderByNameAsc()).thenReturn(listOf(town))
        whenever(directoryEntryRepository.countByTownIdGroupByTownIdPublished())
            .thenReturn(listOf(arrayOf<Any>(town.id!!, 1L, 1L)))
        whenever(directoryEntryRepository.findPublishedEntryIdsWithTownId())
            .thenReturn(listOf(arrayOf<Any>(entry, town.id!!)))
        whenever(mediaQueryService.countActiveMediaByEntryIds(any())).thenReturn(emptyMap())

        val status = service.getAllWithStatus().single()

        assertThat(status.status).isEqualTo(SettlementStatus.DOCUMENTED)
        assertThat(status.hasPhotograph).isTrue()
        assertThat(status.photographCount).isZero()
    }

    @Test
    fun `carries population and elevation as recorded, or null`() {
        val recorded = town("nossa-senhora-do-monte", population = "271 (2010 census)", elevation = "642m")
        val unrecorded = town("minhoto")

        whenever(townRepository.findAllByOrderByNameAsc()).thenReturn(listOf(recorded, unrecorded))
        whenever(directoryEntryRepository.countByTownIdGroupByTownIdPublished()).thenReturn(emptyList())
        whenever(directoryEntryRepository.findPublishedEntryIdsWithTownId()).thenReturn(emptyList())
        whenever(mediaQueryService.countActiveMediaByEntryIds(any())).thenReturn(emptyMap())

        val result = service.getAllWithStatus().associateBy { it.slug }

        assertThat(result.getValue("nossa-senhora-do-monte").population).isEqualTo("271 (2010 census)")
        assertThat(result.getValue("nossa-senhora-do-monte").elevation).isEqualTo("642m")
        assertThat(result.getValue("minhoto").population).isNull()
        assertThat(result.getValue("minhoto").elevation).isNull()
    }
}
