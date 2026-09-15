package com.nosilha.core.shared.api

import java.time.Instant
import java.util.*

/**
 * DTO for a Town entity representing geographic/administrative information
 * about towns and villages on Brava Island.
 *
 * Towns are separate from DirectoryEntry entities as they represent geographic
 * containers rather than visitable businesses/attractions.
 */
data class TownDto(
    val id: UUID,
    val name: String,
    val slug: String,
    val description: String,
    val latitude: Double,
    val longitude: Double,
    val population: String?,
    val elevation: String?,
    val founded: String?,
    val highlights: List<String>,
    val createdAt: Instant,
    val updatedAt: Instant,
)

/**
 * How much the archive holds about a settlement.
 *
 * Documentation state, not a category — derived on read from live counts. Spec 033
 * FR-005.
 */
enum class SettlementStatus {
    /** Has at least one record, and at least one of those records has a photograph. */
    DOCUMENTED,

    /** Has records, but none of them carries a photograph. */
    PARTIAL,

    /** Name, coordinates and description only. Nothing has been recorded here. */
    NAME_ONLY,
}

/**
 * A settlement with its derived documentation status, for the settlements index and the
 * map's Settlements mode.
 *
 * Counts are live aggregates so the filter-chip totals can never drift from the cards
 * they describe. Coordinates and description let the map pin and describe every
 * settlement from this one response (spec 033 FR-012).
 */
data class TownStatusDto(
    val id: UUID?,
    val slug: String,
    val name: String,
    val description: String,
    val latitude: Double,
    val longitude: Double,
    val entryCount: Long,
    val hasPhotograph: Boolean,
    val status: SettlementStatus,
    /** As recorded on the settlement, e.g. "271 (2010 census)"; null when not recorded. */
    val population: String?,
    /** As recorded on the settlement, e.g. "642m"; null when not recorded. */
    val elevation: String?,
    /**
     * Active gallery archive photographs linked to this settlement's records; a record's
     * hero is not counted (spec 034 FR-017).
     */
    val photographCount: Long,
    /**
     * Located archive photographs linked to no record, inside this settlement's
     * proximity box: the records `/photographs?region=<slug>` lists (spec 034 FR-020).
     */
    val unconfirmedPhotographCount: Int,
)
