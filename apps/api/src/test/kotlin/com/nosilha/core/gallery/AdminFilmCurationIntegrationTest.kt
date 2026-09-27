package com.nosilha.core.gallery

import com.nosilha.core.gallery.domain.ExternalMedia
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.gallery.domain.UserUploadedMedia
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

/**
 * Film curation fields through the admin PATCH and the public DTO (spec 038 T-01).
 *
 * gallery_media and towns hold shared seed rows (the Igreja hero among them), so this
 * class deletes only the rows it created.
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Film curation: displayTitle and placeId")
class AdminFilmCurationIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var galleryMediaRepository: GalleryMediaRepository

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val adminId = UUID.fromString("00000000-0000-0000-0000-000000000038")
    private val created = mutableListOf<UUID>()
    private lateinit var townId: UUID

    @BeforeEach
    fun setup() {
        // The audited updated_by column references users, so the acting admin needs a row
        jdbcTemplate.update("INSERT INTO users (id, email) VALUES (?, 'film-curator@test.com') ON CONFLICT DO NOTHING", adminId)
        townId = jdbcTemplate.queryForObject("SELECT id FROM towns ORDER BY slug LIMIT 1", UUID::class.java)!!
    }

    @AfterEach
    fun removeCreatedRows() {
        created.forEach { jdbcTemplate.update("DELETE FROM gallery_media WHERE id = ?", it) }
        created.clear()
        jdbcTemplate.update("DELETE FROM users WHERE id = ?", adminId)
    }

    private fun adminAuth() =
        authentication(
            UsernamePasswordAuthenticationToken(adminId.toString(), null, listOf(SimpleGrantedAuthority("ROLE_ADMIN"))),
        )

    private fun film(
        displayTitle: String? = null,
        placeId: UUID? = null,
    ): ExternalMedia =
        galleryMediaRepository
            .save(
                ExternalMedia().apply {
                    title = "BRAVA 4K | drone footage #capeverde"
                    externalId = UUID.randomUUID().toString().take(11)
                    status = GalleryMediaStatus.ACTIVE
                    this.displayTitle = displayTitle
                    this.placeId = placeId
                },
            ).also { created += it.id!! }

    private fun upload(): UserUploadedMedia =
        galleryMediaRepository
            .save(
                UserUploadedMedia().apply {
                    storageKey = "uploads/2026/09/${UUID.randomUUID()}.jpg"
                    contentType = "image/jpeg"
                    status = GalleryMediaStatus.ACTIVE
                },
            ).also { created += it.id!! }

    private fun reloadFilm(id: UUID?) = galleryMediaRepository.findById(id!!).orElseThrow() as ExternalMedia

    private fun patchJson(
        id: UUID?,
        body: String,
    ) = mockMvc.perform(
        patch("/api/v1/admin/gallery/$id")
            .with(adminAuth())
            .contentType(MediaType.APPLICATION_JSON)
            .content(body),
    )

    @Nested
    @DisplayName("PATCH /api/v1/admin/gallery/{id}")
    inner class Patch {
        @Test
        fun `sets displayTitle and keeps the host title`() {
            val media = film()

            patchJson(media.id, """{"displayTitle": "  Brava from the air  "}""")
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.data.displayTitle").value("Brava from the air"))
                .andExpect(jsonPath("$.data.title").value("BRAVA 4K | drone footage #capeverde"))

            val reloaded = reloadFilm(media.id)
            assertThat(reloaded.displayTitle).isEqualTo("Brava from the air")
            assertThat(reloaded.title).isEqualTo("BRAVA 4K | drone footage #capeverde")
        }

        @Test
        fun `a blank displayTitle clears it`() {
            val media = film(displayTitle = "Brava from the air")

            patchJson(media.id, """{"displayTitle": "   "}""")
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.data.displayTitle").doesNotExist())

            assertThat(reloadFilm(media.id).displayTitle).isNull()
        }

        @Test
        fun `a PATCH without the fields leaves them unchanged`() {
            val media = film(displayTitle = "Brava from the air", placeId = townId)

            patchJson(media.id, """{"description": "Aerial film"}""").andExpect(status().isOk)

            val reloaded = reloadFilm(media.id)
            assertThat(reloaded.displayTitle).isEqualTo("Brava from the air")
            assertThat(reloaded.placeId).isEqualTo(townId)
        }

        @Test
        fun `sets placeId`() {
            val media = film()

            patchJson(media.id, """{"placeId": "$townId"}""")
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.data.placeId").value(townId.toString()))

            assertThat(reloadFilm(media.id).placeId).isEqualTo(townId)
        }

        @Test
        fun `clearPlace true clears placeId`() {
            val media = film(placeId = townId)

            patchJson(media.id, """{"clearPlace": true}""")
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.data.placeId").doesNotExist())

            assertThat(reloadFilm(media.id).placeId).isNull()
        }

        @Test
        fun `an unknown placeId returns 400 and changes nothing`() {
            val media = film(displayTitle = "Brava from the air")

            patchJson(media.id, """{"placeId": "${UUID.randomUUID()}", "displayTitle": "Changed"}""")
                .andExpect(status().isBadRequest)

            val reloaded = reloadFilm(media.id)
            assertThat(reloaded.placeId).isNull()
            assertThat(reloaded.displayTitle).isEqualTo("Brava from the air")
        }

        @Test
        fun `a displayTitle over 255 characters returns 400`() {
            val media = film()

            patchJson(media.id, """{"displayTitle": "${"x".repeat(256)}"}""").andExpect(status().isBadRequest)
        }

        @Test
        fun `uploads ignore displayTitle, placeId and clearPlace`() {
            val media = upload()

            patchJson(media.id, """{"displayTitle": "Ignored", "placeId": "${UUID.randomUUID()}", "clearPlace": true}""")
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.data.displayTitle").doesNotExist())
                .andExpect(jsonPath("$.data.placeId").doesNotExist())

            val row =
                jdbcTemplate.queryForMap("SELECT display_title, place_id FROM gallery_media WHERE id = ?", media.id)
            assertThat(row["display_title"]).isNull()
            assertThat(row["place_id"]).isNull()
        }
    }

    @Nested
    @DisplayName("DTO exposure")
    inner class Exposure {
        @Test
        fun `the public external DTO exposes displayTitle and placeId`() {
            val media = film(displayTitle = "Brava from the air", placeId = townId)

            mockMvc
                .perform(get("/api/v1/gallery/${media.id}"))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.data.mediaSource").value("EXTERNAL"))
                .andExpect(jsonPath("$.data.displayTitle").value("Brava from the air"))
                .andExpect(jsonPath("$.data.placeId").value(townId.toString()))
        }

        @Test
        fun `the public external DTO serialises unset fields as null`() {
            val media = film()

            mockMvc
                .perform(get("/api/v1/gallery/${media.id}"))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.data.displayTitle").isEmpty)
                .andExpect(jsonPath("$.data.placeId").isEmpty)
        }

        @Test
        fun `the admin DTO exposes displayTitle and placeId`() {
            val media = film(displayTitle = "Brava from the air", placeId = townId)

            mockMvc
                .perform(get("/api/v1/admin/gallery/${media.id}").with(adminAuth()))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.data.displayTitle").value("Brava from the air"))
                .andExpect(jsonPath("$.data.placeId").value(townId.toString()))
        }
    }

    @Test
    fun `deleting the settlement nulls the film's place_id`() {
        val townSlug = "t038-${UUID.randomUUID().toString().take(8)}"
        val tempTown =
            jdbcTemplate.queryForObject(
                """INSERT INTO towns (slug, name, description, latitude, longitude)
                   VALUES (?, 'Temp', 'Temp', 14.85, -24.7) RETURNING id""",
                UUID::class.java,
                townSlug,
            )!!
        val media = film(placeId = tempTown)

        jdbcTemplate.update("DELETE FROM towns WHERE id = ?", tempTown)

        assertThat(reloadFilm(media.id).placeId).isNull()
    }
}
