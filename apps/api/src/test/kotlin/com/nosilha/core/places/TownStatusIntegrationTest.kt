package com.nosilha.core.places

import com.jayway.jsonpath.JsonPath
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

/**
 * Integration tests for the settlements index endpoint (spec 033 FR-005, spec 034 FR-017).
 *
 * Runs against the real seed data so the counts asserted here are the counts the
 * settlements index will actually render — the redesign forbids literals anywhere a
 * number is shown as fact, and a test that stubs the aggregate would not catch a
 * regression in it.
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("GET /api/v1/towns/status-summary")
class TownStatusIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Test
    fun `is publicly readable and returns every settlement`() {
        mockMvc
            .perform(get("/api/v1/towns/status-summary"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data").isArray)
            .andExpect(jsonPath("$.data.length()").value(25))
    }

    @Test
    fun `derives a status for every settlement`() {
        mockMvc
            .perform(get("/api/v1/towns/status-summary"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data[*].status").isArray)
            .andExpect(
                jsonPath("$.data[?(@.status != 'DOCUMENTED' && @.status != 'PARTIAL' && @.status != 'NAME_ONLY')]")
                    .isEmpty,
            )
    }

    @Test
    fun `settlements with no records report NAME_ONLY and a zero count`() {
        // The nine promoted settlements have nothing recorded in them. The archive says
        // so rather than hiding it, and the status must reflect that honestly.
        mockMvc
            .perform(get("/api/v1/towns/status-summary"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data[?(@.slug == 'minhoto')].status").value("NAME_ONLY"))
            .andExpect(jsonPath("$.data[?(@.slug == 'minhoto')].entryCount").value(0))
            .andExpect(jsonPath("$.data[?(@.slug == 'minhoto')].hasPhotograph").value(false))
    }

    @Test
    fun `entry counts match the database`() {
        val expected = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*) FROM directory_entries d
            JOIN towns t ON d.town_id = t.id
            WHERE t.slug = 'nova-sintra' AND d.status = 'PUBLISHED'
            """.trimIndent(),
            Int::class.java,
        )

        mockMvc
            .perform(get("/api/v1/towns/status-summary"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data[?(@.slug == 'nova-sintra')].entryCount").value(expected))
    }

    @Test
    fun `status reflects what each settlement actually holds`() {
        // Creates its own fixtures rather than asserting on seed rows: other test classes
        // in this shared container clear directory_entries, so a seed-dependent assertion
        // would silently skip rather than run. Two settlements, three states.
        val documentedTown = townIdFor("nova-sintra")
        val partialTown = townIdFor("furna")
        val withPhoto = UUID.randomUUID()
        val withoutPhoto = UUID.randomUUID()
        val hero = UUID.randomUUID()

        try {
            insertEntry(withPhoto, "status-probe-photo", documentedTown)
            // Its hero is the record's photograph.
            insertMedia(hero, withPhoto, "ACTIVE", roleLiteral = "HERO")
            insertEntry(withoutPhoto, "status-probe-plain", partialTown)

            mockMvc
                .perform(get("/api/v1/towns/status-summary"))
                .andExpect(status().isOk)
                // Has a record with a photograph.
                .andExpect(jsonPath("$.data[?(@.slug == 'nova-sintra')].hasPhotograph").value(true))
                .andExpect(jsonPath("$.data[?(@.slug == 'nova-sintra')].status").value("DOCUMENTED"))
                // Has a record, but no photograph.
                .andExpect(jsonPath("$.data[?(@.slug == 'furna')].hasPhotograph").value(false))
                .andExpect(jsonPath("$.data[?(@.slug == 'furna')].status").value("PARTIAL"))
                // Name only -- nothing recorded. Thirteen of the island's settlements
                // are in this state, and the archive says so rather than padding it out.
                .andExpect(jsonPath("$.data[?(@.slug == 'minhoto')].status").value("NAME_ONLY"))
        } finally {
            jdbcTemplate.update("DELETE FROM gallery_media WHERE id = ?", hero)
            jdbcTemplate.update("DELETE FROM directory_entries WHERE id IN (?, ?)", withPhoto, withoutPhoto)
        }
    }

    @Test
    fun `carries each settlement's coordinates and description for the map`() {
        // The map's Settlements mode pins every settlement from this one response
        // (spec 033 FR-012), so the pin sits where the towns table says it does.
        val town = jdbcTemplate.queryForMap(
            "SELECT latitude, longitude, description FROM towns WHERE slug = 'nova-sintra'",
        )

        mockMvc
            .perform(get("/api/v1/towns/status-summary"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data[?(@.slug == 'nova-sintra')].latitude").value((town["latitude"] as Number).toDouble()))
            .andExpect(jsonPath("$.data[?(@.slug == 'nova-sintra')].longitude").value((town["longitude"] as Number).toDouble()))
            .andExpect(jsonPath("$.data[?(@.slug == 'nova-sintra')].description").value(town["description"] as String))
            .andExpect(jsonPath("$.data[?(@.latitude == null || @.longitude == null)]").isEmpty)
    }

    @Test
    fun `carries each settlement's recorded population and elevation`() {
        mockMvc
            .perform(get("/api/v1/towns/status-summary"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data[?(@.slug == 'nossa-senhora-do-monte')].population").value("271 (2010 census)"))
            .andExpect(jsonPath("$.data[?(@.slug == 'nossa-senhora-do-monte')].elevation").value("642m"))
            // A promoted settlement has nothing recorded, and says so with null.
            .andExpect(jsonPath("$.data[?(@.slug == 'minhoto')].population").value(null as Any?))
            .andExpect(jsonPath("$.data[?(@.slug == 'minhoto')].elevation").value(null as Any?))
    }

    @Test
    fun `counts active gallery photographs linked to a settlement's records`() {
        val town = townIdFor("furna")
        val entry = UUID.randomUUID()
        val media = List(3) { UUID.randomUUID() }
        val before = photographCountFor("furna")

        try {
            insertEntry(entry, "photograph-count-probe", town)
            insertMedia(media[0], entry, "ACTIVE")
            insertMedia(media[1], entry, "ACTIVE")
            // Awaiting review is not a photograph the archive shows.
            insertMedia(media[2], entry, "PENDING_REVIEW")

            assertThat(photographCountFor("furna")).isEqualTo(before + 2)
        } finally {
            media.forEach { jdbcTemplate.update("DELETE FROM gallery_media WHERE id = ?", it) }
            jdbcTemplate.update("DELETE FROM directory_entries WHERE id = ?", entry)
        }
    }

    @Test
    fun `a record's hero is not counted as a photograph of its settlement`() {
        // Decided 2026-09-15: a hero heads its record; "Photographs of <town>" lists
        // archive records, so the count does too.
        val town = townIdFor("furna")
        val entry = UUID.randomUUID()
        val hero = UUID.randomUUID()
        val archive = UUID.randomUUID()
        val before = photographCountFor("furna")

        try {
            insertEntry(entry, "hero-count-probe", town)
            insertMedia(hero, entry, "ACTIVE", roleLiteral = "HERO")
            insertMedia(archive, entry, "ACTIVE")

            assertThat(photographCountFor("furna")).isEqualTo(before + 1)
        } finally {
            listOf(hero, archive).forEach { jdbcTemplate.update("DELETE FROM gallery_media WHERE id = ?", it) }
            jdbcTemplate.update("DELETE FROM directory_entries WHERE id = ?", entry)
        }
    }

    @Test
    fun `counts unconfirmed photographs inside a settlement's proximity box`() {
        // Spec 034 T-15: two unplaced located photographs inside Nova Sintra's box and one
        // outside count two. A photograph a record already claims is not unconfirmed.
        val point = jdbcTemplate.queryForMap("SELECT latitude, longitude FROM towns WHERE slug = 'nova-sintra'")
        val lat = (point["latitude"] as Number).toDouble()
        val lng = (point["longitude"] as Number).toDouble()
        val claimingEntry = UUID.randomUUID()
        val media = List(4) { UUID.randomUUID() }
        val before = unconfirmedCountFor("nova-sintra")

        try {
            insertEntry(claimingEntry, "unconfirmed-count-probe", townIdFor("furna"))
            insertLocatedMedia(media[0], lat + 0.003, lng - 0.004, entryId = null)
            insertLocatedMedia(media[1], lat - 0.005, lng + 0.005, entryId = null)
            insertLocatedMedia(media[2], lat + 0.05, lng, entryId = null)
            insertLocatedMedia(media[3], lat, lng, entryId = claimingEntry)

            assertThat(unconfirmedCountFor("nova-sintra")).isEqualTo(before + 2)
        } finally {
            media.forEach { jdbcTemplate.update("DELETE FROM gallery_media WHERE id = ?", it) }
            jdbcTemplate.update("DELETE FROM directory_entries WHERE id = ?", claimingEntry)
        }
    }

    @Test
    fun `every settlement's status agrees with an independent derivation`() {
        // The same rule written once more in SQL: records, and a public hero or an
        // active gallery archive photograph on any of them.
        val expected = jdbcTemplate
            .queryForList(
                """
                SELECT t.slug,
                       COUNT(d.id) AS entries,
                       COUNT(h.id) + (
                           SELECT COUNT(*) FROM gallery_media m
                           JOIN directory_entries de ON m.entry_id = de.id
                           WHERE de.town_id = t.id AND de.status = 'PUBLISHED' AND m.status = 'ACTIVE'
                             AND m.role = 'ARCHIVE'
                       ) AS photographs
                FROM towns t
                LEFT JOIN directory_entries d ON d.town_id = t.id AND d.status = 'PUBLISHED'
                LEFT JOIN gallery_media h ON h.entry_id = d.id AND h.role = 'HERO' AND h.status = 'ACTIVE'
                    AND NOT h.identifiable_person AND NULLIF(h.public_url, '') IS NOT NULL
                GROUP BY t.id, t.slug
                """.trimIndent(),
            ).associate { row ->
                val entries = (row["entries"] as Number).toLong()
                val photographs = (row["photographs"] as Number).toLong()
                row["slug"] as String to when {
                    entries > 0 && photographs > 0 -> "DOCUMENTED"
                    entries > 0 -> "PARTIAL"
                    else -> "NAME_ONLY"
                }
            }

        val actual = summary().associate { it["slug"] as String to it["status"] as String }

        assertThat(actual).hasSize(25).isEqualTo(expected)
    }

    private fun summary(): List<Map<String, Any?>> {
        val body = mockMvc
            .perform(get("/api/v1/towns/status-summary"))
            .andExpect(status().isOk)
            .andReturn()
            .response
            .contentAsString
        return JsonPath.parse(body).read("$.data")
    }

    private fun photographCountFor(slug: String): Long = (summary().single { it["slug"] == slug }["photographCount"] as Number).toLong()

    private fun unconfirmedCountFor(slug: String): Int {
        val settlement = summary().single { it["slug"] == slug }
        return (settlement["unconfirmedPhotographCount"] as Number).toInt()
    }

    private fun insertMedia(
        id: UUID,
        entryId: UUID,
        statusLiteral: String,
        roleLiteral: String = "ARCHIVE",
    ) {
        require(statusLiteral in setOf("ACTIVE", "PENDING_REVIEW")) { "unexpected status literal" }
        require(roleLiteral in setOf("ARCHIVE", "HERO")) { "unexpected role literal" }
        jdbcTemplate.update(
            "INSERT INTO gallery_media (id, media_source, status, entry_id, role, public_url) " +
                "VALUES (?, 'USER_UPLOAD', '$statusLiteral', ?, '$roleLiteral', ?)",
            id,
            entryId,
            "/images/probe/$id.jpg",
        )
    }

    private fun insertLocatedMedia(
        id: UUID,
        latitude: Double,
        longitude: Double,
        entryId: UUID?,
    ) {
        jdbcTemplate.update(
            "INSERT INTO gallery_media (id, media_source, status, show_in_gallery, latitude, longitude, entry_id) " +
                "VALUES (?, 'USER_UPLOAD', 'ACTIVE', true, ?, ?, ?)",
            id,
            latitude.toBigDecimal(),
            longitude.toBigDecimal(),
            entryId,
        )
    }

    private fun townIdFor(slug: String): UUID =
        requireNotNull(
            jdbcTemplate.queryForObject("SELECT id FROM towns WHERE slug = ?", UUID::class.java, slug),
        ) { "settlement '$slug' should exist in reference data" }

    private fun insertEntry(
        id: UUID,
        slug: String,
        townId: UUID,
    ) {
        jdbcTemplate.update(
            """
            INSERT INTO directory_entries
                (id, slug, name, description, category, town, town_id, latitude, longitude, status)
            VALUES (?, ?, 'Status Probe', 'Probe row.', 'Heritage', 'Probe Town', ?, 14.87, -24.69, 'PUBLISHED')
            """.trimIndent(),
            id,
            slug,
            townId,
        )
    }
}
