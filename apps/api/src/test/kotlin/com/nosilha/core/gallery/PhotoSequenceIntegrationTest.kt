package com.nosilha.core.gallery

import com.nosilha.core.gallery.domain.R2StorageService
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

/**
 * Previous and next among located photographs (spec 034 FR-021, T-13).
 *
 * <p>Order is when a photograph was taken, or added when that is unknown, then id.</p>
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("GET /api/v1/gallery/{id}/sequence")
class PhotoSequenceIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @MockitoBean
    private lateinit var r2StorageService: R2StorageService

    private lateinit var fixtures: ArchiveFixtures
    private lateinit var first: UUID
    private lateinit var second: UUID
    private lateinit var third: UUID
    private lateinit var unlocated: UUID
    private lateinit var pending: UUID

    @BeforeEach
    fun setup() {
        fixtures = ArchiveFixtures(jdbcTemplate)
        fixtures.clearMedia()
        val entry = fixtures.entry()
        // Inserted out of order, so the test proves the ordering rather than insertion
        third = fixtures.media(latitude = "14.87", longitude = "-24.70", dateTaken = "2025-06-01T00:00:00Z")
        first = fixtures.media(latitude = "14.86", longitude = "-24.71", dateTaken = "1960-01-01T00:00:00Z")
        // No date taken: placed by when it was added
        second = fixtures.media(latitude = "14.85", longitude = "-24.72", createdAt = "2024-01-01T00:00:00Z")
        unlocated = fixtures.media()
        pending = fixtures.media(status = "PENDING_REVIEW", latitude = "14.87", longitude = "-24.70")
        // A hero is not an archive photograph and takes no place in the sequence
        fixtures.media(role = "HERO", entryId = entry, latitude = "14.87", longitude = "-24.70", dateTaken = "1970-01-01T00:00:00Z")
    }

    @AfterEach
    fun cleanup() {
        fixtures.clear()
    }

    @Test
    fun `places a photograph between its neighbours`() {
        mockMvc
            .perform(get("/api/v1/gallery/$second/sequence"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.id").value(second.toString()))
            .andExpect(jsonPath("$.data.position").value(2))
            .andExpect(jsonPath("$.data.total").value(3))
            .andExpect(jsonPath("$.data.previousId").value(first.toString()))
            .andExpect(jsonPath("$.data.nextId").value(third.toString()))
    }

    @Test
    fun `the first photograph's previous is the last`() {
        mockMvc
            .perform(get("/api/v1/gallery/$first/sequence"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.position").value(1))
            .andExpect(jsonPath("$.data.previousId").value(third.toString()))
            .andExpect(jsonPath("$.data.nextId").value(second.toString()))
    }

    @Test
    fun `the last photograph's next is the first`() {
        mockMvc
            .perform(get("/api/v1/gallery/$third/sequence"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.position").value(3))
            .andExpect(jsonPath("$.data.previousId").value(second.toString()))
            .andExpect(jsonPath("$.data.nextId").value(first.toString()))
    }

    @Test
    fun `a photograph with no place has no position but still a total`() {
        mockMvc
            .perform(get("/api/v1/gallery/$unlocated/sequence"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.position").value(null as Any?))
            .andExpect(jsonPath("$.data.total").value(3))
            .andExpect(jsonPath("$.data.previousId").value(null as Any?))
            .andExpect(jsonPath("$.data.nextId").value(null as Any?))
    }

    @Test
    fun `the total is the with-a-place facet`() {
        mockMvc
            .perform(get("/api/v1/gallery/facets"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.withPlace").value(3))
    }

    @Test
    fun `an unknown id is not found`() {
        mockMvc
            .perform(get("/api/v1/gallery/${UUID.randomUUID()}/sequence"))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `a record awaiting review is not found`() {
        mockMvc
            .perform(get("/api/v1/gallery/$pending/sequence"))
            .andExpect(status().isNotFound)
    }
}
