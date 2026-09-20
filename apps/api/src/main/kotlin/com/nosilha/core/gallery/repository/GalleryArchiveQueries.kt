package com.nosilha.core.gallery.repository

import com.nosilha.core.gallery.api.dto.GalleryFacetsDto
import com.nosilha.core.gallery.domain.ArchiveFilter
import com.nosilha.core.gallery.domain.GalleryMedia
import com.nosilha.core.gallery.domain.MediaType
import jakarta.persistence.EntityManager
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Repository
import java.math.BigDecimal
import java.util.UUID

/**
 * SQL fragments that define the public archive (spec 034 FR-018, FR-020, FR-021).
 *
 * Every count and list the archive screens show is built from these, so a chip count,
 * a list total and a sequence total can never disagree about what a record is.
 */
object ArchiveSql {
    /** A record the public archive shows. Heroes are never archive records. */
    const val ARCHIVE = "status = 'ACTIVE' AND show_in_gallery = true AND role = 'ARCHIVE'"

    /** A photograph: an upload. */
    const val PHOTOGRAPH = "media_source = 'USER_UPLOAD'"

    /** A film: an external video. */
    const val FILM = "(media_source = 'EXTERNAL' AND media_type = 'VIDEO')"

    /** Has a place: both coordinates recorded. */
    const val LOCATED = "(latitude IS NOT NULL AND longitude IS NOT NULL)"

    /** An upload with no place. Films never carry coordinates, so they are not "missing" one. */
    const val UNLOCATED_UPLOAD = "(media_source = 'USER_UPLOAD' AND (latitude IS NULL OR longitude IS NULL))"

    /** Neither a date taken nor an approximate date. */
    const val UNDATED = "(date_taken IS NULL AND NULLIF(TRIM(approximate_date), '') IS NULL)"

    /**
     * No credit, or the credit "not known". An upload's credit is its photographer; a
     * film's is its author.
     */
    const val UNCREDITED = "(COALESCE(LOWER(TRIM(COALESCE(photographer_credit, author))), '') IN ('', 'not known'))"

    /** Legacy `hasGeo=true`: uploads with both coordinates. */
    const val GEO_UPLOAD = "(media_source = 'USER_UPLOAD' AND latitude IS NOT NULL AND longitude IS NOT NULL)"

    /** Best year for a record: date taken, then the first four digits of the approximate date, then creation. */
    const val YEAR =
        "COALESCE(EXTRACT(YEAR FROM date_taken AT TIME ZONE 'UTC'), " +
            "CAST(SUBSTRING(approximate_date FROM '(\\d{4})') AS INTEGER), " +
            "EXTRACT(YEAR FROM created_at AT TIME ZONE 'UTC'))"
}

/**
 * Native queries over the archive, built from [ArchiveSql]. Filters, totals, proximity
 * and ordering are all evaluated by the database, never over a loaded page.
 */
@Repository
class GalleryArchiveQueries(
    private val entityManager: EntityManager,
) {
    /** One page of the archive list, with its total counted by the same predicate. */
    fun findArchive(
        filter: ArchiveFilter,
        pageable: Pageable,
    ): Page<GalleryMedia> {
        val (where, params) = whereClause(filter)
        val order =
            if (filter.query != null) {
                "ts_rank(search_vector, plainto_tsquery('portuguese', :query)) DESC, display_order ASC, id ASC"
            } else {
                "display_order ASC, id ASC"
            }

        val select = entityManager.createNativeQuery(
            "SELECT * FROM gallery_media WHERE $where ORDER BY $order",
            GalleryMedia::class.java,
        )
        params.forEach { (name, value) -> select.setParameter(name, value) }
        select.firstResult = pageable.offset.toInt()
        select.maxResults = pageable.pageSize

        val count = entityManager.createNativeQuery("SELECT COUNT(*) FROM gallery_media WHERE $where")
        params.forEach { (name, value) -> count.setParameter(name, value) }

        val content = select.resultList.map { it as GalleryMedia }
        val total = (count.singleResult as Number).toLong()
        return PageImpl(content, pageable, total)
    }

    /** Whole-archive counts in one round trip. */
    fun countFacets(): GalleryFacetsDto {
        val row = entityManager
            .createNativeQuery(
                """
                SELECT COUNT(*),
                       COUNT(*) FILTER (WHERE ${ArchiveSql.PHOTOGRAPH}),
                       COUNT(*) FILTER (WHERE ${ArchiveSql.FILM}),
                       COUNT(*) FILTER (WHERE ${ArchiveSql.LOCATED}),
                       COUNT(*) FILTER (WHERE ${ArchiveSql.UNLOCATED_UPLOAD}),
                       COUNT(*) FILTER (WHERE ${ArchiveSql.UNDATED}),
                       COUNT(*) FILTER (WHERE ${ArchiveSql.UNCREDITED})
                FROM gallery_media
                WHERE ${ArchiveSql.ARCHIVE}
                """.trimIndent(),
            ).singleResult as Array<*>

        fun at(index: Int) = (row[index] as Number).toLong()
        return GalleryFacetsDto(
            total = at(0),
            photographs = at(1),
            films = at(2),
            withPlace = at(3),
            withoutPlace = at(4),
            withoutDate = at(5),
            uncredited = at(6),
        )
    }

    /** Coordinates of every located archive record linked to no directory entry. */
    fun findLocatedUnplacedCoordinates(): List<Pair<BigDecimal, BigDecimal>> =
        entityManager
            .createNativeQuery(
                "SELECT latitude, longitude FROM gallery_media " +
                    "WHERE ${ArchiveSql.ARCHIVE} AND ${ArchiveSql.LOCATED} AND entry_id IS NULL",
            ).resultList
            .map { row ->
                row as Array<*>
                (row[0] as BigDecimal) to (row[1] as BigDecimal)
            }

    /** Ids of located archive records in sequence order: when taken (or added), then id. */
    fun findLocatedArchiveIdsInSequence(): List<UUID> =
        entityManager
            .createNativeQuery(
                "SELECT id FROM gallery_media WHERE ${ArchiveSql.ARCHIVE} AND ${ArchiveSql.LOCATED} " +
                    "ORDER BY COALESCE(date_taken, created_at), id",
            ).resultList
            .map { it as UUID }

    private fun whereClause(filter: ArchiveFilter): Pair<String, Map<String, Any>> {
        val clauses = mutableListOf(ArchiveSql.ARCHIVE)
        val params = mutableMapOf<String, Any>()

        filter.category?.let {
            clauses += "category = :category"
            params["category"] = it
        }
        filter.decade?.let {
            clauses += "${ArchiveSql.YEAR} BETWEEN :yearFrom AND :yearTo"
            params["yearFrom"] = it.first
            params["yearTo"] = it.last
        }
        filter.query?.let {
            clauses += "search_vector @@ plainto_tsquery('portuguese', :query)"
            params["query"] = it
        }
        if (filter.hasGeo == true) clauses += ArchiveSql.GEO_UPLOAD
        when (filter.hasPlace) {
            true -> clauses += ArchiveSql.LOCATED
            false -> clauses += ArchiveSql.UNLOCATED_UPLOAD
            null -> Unit
        }
        when (filter.hasDate) {
            true -> clauses += "NOT ${ArchiveSql.UNDATED}"
            false -> clauses += ArchiveSql.UNDATED
            null -> Unit
        }
        when (filter.mediaType) {
            MediaType.IMAGE -> clauses += ArchiveSql.PHOTOGRAPH
            MediaType.VIDEO -> clauses += ArchiveSql.FILM
            MediaType.AUDIO -> throw IllegalArgumentException("mediaType must be IMAGE or VIDEO")
            null -> Unit
        }
        filter.near?.let {
            clauses += "latitude BETWEEN :minLat AND :maxLat AND longitude BETWEEN :minLng AND :maxLng"
            params["minLat"] = it.minLat
            params["maxLat"] = it.maxLat
            params["minLng"] = it.minLng
            params["maxLng"] = it.maxLng
        }
        if (filter.unplaced == true) clauses += "entry_id IS NULL"

        return clauses.joinToString(" AND ") to params
    }
}
