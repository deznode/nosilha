package com.nosilha.core.gallery

import com.jayway.jsonpath.JsonPath
import com.nosilha.core.gallery.domain.R2StorageService
import org.assertj.core.api.Assertions.assertThat
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

/**
 * Whole-archive counts (spec 034 FR-018, FR-025, T-11).
 *
 * <p>The facets and the list share one predicate, so the chip counts can never disagree
 * with the records a chip lists. The 26-versus-24 bug came from counting a loaded page.</p>
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("GET /api/v1/gallery/facets")
class GalleryFacetsIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @MockitoBean
    private lateinit var r2StorageService: R2StorageService

    private lateinit var fixtures: ArchiveFixtures

    @BeforeEach
    fun setup() {
        fixtures = ArchiveFixtures(jdbcTemplate)
        fixtures.clearMedia()
    }

    @AfterEach
    fun cleanup() {
        fixtures.clear()
    }

    private fun seedArchive() {
        val entry = fixtures.entry()
        // Photographs
        fixtures.media(latitude = "14.87", longitude = "-24.70", dateTaken = "2019-05-01T10:00:00Z", photographerCredit = "Ana Lopes")
        fixtures.media(approximateDate = "the 1960s", photographerCredit = "  Not known ")
        fixtures.media(approximateDate = "   ", photographerCredit = null)
        // Films: a film's credit is its author
        fixtures.media(source = "EXTERNAL", mediaType = "VIDEO", author = "Nos Ilha")
        fixtures.media(source = "EXTERNAL", mediaType = "VIDEO", author = null)
        // An external image is a record, but neither a photograph nor a film
        fixtures.media(source = "EXTERNAL", mediaType = "IMAGE", author = "Wikimedia")
        // Not archive records: a hero, a pending upload, and one hidden from the gallery
        fixtures.media(role = "HERO", entryId = entry, latitude = "14.87", longitude = "-24.70", photographerCredit = "Torbenbrinker")
        fixtures.media(status = "PENDING_REVIEW")
        fixtures.media(showInGallery = false)
    }

    @Test
    fun `counts every facet over archive records only`() {
        seedArchive()

        mockMvc
            .perform(get("/api/v1/gallery/facets"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.total").value(6))
            .andExpect(jsonPath("$.data.photographs").value(3))
            .andExpect(jsonPath("$.data.films").value(2))
            .andExpect(jsonPath("$.data.withPlace").value(1))
            .andExpect(jsonPath("$.data.withoutPlace").value(2))
            // A blank approximate date is no date
            .andExpect(jsonPath("$.data.withoutDate").value(4))
            // Null, blank-free "not known" in any case, and an authorless film
            .andExpect(jsonPath("$.data.uncredited").value(3))
    }

    @Test
    fun `total equals the unfiltered list's total`() {
        seedArchive()

        val facets = JsonPath.parse(body("/api/v1/gallery/facets"))
        val list = JsonPath.parse(body("/api/v1/gallery?size=1"))

        assertThat(facets.read<Number>("$.data.total").toLong())
            .isEqualTo(list.read<Number>("$.pageable.totalElements").toLong())
            .isEqualTo(6L)
    }

    @Test
    fun `an empty archive counts zero everywhere`() {
        mockMvc
            .perform(get("/api/v1/gallery/facets"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.total").value(0))
            .andExpect(jsonPath("$.data.photographs").value(0))
            .andExpect(jsonPath("$.data.films").value(0))
            .andExpect(jsonPath("$.data.withPlace").value(0))
            .andExpect(jsonPath("$.data.withoutPlace").value(0))
            .andExpect(jsonPath("$.data.withoutDate").value(0))
            .andExpect(jsonPath("$.data.uncredited").value(0))
    }

    private fun body(url: String): String =
        mockMvc
            .perform(get(url))
            .andExpect(status().isOk)
            .andReturn()
            .response
            .contentAsString
}
