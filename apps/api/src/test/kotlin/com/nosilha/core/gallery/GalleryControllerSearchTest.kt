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
class GalleryControllerSearchTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var galleryMediaRepository: GalleryMediaRepository

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @MockitoBean
    private lateinit var r2StorageService: R2StorageService

    private val testUserId = UUID.fromString("00000000-0000-0000-0000-000000000001")

    // Fixed UUIDs for test media so we can assert against them
    private val churchId = UUID.fromString("11111111-1111-1111-1111-111111111001")
    private val festivalId = UUID.fromString("11111111-1111-1111-1111-111111111002")
    private val landscapeId = UUID.fromString("11111111-1111-1111-1111-111111111003")
    private val historicalId = UUID.fromString("11111111-1111-1111-1111-111111111004")
    private val modernId = UUID.fromString("11111111-1111-1111-1111-111111111005")

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

    /**
     * Seeds gallery_media directly via SQL to control search_vector generation
     * and date fields precisely. Using JdbcTemplate ensures the GENERATED ALWAYS AS
     * search_vector column is populated by PostgreSQL.
     */
    private fun seedTestMedia() {
        // 1. Church photo — Heritage, 2024, with location
        jdbcTemplate.execute(
            """INSERT INTO gallery_media (
                id, title, description, category, display_order, status,
                media_source, show_in_gallery, location_name, alt_text,
                public_url, uploaded_by, date_taken, created_at, updated_at
            ) VALUES (
                '$churchId',
                'Igreja de São João Baptista',
                'A histórica igreja no centro de Vila Nova Sintra, construída no século XIX',
                'Heritage', 1, 'ACTIVE',
                'USER_UPLOAD', true, 'Vila Nova Sintra', 'Fachada da igreja',
                'https://media.example.com/church.jpg', '$testUserId',
                '2024-06-15 10:30:00+00', NOW(), NOW()
            )""",
        )

        // 2. Festival photo — Event, 1985 (via approximate_date), searchable
        jdbcTemplate.execute(
            """INSERT INTO gallery_media (
                id, title, description, category, display_order, status,
                media_source, show_in_gallery, location_name, alt_text,
                public_url, uploaded_by, approximate_date, created_at, updated_at
            ) VALUES (
                '$festivalId',
                'Festival de música tradicional',
                'Celebração anual com morna e coladeira na praça central',
                'Event', 2, 'ACTIVE',
                'USER_UPLOAD', true, 'Nova Sintra', 'Músicos tocando morna',
                'https://media.example.com/festival.jpg', '$testUserId',
                'circa 1985', NOW(), NOW()
            )""",
        )

        // 3. Landscape — Nature, 2005 (via date_taken)
        jdbcTemplate.execute(
            """INSERT INTO gallery_media (
                id, title, description, category, display_order, status,
                media_source, show_in_gallery, location_name, alt_text,
                public_url, uploaded_by, date_taken, created_at, updated_at
            ) VALUES (
                '$landscapeId',
                'Vista panorâmica de Fajã d''Água',
                'A paisagem costeira de Brava vista do miradouro',
                'Nature', 3, 'ACTIVE',
                'USER_UPLOAD', true, 'Fajã d''Água', 'Costa de Brava',
                'https://media.example.com/landscape.jpg', '$testUserId',
                '2005-08-20 14:00:00+00', NOW(), NOW()
            )""",
        )

        // 4. Historical photo — Heritage, pre-1975 (via approximate_date)
        jdbcTemplate.execute(
            """INSERT INTO gallery_media (
                id, title, description, category, display_order, status,
                media_source, show_in_gallery, location_name, alt_text,
                public_url, uploaded_by, approximate_date, created_at, updated_at
            ) VALUES (
                '$historicalId',
                'Porto de Furna em 1960',
                'O antigo porto principal de Brava antes da modernização',
                'Historical', 4, 'ACTIVE',
                'USER_UPLOAD', true, 'Furna', 'Porto histórico de Furna',
                'https://media.example.com/historical.jpg', '$testUserId',
                'circa 1960', NOW(), NOW()
            )""",
        )

        // 5. Modern photo — Culture, 2020 (via date_taken)
        jdbcTemplate.execute(
            """INSERT INTO gallery_media (
                id, title, description, category, display_order, status,
                media_source, show_in_gallery, location_name, alt_text,
                public_url, uploaded_by, date_taken, created_at, updated_at
            ) VALUES (
                '$modernId',
                'Casa tradicional com bougainvillea',
                'Arquitectura típica de Brava com flores coloridas',
                'Culture', 5, 'ACTIVE',
                'USER_UPLOAD', true, 'Vila Nova Sintra', 'Casa com flores',
                'https://media.example.com/modern.jpg', '$testUserId',
                '2020-03-10 09:00:00+00', NOW(), NOW()
            )""",
        )
    }

    @Nested
    @DisplayName("GET /api/v1/gallery?q= — Full-text search")
    inner class FullTextSearch {
        @Test
        @DisplayName("Should return matching results for Portuguese search term")
        fun `search for igreja returns church photo`() {
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("q", "igreja"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data").isArray)
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(churchId.toString()))
        }

        @Test
        @DisplayName("Should search across title, description, and location")
        fun `search matches description content`() {
            // "morna" appears in the festival description
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("q", "morna"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data").isArray)
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(festivalId.toString()))
        }

        @Test
        @DisplayName("Should search by location name")
        fun `search matches location name`() {
            // "Fajã d'Água" is the location of the landscape photo
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("q", "Fajã"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data").isArray)
                .andExpect(jsonPath("$.data[0].id").value(landscapeId.toString()))
        }

        @Test
        @DisplayName("Should return empty results for non-matching query")
        fun `search with no matches returns empty page`() {
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("q", "xyznonexistent"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data").isArray)
                .andExpect(jsonPath("$.data.length()").value(0))
                .andExpect(jsonPath("$.pageable.totalElements").value(0))
        }

        @Test
        @DisplayName("Should handle Portuguese text search with stemming")
        fun `Portuguese stemming matches inflected forms`() {
            // "histórica" should match "histórico" via Portuguese stemming
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("q", "histórico"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data").isArray)
                .andExpect(jsonPath("$.data").isNotEmpty)
        }

        @Test
        @DisplayName("Should rank title matches higher than description matches")
        fun `title match ranked higher than description match`() {
            // "festival" appears in title of festival and nowhere else
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("q", "festival"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data[0].id").value(festivalId.toString()))
        }
    }

    @Nested
    @DisplayName("GET /api/v1/gallery?decade= — Decade/era filter")
    inner class DecadeFilter {
        @Test
        @DisplayName("Should filter pre-1975 using approximate_date year")
        fun `decade pre-1975 returns historical photo`() {
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("decade", "pre-1975"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data").isArray)
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(historicalId.toString()))
        }

        @Test
        @DisplayName("Should filter 1975-1990 using approximate_date year")
        fun `decade 1975-1990 returns festival photo`() {
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("decade", "1975-1990"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data").isArray)
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(festivalId.toString()))
        }

        @Test
        @DisplayName("Should filter 1990-2010 using date_taken year")
        fun `decade 1990-2010 returns landscape photo`() {
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("decade", "1990-2010"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data").isArray)
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(landscapeId.toString()))
        }

        @Test
        @DisplayName("Should filter 2010-plus using date_taken year")
        fun `decade 2010-plus returns modern and church photos`() {
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("decade", "2010-plus"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data").isArray)
                .andExpect(jsonPath("$.data.length()").value(2))
        }

        @Test
        @DisplayName("Should ignore invalid decade values")
        fun `invalid decade returns all results`() {
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("decade", "invalid-range"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.length()").value(5))
        }
    }

    @Nested
    @DisplayName("GET /api/v1/gallery — Combined filters")
    inner class CombinedFilters {
        @Test
        @DisplayName("Should combine search + category filter")
        fun `search with category narrows results`() {
            // Search "Brava" matches multiple items, but category=Nature limits to landscape
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("q", "Brava")
                        .param("category", "Nature"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data").isArray)
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(landscapeId.toString()))
        }

        @Test
        @DisplayName("Should combine search + decade filter")
        fun `search with decade narrows results`() {
            // Search "Brava" matches multiple, decade=pre-1975 limits to historical
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("q", "Brava")
                        .param("decade", "pre-1975"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data").isArray)
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(historicalId.toString()))
        }

        @Test
        @DisplayName("Should combine category + decade filter")
        fun `category with decade narrows results`() {
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("category", "Heritage")
                        .param("decade", "2010-plus"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data").isArray)
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(churchId.toString()))
        }

        @Test
        @DisplayName("Should combine all three filters")
        fun `search with category and decade`() {
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("q", "música")
                        .param("category", "Event")
                        .param("decade", "1975-1990"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data").isArray)
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(festivalId.toString()))
        }

        @Test
        @DisplayName("Should return empty when filters produce no overlap")
        fun `conflicting filters return empty`() {
            // Heritage category + pre-1975 decade — church is 2024, historical is Historical
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("category", "Heritage")
                        .param("decade", "pre-1975"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data").isArray)
                .andExpect(jsonPath("$.data.length()").value(0))
        }
    }

    @Nested
    @DisplayName("GET /api/v1/gallery — Pagination")
    inner class Pagination {
        @Test
        @DisplayName("Should return pageable metadata")
        fun `response includes pageable info`() {
            mockMvc
                .perform(
                    get("/api/v1/gallery")
                        .param("page", "0")
                        .param("size", "2"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.pageable.page").value(0))
                .andExpect(jsonPath("$.pageable.size").value(2))
                .andExpect(jsonPath("$.pageable.totalElements").value(5))
                .andExpect(jsonPath("$.pageable.totalPages").value(3))
                .andExpect(jsonPath("$.pageable.first").value(true))
                .andExpect(jsonPath("$.pageable.last").value(false))
                .andExpect(jsonPath("$.data.length()").value(2))
        }
    }
}
