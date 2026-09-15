package com.nosilha.core.places

import com.jayway.jsonpath.JsonPath
import com.nosilha.core.shared.api.CreateEntryRequestDto
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.core.io.ClassPathResource
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import tools.jackson.databind.json.JsonMapper
import java.util.UUID
import javax.sql.DataSource

/**
 * Heritage details through the API, writes and seed (spec 034, FR-016, T-08).
 *
 * <p>The place record renders Established, Status, Festival and Architect for heritage
 * and church records. These tests prove the fields reach the response only for those
 * categories, persist through create and update, and arrive in existing databases
 * through the repeatable seed without overwriting later edits.</p>
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Heritage details, end to end")
class HeritageDetailsIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jsonMapper: JsonMapper

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var dataSource: DataSource

    private val created = mutableListOf<UUID>()

    // A real user: JPA auditing writes the principal into created_by, which references users.
    private val adminId = UUID.fromString("00000000-0000-0000-0000-000000003401")

    @BeforeEach
    fun seedAdmin() {
        jdbcTemplate.update(
            "INSERT INTO users (id, email, role) VALUES (?, 'heritage-details-admin@test.com', 'ADMIN') ON CONFLICT DO NOTHING",
            adminId,
        )
    }

    @AfterEach
    fun cleanup() {
        created.forEach { jdbcTemplate.update("DELETE FROM directory_entries WHERE id = ?", it) }
        created.clear()
        // After the entries: their created_by references this user.
        jdbcTemplate.update("DELETE FROM users WHERE id = ?", adminId)
    }

    private fun adminAuth() =
        authentication(
            UsernamePasswordAuthenticationToken(
                adminId.toString(),
                null,
                listOf(SimpleGrantedAuthority("ROLE_ADMIN")),
            ),
        )

    private fun runEntrySeed() {
        ResourceDatabasePopulator(ClassPathResource("db/seed/R__seed_directory_entries.sql")).execute(dataSource)
    }

    private fun request(
        name: String,
        category: String,
        established: String? = null,
        conditionStatus: String? = null,
        festival: String? = null,
        architect: String? = null,
    ) = CreateEntryRequestDto(
        name = name,
        description = "A heritage details probe.",
        category = category,
        town = "Nova Sintra",
        latitude = 14.87,
        longitude = -24.69,
        imageUrl = null,
        details = null,
        established = established,
        conditionStatus = conditionStatus,
        festival = festival,
        architect = architect,
    )

    private fun create(body: CreateEntryRequestDto): UUID {
        val response = mockMvc
            .perform(
                post("/api/v1/directory/entries")
                    .with(adminAuth())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(body)),
            ).andExpect(status().isCreated)
            .andReturn()
            .response
            .contentAsString
        return UUID.fromString(JsonPath.read<String>(response, "$.data.id")).also { created += it }
    }

    private fun column(
        id: UUID,
        name: String,
    ): String? = jdbcTemplate.queryForObject("SELECT $name FROM directory_entries WHERE id = ?", String::class.java, id)

    @Test
    fun `the church record's seed carries the values already in its description`() {
        // Run twice: the repeatable seed must stay idempotent.
        runEntrySeed()
        runEntrySeed()

        mockMvc
            .perform(get("/api/v1/directory/slug/igreja-nossa-senhora-do-monte"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.details.established").value("c. 1826"))
            .andExpect(jsonPath("$.data.details.conditionStatus").value("under reconstruction since 2023"))
            .andExpect(jsonPath("$.data.details.festival").value("second weekend of August"))
            .andExpect(jsonPath("$.data.details.architect").value(null as Any?))
    }

    @Test
    fun `the seed never overwrites heritage values edited since`() {
        runEntrySeed()
        val slug = "igreja-nossa-senhora-do-monte"
        jdbcTemplate.update("UPDATE directory_entries SET established = 'c. 1830' WHERE slug = ?", slug)

        try {
            runEntrySeed()

            val established = jdbcTemplate.queryForObject(
                "SELECT established FROM directory_entries WHERE slug = ?",
                String::class.java,
                slug,
            )
            assertThat(established).isEqualTo("c. 1830")
        } finally {
            jdbcTemplate.update("UPDATE directory_entries SET established = 'c. 1826' WHERE slug = ?", slug)
        }
    }

    @Test
    fun `records outside heritage and churches expose no heritage details`() {
        runEntrySeed()

        mockMvc
            .perform(get("/api/v1/directory/slug/pousada-nova-sintra"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.details.established").doesNotExist())
            .andExpect(jsonPath("$.data.details.conditionStatus").doesNotExist())

        mockMvc
            .perform(get("/api/v1/directory/slug/faja-dagua"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.details.established").doesNotExist())
    }

    @Test
    fun `create persists the heritage fields`() {
        val id = create(
            request(
                name = "Heritage Create Probe",
                category = "Heritage",
                established = "1843",
                conditionStatus = "restored in 2011",
                festival = "3 May",
                architect = "not known",
            ),
        )

        assertThat(column(id, "established")).isEqualTo("1843")
        assertThat(column(id, "condition_status")).isEqualTo("restored in 2011")
        assertThat(column(id, "festival")).isEqualTo("3 May")
        assertThat(column(id, "architect")).isEqualTo("not known")

        mockMvc
            .perform(get("/api/v1/directory/entries/$id"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.details.established").value("1843"))
    }

    @Test
    fun `update replaces the heritage fields`() {
        val id = create(request(name = "Heritage Update Probe", category = "Church", established = "1843", architect = "not known"))

        mockMvc
            .perform(
                put("/api/v1/directory/entries/$id")
                    .with(adminAuth())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        jsonMapper.writeValueAsString(
                            request(name = "Heritage Update Probe", category = "Church", established = "c. 1850", festival = "15 August"),
                        ),
                    ),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.data.category").value("Church"))
            .andExpect(jsonPath("$.data.details.established").value("c. 1850"))
            .andExpect(jsonPath("$.data.details.festival").value("15 August"))

        assertThat(column(id, "established")).isEqualTo("c. 1850")
        assertThat(column(id, "festival")).isEqualTo("15 August")
        assertThat(column(id, "architect")).isNull()
    }

    @Test
    fun `heritage fields sent for an ineligible category are not stored`() {
        val id = create(request(name = "Beach Heritage Probe", category = "Beach", established = "1843", festival = "3 May"))

        assertThat(column(id, "established")).isNull()
        assertThat(column(id, "festival")).isNull()
    }
}
