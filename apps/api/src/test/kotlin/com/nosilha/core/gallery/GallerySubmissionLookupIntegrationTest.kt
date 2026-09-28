package com.nosilha.core.gallery

import com.nosilha.core.gallery.domain.ExternalMedia
import com.nosilha.core.gallery.domain.ExternalPlatform
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.gallery.domain.MediaType
import com.nosilha.core.gallery.domain.UserUploadedMedia
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
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
import java.sql.Timestamp
import java.time.Instant
import java.util.UUID

/**
 * Film duplicate check and a settlement's first photo (spec 039 T-09).
 *
 * Both endpoints are public (no auth), matcher-gated in `SecurityConfig`. gallery_media
 * and towns hold shared seed rows (the Igreja hero among them), so this class deletes only
 * the rows it created.
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class GallerySubmissionLookupIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var galleryMediaRepository: GalleryMediaRepository

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val created = mutableListOf<UUID>()
    private lateinit var townA: UUID
    private lateinit var townB: UUID

    @BeforeEach
    fun setup() {
        val towns = jdbcTemplate.queryForList("SELECT id FROM towns ORDER BY slug LIMIT 2", UUID::class.java)
        townA = towns[0]!!
        townB = towns[1]!!
    }

    @AfterEach
    fun removeCreatedRows() {
        created.forEach { jdbcTemplate.update("DELETE FROM gallery_media WHERE id = ?", it) }
        created.clear()
    }

    // -- Fixtures --

    private fun externalFilm(
        platform: ExternalPlatform,
        externalId: String,
        status: GalleryMediaStatus,
    ): UUID {
        val media = ExternalMedia().apply {
            this.title = "Fixture film"
            this.mediaType = MediaType.VIDEO
            this.platform = platform
            this.externalId = externalId
            this.status = status
        }
        val saved = galleryMediaRepository.save(media)
        created += saved.id!!
        return saved.id!!
    }

    private fun userUploadImage(
        townId: UUID?,
        status: GalleryMediaStatus = GalleryMediaStatus.ACTIVE,
        contentType: String = "image/jpeg",
    ): UUID {
        val media = UserUploadedMedia().apply {
            this.title = "Fixture upload"
            this.contentType = contentType
            this.status = status
            this.placeId = townId
            this.publicUrl = "https://cdn.example.com/fixture.jpg"
        }
        val saved = galleryMediaRepository.save(media)
        created += saved.id!!
        return saved.id!!
    }

    private fun externalImage(
        townId: UUID?,
        status: GalleryMediaStatus = GalleryMediaStatus.ACTIVE,
    ): UUID {
        val media = ExternalMedia().apply {
            this.title = "Fixture curated photo"
            this.mediaType = MediaType.IMAGE
            this.platform = ExternalPlatform.SELF_HOSTED
            this.url = "https://cdn.example.com/curated.jpg"
            this.status = status
            this.placeId = townId
        }
        val saved = galleryMediaRepository.save(media)
        created += saved.id!!
        return saved.id!!
    }

    private fun setCreatedAt(
        id: UUID,
        instant: Instant,
    ) {
        jdbcTemplate.update("UPDATE gallery_media SET created_at = ? WHERE id = ?", Timestamp.from(instant), id)
    }

    // -- GET /gallery/submissions/lookup --

    @Test
    @DisplayName("Should return public with id and url for an ACTIVE film")
    fun `lookup should return public for an active film`() {
        val id = externalFilm(ExternalPlatform.YOUTUBE, "abc123public", GalleryMediaStatus.ACTIVE)

        mockMvc
            .perform(get("/api/v1/gallery/submissions/lookup").param("platform", "YOUTUBE").param("externalId", "abc123public"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.status").value("public"))
            .andExpect(jsonPath("$.data.id").value(id.toString()))
            .andExpect(jsonPath("$.data.url").value("/films/$id"))
    }

    @Test
    @DisplayName("Should return pending with no id or url for a PENDING_REVIEW film")
    fun `lookup should return pending with no id or url for a pending film`() {
        externalFilm(ExternalPlatform.VIMEO, "vid456pending", GalleryMediaStatus.PENDING_REVIEW)

        mockMvc
            .perform(get("/api/v1/gallery/submissions/lookup").param("platform", "VIMEO").param("externalId", "vid456pending"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.status").value("pending"))
            .andExpect(jsonPath("$.data.id").doesNotExist())
            .andExpect(jsonPath("$.data.url").doesNotExist())
    }

    @Test
    @DisplayName("Should return none for an unknown platform and external id pair")
    fun `lookup should return none when no row matches`() {
        mockMvc
            .perform(get("/api/v1/gallery/submissions/lookup").param("platform", "YOUTUBE").param("externalId", "does-not-exist"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.status").value("none"))
            .andExpect(jsonPath("$.data.id").doesNotExist())
    }

    @Test
    @DisplayName("Should return none for a REJECTED row rather than leaking its id")
    fun `lookup should return none for a rejected film`() {
        externalFilm(ExternalPlatform.YOUTUBE, "rejected789", GalleryMediaStatus.REJECTED)

        mockMvc
            .perform(get("/api/v1/gallery/submissions/lookup").param("platform", "YOUTUBE").param("externalId", "rejected789"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.status").value("none"))
    }

    @Test
    @DisplayName("Should return 400 when externalId is missing")
    fun `lookup should return 400 when externalId is missing`() {
        mockMvc
            .perform(get("/api/v1/gallery/submissions/lookup").param("platform", "YOUTUBE"))
            .andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("Should return 400 when platform is missing")
    fun `lookup should return 400 when platform is missing`() {
        mockMvc
            .perform(get("/api/v1/gallery/submissions/lookup").param("externalId", "abc123"))
            .andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("Should return 400 for an unrecognised platform value")
    fun `lookup should return 400 for an unknown platform`() {
        mockMvc
            .perform(get("/api/v1/gallery/submissions/lookup").param("platform", "NOT_A_PLATFORM").param("externalId", "abc123"))
            .andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("Should return 400 for a platform outside YOUTUBE and VIMEO")
    fun `lookup should return 400 for soundcloud`() {
        mockMvc
            .perform(get("/api/v1/gallery/submissions/lookup").param("platform", "SOUNDCLOUD").param("externalId", "abc123"))
            .andExpect(status().isBadRequest)
    }

    // -- GET /gallery/towns/{townId}/first-photo --

    @Test
    @DisplayName("Should return 200 with the earliest active photo for the town, anonymously")
    fun `first photo should return the earliest active photo anonymously`() {
        val later = userUploadImage(townA)
        val earlier = userUploadImage(townA)
        setCreatedAt(later, Instant.parse("2020-06-01T00:00:00Z"))
        setCreatedAt(earlier, Instant.parse("2019-01-01T00:00:00Z"))

        mockMvc
            .perform(get("/api/v1/gallery/towns/$townA/first-photo"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.id").value(earlier.toString()))
            .andExpect(jsonPath("$.data.mediaSource").value("USER_UPLOAD"))
    }

    @Test
    @DisplayName("Should include a curated EXTERNAL image among candidates")
    fun `first photo should include curated external images`() {
        val curated = externalImage(townA)
        setCreatedAt(curated, Instant.parse("2018-01-01T00:00:00Z"))

        mockMvc
            .perform(get("/api/v1/gallery/towns/$townA/first-photo"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.id").value(curated.toString()))
            .andExpect(jsonPath("$.data.mediaSource").value("EXTERNAL"))
    }

    @Test
    @DisplayName("Should return 204 when the town has no photo")
    fun `first photo should return 204 for a town with no photos`() {
        mockMvc
            .perform(get("/api/v1/gallery/towns/$townB/first-photo"))
            .andExpect(status().isNoContent)
    }

    @Test
    @DisplayName("Should return 204 for an unknown townId")
    fun `first photo should return 204 for an unknown town`() {
        mockMvc
            .perform(get("/api/v1/gallery/towns/${UUID.randomUUID()}/first-photo"))
            .andExpect(status().isNoContent)
    }

    @Test
    @DisplayName("Should ignore a PENDING_REVIEW upload for the town")
    fun `first photo should ignore non-active rows`() {
        userUploadImage(townB, status = GalleryMediaStatus.PENDING_REVIEW)

        mockMvc
            .perform(get("/api/v1/gallery/towns/$townB/first-photo"))
            .andExpect(status().isNoContent)
    }

    @Test
    @DisplayName("Should ignore an active photo linked to a different town")
    fun `first photo should ignore other towns`() {
        userUploadImage(townA)

        mockMvc
            .perform(get("/api/v1/gallery/towns/$townB/first-photo"))
            .andExpect(status().isNoContent)
    }

    @Test
    @DisplayName("Should ignore a non-image user upload (e.g. video) for the town")
    fun `first photo should ignore non-image uploads`() {
        userUploadImage(townB, contentType = "video/mp4")

        mockMvc
            .perform(get("/api/v1/gallery/towns/$townB/first-photo"))
            .andExpect(status().isNoContent)
    }
}
