package com.nosilha.core.gallery

import com.nosilha.core.gallery.api.dto.UpdateExifRequest
import com.nosilha.core.gallery.domain.ExternalMedia
import com.nosilha.core.gallery.domain.ExternalPlatform
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.gallery.domain.MediaSource
import com.nosilha.core.gallery.domain.MediaType
import com.nosilha.core.gallery.domain.UserUploadedMedia
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import com.nosilha.core.gallery.repository.MediaModerationAuditRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType as HttpMediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import tools.jackson.databind.json.JsonMapper
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

/**
 * Integration tests for POST /api/v1/admin/gallery/{mediaId}/update-exif.
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class ExifUpdateControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jsonMapper: JsonMapper

    @Autowired
    private lateinit var galleryMediaRepository: GalleryMediaRepository

    @Autowired
    private lateinit var auditRepository: MediaModerationAuditRepository

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val testAdminId = UUID.fromString("00000000-0000-0000-0000-000000000002")

    @BeforeEach
    fun setup() {
        jdbcTemplate.execute("DELETE FROM media_moderation_audit")
        galleryMediaRepository.deleteAll()
        jdbcTemplate.execute("DELETE FROM users")
        jdbcTemplate.execute(
            """INSERT INTO users (id, email) VALUES
                ('$testAdminId', 'admin@test.com')
                ON CONFLICT DO NOTHING""",
        )
    }

    private fun adminAuth() = authentication(
        UsernamePasswordAuthenticationToken(
            testAdminId.toString(),
            null,
            listOf(SimpleGrantedAuthority("ROLE_ADMIN")),
        ),
    )

    private fun seedUserUploadedMedia(): UserUploadedMedia {
        val media = UserUploadedMedia().apply {
            title = "test-photo.jpg"
            storageKey = "uploads/2026/01/test-photo.jpg"
            publicUrl = "https://media.example.com/uploads/2026/01/test-photo.jpg"
            fileName = "test-photo.jpg"
            originalName = "test-photo.jpg"
            contentType = "image/jpeg"
            fileSize = 2048L
            status = GalleryMediaStatus.ACTIVE
            source = MediaSource.LOCAL
            uploadedBy = testAdminId
            reviewedBy = testAdminId
            reviewedAt = Instant.now()
        }
        return galleryMediaRepository.save(media)
    }

    private fun seedExternalMedia(): ExternalMedia {
        val media = ExternalMedia().apply {
            title = "external-video"
            mediaType = MediaType.VIDEO
            platform = ExternalPlatform.YOUTUBE
            externalId = "dQw4w9WgXcQ"
            status = GalleryMediaStatus.ACTIVE
            curatedBy = testAdminId
        }
        return galleryMediaRepository.save(media)
    }

    @Nested
    @DisplayName("POST /api/v1/admin/gallery/{mediaId}/update-exif")
    inner class UpdateExif {
        @Test
        @DisplayName("Should update EXIF fields for valid UserUploadedMedia")
        fun `valid request updates EXIF fields and returns 200`() {
            val media = seedUserUploadedMedia()
            val request = UpdateExifRequest(
                latitude = 14.8672,
                longitude = -24.7045,
                altitude = 150.5,
                dateTaken = Instant.parse("2024-06-15T10:30:00Z"),
                cameraMake = "DJI",
                cameraModel = "FC3302",
                orientation = 1,
                photoType = "CULTURAL_SITE",
                gpsPrivacyLevel = "FULL",
            )

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/${media.id}/update-exif")
                        .with(adminAuth())
                        .contentType(HttpMediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.id").value(media.id.toString()))

            val updated = galleryMediaRepository.findById(media.id!!).get() as UserUploadedMedia
            assertThat(updated.latitude).isEqualByComparingTo(BigDecimal.valueOf(14.8672))
            assertThat(updated.longitude).isEqualByComparingTo(BigDecimal.valueOf(-24.7045))
            assertThat(updated.altitude).isEqualByComparingTo(BigDecimal.valueOf(150.5))
            assertThat(updated.dateTaken).isEqualTo(Instant.parse("2024-06-15T10:30:00Z"))
            assertThat(updated.cameraMake).isEqualTo("DJI")
            assertThat(updated.cameraModel).isEqualTo("FC3302")
            assertThat(updated.orientation).isEqualTo(1)
            assertThat(updated.photoType).isEqualTo("CULTURAL_SITE")
            assertThat(updated.gpsPrivacyLevel).isEqualTo("FULL")
        }

        @Test
        @DisplayName("Should return 404 for non-existent media ID")
        fun `non-existent media returns 404`() {
            val request = UpdateExifRequest(latitude = 14.0)

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/${UUID.randomUUID()}/update-exif")
                        .with(adminAuth())
                        .contentType(HttpMediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isNotFound)
        }

        @Test
        @DisplayName("Should return 422 for ExternalMedia (not UserUploadedMedia)")
        fun `external media returns 422`() {
            val external = seedExternalMedia()
            val request = UpdateExifRequest(latitude = 14.0)

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/${external.id}/update-exif")
                        .with(adminAuth())
                        .contentType(HttpMediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isUnprocessableEntity)
        }

        @Test
        @DisplayName("Should return 400 for invalid latitude (> 90)")
        fun `invalid latitude returns 400`() {
            val media = seedUserUploadedMedia()
            val request = UpdateExifRequest(latitude = 91.0)

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/${media.id}/update-exif")
                        .with(adminAuth())
                        .contentType(HttpMediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isBadRequest)
        }

        @Test
        @DisplayName("Should write audit row with action EXIF_UPDATE")
        fun `audit row written with correct action`() {
            val media = seedUserUploadedMedia()
            val request = UpdateExifRequest(
                latitude = 14.8672,
                longitude = -24.7045,
            )

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/${media.id}/update-exif")
                        .with(adminAuth())
                        .contentType(HttpMediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isOk)

            val audits = auditRepository.findByMediaIdOrderByCreatedAtDesc(media.id!!)
            assertThat(audits).hasSize(1)
            assertThat(audits[0].action).isEqualTo("EXIF_UPDATE")
            assertThat(audits[0].mediaId).isEqualTo(media.id)
        }

        @Test
        @DisplayName("Should only apply non-null fields (PATCH semantics)")
        fun `partial update only changes provided fields`() {
            val media = seedUserUploadedMedia().apply {
                cameraMake = "Apple"
                cameraModel = "iPhone 13 Pro"
            }
            galleryMediaRepository.save(media)

            val request = UpdateExifRequest(
                latitude = 14.8672,
                longitude = -24.7045,
            )

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/${media.id}/update-exif")
                        .with(adminAuth())
                        .contentType(HttpMediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isOk)

            val updated = galleryMediaRepository.findById(media.id!!).get() as UserUploadedMedia
            assertThat(updated.latitude).isEqualByComparingTo(BigDecimal.valueOf(14.8672))
            assertThat(updated.longitude).isEqualByComparingTo(BigDecimal.valueOf(-24.7045))
            assertThat(updated.cameraMake).isEqualTo("Apple")
            assertThat(updated.cameraModel).isEqualTo("iPhone 13 Pro")
        }
    }
}
