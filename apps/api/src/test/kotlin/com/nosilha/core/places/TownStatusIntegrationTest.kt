package com.nosilha.core.places

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
 * Integration tests for the settlements index endpoint (spec 033, FR-005).
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

        try {
            insertEntry(withPhoto, "status-probe-photo", documentedTown, imageUrl = "/images/probe.jpg")
            insertEntry(withoutPhoto, "status-probe-plain", partialTown, imageUrl = null)

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
            jdbcTemplate.update("DELETE FROM directory_entries WHERE id IN (?, ?)", withPhoto, withoutPhoto)
        }
    }

    private fun townIdFor(slug: String): UUID =
        requireNotNull(
            jdbcTemplate.queryForObject("SELECT id FROM towns WHERE slug = ?", UUID::class.java, slug),
        ) { "settlement '$slug' should exist in reference data" }

    private fun insertEntry(
        id: UUID,
        slug: String,
        townId: UUID,
        imageUrl: String?,
    ) {
        jdbcTemplate.update(
            """
            INSERT INTO directory_entries
                (id, slug, name, description, category, town, town_id, latitude, longitude, image_url, status)
            VALUES (?, ?, 'Status Probe', 'Probe row.', 'Heritage', 'Probe Town', ?, 14.87, -24.69, ?, 'PUBLISHED')
            """.trimIndent(),
            id,
            slug,
            townId,
            imageUrl,
        )
    }
}
