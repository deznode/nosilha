package com.nosilha.core.gallery

import com.nosilha.core.gallery.domain.R2StorageService
import com.nosilha.core.gallery.repository.GalleryMediaRepository
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
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class GalleryControllerFeaturedVideoTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var galleryMediaRepository: GalleryMediaRepository

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @MockitoBean
    private lateinit var r2StorageService: R2StorageService

    private val testAdminId = UUID.fromString("00000000-0000-0000-0000-000000000001")

    private val videoAId = UUID.fromString("22222222-2222-2222-2222-222222222001")
    private val videoBId = UUID.fromString("22222222-2222-2222-2222-222222222002")

    @BeforeEach
    fun setup() {
        galleryMediaRepository.deleteAll()
        jdbcTemplate.execute("DELETE FROM event_publication")
        jdbcTemplate.execute("DELETE FROM users")
        jdbcTemplate.execute(
            """INSERT INTO users (id, email) VALUES
                ('$testAdminId', 'admin@test.com')
                ON CONFLICT DO NOTHING""",
        )
        seedExternalVideos()
    }

    /**
     * Seeds two ACTIVE external videos via SQL — neither is featured initially.
     */
    private fun seedExternalVideos() {
        jdbcTemplate.execute(
            """INSERT INTO gallery_media (
                id, title, description, category, display_order, status,
                media_source, show_in_gallery, alt_text,
                media_type, platform, external_id, url, thumbnail_url,
                author, featured, duration_seconds,
                curated_by, created_at, updated_at
            ) VALUES (
                '$videoAId',
                'Brava Island Documentary',
                'A documentary about Brava cultural heritage',
                'Culture', 1, 'ACTIVE',
                'EXTERNAL', true, 'Documentary thumbnail',
                'VIDEO', 'YOUTUBE', 'abc123xyz',
                'https://www.youtube.com/watch?v=abc123xyz',
                'https://img.youtube.com/vi/abc123xyz/hqdefault.jpg',
                'Nos Ilha Channel', false, 272,
                '$testAdminId', NOW(), NOW()
            )""",
        )

        jdbcTemplate.execute(
            """INSERT INTO gallery_media (
                id, title, description, category, display_order, status,
                media_source, show_in_gallery, alt_text,
                media_type, platform, external_id, url, thumbnail_url,
                author, featured, duration_seconds,
                curated_by, created_at, updated_at
            ) VALUES (
                '$videoBId',
                'Morna Music Session',
                'Traditional morna performance in Nova Sintra',
                'Culture', 2, 'ACTIVE',
                'EXTERNAL', true, 'Music session thumbnail',
                'VIDEO', 'YOUTUBE', 'def456uvw',
                'https://www.youtube.com/watch?v=def456uvw',
                'https://img.youtube.com/vi/def456uvw/hqdefault.jpg',
                'Brava Music', false, 3735,
                '$testAdminId', NOW(), NOW()
            )""",
        )
    }

    private fun adminAuth() =
        authentication(
            UsernamePasswordAuthenticationToken(
                testAdminId.toString(),
                null,
                listOf(SimpleGrantedAuthority("ROLE_ADMIN")),
            ),
        )

    @Nested
    @DisplayName("GET /api/v1/gallery/videos/featured")
    inner class GetFeaturedVideo {
        @Test
        @DisplayName("Should return 404 when no video is featured")
        fun `returns 404 when no featured video`() {
            mockMvc
                .perform(
                    get("/api/v1/gallery/videos/featured"),
                ).andExpect(status().isNotFound)
        }

        @Test
        @DisplayName("Should return 200 with featured video after admin sets featured=true")
        fun `returns featured video after setting featured`() {
            // Set video A as featured via admin PATCH
            mockMvc
                .perform(
                    patch("/api/v1/admin/gallery/$videoAId")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"featured": true}"""),
                ).andExpect(status().isOk)

            // Now GET featured should return video A
            mockMvc
                .perform(
                    get("/api/v1/gallery/videos/featured"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.id").value(videoAId.toString()))
                .andExpect(jsonPath("$.data.title").value("Brava Island Documentary"))
                .andExpect(jsonPath("$.data.featured").value(true))
                .andExpect(jsonPath("$.data.mediaSource").value("EXTERNAL"))
                .andExpect(jsonPath("$.data.mediaType").value("VIDEO"))
        }

        @Test
        @DisplayName("Should include durationSeconds in featured video response")
        fun `featured video response includes durationSeconds`() {
            // Set video A as featured
            mockMvc
                .perform(
                    patch("/api/v1/admin/gallery/$videoAId")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"featured": true}"""),
                ).andExpect(status().isOk)

            mockMvc
                .perform(
                    get("/api/v1/gallery/videos/featured"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.durationSeconds").value(272))
        }

        @Test
        @DisplayName("Should enforce featured exclusivity — setting new featured clears previous")
        fun `setting new featured clears previous featured video`() {
            // Set video A as featured
            mockMvc
                .perform(
                    patch("/api/v1/admin/gallery/$videoAId")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"featured": true}"""),
                ).andExpect(status().isOk)

            // Set video B as featured (should clear video A)
            mockMvc
                .perform(
                    patch("/api/v1/admin/gallery/$videoBId")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"featured": true}"""),
                ).andExpect(status().isOk)

            // GET featured should now return video B, not A
            mockMvc
                .perform(
                    get("/api/v1/gallery/videos/featured"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.id").value(videoBId.toString()))
                .andExpect(jsonPath("$.data.title").value("Morna Music Session"))
                .andExpect(jsonPath("$.data.durationSeconds").value(3735))
        }
    }
}
