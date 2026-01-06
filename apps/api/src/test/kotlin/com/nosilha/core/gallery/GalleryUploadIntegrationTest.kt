package com.nosilha.core.gallery

import com.nosilha.core.gallery.api.dto.ConfirmRequest
import com.nosilha.core.gallery.api.dto.PresignRequest
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.gallery.domain.PresignedPutUrlResult
import com.nosilha.core.gallery.domain.R2StorageService
import com.nosilha.core.gallery.domain.UserUploadedMedia
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyInt
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito.reset
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
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
import tools.jackson.databind.json.JsonMapper
import java.time.Instant
import java.util.*

/**
 * Integration tests for Gallery Upload flow.
 *
 * Tests the complete presign → upload → confirm flow with mocked R2 storage.
 * Uses Testcontainers for PostgreSQL database.
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class GalleryUploadIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jsonMapper: JsonMapper

    @Autowired
    private lateinit var galleryMediaRepository: GalleryMediaRepository

    @MockitoBean
    private lateinit var r2StorageService: R2StorageService

    @BeforeEach
    fun setup() {
        galleryMediaRepository.deleteAll()
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

        mockMvc
            .perform(
                post("/api/v1/gallery/upload/presign")
                    .with(userAuth())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(request)),
            ).andExpect(status().isOk)
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

        mockMvc
            .perform(
                post("/api/v1/gallery/upload/presign")
                    .with(userAuth())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(request)),
            ).andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("Should reject file exceeding size limit")
    fun `presign with file over 50MB should return 400`() {
        val request = PresignRequest(
            fileName = "large-video.mp4",
            contentType = "video/mp4",
            fileSize = 60 * 1024 * 1024,
        )

        mockMvc
            .perform(
                post("/api/v1/gallery/upload/presign")
                    .with(userAuth())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(request)),
            ).andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("Should create gallery media record when upload confirmed")
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

        mockMvc
            .perform(
                post("/api/v1/gallery/upload/confirm")
                    .with(userAuth())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(request)),
            ).andExpect(status().isCreated)
            .andExpect(jsonPath("$.data.id").isNotEmpty)
            .andExpect(jsonPath("$.data.originalName").value("my-photo.jpg"))
            .andExpect(jsonPath("$.data.status").value("PENDING_REVIEW"))

        val galleryMedia = galleryMediaRepository.findAll()
        assertThat(galleryMedia).hasSize(1)
        val media = galleryMedia[0] as UserUploadedMedia
        assertThat(media.originalName).isEqualTo("my-photo.jpg")
        assertThat(media.status).isEqualTo(GalleryMediaStatus.PENDING_REVIEW)
        assertThat(media.uploadedBy).isEqualTo("test-user-123")
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

        mockMvc
            .perform(
                post("/api/v1/gallery/upload/confirm")
                    .with(userAuth())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(request)),
            ).andExpect(status().is5xxServerError)
    }

    @Test
    @DisplayName("Should return 404 for non-existent media")
    fun `get non-existent media should return 404`() {
        mockMvc
            .perform(get("/api/v1/gallery/${UUID.randomUUID()}"))
            .andExpect(status().isNotFound)
    }

    @Test
    @DisplayName("Should return empty list for entry with no media")
    fun `get media for entry with no uploads should return empty list`() {
        mockMvc
            .perform(get("/api/v1/gallery/entry/${UUID.randomUUID()}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data").isArray)
            .andExpect(jsonPath("$.data").isEmpty)
    }

    @Test
    @DisplayName("Should reject pending list for non-admin")
    fun `get pending as non-admin should return 403`() {
        mockMvc
            .perform(
                get("/api/v1/admin/gallery/queue")
                    .with(userAuth()),
            ).andExpect(status().isForbidden)
    }

    @Test
    @DisplayName("Should return pending list for admin")
    fun `get pending as admin should return list`() {
        mockMvc
            .perform(
                get("/api/v1/admin/gallery/queue")
                    .with(adminAuth()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.data").isArray)
    }

    // =================================================================
    // MEDIA ACCESS SECURITY TESTS
    // Tests public/admin access patterns for different media statuses
    // =================================================================

    @Test
    @DisplayName("Unauthenticated user can access AVAILABLE media")
    fun `unauthenticated user can access AVAILABLE media`() {
        setupDefaultMocks()

        // Create media with AVAILABLE status via confirm + approve flow
        val storageKey = "uploads/2024/12/available-image.jpg"
        `when`(r2StorageService.objectExists(storageKey)).thenReturn(true)
        `when`(r2StorageService.getPublicUrl(storageKey)).thenReturn("https://media.example.com/$storageKey")

        val confirmRequest = ConfirmRequest(
            key = storageKey,
            originalName = "public-photo.jpg",
            contentType = "image/jpeg",
            fileSize = 1024,
            entryId = null,
            category = null,
            description = null,
        )

        // Upload as user
        mockMvc
            .perform(
                post("/api/v1/gallery/upload/confirm")
                    .with(userAuth())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(confirmRequest)),
            ).andExpect(status().isCreated)

        // Get the media ID and approve it as admin
        val media = galleryMediaRepository.findAll().first()
        media.status = GalleryMediaStatus.ACTIVE
        galleryMediaRepository.save(media)

        // Unauthenticated user can access ACTIVE media
        mockMvc
            .perform(get("/api/v1/gallery/${media.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.status").value("ACTIVE"))
    }

    @Test
    @DisplayName("Unauthenticated user gets 404 for PENDING_REVIEW media")
    fun `unauthenticated user gets 404 for PENDING_REVIEW media`() {
        setupDefaultMocks()

        // Create media with PENDING_REVIEW status
        val storageKey = "uploads/2024/12/pending-image.jpg"
        `when`(r2StorageService.objectExists(storageKey)).thenReturn(true)
        `when`(r2StorageService.getPublicUrl(storageKey)).thenReturn("https://media.example.com/$storageKey")

        val confirmRequest = ConfirmRequest(
            key = storageKey,
            originalName = "pending-photo.jpg",
            contentType = "image/jpeg",
            fileSize = 1024,
            entryId = null,
            category = null,
            description = null,
        )

        mockMvc
            .perform(
                post("/api/v1/gallery/upload/confirm")
                    .with(userAuth())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(confirmRequest)),
            ).andExpect(status().isCreated)

        val media = galleryMediaRepository.findAll().first() as UserUploadedMedia
        assertThat(media.status).isEqualTo(GalleryMediaStatus.PENDING_REVIEW)

        // Unauthenticated user cannot access PENDING_REVIEW media
        mockMvc
            .perform(get("/api/v1/gallery/${media.id}"))
            .andExpect(status().isNotFound)
    }

    @Test
    @DisplayName("Non-admin user gets 404 for PENDING_REVIEW media")
    fun `non-admin user gets 404 for PENDING_REVIEW media`() {
        setupDefaultMocks()

        val storageKey = "uploads/2024/12/pending-image2.jpg"
        `when`(r2StorageService.objectExists(storageKey)).thenReturn(true)
        `when`(r2StorageService.getPublicUrl(storageKey)).thenReturn("https://media.example.com/$storageKey")

        val confirmRequest = ConfirmRequest(
            key = storageKey,
            originalName = "pending-photo2.jpg",
            contentType = "image/jpeg",
            fileSize = 1024,
            entryId = null,
            category = null,
            description = null,
        )

        mockMvc
            .perform(
                post("/api/v1/gallery/upload/confirm")
                    .with(userAuth("uploader-user"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(confirmRequest)),
            ).andExpect(status().isCreated)

        val media = galleryMediaRepository.findAll().first() as UserUploadedMedia

        // Different non-admin user cannot access PENDING_REVIEW media
        mockMvc
            .perform(
                get("/api/v1/gallery/${media.id}")
                    .with(userAuth("other-user")),
            ).andExpect(status().isNotFound)
    }

    @Test
    @DisplayName("Admin can access PENDING_REVIEW media")
    fun `admin can access PENDING_REVIEW media`() {
        setupDefaultMocks()

        val storageKey = "uploads/2024/12/pending-image3.jpg"
        `when`(r2StorageService.objectExists(storageKey)).thenReturn(true)
        `when`(r2StorageService.getPublicUrl(storageKey)).thenReturn("https://media.example.com/$storageKey")

        val confirmRequest = ConfirmRequest(
            key = storageKey,
            originalName = "pending-for-admin.jpg",
            contentType = "image/jpeg",
            fileSize = 1024,
            entryId = null,
            category = null,
            description = null,
        )

        mockMvc
            .perform(
                post("/api/v1/gallery/upload/confirm")
                    .with(userAuth())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(confirmRequest)),
            ).andExpect(status().isCreated)

        val media = galleryMediaRepository.findAll().first() as UserUploadedMedia

        // Admin CAN access PENDING_REVIEW media
        mockMvc
            .perform(
                get("/api/v1/gallery/${media.id}")
                    .with(adminAuth()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.data.status").value("PENDING_REVIEW"))
    }

    @Test
    @DisplayName("Admin can access DELETED media for moderation review")
    fun `admin can access DELETED media`() {
        setupDefaultMocks()

        val storageKey = "uploads/2024/12/deleted-image.jpg"
        `when`(r2StorageService.objectExists(storageKey)).thenReturn(true)
        `when`(r2StorageService.getPublicUrl(storageKey)).thenReturn("https://media.example.com/$storageKey")

        val confirmRequest = ConfirmRequest(
            key = storageKey,
            originalName = "to-delete.jpg",
            contentType = "image/jpeg",
            fileSize = 1024,
            entryId = null,
            category = null,
            description = null,
        )

        mockMvc
            .perform(
                post("/api/v1/gallery/upload/confirm")
                    .with(userAuth())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(confirmRequest)),
            ).andExpect(status().isCreated)

        val media = galleryMediaRepository.findAll().first() as UserUploadedMedia
        media.status = GalleryMediaStatus.ARCHIVED
        media.rejectionReason = "Test rejection"
        galleryMediaRepository.save(media)

        // Unauthenticated user cannot access ARCHIVED media
        mockMvc
            .perform(get("/api/v1/gallery/${media.id}"))
            .andExpect(status().isNotFound)

        // Admin CAN access ARCHIVED media for moderation purposes
        mockMvc
            .perform(
                get("/api/v1/gallery/${media.id}")
                    .with(adminAuth()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.data.status").value("ARCHIVED"))
    }
}
