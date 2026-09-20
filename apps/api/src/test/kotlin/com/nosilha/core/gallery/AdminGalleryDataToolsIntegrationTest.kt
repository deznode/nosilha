package com.nosilha.core.gallery

import com.nosilha.core.gallery.domain.ExternalMedia
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.gallery.domain.GalleryModerationService
import com.nosilha.core.gallery.domain.R2AdminService
import com.nosilha.core.gallery.domain.R2StorageService
import com.nosilha.core.gallery.domain.UserUploadedMedia
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.mockito.Mockito.reset
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import java.util.UUID
import javax.imageio.ImageIO

/**
 * Admin data tools for the archive (spec 034 FR-019, FR-022, FR-024, FR-026, T-16).
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Admin gallery data tools")
class AdminGalleryDataToolsIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var galleryMediaRepository: GalleryMediaRepository

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @MockitoBean
    private lateinit var r2StorageService: R2StorageService

    private val testAdminId = UUID.fromString("00000000-0000-0000-0000-000000000002")
    private val testUserId = UUID.fromString("00000000-0000-0000-0000-000000000001")

    @BeforeEach
    fun setup() {
        galleryMediaRepository.deleteAll()
        jdbcTemplate.execute("DELETE FROM users")
        jdbcTemplate.execute(
            """INSERT INTO users (id, email) VALUES
                ('$testAdminId', 'admin@test.com'),
                ('$testUserId', 'user@test.com')
                ON CONFLICT DO NOTHING""",
        )
        reset(r2StorageService)
    }

    private fun adminAuth() = auth(testAdminId, "ADMIN")

    private fun userAuth() = auth(testUserId, "USER")

    private fun auth(
        userId: UUID,
        role: String,
    ) = authentication(
        UsernamePasswordAuthenticationToken(userId.toString(), null, listOf(SimpleGrantedAuthority("ROLE_$role"))),
    )

    @Suppress("LongParameterList")
    private fun upload(
        credit: String? = null,
        flagged: Boolean = false,
        storageKey: String? = "uploads/2026/09/${UUID.randomUUID()}.jpg",
        contentType: String = "image/jpeg",
        width: Int? = null,
        orientation: Int = 1,
    ): UserUploadedMedia =
        galleryMediaRepository.save(
            UserUploadedMedia().apply {
                photographerCredit = credit
                identifiablePerson = flagged
                this.storageKey = storageKey
                this.contentType = contentType
                this.width = width
                height = width
                this.orientation = orientation
                status = GalleryMediaStatus.ACTIVE
            },
        )

    private fun film(author: String?): ExternalMedia =
        galleryMediaRepository.save(
            ExternalMedia().apply {
                title = "Festa de São João"
                this.author = author
                externalId = UUID.randomUUID().toString().take(11)
                status = GalleryMediaStatus.ACTIVE
            },
        )

    private fun reloadUpload(id: UUID?) = galleryMediaRepository.findById(id!!).orElseThrow() as UserUploadedMedia

    private fun png(
        width: Int,
        height: Int,
    ): ByteArray =
        ByteArrayOutputStream().use { out ->
            ImageIO.write(BufferedImage(width, height, BufferedImage.TYPE_INT_RGB), "png", out)
            out.toByteArray()
        }

    @Nested
    @DisplayName("PATCH /api/v1/admin/gallery/{id} — provenance flag")
    inner class ProvenanceFlag {
        @Test
        fun `flags a record as showing an identifiable person`() {
            val media = upload(credit = "Ana Lopes")

            mockMvc
                .perform(
                    patch("/api/v1/admin/gallery/${media.id}")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"identifiablePerson": true}"""),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.identifiablePerson").value(true))

            assertThat(reloadUpload(media.id).identifiablePerson).isTrue()
        }

        @Test
        fun `a PATCH without the flag leaves it as it was`() {
            val media = upload(flagged = true)

            mockMvc
                .perform(
                    patch("/api/v1/admin/gallery/${media.id}")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"description": "A wedding in Furna"}"""),
                ).andExpect(status().isOk)

            assertThat(reloadUpload(media.id).identifiablePerson).isTrue()
        }

        @Test
        fun `is forbidden to non-admins`() {
            val media = upload()

            mockMvc
                .perform(
                    patch("/api/v1/admin/gallery/${media.id}")
                        .with(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"identifiablePerson": true}"""),
                ).andExpect(status().isForbidden)
        }
    }

    @Nested
    @DisplayName("POST /api/v1/admin/gallery/credits/not-known")
    inner class NotKnownCredits {
        @Test
        fun `stamps not known on uncredited records and skips flagged ones`() {
            val uncredited = upload(credit = null)
            val blank = upload(credit = "")
            val flagged = upload(credit = null, flagged = true)
            val credited = upload(credit = "Ana Lopes")
            val authorless = film(author = null)
            val authored = film(author = "Nos Ilha")

            mockMvc
                .perform(post("/api/v1/admin/gallery/credits/not-known").with(adminAuth()))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.data.updated").value(3))
                .andExpect(jsonPath("$.data.skippedFlagged").value(1))
                .andExpect(jsonPath("$.data.errors").isEmpty)

            assertThat(reloadUpload(uncredited.id).photographerCredit).isEqualTo("not known")
            assertThat(reloadUpload(blank.id).photographerCredit).isEqualTo("not known")
            // Provenance comes first: a flagged record's credit waits for a person (FR-022)
            assertThat(reloadUpload(flagged.id).photographerCredit).isNull()
            assertThat(reloadUpload(credited.id).photographerCredit).isEqualTo("Ana Lopes")
            assertThat((galleryMediaRepository.findById(authorless.id!!).orElseThrow() as ExternalMedia).author).isEqualTo("not known")
            assertThat((galleryMediaRepository.findById(authored.id!!).orElseThrow() as ExternalMedia).author).isEqualTo("Nos Ilha")

            val audited = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM media_moderation_audit WHERE action = 'CREDIT_NOT_KNOWN'",
                Int::class.java,
            )
            assertThat(audited).isEqualTo(3)
        }

        @Test
        fun `reports requested records it could not stamp`() {
            val credited = upload(credit = "Ana Lopes")
            val target = upload(credit = null)
            val unknown = UUID.randomUUID()

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/credits/not-known")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"mediaIds": ["${credited.id}", "${target.id}", "$unknown"]}"""),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.updated").value(1))
                .andExpect(jsonPath("$.data.skippedFlagged").value(0))
                .andExpect(jsonPath("$.data.errors.length()").value(2))
                .andExpect(jsonPath("$.data.errors[?(@.mediaId == '$unknown')].reason").value("Media not found"))
                .andExpect(jsonPath("$.data.errors[?(@.mediaId == '${credited.id}')].reason").value("Media already has a credit"))
        }

        @Test
        fun `never stamps a hero, even when asked for it by id`() {
            val fixtures = ArchiveFixtures(jdbcTemplate)
            try {
                val hero = fixtures.media(role = "HERO", entryId = fixtures.entry(), photographerCredit = null)

                mockMvc
                    .perform(
                        post("/api/v1/admin/gallery/credits/not-known")
                            .with(adminAuth())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""{"mediaIds": ["$hero"]}"""),
                    ).andExpect(status().isOk)
                    .andExpect(jsonPath("$.data.updated").value(0))
                    .andExpect(jsonPath("$.data.errors[0].reason").value(GalleryModerationService.HERO_NOT_STAMPED))

                val credit = jdbcTemplate.queryForObject(
                    "SELECT photographer_credit FROM gallery_media WHERE id = ?",
                    String::class.java,
                    hero,
                )
                assertThat(credit).isNull()
            } finally {
                fixtures.clear()
            }
        }

        @Test
        fun `is forbidden to non-admins`() {
            mockMvc
                .perform(post("/api/v1/admin/gallery/credits/not-known").with(userAuth()))
                .andExpect(status().isForbidden)
        }
    }

    @Nested
    @DisplayName("GET /api/v1/admin/gallery/r2/broken")
    inner class BrokenObjects {
        @Test
        fun `lists records whose storage object is missing and skips records without a key`() {
            val present = upload()
            val missing = upload()
            upload(storageKey = null)
            film(author = "Nos Ilha")
            `when`(r2StorageService.objectExists(present.storageKey!!)).thenReturn(true)
            `when`(r2StorageService.objectExists(missing.storageKey!!)).thenReturn(false)

            mockMvc
                .perform(get("/api/v1/admin/gallery/r2/broken").with(adminAuth()))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].mediaId").value(missing.id.toString()))
                .andExpect(jsonPath("$.data[0].storageKey").value(missing.storageKey))
        }

        @Test
        fun `is forbidden to non-admins`() {
            mockMvc
                .perform(get("/api/v1/admin/gallery/r2/broken").with(userAuth()))
                .andExpect(status().isForbidden)
        }
    }

    @Nested
    @DisplayName("POST /api/v1/admin/gallery/dimensions/backfill")
    inner class DimensionBackfill {
        @Test
        fun `fills dimensions from stored image headers`() {
            val plain = upload(contentType = "image/png")
            val turned = upload(orientation = 6)
            val corrupt = upload()
            val gone = upload()
            val sized = upload(width = 640)
            val video = upload(contentType = "video/mp4")
            `when`(r2StorageService.readObjectPrefix(plain.storageKey!!, R2AdminService.HEADER_BYTES)).thenReturn(png(12, 7))
            `when`(r2StorageService.readObjectPrefix(turned.storageKey!!, R2AdminService.HEADER_BYTES)).thenReturn(png(12, 7))
            `when`(r2StorageService.readObjectPrefix(corrupt.storageKey!!, R2AdminService.HEADER_BYTES))
                .thenReturn("not an image".toByteArray())

            mockMvc
                .perform(post("/api/v1/admin/gallery/dimensions/backfill").with(adminAuth()))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.data.accepted").value(2))
                .andExpect(jsonPath("$.data.rejected").value(2))
                .andExpect(jsonPath("$.data.updated.length()").value(2))
                .andExpect(
                    jsonPath("$.data.errors[?(@.mediaId == '${corrupt.id}')].reason")
                        .value("Could not read image dimensions from the file header"),
                ).andExpect(jsonPath("$.data.errors[?(@.mediaId == '${gone.id}')].reason").value("Object not found in R2"))

            assertThat(reloadUpload(plain.id).let { it.width to it.height }).isEqualTo(12 to 7)
            // EXIF orientation 6 turns the image a quarter: browsers show it 7 wide
            assertThat(reloadUpload(turned.id).let { it.width to it.height }).isEqualTo(7 to 12)
            assertThat(reloadUpload(sized.id).width).isEqualTo(640)
            assertThat(reloadUpload(video.id).width).isNull()
        }

        @Test
        fun `reports requested records it cannot fill`() {
            val unknown = UUID.randomUUID()
            val external = film(author = "Nos Ilha")

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/dimensions/backfill")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"mediaIds": ["$unknown", "${external.id}"]}"""),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.accepted").value(0))
                .andExpect(jsonPath("$.data.rejected").value(2))
                .andExpect(jsonPath("$.data.errors[?(@.mediaId == '$unknown')].reason").value("Media not found"))
                .andExpect(
                    jsonPath("$.data.errors[?(@.mediaId == '${external.id}')].reason")
                        .value("Only user uploads have a stored image"),
                )
        }

        @Test
        fun `is forbidden to non-admins`() {
            mockMvc
                .perform(post("/api/v1/admin/gallery/dimensions/backfill").with(userAuth()))
                .andExpect(status().isForbidden)
        }
    }
}
