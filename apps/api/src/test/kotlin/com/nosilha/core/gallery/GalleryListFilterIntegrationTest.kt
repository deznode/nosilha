package com.nosilha.core.gallery

import com.jayway.jsonpath.JsonPath
import com.nosilha.core.gallery.api.GeoPoint
import com.nosilha.core.gallery.api.MediaQueryService
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
import java.util.UUID

/**
 * Archive list filters and proximity, evaluated in SQL (spec 034 FR-018, FR-020, T-12).
 *
 * <p>Every filtered list is checked twice: the records it returns and the total it
 * reports, which must come from the database rather than the loaded page.</p>
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("GET /api/v1/gallery — archive filters")
class GalleryListFilterIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var mediaQueryService: MediaQueryService

    @MockitoBean
    private lateinit var r2StorageService: R2StorageService

    private lateinit var fixtures: ArchiveFixtures
    private lateinit var ids: Map<String, UUID>

    /** Centre of the proximity box used below. The box reaches ±0.006° either way. */
    private val centre = "14.87" to "-24.70"

    @BeforeEach
    fun setup() {
        fixtures = ArchiveFixtures(jdbcTemplate)
        fixtures.clearMedia()
        val entry = fixtures.entry()
        ids = mapOf(
            "near" to fixtures.media(
                latitude = "14.8730000",
                longitude = "-24.7040000",
                dateTaken = "2019-05-01T10:00:00Z",
                category = "Heritage",
                displayOrder = 1,
            ),
            "nearPlaced" to fixtures.media(
                latitude = "14.8650000",
                longitude = "-24.6950000",
                approximateDate = "1984",
                entryId = entry,
                displayOrder = 2,
            ),
            "far" to fixtures.media(
                latitude = "14.9000000",
                longitude = "-24.7000000",
                dateTaken = "2020-01-01T00:00:00Z",
                displayOrder = 3,
            ),
            // Exactly on the box's corner: the rule is inclusive
            "edge" to fixtures.media(
                latitude = "14.8760000",
                longitude = "-24.7060000",
                dateTaken = "2021-01-01T00:00:00Z",
                displayOrder = 4,
            ),
            "noPlace" to fixtures.media(displayOrder = 5),
            "film" to fixtures.media(source = "EXTERNAL", mediaType = "VIDEO", displayOrder = 6),
            "externalImage" to fixtures.media(source = "EXTERNAL", mediaType = "IMAGE", displayOrder = 7),
            "hero" to fixtures.media(
                role = "HERO",
                entryId = entry,
                latitude = "14.8700000",
                longitude = "-24.7000000",
                dateTaken = "2018-01-01T00:00:00Z",
            ),
        )
    }

    @AfterEach
    fun cleanup() {
        fixtures.clear()
    }

    @Test
    fun `never lists a hero`() {
        assertListed(named("near", "nearPlaced", "far", "edge", "noPlace", "film", "externalImage"))
    }

    @Test
    fun `hasPlace lists located records, or uploads without a place`() {
        assertListed(named("near", "nearPlaced", "far", "edge"), "hasPlace" to "true")
        assertListed(named("noPlace"), "hasPlace" to "false")
    }

    @Test
    fun `hasDate lists records with or without any date`() {
        assertListed(named("near", "nearPlaced", "far", "edge"), "hasDate" to "true")
        assertListed(named("noPlace", "film", "externalImage"), "hasDate" to "false")
    }

    @Test
    fun `mediaType lists photographs or films`() {
        assertListed(named("near", "nearPlaced", "far", "edge", "noPlace"), "mediaType" to "IMAGE")
        assertListed(named("film"), "mediaType" to "VIDEO")
    }

    @Test
    fun `nearLat and nearLng list records inside the proximity box, edges included`() {
        assertListed(named("near", "nearPlaced", "edge"), "nearLat" to centre.first, "nearLng" to centre.second)
    }

    @Test
    fun `unplaced lists records no directory entry claims`() {
        assertListed(named("near", "far", "edge", "noPlace", "film", "externalImage"), "unplaced" to "true")
        assertListed(
            named("near", "edge"),
            "nearLat" to centre.first,
            "nearLng" to centre.second,
            "unplaced" to "true",
        )
    }

    @Test
    fun `filters combine`() {
        assertListed(
            named("near"),
            "nearLat" to centre.first,
            "nearLng" to centre.second,
            "unplaced" to "true",
            "hasDate" to "true",
            "hasPlace" to "true",
            "mediaType" to "IMAGE",
            "category" to "Heritage",
        )
    }

    @Test
    fun `legacy hasGeo and category still filter`() {
        assertListed(named("near", "nearPlaced", "far", "edge"), "hasGeo" to "true")
        assertListed(named("near"), "category" to "Heritage")
        assertListed(named("near"), "hasGeo" to "true", "category" to "Heritage")
    }

    @Test
    fun `totals come from the database, not the loaded page`() {
        mockMvc
            .perform(get("/api/v1/gallery").param("hasPlace", "true").param("size", "1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.length()").value(1))
            .andExpect(jsonPath("$.pageable.totalElements").value(4))
            .andExpect(jsonPath("$.pageable.totalPages").value(4))
    }

    @Test
    fun `a coordinate without its pair is rejected`() {
        mockMvc
            .perform(get("/api/v1/gallery").param("nearLat", centre.first))
            .andExpect(status().isBadRequest)
        mockMvc
            .perform(get("/api/v1/gallery").param("nearLng", centre.second))
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `a media type other than photographs or films is rejected`() {
        mockMvc
            .perform(get("/api/v1/gallery").param("mediaType", "AUDIO"))
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `a settlement's unconfirmed count is the number its region list shows`() {
        // FR-020: one rule serves both. The count names "See the N unconfirmed
        // photographs"; the link lists exactly those records.
        val key = UUID.randomUUID()
        val counted = mediaQueryService.countUnplacedNear(
            mapOf(key to GeoPoint(centre.first.toDouble(), centre.second.toDouble())),
        )

        val (_, listedTotal) = list("nearLat" to centre.first, "nearLng" to centre.second, "unplaced" to "true")

        assertThat(counted.getValue(key).toLong()).isEqualTo(listedTotal).isEqualTo(2L)
    }

    private fun named(vararg keys: String): Set<UUID> = keys.map { ids.getValue(it) }.toSet()

    private fun assertListed(
        expected: Set<UUID>,
        vararg params: Pair<String, String>,
    ) {
        val (listed, total) = list(*params)
        assertThat(listed).isEqualTo(expected)
        assertThat(total).isEqualTo(expected.size.toLong())
    }

    private fun list(vararg params: Pair<String, String>): Pair<Set<UUID>, Long> {
        val request = get("/api/v1/gallery").param("size", "100")
        params.forEach { (name, value) -> request.param(name, value) }
        val body = mockMvc
            .perform(request)
            .andExpect(status().isOk)
            .andReturn()
            .response
            .contentAsString
        val parsed = JsonPath.parse(body)
        val listed = parsed.read<List<String>>("$.data[*].id").map(UUID::fromString).toSet()
        return listed to parsed.read<Number>("$.pageable.totalElements").toLong()
    }
}
