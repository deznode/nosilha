package com.nosilha.core.media

import com.fasterxml.jackson.databind.ObjectMapper
import com.nosilha.core.media.api.dto.ConfirmRequest
import com.nosilha.core.media.api.dto.PresignRequest
import com.nosilha.core.media.domain.MediaStatus
import com.nosilha.core.media.domain.PresignedPutUrlResult
import com.nosilha.core.media.domain.R2StorageService
import com.nosilha.core.media.repository.MediaRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyInt
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito.reset
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.*

/**
 * Integration tests for Media Upload flow.
 *
 * Tests the complete presign → upload → confirm flow with mocked R2 storage.
 * Uses Testcontainers for PostgreSQL database.
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class MediaUploadIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var mediaRepository: MediaRepository

    @MockitoBean
    private lateinit var r2StorageService: R2StorageService

    @BeforeEach
    fun setup() {
        mediaRepository.deleteAll()
        reset(r2StorageService)
    }

    private fun setupDefaultMocks() {
        `when`(r2StorageService.generatePresignedPutUrl(anyString(), anyString(), anyInt()))
            .thenAnswer { invocation ->
                val fileName = invocation.getArgument<String>(0)
                PresignedPutUrlResult(
                    uploadUrl = "https://r2.example.com/upload?signature=abc",
                    key = "uploads/2024/12/test-uuid-$fileName",
                    expiresAt = Instant.now().plusSeconds(600),
                )
            }

        `when`(r2StorageService.objectExists(anyString())).thenReturn(true)
        `when`(r2StorageService.getPublicUrl(anyString())).thenAnswer { invocation ->
            "https://media.example.com/${invocation.getArgument<String>(0)}"
        }
    }

    /**
     * Creates an authentication with user ID as principal (matching controller expectation).
     */
    private fun userAuth(
        userId: String = "test-user-123",
        roles: List<String> = listOf("USER"),
    ) = authentication(
        UsernamePasswordAuthenticationToken(
            userId,
            null,
            roles.map { SimpleGrantedAuthority("ROLE_$it") },
        ),
    )

    /**
     * Creates an admin authentication.
     */
    private fun adminAuth(userId: String = "test-admin-456") = userAuth(userId, listOf("ADMIN"))

    @Test
    @DisplayName("Should generate presigned URL for valid JPEG file")
    fun `presign with valid JPEG should return presigned URL`() {
        setupDefaultMocks()

        val request = PresignRequest(
            fileName = "test-image.jpg",
            contentType = "image/jpeg",
            fileSize = 1024 * 1024,
        )

        mockMvc.perform(
            post("/api/v1/media/presign")
                .with(userAuth())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.uploadUrl").isNotEmpty)
            .andExpect(jsonPath("$.data.key").isNotEmpty)
    }

    @Test
    @DisplayName("Should reject unsupported file type")
    fun `presign with unsupported type should return 400`() {
        val request = PresignRequest(
            fileName = "test-doc.pdf",
            contentType = "application/pdf",
            fileSize = 1024 * 1024,
        )

        mockMvc.perform(
            post("/api/v1/media/presign")
                .with(userAuth())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("Should reject file exceeding size limit")
    fun `presign with file over 50MB should return 400`() {
        val request = PresignRequest(
            fileName = "large-video.mp4",
            contentType = "video/mp4",
            fileSize = 60 * 1024 * 1024,
        )

        mockMvc.perform(
            post("/api/v1/media/presign")
                .with(userAuth())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("Should create media record when upload confirmed")
    fun `confirm with valid key should create media record`() {
        setupDefaultMocks()

        val storageKey = "uploads/2024/12/test-uuid-test-image.jpg"
        val request = ConfirmRequest(
            key = storageKey,
            originalName = "my-photo.jpg",
            contentType = "image/jpeg",
            fileSize = 1024 * 1024,
            entryId = null,
            category = "gallery",
            description = "Test upload",
        )

        mockMvc.perform(
            post("/api/v1/media/confirm")
                .with(userAuth())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.data.id").isNotEmpty)
            .andExpect(jsonPath("$.data.originalName").value("my-photo.jpg"))
            .andExpect(jsonPath("$.data.status").value("PENDING_REVIEW"))

        val media = mediaRepository.findAll()
        assertThat(media).hasSize(1)
        assertThat(media[0].originalName).isEqualTo("my-photo.jpg")
        assertThat(media[0].status).isEqualTo(MediaStatus.PENDING_REVIEW)
        assertThat(media[0].uploadedBy).isEqualTo("test-user-123")
    }

    @Test
    @DisplayName("Should reject confirm when file not in R2")
    fun `confirm with missing file should return error`() {
        `when`(r2StorageService.objectExists(anyString())).thenReturn(false)

        val storageKey = "uploads/2024/12/nonexistent-file.jpg"
        val request = ConfirmRequest(
            key = storageKey,
            originalName = "missing.jpg",
            contentType = "image/jpeg",
            fileSize = 1024 * 1024,
            entryId = null,
            category = null,
            description = null,
        )

        mockMvc.perform(
            post("/api/v1/media/confirm")
                .with(userAuth())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)),
        )
            .andExpect(status().is5xxServerError)
    }

    @Test
    @DisplayName("Should return 404 for non-existent media")
    fun `get non-existent media should return 404`() {
        mockMvc.perform(get("/api/v1/media/${UUID.randomUUID()}"))
            .andExpect(status().isNotFound)
    }

    @Test
    @DisplayName("Should return empty list for entry with no media")
    fun `get media for entry with no uploads should return empty list`() {
        mockMvc.perform(get("/api/v1/media/entry/${UUID.randomUUID()}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data").isArray)
            .andExpect(jsonPath("$.data").isEmpty)
    }

    @Test
    @DisplayName("Should reject pending list for non-admin")
    fun `get pending as non-admin should return 403`() {
        mockMvc.perform(
            get("/api/v1/media/pending")
                .with(userAuth()),
        )
            .andExpect(status().isForbidden)
    }

    @Test
    @DisplayName("Should return pending list for admin")
    fun `get pending as admin should return list`() {
        mockMvc.perform(
            get("/api/v1/media/pending")
                .with(adminAuth()),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data").isArray)
    }
}
