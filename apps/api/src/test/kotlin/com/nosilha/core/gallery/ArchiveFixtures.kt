package com.nosilha.core.gallery

import org.springframework.jdbc.core.JdbcTemplate
import java.math.BigDecimal
import java.sql.Timestamp
import java.time.Instant
import java.util.UUID

/**
 * Inserts archive records with SQL for tests that pin what the archive counts, lists and
 * orders (spec 034 T-11, T-12, T-13).
 *
 * Enum columns take literals: bound strings are typed `varchar`, which PostgreSQL will
 * not cast to an enum.
 */
class ArchiveFixtures(
    private val jdbcTemplate: JdbcTemplate,
) {
    private val entries = mutableListOf<UUID>()

    /** A published directory entry to link records to. Removed by [clear]. */
    fun entry(): UUID {
        val id = UUID.randomUUID()
        jdbcTemplate.update(
            """
            INSERT INTO directory_entries (id, slug, name, description, category, town, latitude, longitude, status)
            VALUES (?, ?, 'Archive Probe', 'Probe row.', 'Heritage', 'Nova Sintra', 14.87, -24.69, 'PUBLISHED')
            """.trimIndent(),
            id,
            "archive-probe-$id",
        )
        entries += id
        return id
    }

    @Suppress("LongParameterList")
    fun media(
        source: String = "USER_UPLOAD",
        status: String = "ACTIVE",
        role: String = "ARCHIVE",
        showInGallery: Boolean = true,
        latitude: String? = null,
        longitude: String? = null,
        dateTaken: String? = null,
        createdAt: String? = null,
        approximateDate: String? = null,
        photographerCredit: String? = null,
        author: String? = null,
        mediaType: String? = null,
        category: String? = null,
        entryId: UUID? = null,
        displayOrder: Int = 0,
    ): UUID {
        require(source in setOf("USER_UPLOAD", "EXTERNAL")) { "unexpected source literal: $source" }
        require(status in setOf("ACTIVE", "PENDING_REVIEW")) { "unexpected status literal: $status" }
        require(role in setOf("ARCHIVE", "HERO")) { "unexpected role literal: $role" }
        val id = UUID.randomUUID()
        // Every external record has a platform; the entity maps it as non-null
        val platform = if (source == "EXTERNAL") "YOUTUBE" else null
        jdbcTemplate.update(
            """
            INSERT INTO gallery_media (
                id, media_source, status, role, show_in_gallery, latitude, longitude, date_taken, created_at,
                approximate_date, photographer_credit, author, media_type, platform, category, entry_id,
                display_order, title
            ) VALUES (
                ?, '$source', '$status', '$role', ?, ?, ?, ?, COALESCE(CAST(? AS TIMESTAMPTZ), NOW()),
                ?, ?, ?, ?, ?, ?, ?, ?, 'Fixture'
            )
            """.trimIndent(),
            id,
            showInGallery,
            latitude?.let { BigDecimal(it) },
            longitude?.let { BigDecimal(it) },
            dateTaken?.let { Timestamp.from(Instant.parse(it)) },
            createdAt?.let { Timestamp.from(Instant.parse(it)) },
            approximateDate,
            photographerCredit,
            author,
            mediaType,
            platform,
            category,
            entryId,
            displayOrder,
        )
        return id
    }

    /** Empties the archive so a test counts only its own records. */
    fun clearMedia() {
        jdbcTemplate.update("DELETE FROM gallery_media")
    }

    fun clear() {
        clearMedia()
        entries.forEach { jdbcTemplate.update("DELETE FROM directory_entries WHERE id = ?", it) }
        entries.clear()
    }
}
