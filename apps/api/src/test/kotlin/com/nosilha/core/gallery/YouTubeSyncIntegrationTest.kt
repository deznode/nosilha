package com.nosilha.core.gallery

import com.nosilha.core.gallery.api.dto.YouTubePlaylistItem
import com.nosilha.core.gallery.api.dto.YouTubePlaylistItemContentDetails
import com.nosilha.core.gallery.api.dto.YouTubePlaylistItemStatus
import com.nosilha.core.gallery.api.dto.YouTubePlaylistResponse
import com.nosilha.core.gallery.api.dto.YouTubeResourceId
import com.nosilha.core.gallery.api.dto.YouTubeSnippet
import com.nosilha.core.gallery.api.dto.YouTubeSyncRequest
import com.nosilha.core.gallery.api.dto.YouTubeThumbnail
import com.nosilha.core.gallery.api.dto.YouTubeThumbnails
import com.nosilha.core.gallery.domain.ExternalMedia
import com.nosilha.core.gallery.domain.ExternalPlatform
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.gallery.domain.MediaType
import com.nosilha.core.gallery.domain.YouTubeApiClient
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import tools.jackson.databind.json.JsonMapper
import java.util.UUID
import org.springframework.http.MediaType as HttpMediaType

/**
 * Integration tests for YouTube channel sync.
 *
 * Tests the sync endpoint with a mocked YouTubeApiClient to avoid real
 * YouTube API calls. Verifies ExternalMedia creation, duplicate detection,
 * and error handling.
 */
@ActiveProfiles("test")
@SpringBootTest(
    properties = [
        "youtube.sync.enabled=true",
        "youtube.sync.api-key=test-api-key",
        "youtube.sync.channel-handle=testchannel",
    ],
)
@AutoConfigureMockMvc
class YouTubeSyncIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jsonMapper: JsonMapper

    @Autowired
    private lateinit var galleryMediaRepository: GalleryMediaRepository

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @MockitoBean
    private lateinit var youTubeApiClient: YouTubeApiClient

    private val testAdminId = UUID.fromString("00000000-0000-0000-0000-000000000001")

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
    }

    private fun adminAuth() =
        authentication(
            UsernamePasswordAuthenticationToken(
                testAdminId.toString(),
                null,
                listOf(SimpleGrantedAuthority("ROLE_ADMIN")),
            ),
        )

    @Test
    @DisplayName("POST /youtube/sync - Syncs new videos from channel")
    fun `syncChannel should create ExternalMedia for new videos`() {
        // Arrange: mock YouTube API to return 2 videos
        `when`(youTubeApiClient.fetchUploadsPlaylistId("testchannel"))
            .thenReturn("UU_test_uploads")

        `when`(youTubeApiClient.fetchPlaylistItems("UU_test_uploads", null))
            .thenReturn(
                YouTubePlaylistResponse(
                    items = listOf(
                        createPlaylistItem("video1", "Brava Island Overview", "Beautiful views"),
                        createPlaylistItem("video2", "Nova Sintra Walking Tour", "Walking around"),
                    ),
                    nextPageToken = null,
                ),
            )

        // Act
        mockMvc
            .perform(
                post("/api/v1/admin/gallery/youtube/sync")
                    .with(adminAuth())
                    .contentType(HttpMediaType.APPLICATION_JSON),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.data.synced").value(2))
            .andExpect(jsonPath("$.data.skipped").value(0))
            .andExpect(jsonPath("$.data.totalProcessed").value(2))

        // Assert: verify ExternalMedia records created
        val allMedia = galleryMediaRepository.findAllExternalMedia()
        assertEquals(2, allMedia.size, "Expected 2 external media records")
        val video1 = allMedia.find { it.externalId == "video1" }!!
        assertEquals("Brava Island Overview", video1.title)
        assertEquals(ExternalPlatform.YOUTUBE, video1.platform)
        assertEquals(MediaType.VIDEO, video1.mediaType)
        assertEquals(GalleryMediaStatus.ACTIVE, video1.status)
    }

    @Test
    @DisplayName("POST /youtube/sync - Skips existing videos (dedup)")
    fun `syncChannel should skip videos that already exist`() {
        // Arrange: pre-insert an existing ExternalMedia
        val existing = ExternalMedia().apply {
            this.mediaType = MediaType.VIDEO
            this.platform = ExternalPlatform.YOUTUBE
            this.externalId = "existing_video"
            this.title = "Already Synced"
            this.status = GalleryMediaStatus.ACTIVE
            this.curatedBy = testAdminId
        }
        galleryMediaRepository.save(existing)

        `when`(youTubeApiClient.fetchUploadsPlaylistId("testchannel"))
            .thenReturn("UU_test_uploads")

        `when`(youTubeApiClient.fetchPlaylistItems("UU_test_uploads", null))
            .thenReturn(
                YouTubePlaylistResponse(
                    items = listOf(
                        createPlaylistItem("existing_video", "Already Synced", "Old video"),
                        createPlaylistItem("new_video", "New Video", "Fresh content"),
                    ),
                    nextPageToken = null,
                ),
            )

        // Act
        mockMvc
            .perform(
                post("/api/v1/admin/gallery/youtube/sync")
                    .with(adminAuth())
                    .contentType(HttpMediaType.APPLICATION_JSON),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.data.synced").value(1))
            .andExpect(jsonPath("$.data.skipped").value(1))
            .andExpect(jsonPath("$.data.totalProcessed").value(2))

        // Assert: only 2 total records (1 existing + 1 new)
        val allMedia = galleryMediaRepository.findAllExternalMedia()
        assertEquals(2, allMedia.size, "Expected 2 external media records")
    }

    @Test
    @DisplayName("POST /youtube/sync - Syncs specific playlist with category")
    fun `syncPlaylist should apply category override`() {
        `when`(youTubeApiClient.fetchPlaylistItems("PL_custom_playlist", null))
            .thenReturn(
                YouTubePlaylistResponse(
                    items = listOf(
                        createPlaylistItem("pl_video1", "Music of Brava", "Morna performance"),
                    ),
                    nextPageToken = null,
                ),
            )

        val request = YouTubeSyncRequest(
            playlistId = "PL_custom_playlist",
            category = "Culture",
        )

        mockMvc
            .perform(
                post("/api/v1/admin/gallery/youtube/sync")
                    .with(adminAuth())
                    .contentType(HttpMediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(request)),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.data.synced").value(1))

        val media = galleryMediaRepository.findAllExternalMedia()
        assertEquals(1, media.size)
        assertEquals("Culture", media[0].category)
    }

    @Test
    @DisplayName("POST /youtube/sync - Skips non-public videos")
    fun `syncChannel should skip private and unlisted videos`() {
        `when`(youTubeApiClient.fetchUploadsPlaylistId("testchannel"))
            .thenReturn("UU_test_uploads")

        `when`(youTubeApiClient.fetchPlaylistItems("UU_test_uploads", null))
            .thenReturn(
                YouTubePlaylistResponse(
                    items = listOf(
                        createPlaylistItem("public_video", "Public Video", "Visible", "public"),
                        createPlaylistItem("private_video", "Private Video", "Hidden", "private"),
                        createPlaylistItem("unlisted_video", "Unlisted Video", "Link only", "unlisted"),
                    ),
                    nextPageToken = null,
                ),
            )

        mockMvc
            .perform(
                post("/api/v1/admin/gallery/youtube/sync")
                    .with(adminAuth())
                    .contentType(HttpMediaType.APPLICATION_JSON),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.data.synced").value(1))
            .andExpect(jsonPath("$.data.skipped").value(2))

        val allMedia = galleryMediaRepository.findAllExternalMedia()
        assertEquals(1, allMedia.size)
        assertEquals("public_video", allMedia[0].externalId)
    }

    @Test
    @DisplayName("POST /youtube/sync - Requires ADMIN role")
    fun `syncEndpoint should reject non-admin users`() {
        val userAuth = authentication(
            UsernamePasswordAuthenticationToken(
                testAdminId.toString(),
                null,
                listOf(SimpleGrantedAuthority("ROLE_USER")),
            ),
        )

        mockMvc
            .perform(
                post("/api/v1/admin/gallery/youtube/sync")
                    .with(userAuth)
                    .contentType(HttpMediaType.APPLICATION_JSON),
            ).andExpect(status().isForbidden)
    }

    private fun createPlaylistItem(
        videoId: String,
        title: String,
        description: String,
        privacyStatus: String = "public",
    ): YouTubePlaylistItem =
        YouTubePlaylistItem(
            snippet = YouTubeSnippet(
                title = title,
                description = description,
                channelTitle = "Nos Ilha",
                thumbnails = YouTubeThumbnails(
                    high = YouTubeThumbnail(url = "https://img.youtube.com/vi/$videoId/hqdefault.jpg"),
                ),
                resourceId = YouTubeResourceId(videoId = videoId),
            ),
            contentDetails = YouTubePlaylistItemContentDetails(
                videoId = videoId,
                videoPublishedAt = "2026-01-15T10:00:00Z",
            ),
            status = YouTubePlaylistItemStatus(
                privacyStatus = privacyStatus,
            ),
        )
}
