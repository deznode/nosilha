package com.nosilha.core.places

import com.jayway.jsonpath.JsonPath
import com.nosilha.core.engagement.services.BookmarkService
import com.nosilha.core.shared.api.CreateEntryRequestDto
import jakarta.persistence.EntityManagerFactory
import org.assertj.core.api.Assertions.assertThat
import org.hibernate.SessionFactory
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.data.domain.PageRequest
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
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
import java.time.Duration
import java.util.UUID

/**
 * Entry reads and writes resolve heroes from the gallery module (spec 034 FR-023, T-19, ADR-001).
 *
 * <p>An entry stores no image. Its DTO carries the hero with its credit, list endpoints resolve
 * every hero in one query, and create, update and public submission hand the image to the
 * gallery, which writes the hero after the entry commits.</p>
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Entry heroes, read and written through places")
class HeroImageReadsIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jsonMapper: JsonMapper

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var entityManagerFactory: EntityManagerFactory

    @Autowired
    private lateinit var bookmarkService: BookmarkService

    // Real users: JPA auditing writes the principal into created_by, which references users.
    private val adminId = UUID.fromString("00000000-0000-0000-0000-000000003419")
    private val userId = UUID.fromString("00000000-0000-0000-0000-000000003420")

    private val entries = mutableListOf<UUID>()

    @BeforeEach
    fun seedUsers() {
        jdbcTemplate.update(
            "INSERT INTO users (id, email, role) VALUES (?, 'hero-reads-admin@test.com', 'ADMIN') ON CONFLICT DO NOTHING",
            adminId
        )
        jdbcTemplate.update(
            "INSERT INTO users (id, email, role) VALUES (?, 'hero-reads-user@test.com', 'USER') ON CONFLICT DO NOTHING",
            userId
        )
    }

    @AfterEach
    fun cleanup() {
        entries.forEach { id ->
            jdbcTemplate.update("DELETE FROM bookmarks WHERE entry_id = ?", id)
            jdbcTemplate.update("DELETE FROM gallery_media WHERE entry_id = ?", id)
            jdbcTemplate.update("DELETE FROM directory_entries WHERE id = ?", id)
        }
        entries.clear()
        // After the entries: their created_by and submitted_by reference these users.
        jdbcTemplate.update("DELETE FROM users WHERE id IN (?, ?)", adminId, userId)
    }

    @Test
    fun `a record carries its hero with the credit, and imageUrl follows the hero`() {
        val entry = insertEntry("hero-read-credited")
        val hero =
            insertHero(entry, "/images/probe/credited.jpg", credit = "Torbenbrinker", source = "Wikimedia Commons, CC BY-SA 3.0, 2010")

        mockMvc
            .perform(get("/api/v1/directory/entries/$entry"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.heroImage.mediaId").value(hero.toString()))
            .andExpect(jsonPath("$.data.heroImage.url").value("/images/probe/credited.jpg"))
            .andExpect(jsonPath("$.data.heroImage.photographerCredit").value("Torbenbrinker"))
            .andExpect(jsonPath("$.data.heroImage.archiveSource").value("Wikimedia Commons, CC BY-SA 3.0, 2010"))
            .andExpect(jsonPath("$.data.imageUrl").value("/images/probe/credited.jpg"))
            // A named photographer is a recorded field of the place record.
            .andExpect(jsonPath("$.data.completeness.missingFields[?(@ == 'photographer')]").isEmpty)
    }

    @Test
    fun `a record without a hero carries no image`() {
        val entry = insertEntry("hero-read-none")

        mockMvc
            .perform(get("/api/v1/directory/entries/$entry"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.heroImage").value(null as Any?))
            .andExpect(jsonPath("$.data.imageUrl").value(null as Any?))
    }

    @Test
    fun `listing a settlement's records resolves every hero in one query, however many records there are`() {
        val town = townIdFor("minhoto")
        insertHero(insertEntry("hero-list-0", town), "/images/probe/list-0.jpg")
        val forOne = statementsDuring { listTown(town, expectedSize = 1) }

        repeat(5) { index -> insertHero(insertEntry("hero-list-${index + 1}", town), "/images/probe/list-${index + 1}.jpg") }
        val forSix = statementsDuring { listTown(town, expectedSize = 6) }

        assertThat(forSix).isEqualTo(forOne)
    }

    @Test
    fun `creating a record with an image gives it an active hero`() {
        val entry = create(request("Hero Create Probe", "/images/probe/created.jpg"))

        val hero = awaitHero(entry) { it["public_url"] == "/images/probe/created.jpg" }
        assertThat(hero["status"]).isEqualTo("ACTIVE")
        assertThat(hero["show_in_gallery"]).isEqualTo(false)

        mockMvc
            .perform(get("/api/v1/directory/entries/$entry"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.imageUrl").value("/images/probe/created.jpg"))
            .andExpect(jsonPath("$.data.heroImage.mediaId").value(hero["id"].toString()))
    }

    @Test
    fun `updating a record's image replaces its hero, and clearing the image removes it`() {
        val entry = create(request("Hero Update Probe", "/images/probe/before.jpg"))
        awaitHero(entry) { it["public_url"] == "/images/probe/before.jpg" }

        update(entry, request("Hero Update Probe", "/images/probe/after.jpg"))
        awaitHero(entry) { it["public_url"] == "/images/probe/after.jpg" }

        update(entry, request("Hero Update Probe", null))
        await("the hero of $entry to be removed") { if (heroesOf(entry).isEmpty()) Unit else null }

        mockMvc
            .perform(get("/api/v1/directory/entries/$entry"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.imageUrl").value(null as Any?))
    }

    @Test
    fun `a public submission's image waits for review, and only moderators see it`() {
        val body =
            mapOf(
                "name" to "Hero Submission Probe",
                "category" to "Heritage",
                "town" to "Nova Sintra",
                "description" to "A submitted record that arrives with an image.",
                "imageUrl" to "/images/probe/submitted.jpg",
            )
        val response =
            mockMvc
                .perform(
                    post("/api/v1/directory/submissions")
                        .with(auth(userId, "ROLE_USER"))
                        .header("X-Forwarded-For", "10.34.19.${(1..254).random()}")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(body)),
                ).andExpect(status().isCreated)
                .andReturn()
                .response
                .contentAsString
        val entry = UUID.fromString(JsonPath.read<String>(response, "$.data.id")).also { entries += it }

        assertThat(awaitHero(entry) { true }["status"]).isEqualTo("PENDING_REVIEW")

        mockMvc
            .perform(get("/api/v1/directory/entries/$entry"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.heroImage").value(null as Any?))
        mockMvc
            .perform(get("/api/v1/admin/directory/entries/$entry").with(auth(adminId, "ROLE_ADMIN")))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.imageUrl").value("/images/probe/submitted.jpg"))
            .andExpect(jsonPath("$.data.heroImage.url").value("/images/probe/submitted.jpg"))
    }

    @Test
    fun `a bookmark's thumbnail is the record's hero`() {
        val entry = insertEntry("hero-bookmark")
        insertHero(entry, "/images/probe/bookmarked.jpg")
        jdbcTemplate.update("INSERT INTO bookmarks (user_id, entry_id) VALUES (?, ?)", userId, entry)

        val bookmarks = bookmarkService.getBookmarks(userId, PageRequest.of(0, 10))

        assertThat(
            bookmarks.content
                .single { it.entry.id == entry }
                .entry.thumbnailUrl
        ).isEqualTo("/images/probe/bookmarked.jpg")
    }

    private fun auth(
        id: UUID,
        role: String,
    ) = authentication(UsernamePasswordAuthenticationToken(id.toString(), null, listOf(SimpleGrantedAuthority(role))))

    private fun request(
        name: String,
        imageUrl: String?,
    ) = CreateEntryRequestDto(
        name = name,
        description = "A hero probe record.",
        category = "Heritage",
        town = "Nova Sintra",
        latitude = 14.87,
        longitude = -24.69,
        imageUrl = imageUrl,
    )

    private fun create(body: CreateEntryRequestDto): UUID {
        val response =
            mockMvc
                .perform(
                    post("/api/v1/directory/entries")
                        .with(auth(adminId, "ROLE_ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(body)),
                ).andExpect(status().isCreated)
                .andReturn()
                .response
                .contentAsString
        return UUID.fromString(JsonPath.read<String>(response, "$.data.id")).also { entries += it }
    }

    private fun update(
        id: UUID,
        body: CreateEntryRequestDto,
    ) {
        mockMvc
            .perform(
                put("/api/v1/directory/entries/$id")
                    .with(auth(adminId, "ROLE_ADMIN"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(body)),
            ).andExpect(status().isOk)
    }

    private fun listTown(
        townId: UUID,
        expectedSize: Int,
    ) {
        mockMvc
            .perform(get("/api/v1/directory/entries").param("townId", townId.toString()).param("size", "50"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.length()").value(expectedSize))
            .andExpect(jsonPath("$.data[?(@.heroImage == null)]").isEmpty)
    }

    private fun statementsDuring(block: () -> Unit): Long {
        val statistics = entityManagerFactory.unwrap(SessionFactory::class.java).statistics
        statistics.clear()
        statistics.isStatisticsEnabled = true
        try {
            block()
        } finally {
            statistics.isStatisticsEnabled = false
        }
        return statistics.prepareStatementCount
    }

    private fun insertEntry(
        slug: String,
        townId: UUID? = null,
    ): UUID {
        val id = UUID.randomUUID()
        jdbcTemplate.update(
            """
            INSERT INTO directory_entries (id, slug, name, description, category, town, town_id, latitude, longitude, status)
            VALUES (?, ?, 'Hero Probe', 'Probe row.', 'Heritage', 'Probe Town', ?, 14.87, -24.69, 'PUBLISHED')
            """.trimIndent(),
            id,
            slug,
            townId,
        )
        entries += id
        return id
    }

    private fun insertHero(
        entryId: UUID,
        url: String,
        credit: String? = null,
        source: String? = null,
    ): UUID {
        val id = UUID.randomUUID()
        jdbcTemplate.update(
            "INSERT INTO gallery_media " +
                "(id, media_source, status, role, show_in_gallery, entry_id, public_url, photographer_credit, archive_source) " +
                "VALUES (?, 'USER_UPLOAD', 'ACTIVE', 'HERO', false, ?, ?, ?, ?)",
            id,
            entryId,
            url,
            credit,
            source,
        )
        return id
    }

    private fun townIdFor(slug: String): UUID =
        requireNotNull(jdbcTemplate.queryForObject("SELECT id FROM towns WHERE slug = ?", UUID::class.java, slug)) {
            "settlement '$slug' should exist in reference data"
        }

    private fun heroesOf(entryId: UUID): List<Map<String, Any?>> =
        jdbcTemplate.queryForList(
            "SELECT id, public_url, status::text AS status, show_in_gallery FROM gallery_media WHERE entry_id = ? AND role = 'HERO'",
            entryId,
        )

    private fun awaitHero(
        entryId: UUID,
        matches: (Map<String, Any?>) -> Boolean,
    ): Map<String, Any?> = await("a hero of entry $entryId") { heroesOf(entryId).singleOrNull()?.takeIf(matches) }

    private fun <T : Any> await(
        description: String,
        probe: () -> T?,
    ): T {
        val deadline = System.nanoTime() + AWAIT_TIMEOUT.toNanos()
        while (System.nanoTime() < deadline) {
            probe()?.let { return it }
            Thread.sleep(100)
        }
        throw AssertionError("Timed out waiting for $description")
    }

    companion object {
        private val AWAIT_TIMEOUT: Duration = Duration.ofSeconds(10)
    }
}
