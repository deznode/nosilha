package com.nosilha.core.gallery

import com.nosilha.core.gallery.api.HeroMediaRef
import com.nosilha.core.gallery.api.MediaQueryService
import com.nosilha.core.shared.events.EntryImageSubmittedEvent
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
import org.springframework.context.ApplicationEventPublisher
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.transaction.support.TransactionTemplate
import java.time.Duration
import java.util.UUID

/**
 * Entry heroes as gallery records (spec 034 FR-023, T-17, ADR-001).
 *
 * <p>An entry's hero is its one `gallery_media` row with role HERO. These tests drive the ways a
 * hero changes (entry writes by event, admin promotion and removal) and the port places reads
 * heroes through.</p>
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Hero media")
class HeroMediaIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var eventPublisher: ApplicationEventPublisher

    @Autowired
    private lateinit var transactionTemplate: TransactionTemplate

    @Autowired
    private lateinit var mediaQueryService: MediaQueryService

    @Autowired
    private lateinit var entityManagerFactory: EntityManagerFactory

    private lateinit var fixtures: ArchiveFixtures

    // A real user: JPA auditing writes the principal into updated_by, which references users.
    private val adminId = UUID.fromString("00000000-0000-0000-0000-000000003417")

    @BeforeEach
    fun setUp() {
        fixtures = ArchiveFixtures(jdbcTemplate)
        fixtures.clearMedia()
        jdbcTemplate.update(
            "INSERT INTO users (id, email, role) VALUES (?, 'hero-media-admin@test.com', 'ADMIN') ON CONFLICT DO NOTHING",
            adminId,
        )
    }

    @AfterEach
    fun tearDown() {
        fixtures.clear()
        jdbcTemplate.update("DELETE FROM users WHERE id = ?", adminId)
    }

    @Test
    fun `an image submitted for a published entry becomes its active hero, kept out of gallery lists`() {
        val entry = fixtures.entry()

        submit(entry, "/images/probe/hero.jpg", entryPublished = true)

        val hero = awaitHero(entry) { it["public_url"] == "/images/probe/hero.jpg" }
        assertThat(hero["status"]).isEqualTo("ACTIVE")
        assertThat(hero["show_in_gallery"]).isEqualTo(false)
        assertThat(hero["media_source"]).isEqualTo("USER_UPLOAD")
    }

    @Test
    fun `an image submitted for an unpublished entry waits for review`() {
        val entry = fixtures.entry()

        submit(entry, "/images/probe/submitted.jpg", entryPublished = false)

        assertThat(awaitHero(entry) { true }["status"]).isEqualTo("PENDING_REVIEW")
    }

    @Test
    fun `a new image replaces the hero and keeps the old one as an archive record`() {
        val entry = fixtures.entry()
        submit(entry, "/images/probe/first.jpg")
        val first = awaitHero(entry) { it["public_url"] == "/images/probe/first.jpg" }

        submit(entry, "/images/probe/second.jpg")
        awaitHero(entry) { it["public_url"] == "/images/probe/second.jpg" }

        assertThat(roleOf(first["id"] as UUID)).isEqualTo("ARCHIVE")
        assertThat(heroesOf(entry)).hasSize(1)
    }

    @Test
    fun `clearing the image removes the hero, and the same image restores it with its credit`() {
        val entry = fixtures.entry()
        val hero =
            fixtures.media(
                role = "HERO",
                entryId = entry,
                showInGallery = false,
                publicUrl = "/images/probe/credited.jpg",
                photographerCredit = "Torbenbrinker",
            )

        submit(entry, null)
        await("the hero of $entry to be removed") { if (heroesOf(entry).isEmpty()) Unit else null }
        assertThat(roleOf(hero)).isEqualTo("ARCHIVE")

        submit(entry, "/images/probe/credited.jpg")
        val restored = awaitHero(entry) { true }
        assertThat(restored["id"]).isEqualTo(hero)
        assertThat(restored["photographer_credit"]).isEqualTo("Torbenbrinker")
    }

    @Test
    fun `promoting an archive photograph demotes the entry's previous hero`() {
        val entry = fixtures.entry()
        val previous = fixtures.media(role = "HERO", entryId = entry, showInGallery = false, publicUrl = "/images/probe/previous.jpg")
        val promoted = fixtures.media(entryId = entry, publicUrl = "/images/probe/promoted.jpg")

        mockMvc
            .perform(patch("/api/v1/admin/gallery/$promoted/promote-hero").with(adminAuth()))
            .andExpect(status().isOk)

        assertThat(roleOf(previous)).isEqualTo("ARCHIVE")
        assertThat(roleOf(promoted)).isEqualTo("HERO")
        assertThat(mediaQueryService.findHeroMedia(listOf(entry)).getValue(entry).mediaId).isEqualTo(promoted)
    }

    @Test
    fun `removing a hero leaves its entry without one`() {
        val entry = fixtures.entry()
        val hero = fixtures.media(role = "HERO", entryId = entry, showInGallery = false, publicUrl = "/images/probe/removed.jpg")

        mockMvc
            .perform(delete("/api/v1/admin/gallery/$hero/hero").with(adminAuth()))
            .andExpect(status().isNoContent)

        assertThat(roleOf(hero)).isEqualTo("ARCHIVE")
        assertThat(mediaQueryService.findHeroMedia(listOf(entry))).isEmpty()
    }

    @Test
    fun `removing the hero role from an archive record is refused`() {
        val archive = fixtures.media(entryId = fixtures.entry(), publicUrl = "/images/probe/archive.jpg")

        mockMvc
            .perform(delete("/api/v1/admin/gallery/$archive/hero").with(adminAuth()))
            .andExpect(status().isUnprocessableEntity)
    }

    @Test
    fun `the public sees approved heroes only, while moderation also sees pending and flagged ones`() {
        val approved = fixtures.entry()
        val pending = fixtures.entry()
        val flagged = fixtures.entry()
        val approvedHero =
            fixtures.media(
                role = "HERO",
                entryId = approved,
                showInGallery = false,
                publicUrl = "/images/probe/approved.jpg",
                photographerCredit = "Torbenbrinker",
                archiveSource = "Wikimedia Commons, CC BY-SA 3.0, 2010",
            )
        fixtures.media(
            role = "HERO",
            status = "PENDING_REVIEW",
            entryId = pending,
            showInGallery = false,
            publicUrl = "/images/probe/pending.jpg"
        )
        fixtures.media(
            role = "HERO",
            entryId = flagged,
            showInGallery = false,
            publicUrl = "/images/probe/flagged.jpg",
            identifiablePerson = true
        )
        val entries = listOf(approved, pending, flagged)

        val seen = mediaQueryService.findHeroMedia(entries)

        assertThat(seen.keys).containsExactly(approved)
        assertThat(seen.getValue(approved))
            .isEqualTo(HeroMediaRef(approvedHero, "/images/probe/approved.jpg", "Torbenbrinker", "Wikimedia Commons, CC BY-SA 3.0, 2010"))
        assertThat(mediaQueryService.findHeroMedia(entries, forModeration = true).keys)
            .containsExactlyInAnyOrder(approved, pending, flagged)
    }

    @Test
    fun `resolves fifty entries' heroes in one query`() {
        val entries = List(50) { fixtures.entry() }
        entries.forEachIndexed { index, entry ->
            fixtures.media(role = "HERO", entryId = entry, showInGallery = false, publicUrl = "/images/probe/$index.jpg")
        }
        val statistics = entityManagerFactory.unwrap(SessionFactory::class.java).statistics

        statistics.clear()
        statistics.isStatisticsEnabled = true
        val heroes =
            try {
                mediaQueryService.findHeroMedia(entries)
            } finally {
                statistics.isStatisticsEnabled = false
            }

        assertThat(heroes).hasSize(50)
        assertThat(statistics.prepareStatementCount).isEqualTo(1)
    }

    @Test
    fun `a hero is not listed among its entry's photographs, offered at random, or counted in categories`() {
        val entry = fixtures.entry()
        // A promoted upload keeps show_in_gallery; its role alone keeps it out.
        val hero = fixtures.media(role = "HERO", entryId = entry, publicUrl = "/images/probe/hero.jpg", category = "Probe Hero")
        val archive = fixtures.media(entryId = entry, publicUrl = "/images/probe/archive.jpg", category = "Probe Archive")

        mockMvc
            .perform(get("/api/v1/gallery/entry/$entry"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.length()").value(1))
            .andExpect(jsonPath("$.data[0].id").value(archive.toString()))
        mockMvc
            .perform(get("/api/v1/gallery/random").param("count", "10"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.length()").value(1))
            .andExpect(jsonPath("$.data[?(@.id == '$hero')]").isEmpty)
        mockMvc
            .perform(get("/api/v1/gallery/categories"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data[?(@ == 'Probe Archive')]").isNotEmpty)
            .andExpect(jsonPath("$.data[?(@ == 'Probe Hero')]").isEmpty)
    }

    private fun adminAuth() =
        authentication(
            UsernamePasswordAuthenticationToken(adminId.toString(), null, listOf(SimpleGrantedAuthority("ROLE_ADMIN"))),
        )

    private fun submit(
        entryId: UUID,
        imageUrl: String?,
        entryPublished: Boolean = true,
    ) {
        // Module listeners run after the publishing transaction commits.
        transactionTemplate.executeWithoutResult {
            eventPublisher.publishEvent(EntryImageSubmittedEvent(entryId = entryId, imageUrl = imageUrl, entryPublished = entryPublished))
        }
    }

    private fun heroesOf(entryId: UUID): List<Map<String, Any?>> =
        jdbcTemplate.queryForList(
            "SELECT id, media_source, public_url, status::text AS status, show_in_gallery, photographer_credit " +
                "FROM gallery_media WHERE entry_id = ? AND role = 'HERO'",
            entryId,
        )

    private fun roleOf(mediaId: UUID): String? =
        jdbcTemplate.queryForObject("SELECT role::text FROM gallery_media WHERE id = ?", String::class.java, mediaId)

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
