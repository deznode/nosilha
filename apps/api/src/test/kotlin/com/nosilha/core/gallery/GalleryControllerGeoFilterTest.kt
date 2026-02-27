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
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class GalleryControllerGeoFilterTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var galleryMediaRepository: GalleryMediaRepository

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @MockitoBean
    private lateinit var r2StorageService: R2StorageService

    private val testUserId = UUID.fromString("00000000-0000-0000-0000-000000000001")

    // UserUpload WITH coordinates
    private val geoHeritageId = UUID.fromString("22222222-2222-2222-2222-222222220001")
    private val geoNatureId = UUID.fromString("22222222-2222-2222-2222-222222220002")

    // UserUpload WITHOUT coordinates
    private val noGeoId = UUID.fromString("22222222-2222-2222-2222-222222220003")

    // ExternalMedia (never has coordinates)
    private val externalId = UUID.fromString("22222222-2222-2222-2222-222222220004")

    @BeforeEach
    fun setup() {
        galleryMediaRepository.deleteAll()
        jdbcTemplate.execute("DELETE FROM users")
        jdbcTemplate.execute(
            """INSERT INTO users (id, email) VALUES
                ('$testUserId', 'test@test.com')
                ON CONFLICT DO NOTHING""",
        )
        seedTestMedia()
    }

    private fun seedTestMedia() {
        // 1. UserUpload WITH geo — Heritage category
        jdbcTemplate.execute(
            """INSERT INTO gallery_media (
                id, title, description, category, display_order, status,
                media_source, show_in_gallery, location_name, alt_text,
                public_url, uploaded_by, latitude, longitude,
                date_taken, created_at, updated_at
            ) VALUES (
                '$geoHeritageId',
                'Igreja de São João Baptista',
                'Historic church in Vila Nova Sintra',
                'Heritage', 1, 'ACTIVE',
                'USER_UPLOAD', true, 'Vila Nova Sintra', 'Church facade',
                'https://media.example.com/church.jpg', '$testUserId',
                14.8512, -24.7134,
                '2024-06-15 10:30:00+00', NOW(), NOW()
            )""",
        )

        // 2. UserUpload WITH geo — Nature category
        jdbcTemplate.execute(
            """INSERT INTO gallery_media (
                id, title, description, category, display_order, status,
                media_source, show_in_gallery, location_name, alt_text,
                public_url, uploaded_by, latitude, longitude,
                date_taken, created_at, updated_at
            ) VALUES (
                '$geoNatureId',
                'Fajã d''Água bay panorama',
                'Coastal view from the viewpoint',
                'Nature', 2, 'ACTIVE',
                'USER_UPLOAD', true, 'Fajã d''Água', 'Bay panorama',
                'https://media.example.com/bay.jpg', '$testUserId',
                14.8650, -24.7200,
                '2024-03-15 14:00:00+00', NOW(), NOW()
            )""",
        )

        // 3. UserUpload WITHOUT geo
        jdbcTemplate.execute(
            """INSERT INTO gallery_media (
                id, title, description, category, display_order, status,
                media_source, show_in_gallery, location_name, alt_text,
                public_url, uploaded_by,
                created_at, updated_at
            ) VALUES (
                '$noGeoId',
                'Festival de música tradicional',
                'Annual music festival in the central square',
                'Event', 3, 'ACTIVE',
                'USER_UPLOAD', true, 'Nova Sintra', 'Music festival',
                'https://media.example.com/festival.jpg', '$testUserId',
                NOW(), NOW()
            )""",
        )

        // 4. ExternalMedia (EXTERNAL — no latitude/longitude)
        jdbcTemplate.execute(
            """INSERT INTO gallery_media (
                id, title, description, category, display_order, status,
                media_source, show_in_gallery, alt_text,
                external_id, platform, media_type, url, thumbnail_url,
                created_at, updated_at
            ) VALUES (
                '$externalId',
                'Brava Island documentary',
                'A documentary about Brava culture',
                'Culture', 4, 'ACTIVE',
                'EXTERNAL', true, 'Video thumbnail',
                'abc123', 'YOUTUBE', 'VIDEO',
                'https://youtube.com/watch?v=abc123',
                'https://img.youtube.com/vi/abc123/hqdefault.jpg',
                NOW(), NOW()
            )""",
        )
    }

    @Nested
    @DisplayName("GET /api/v1/gallery?hasGeo=true — Geo filter")
    inner class GeoFilter {
        @Test
        @DisplayName("Should return only items with GPS coordinates")
        fun `hasGeo true returns only geo-tagged items`() {
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("hasGeo", "true"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data").isArray)
                .andExpect(jsonPath("$.data.length()").value(2))
        }

        @Test
        @DisplayName("Should exclude items without coordinates")
        fun `hasGeo true excludes items without coordinates`() {
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("hasGeo", "true"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data[?(@.id == '$noGeoId')]").isEmpty)
        }

        @Test
        @DisplayName("Should exclude ExternalMedia items")
        fun `hasGeo true excludes external media`() {
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("hasGeo", "true"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data[?(@.id == '$externalId')]").isEmpty)
        }

        @Test
        @DisplayName("Should have non-null latitude and longitude in all results")
        fun `hasGeo true results have non-null coordinates`() {
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("hasGeo", "true"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data[0].latitude").isNotEmpty)
                .andExpect(jsonPath("$.data[0].longitude").isNotEmpty)
                .andExpect(jsonPath("$.data[1].latitude").isNotEmpty)
                .andExpect(jsonPath("$.data[1].longitude").isNotEmpty)
        }

        @Test
        @DisplayName("Should combine hasGeo with category filter")
        fun `hasGeo true with category narrows results`() {
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("hasGeo", "true")
                        .param("category", "Heritage"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data").isArray)
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(geoHeritageId.toString()))
        }

        @Test
        @DisplayName("hasGeo=false should return same results as no hasGeo parameter")
        fun `hasGeo false returns all results`() {
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("hasGeo", "false"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.length()").value(4))

            mockMvc
                .perform(
                    get("/api/v1/gallery"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.length()").value(4))
        }

        @Test
        @DisplayName("Absent hasGeo should return all results")
        fun `absent hasGeo returns all results`() {
            mockMvc
                .perform(
                    get("/api/v1/gallery"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.length()").value(4))
        }
    }
}
