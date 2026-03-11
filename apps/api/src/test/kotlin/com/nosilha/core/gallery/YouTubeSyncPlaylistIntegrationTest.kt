package com.nosilha.core.gallery

import com.nosilha.core.gallery.api.dto.SaveYouTubeSyncPlaylistRequest
import com.nosilha.core.gallery.domain.YouTubeApiClient
import com.nosilha.core.gallery.domain.YouTubePlaylistItem
import com.nosilha.core.gallery.domain.YouTubePlaylistItemContentDetails
import com.nosilha.core.gallery.domain.YouTubePlaylistItemStatus
import com.nosilha.core.gallery.domain.YouTubePlaylistResponse
import com.nosilha.core.gallery.domain.YouTubeResourceId
import com.nosilha.core.gallery.domain.YouTubeSnippet
import com.nosilha.core.gallery.domain.YouTubeThumbnail
import com.nosilha.core.gallery.domain.YouTubeThumbnails
import com.nosilha.core.gallery.repository.YouTubeSyncPlaylistRepository
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import tools.jackson.databind.json.JsonMapper
import java.util.UUID
import org.springframework.http.MediaType as HttpMediaType

@ActiveProfiles("test")
@SpringBootTest(
    properties = [
        "youtube.sync.api-key=test-api-key",
        "youtube.sync.channel-handle=testchannel",
    ],
)
@AutoConfigureMockMvc
class YouTubeSyncPlaylistIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jsonMapper: JsonMapper

    @Autowired
    private lateinit var playlistRepository: YouTubeSyncPlaylistRepository

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @MockitoBean
    private lateinit var youTubeApiClient: YouTubeApiClient

    private val testAdminId = UUID.fromString("00000000-0000-0000-0000-000000000001")

    @BeforeEach
    fun setup() {
        jdbcTemplate.execute("DELETE FROM gallery_media")
        jdbcTemplate.execute("DELETE FROM event_publication")
        jdbcTemplate.execute("DELETE FROM youtube_sync_playlist")
        jdbcTemplate.execute("DELETE FROM youtube_sync_config")
        jdbcTemplate.execute("DELETE FROM users")
        jdbcTemplate.execute(
            """INSERT INTO users (id, email) VALUES
                ('$testAdminId', 'admin@test.com')
                ON CONFLICT DO NOTHING""",
        )
        jdbcTemplate.execute(
            "INSERT INTO youtube_sync_config (enabled, default_category) VALUES (true, 'Culture')",
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

    private val basePath = "/api/v1/admin/gallery/youtube/playlists"

    // --- CRUD Tests ---

    @Test
    @DisplayName("POST /youtube/playlists - Creates a saved playlist")
    fun `savePlaylist should create and return 201`() {
        val request = SaveYouTubeSyncPlaylistRequest(
            playlistId = "PLtest123",
            label = "Brava Music",
            category = "Music",
        )

        mockMvc
            .perform(
                post(basePath)
                    .with(adminAuth())
                    .contentType(HttpMediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(request)),
            ).andExpect(status().isCreated)
            .andExpect(jsonPath("$.status").value(201))
            .andExpect(jsonPath("$.data.playlistId").value("PLtest123"))
            .andExpect(jsonPath("$.data.label").value("Brava Music"))
            .andExpect(jsonPath("$.data.category").value("Music"))
            .andExpect(jsonPath("$.data.lastSyncCount").value(0))
            .andExpect(jsonPath("$.data.id").isNotEmpty)
    }

    @Test
    @DisplayName("POST /youtube/playlists - Rejects duplicate playlist ID")
    fun `savePlaylist should reject duplicate playlistId with 422`() {
        val request = SaveYouTubeSyncPlaylistRequest(
            playlistId = "PLdup",
            label = "First",
        )

        // Create the first one
        mockMvc
            .perform(
                post(basePath)
                    .with(adminAuth())
                    .contentType(HttpMediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(request)),
            ).andExpect(status().isCreated)

        // Attempt duplicate
        val duplicate = SaveYouTubeSyncPlaylistRequest(
            playlistId = "PLdup",
            label = "Second",
        )

        mockMvc
            .perform(
                post(basePath)
                    .with(adminAuth())
                    .contentType(HttpMediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(duplicate)),
            ).andExpect(status().isUnprocessableEntity)
    }

    @Test
    @DisplayName("GET /youtube/playlists - Lists saved playlists sorted by label")
    fun `listPlaylists should return playlists sorted by label`() {
        // Create two playlists (Z first, A second — should return A, Z)
        createPlaylist("PLz", "Zanzibar")
        createPlaylist("PLa", "Alpha")

        mockMvc
            .perform(
                get(basePath)
                    .with(adminAuth()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.data.length()").value(2))
            .andExpect(jsonPath("$.data[0].label").value("Alpha"))
            .andExpect(jsonPath("$.data[1].label").value("Zanzibar"))
    }

    @Test
    @DisplayName("PUT /youtube/playlists/{id} - Updates a saved playlist")
    fun `updatePlaylist should modify fields`() {
        val id = createPlaylist("PLorig", "Original")

        val updateRequest = SaveYouTubeSyncPlaylistRequest(
            playlistId = "PLorig",
            label = "Updated Label",
            category = "Travel",
        )

        mockMvc
            .perform(
                put("$basePath/$id")
                    .with(adminAuth())
                    .contentType(HttpMediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(updateRequest)),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.data.label").value("Updated Label"))
            .andExpect(jsonPath("$.data.category").value("Travel"))
    }

    @Test
    @DisplayName("DELETE /youtube/playlists/{id} - Deletes a saved playlist")
    fun `deletePlaylist should return 204`() {
        val id = createPlaylist("PLdel", "To Delete")

        mockMvc
            .perform(
                delete("$basePath/$id")
                    .with(adminAuth()),
            ).andExpect(status().isNoContent)

        // Verify it's gone
        mockMvc
            .perform(
                get(basePath)
                    .with(adminAuth()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.data.length()").value(0))
    }

    @Test
    @DisplayName("DELETE /youtube/playlists/{id} - Returns 404 for unknown ID")
    fun `deletePlaylist should return 404 for missing id`() {
        mockMvc
            .perform(
                delete("$basePath/${UUID.randomUUID()}")
                    .with(adminAuth()),
            ).andExpect(status().isNotFound)
    }

    // --- Sync Tests ---

    @Test
    @DisplayName("POST /youtube/playlists/{id}/sync - Syncs a saved playlist")
    fun `syncSavedPlaylist should sync and record result`() {
        val id = createPlaylist("PLsync", "Sync Me", "Music")

        `when`(youTubeApiClient.fetchPlaylistItems("PLsync", null))
            .thenReturn(
                YouTubePlaylistResponse(
                    items = listOf(
                        createPlaylistItem("vid1", "Video 1", "Description"),
                        createPlaylistItem("vid2", "Video 2", "Description"),
                    ),
                    nextPageToken = null,
                ),
            )

        mockMvc
            .perform(
                post("$basePath/$id/sync")
                    .with(adminAuth())
                    .contentType(HttpMediaType.APPLICATION_JSON),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.data.synced").value(2))
            .andExpect(jsonPath("$.data.skipped").value(0))

        // Verify sync result was recorded on the playlist
        val updated = playlistRepository.findById(UUID.fromString(id)).orElseThrow()
        assert(updated.lastSyncedAt != null) { "lastSyncedAt should be set" }
        assert(updated.lastSyncCount == 2) { "lastSyncCount should be 2" }
    }

    @Test
    @DisplayName("POST /youtube/playlists/{id}/sync - Uses global default category when playlist has none")
    fun `syncSavedPlaylist should fall back to global default category`() {
        val id = createPlaylist("PLnocat", "No Category")

        `when`(youTubeApiClient.fetchPlaylistItems("PLnocat", null))
            .thenReturn(
                YouTubePlaylistResponse(
                    items = listOf(
                        createPlaylistItem("vid_nocat", "No Cat Video", "Test"),
                    ),
                    nextPageToken = null,
                ),
            )

        mockMvc
            .perform(
                post("$basePath/$id/sync")
                    .with(adminAuth())
                    .contentType(HttpMediaType.APPLICATION_JSON),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.data.synced").value(1))

        // Global default category is "Culture" (from @BeforeEach)
        val media = jdbcTemplate.queryForMap(
            "SELECT category FROM gallery_media WHERE external_id = 'vid_nocat'",
        )
        assert(media["category"] == "Culture") { "Expected global default 'Culture', got ${media["category"]}" }
    }

    // --- Helpers ---

    private fun createPlaylist(
        playlistId: String,
        label: String,
        category: String? = null,
    ): String {
        val request = SaveYouTubeSyncPlaylistRequest(
            playlistId = playlistId,
            label = label,
            category = category,
        )

        val result = mockMvc
            .perform(
                post(basePath)
                    .with(adminAuth())
                    .contentType(HttpMediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(request)),
            ).andExpect(status().isCreated)
            .andReturn()

        val body = result.response.contentAsString
        // Extract ID from JSON response
        val idRegex = """"id"\s*:\s*"([^"]+)"""".toRegex()
        return idRegex.find(body)?.groupValues?.get(1)
            ?: throw IllegalStateException("Could not extract id from response: $body")
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
