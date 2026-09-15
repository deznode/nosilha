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
import org.springframework.core.io.ClassPathResource
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
import java.nio.charset.StandardCharsets
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

    @Autowired
    private lateinit var jdbcTemplate: org.springframework.jdbc.core.JdbcTemplate

    @BeforeEach
    fun setup() {
        galleryMediaRepository.deleteAll()
        jdbcTemplate.execute("DELETE FROM users")
        // Insert test users for FK constraints on created_by/updated_by
        jdbcTemplate.execute(
            """INSERT INTO users (id, email) VALUES
                ('$testUserId', 'user@test.com'),
                ('$testAdminId', 'admin@test.com'),
                ('$uploaderUserId', 'uploader@test.com'),
                ('$otherUserId', 'other@test.com')
                ON CONFLICT DO NOTHING""",
        )
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

    private val testUserId = UUID.fromString("00000000-0000-0000-0000-000000000001")
    private val testAdminId = UUID.fromString("00000000-0000-0000-0000-000000000002")
    private val uploaderUserId = UUID.fromString("00000000-0000-0000-0000-000000000003")
    private val otherUserId = UUID.fromString("00000000-0000-0000-0000-000000000004")

    /**
     * Creates an authentication with user ID as principal (matching controller expectation).
     */
    private fun userAuth(
        userId: UUID = testUserId,
        roles: List<String> = listOf("USER"),
    ) = authentication(
        UsernamePasswordAuthenticationToken(
            userId.toString(),
            null,
            roles.map { SimpleGrantedAuthority("ROLE_$it") },
        ),
    )

    /**
     * Creates an admin authentication.
     */
    private fun adminAuth(userId: UUID = testAdminId) = userAuth(userId, listOf("ADMIN"))

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
            photographerCredit = "Test Photographer",
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
        assertThat(media.uploadedBy).isEqualTo(testUserId)
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
            photographerCredit = "Test Photographer",
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
    @DisplayName("Should reject confirm when photographer credit is blank")
    fun `confirm with blank photographer credit should return 400`() {
        setupDefaultMocks()

        val request = ConfirmRequest(
            key = "uploads/2024/12/test-uuid-blank-credit.jpg",
            originalName = "blank-credit.jpg",
            contentType = "image/jpeg",
            fileSize = 1024,
            photographerCredit = "   ",
        )

        mockMvc
            .perform(
                post("/api/v1/gallery/upload/confirm")
                    .with(userAuth())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(request)),
            ).andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.details[0].field").value("photographerCredit"))

        assertThat(galleryMediaRepository.findAll()).isEmpty()
    }

    @Test
    @DisplayName("Should reject confirm when photographer credit is missing")
    fun `confirm without photographer credit should return 400`() {
        setupDefaultMocks()

        // Raw JSON rather than ConfirmRequest, so the field is absent — not merely null.
        val body =
            """
            {"key":"uploads/2024/12/test-uuid-no-credit.jpg","originalName":"no-credit.jpg",
            "contentType":"image/jpeg","fileSize":1024}
            """.trimIndent()

        mockMvc
            .perform(
                post("/api/v1/gallery/upload/confirm")
                    .with(userAuth())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body),
            ).andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.details[0].field").value("photographerCredit"))

        assertThat(galleryMediaRepository.findAll()).isEmpty()
    }

    @Test
    @DisplayName("Should store 'not known' as typed, not as null")
    fun `confirm with not known credit should persist it verbatim`() {
        setupDefaultMocks()

        val request = ConfirmRequest(
            key = "uploads/2024/12/test-uuid-not-known.jpg",
            originalName = "not-known.jpg",
            contentType = "image/jpeg",
            fileSize = 1024,
            photographerCredit = "not known",
        )

        mockMvc
            .perform(
                post("/api/v1/gallery/upload/confirm")
                    .with(userAuth())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(request)),
            ).andExpect(status().isCreated)

        val media = galleryMediaRepository.findAll().single() as UserUploadedMedia
        assertThat(media.photographerCredit).isEqualTo("not known")
        assertThat(media.creditPlatform).isNull()
        assertThat(media.creditHandle).isNull()
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
            photographerCredit = "Test Photographer",
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

        // Unauthenticated user can access ACTIVE media (public DTO, no status field)
        mockMvc
            .perform(get("/api/v1/gallery/${media.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.id").value(media.id.toString()))
            .andExpect(jsonPath("$.data.mediaSource").value("USER_UPLOAD"))
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
            photographerCredit = "Test Photographer",
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
            photographerCredit = "Test Photographer",
        )

        mockMvc
            .perform(
                post("/api/v1/gallery/upload/confirm")
                    .with(userAuth(uploaderUserId))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(confirmRequest)),
            ).andExpect(status().isCreated)

        val media = galleryMediaRepository.findAll().first() as UserUploadedMedia

        // Different non-admin user cannot access PENDING_REVIEW media
        mockMvc
            .perform(
                get("/api/v1/gallery/${media.id}")
                    .with(userAuth(otherUserId)),
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
            photographerCredit = "Test Photographer",
        )

        mockMvc
            .perform(
                post("/api/v1/gallery/upload/confirm")
                    .with(userAuth())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(confirmRequest)),
            ).andExpect(status().isCreated)

        val media = galleryMediaRepository.findAll().first() as UserUploadedMedia

        // Public endpoint returns 404 for PENDING_REVIEW media (even for admins)
        mockMvc
            .perform(
                get("/api/v1/gallery/${media.id}")
                    .with(adminAuth()),
            ).andExpect(status().isNotFound)

        // Admin CAN access PENDING_REVIEW media via admin endpoint
        mockMvc
            .perform(
                get("/api/v1/admin/gallery/${media.id}")
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
            photographerCredit = "Test Photographer",
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

        // Public endpoint returns 404 for ARCHIVED media (even for admins)
        mockMvc
            .perform(
                get("/api/v1/gallery/${media.id}")
                    .with(adminAuth()),
            ).andExpect(status().isNotFound)

        // Admin CAN access ARCHIVED media via admin endpoint
        mockMvc
            .perform(
                get("/api/v1/admin/gallery/${media.id}")
                    .with(adminAuth()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.data.status").value("ARCHIVED"))
    }

    // =================================================================
    // TITLES AND DIMENSIONS (spec 034 FR-019, T-14)
    // =================================================================

    @Test
    @DisplayName("An upload with no description is untitled, never named after its file")
    fun `confirm without a description leaves the upload untitled`() {
        setupDefaultMocks()

        val request = ConfirmRequest(
            key = "uploads/2024/12/test-uuid-DJI_0155.JPG",
            originalName = "DJI_0155.JPG",
            contentType = "image/jpeg",
            fileSize = 1024,
            description = null,
            photographerCredit = "not known",
        )

        mockMvc
            .perform(
                post("/api/v1/gallery/upload/confirm")
                    .with(userAuth())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(request)),
            ).andExpect(status().isCreated)
            .andExpect(jsonPath("$.data.title").value(null as Any?))
            .andExpect(jsonPath("$.data.originalName").value("DJI_0155.JPG"))

        val media = galleryMediaRepository.findAll().single() as UserUploadedMedia
        assertThat(media.title).isNull()
        assertThat(media.originalName).isEqualTo("DJI_0155.JPG")
    }

    @Test
    @DisplayName("A description becomes the title; a blank one leaves it untitled")
    fun `confirm uses the description as the title`() {
        setupDefaultMocks()

        listOf("Festa de São João, Nova Sintra" to "uploads/2024/12/described.jpg", "   " to "uploads/2024/12/blank.jpg")
            .forEach { (description, key) ->
                val request = ConfirmRequest(
                    key = key,
                    originalName = key.substringAfterLast('/'),
                    contentType = "image/jpeg",
                    fileSize = 1024,
                    description = description,
                    photographerCredit = "not known",
                )
                mockMvc
                    .perform(
                        post("/api/v1/gallery/upload/confirm")
                            .with(userAuth())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(jsonMapper.writeValueAsString(request)),
                    ).andExpect(status().isCreated)
            }

        val titles = galleryMediaRepository.findAll().map { it as UserUploadedMedia }.associate { it.originalName to it.title }
        assertThat(titles).containsEntry("described.jpg", "Festa de São João, Nova Sintra")
        assertThat(titles).containsEntry("blank.jpg", null)
    }

    @Test
    @DisplayName("Records the dimensions the browser read and shows them with the file name")
    fun `confirm records dimensions and the public DTO exposes them`() {
        setupDefaultMocks()

        val request = ConfirmRequest(
            key = "uploads/2024/12/test-uuid-harbour.jpg",
            originalName = "harbour.jpg",
            contentType = "image/jpeg",
            fileSize = 1024,
            width = 1200,
            height = 800,
            photographerCredit = "Ana Lopes",
        )

        mockMvc
            .perform(
                post("/api/v1/gallery/upload/confirm")
                    .with(userAuth())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(request)),
            ).andExpect(status().isCreated)

        val media = galleryMediaRepository.findAll().single() as UserUploadedMedia
        assertThat(media.width).isEqualTo(1200)
        assertThat(media.height).isEqualTo(800)

        media.status = GalleryMediaStatus.ACTIVE
        galleryMediaRepository.save(media)

        mockMvc
            .perform(get("/api/v1/gallery/${media.id}"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.originalName").value("harbour.jpg"))
            .andExpect(jsonPath("$.data.width").value(1200))
            .andExpect(jsonPath("$.data.height").value(800))
    }

    @Test
    @DisplayName("Rejects dimensions that are not positive")
    fun `confirm with a zero width returns 400`() {
        setupDefaultMocks()

        val request = ConfirmRequest(
            key = "uploads/2024/12/test-uuid-zero.jpg",
            originalName = "zero.jpg",
            contentType = "image/jpeg",
            fileSize = 1024,
            width = 0,
            height = 800,
            photographerCredit = "not known",
        )

        mockMvc
            .perform(
                post("/api/v1/gallery/upload/confirm")
                    .with(userAuth())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(request)),
            ).andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.details[0].field").value("width"))
    }

    @Test
    @DisplayName("V17 untitles only uploads whose title is their file name")
    fun `untitle migration clears titles that merely repeat the file name`() {
        val named = UUID.randomUUID()
        val titled = UUID.randomUUID()
        val film = UUID.randomUUID()
        jdbcTemplate.update(
            "INSERT INTO gallery_media (id, media_source, status, title, original_name) VALUES (?, 'USER_UPLOAD', 'ACTIVE', 'IMG_0001.jpg', 'IMG_0001.jpg')",
            named,
        )
        jdbcTemplate.update(
            "INSERT INTO gallery_media (id, media_source, status, title, original_name) VALUES (?, 'USER_UPLOAD', 'ACTIVE', 'Festa', 'IMG_0002.jpg')",
            titled,
        )
        jdbcTemplate.update(
            "INSERT INTO gallery_media (id, media_source, status, title) VALUES (?, 'EXTERNAL', 'ACTIVE', 'Festa de São João')",
            film,
        )

        jdbcTemplate.execute(
            ClassPathResource("db/migration/V17__untitle_uploads_named_after_their_file.sql").getContentAsString(StandardCharsets.UTF_8),
        )

        fun titleOf(id: UUID) = jdbcTemplate.queryForObject("SELECT title FROM gallery_media WHERE id = ?", String::class.java, id)
        assertThat(titleOf(named)).isNull()
        assertThat(titleOf(titled)).isEqualTo("Festa")
        assertThat(titleOf(film)).isEqualTo("Festa de São João")

        val applied = jdbcTemplate.queryForObject(
            "SELECT success FROM flyway_schema_history WHERE version = '17'",
            Boolean::class.java,
        )
        assertThat(applied).isTrue()
    }
}
