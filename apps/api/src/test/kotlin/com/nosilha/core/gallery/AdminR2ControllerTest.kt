package com.nosilha.core.gallery

import com.nosilha.core.gallery.api.dto.BulkConfirmRequest
import com.nosilha.core.gallery.api.dto.BulkConfirmUploadDto
import com.nosilha.core.gallery.api.dto.BulkPresignFileRequest
import com.nosilha.core.gallery.api.dto.BulkPresignRequest
import com.nosilha.core.gallery.api.dto.DeleteOrphanRequest
import com.nosilha.core.gallery.api.dto.LinkOrphanRequest
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.gallery.domain.MediaSource
import com.nosilha.core.gallery.domain.PresignedPutUrlResult
import com.nosilha.core.gallery.domain.R2ListResult
import com.nosilha.core.gallery.domain.R2ObjectInfo
import com.nosilha.core.gallery.domain.R2ObjectMetadata
import com.nosilha.core.gallery.domain.R2StorageService
import com.nosilha.core.gallery.domain.UserUploadedMedia
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyInt
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito.reset
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.kotlin.anyOrNull
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import tools.jackson.databind.json.JsonMapper
import java.time.Instant
import java.util.UUID

/**
 * Integration tests for R2 admin endpoints in AdminGalleryController.
 *
 * Tests all 6 endpoints under /api/v1/admin/gallery/r2/ with mocked R2 storage.
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class AdminR2ControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jsonMapper: JsonMapper

    @Autowired
    private lateinit var galleryMediaRepository: GalleryMediaRepository

    @MockitoBean
    private lateinit var r2StorageService: R2StorageService

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val testAdminId = UUID.fromString("00000000-0000-0000-0000-000000000002")
    private val testUserId = UUID.fromString("00000000-0000-0000-0000-000000000001")
    private val now = Instant.parse("2026-01-15T10:00:00Z")

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
        setupDefaultR2Mocks()
    }

    private fun setupDefaultR2Mocks() {
        `when`(r2StorageService.getPublicUrl(anyString())).thenAnswer { invocation ->
            "https://media.example.com/${invocation.getArgument<String>(0)}"
        }
        `when`(r2StorageService.objectExists(anyString())).thenReturn(true)
        `when`(r2StorageService.generatePresignedPutUrl(anyString(), anyString(), anyInt()))
            .thenAnswer { invocation ->
                val fileName = invocation.getArgument<String>(0)
                PresignedPutUrlResult(
                    uploadUrl = "https://r2.example.com/upload?signature=abc",
                    key = "uploads/2026/01/$fileName",
                    expiresAt = now.plusSeconds(1800),
                )
            }
    }

    private fun adminAuth(userId: UUID = testAdminId) = userAuth(userId, listOf("ADMIN"))

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

    private fun seedLinkedMedia(storageKey: String): UserUploadedMedia {
        val media = UserUploadedMedia().apply {
            title = "linked.jpg"
            this.storageKey = storageKey
            publicUrl = "https://media.example.com/$storageKey"
            fileName = "linked.jpg"
            originalName = "linked.jpg"
            contentType = "image/jpeg"
            fileSize = 1024L
            status = GalleryMediaStatus.ACTIVE
            source = MediaSource.LOCAL
            uploadedBy = testAdminId
            reviewedBy = testAdminId
            reviewedAt = now
        }
        return galleryMediaRepository.save(media)
    }

    // =================================================================
    // LIST BUCKET
    // =================================================================

    @Nested
    @DisplayName("GET /api/v1/admin/gallery/r2/list")
    inner class ListBucket {
        @Test
        @DisplayName("Should return paginated bucket objects")
        fun `list bucket returns objects with public URLs`() {
            `when`(r2StorageService.listObjects(anyOrNull(), anyOrNull(), anyInt()))
                .thenReturn(
                    R2ListResult(
                        objects = listOf(
                            R2ObjectInfo("uploads/2026/01/photo1.jpg", 2048L, now),
                            R2ObjectInfo("uploads/2026/01/photo2.png", 4096L, now),
                        ),
                        continuationToken = "next-token",
                        isTruncated = true,
                    ),
                )

            mockMvc
                .perform(
                    get("/api/v1/admin/gallery/r2/list")
                        .with(adminAuth())
                        .param("maxKeys", "2"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.objects").isArray)
                .andExpect(jsonPath("$.data.objects.length()").value(2))
                .andExpect(jsonPath("$.data.objects[0].key").value("uploads/2026/01/photo1.jpg"))
                .andExpect(jsonPath("$.data.objects[0].size").value(2048))
                .andExpect(jsonPath("$.data.objects[0].publicUrl").isNotEmpty)
                .andExpect(jsonPath("$.data.continuationToken").value("next-token"))
                .andExpect(jsonPath("$.data.isTruncated").value(true))
        }

        @Test
        @DisplayName("Should support prefix filtering")
        fun `list bucket with prefix filters results`() {
            `when`(r2StorageService.listObjects(anyOrNull(), anyOrNull(), anyInt()))
                .thenReturn(R2ListResult(objects = emptyList(), continuationToken = null, isTruncated = false))

            mockMvc
                .perform(
                    get("/api/v1/admin/gallery/r2/list")
                        .with(adminAuth())
                        .param("prefix", "uploads/2026/"),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.objects").isArray)
                .andExpect(jsonPath("$.data.isTruncated").value(false))
        }

        @Test
        @DisplayName("Should return 403 for non-admin user")
        fun `list bucket as non-admin returns 403`() {
            mockMvc
                .perform(
                    get("/api/v1/admin/gallery/r2/list")
                        .with(userAuth()),
                ).andExpect(status().isForbidden)
        }
    }

    // =================================================================
    // BULK PRESIGN
    // =================================================================

    @Nested
    @DisplayName("POST /api/v1/admin/gallery/r2/bulk-presign")
    inner class BulkPresign {
        @Test
        @DisplayName("Should return presigned URLs for valid files")
        fun `bulk presign returns presigned URLs`() {
            val request = BulkPresignRequest(
                files = listOf(
                    BulkPresignFileRequest("photo1.jpg", "image/jpeg", 1024L),
                    BulkPresignFileRequest("photo2.png", "image/png", 2048L),
                ),
            )

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/r2/bulk-presign")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.presigns").isArray)
                .andExpect(jsonPath("$.data.presigns.length()").value(2))
                .andExpect(jsonPath("$.data.presigns[0].fileName").value("photo1.jpg"))
                .andExpect(jsonPath("$.data.presigns[0].uploadUrl").isNotEmpty)
                .andExpect(jsonPath("$.data.presigns[0].key").isNotEmpty)
                .andExpect(jsonPath("$.data.presigns[0].expiresAt").isNotEmpty)
        }

        @Test
        @DisplayName("Should reject empty file list")
        fun `bulk presign with empty files returns 400`() {
            val request = BulkPresignRequest(files = emptyList())

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/r2/bulk-presign")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isBadRequest)
        }

        @Test
        @DisplayName("Should reject unsupported content type")
        fun `bulk presign with unsupported type returns 400`() {
            val request = BulkPresignRequest(
                files = listOf(
                    BulkPresignFileRequest("doc.pdf", "application/pdf", 1024L),
                ),
            )

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/r2/bulk-presign")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isBadRequest)
        }

        @Test
        @DisplayName("Should reject file exceeding 50MB")
        fun `bulk presign with oversized file returns 400`() {
            val request = BulkPresignRequest(
                files = listOf(
                    BulkPresignFileRequest("huge.jpg", "image/jpeg", 60 * 1024 * 1024L),
                ),
            )

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/r2/bulk-presign")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isBadRequest)
        }

        @Test
        @DisplayName("Should return 403 for non-admin user")
        fun `bulk presign as non-admin returns 403`() {
            val request = BulkPresignRequest(
                files = listOf(
                    BulkPresignFileRequest("photo.jpg", "image/jpeg", 1024L),
                ),
            )

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/r2/bulk-presign")
                        .with(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isForbidden)
        }
    }

    // =================================================================
    // BULK CONFIRM
    // =================================================================

    @Nested
    @DisplayName("POST /api/v1/admin/gallery/r2/bulk-confirm")
    inner class BulkConfirm {
        @Test
        @DisplayName("Should create ACTIVE media records with admin as reviewer")
        fun `bulk confirm creates ACTIVE media records`() {
            val request = BulkConfirmRequest(
                uploads = listOf(
                    BulkConfirmUploadDto(
                        key = "uploads/2026/01/photo1.jpg",
                        originalName = "photo1.jpg",
                        contentType = "image/jpeg",
                        fileSize = 1024L,
                        category = "gallery",
                        description = "Test photo",
                    ),
                ),
            )

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/r2/bulk-confirm")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isCreated)
                .andExpect(jsonPath("$.data.accepted").value(1))
                .andExpect(jsonPath("$.data.rejected").value(0))
                .andExpect(jsonPath("$.data.created").isArray)
                .andExpect(jsonPath("$.data.created.length()").value(1))
                .andExpect(jsonPath("$.data.errors").isEmpty)

            val media = galleryMediaRepository.findAll()
            assertThat(media).hasSize(1)
            val record = media[0] as UserUploadedMedia
            assertThat(record.status).isEqualTo(GalleryMediaStatus.ACTIVE)
            assertThat(record.uploadedBy).isEqualTo(testAdminId)
            assertThat(record.reviewedBy).isEqualTo(testAdminId)
            assertThat(record.reviewedAt).isNotNull()
            assertThat(record.source).isEqualTo(MediaSource.LOCAL)
        }

        @Test
        @DisplayName("Should handle mixed success and failure in batch")
        fun `bulk confirm with missing R2 object collects batch errors`() {
            `when`(r2StorageService.objectExists("uploads/2026/01/exists.jpg")).thenReturn(true)
            `when`(r2StorageService.objectExists("uploads/2026/01/missing.jpg")).thenReturn(false)

            val request = BulkConfirmRequest(
                uploads = listOf(
                    BulkConfirmUploadDto(
                        key = "uploads/2026/01/exists.jpg",
                        originalName = "exists.jpg",
                        contentType = "image/jpeg",
                        fileSize = 1024L,
                    ),
                    BulkConfirmUploadDto(
                        key = "uploads/2026/01/missing.jpg",
                        originalName = "missing.jpg",
                        contentType = "image/jpeg",
                        fileSize = 1024L,
                    ),
                ),
            )

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/r2/bulk-confirm")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isCreated)
                .andExpect(jsonPath("$.data.accepted").value(1))
                .andExpect(jsonPath("$.data.rejected").value(1))
                .andExpect(jsonPath("$.data.errors[0].key").value("uploads/2026/01/missing.jpg"))

            assertThat(galleryMediaRepository.findAll()).hasSize(1)
        }

        @Test
        @DisplayName("Should reject empty uploads list")
        fun `bulk confirm with empty uploads returns 400`() {
            val request = BulkConfirmRequest(uploads = emptyList())

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/r2/bulk-confirm")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isBadRequest)
        }

        @Test
        @DisplayName("Should return 403 for non-admin user")
        fun `bulk confirm as non-admin returns 403`() {
            val request = BulkConfirmRequest(
                uploads = listOf(
                    BulkConfirmUploadDto(
                        key = "uploads/2026/01/photo.jpg",
                        originalName = "photo.jpg",
                        contentType = "image/jpeg",
                        fileSize = 1024L,
                    ),
                ),
            )

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/r2/bulk-confirm")
                        .with(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isForbidden)
        }
    }

    // =================================================================
    // DETECT ORPHANS
    // =================================================================

    @Nested
    @DisplayName("GET /api/v1/admin/gallery/r2/orphans")
    inner class DetectOrphans {
        @Test
        @DisplayName("Should return orphaned objects not in database")
        fun `detect orphans returns unlinked R2 objects`() {
            // Seed a linked media record
            seedLinkedMedia("uploads/2026/01/linked.jpg")

            `when`(r2StorageService.listObjects(anyOrNull(), anyOrNull(), anyInt()))
                .thenReturn(
                    R2ListResult(
                        objects = listOf(
                            R2ObjectInfo("uploads/2026/01/linked.jpg", 1024L, now),
                            R2ObjectInfo("uploads/2026/01/orphan.jpg", 2048L, now),
                        ),
                        continuationToken = null,
                        isTruncated = false,
                    ),
                )

            mockMvc
                .perform(
                    get("/api/v1/admin/gallery/r2/orphans")
                        .with(adminAuth()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.orphans").isArray)
                .andExpect(jsonPath("$.data.orphans.length()").value(1))
                .andExpect(jsonPath("$.data.orphans[0].key").value("uploads/2026/01/orphan.jpg"))
                .andExpect(jsonPath("$.data.totalScanned").value(2))
                .andExpect(jsonPath("$.data.isTruncated").value(false))
        }

        @Test
        @DisplayName("Should return empty list when no orphans exist")
        fun `detect orphans returns empty when all linked`() {
            seedLinkedMedia("uploads/2026/01/linked.jpg")

            `when`(r2StorageService.listObjects(anyOrNull(), anyOrNull(), anyInt()))
                .thenReturn(
                    R2ListResult(
                        objects = listOf(
                            R2ObjectInfo("uploads/2026/01/linked.jpg", 1024L, now),
                        ),
                        continuationToken = null,
                        isTruncated = false,
                    ),
                )

            mockMvc
                .perform(
                    get("/api/v1/admin/gallery/r2/orphans")
                        .with(adminAuth()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.orphans").isArray)
                .andExpect(jsonPath("$.data.orphans").isEmpty)
                .andExpect(jsonPath("$.data.totalScanned").value(1))
        }

        @Test
        @DisplayName("Should return 403 for non-admin user")
        fun `detect orphans as non-admin returns 403`() {
            mockMvc
                .perform(
                    get("/api/v1/admin/gallery/r2/orphans")
                        .with(userAuth()),
                ).andExpect(status().isForbidden)
        }
    }

    // =================================================================
    // LINK ORPHAN
    // =================================================================

    @Nested
    @DisplayName("POST /api/v1/admin/gallery/r2/orphans/link")
    inner class LinkOrphan {
        @Test
        @DisplayName("Should create media record from orphaned R2 object")
        fun `link orphan creates ACTIVE media record`() {
            val storageKey = "uploads/2026/01/orphan-photo.jpg"
            `when`(r2StorageService.headObject(storageKey))
                .thenReturn(R2ObjectMetadata("image/jpeg", 4096L, now))

            val request = LinkOrphanRequest(
                storageKey = storageKey,
                category = "heritage",
                description = "Historical photo",
            )

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/r2/orphans/link")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isCreated)
                .andExpect(jsonPath("$.data.id").isNotEmpty)
                .andExpect(jsonPath("$.data.storageKey").value(storageKey))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.contentType").value("image/jpeg"))
                .andExpect(jsonPath("$.data.mediaSource").value("USER_UPLOAD"))

            val media = galleryMediaRepository.findAll()
            assertThat(media).hasSize(1)
            val record = media[0] as UserUploadedMedia
            assertThat(record.storageKey).isEqualTo(storageKey)
            assertThat(record.status).isEqualTo(GalleryMediaStatus.ACTIVE)
            assertThat(record.category).isEqualTo("heritage")
            assertThat(record.description).isEqualTo("Historical photo")
            assertThat(record.uploadedBy).isEqualTo(testAdminId)
            assertThat(record.reviewedBy).isEqualTo(testAdminId)
        }

        @Test
        @DisplayName("Should return 422 when key is already linked")
        fun `link orphan with existing key returns 422`() {
            val storageKey = "uploads/2026/01/already-linked.jpg"
            seedLinkedMedia(storageKey)

            val request = LinkOrphanRequest(storageKey = storageKey)

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/r2/orphans/link")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isUnprocessableEntity)
        }

        @Test
        @DisplayName("Should return 404 when object does not exist in R2")
        fun `link orphan with nonexistent R2 object returns 404`() {
            val storageKey = "uploads/2026/01/gone.jpg"
            `when`(r2StorageService.headObject(storageKey)).thenReturn(null)

            val request = LinkOrphanRequest(storageKey = storageKey)

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/r2/orphans/link")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isNotFound)
        }

        @Test
        @DisplayName("Should reject blank storage key")
        fun `link orphan with blank key returns 400`() {
            val request = LinkOrphanRequest(storageKey = "")

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/r2/orphans/link")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isBadRequest)
        }

        @Test
        @DisplayName("Should return 403 for non-admin user")
        fun `link orphan as non-admin returns 403`() {
            val request = LinkOrphanRequest(storageKey = "uploads/2026/01/orphan.jpg")

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/r2/orphans/link")
                        .with(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isForbidden)
        }
    }

    // =================================================================
    // DELETE ORPHAN
    // =================================================================

    @Nested
    @DisplayName("DELETE /api/v1/admin/gallery/r2/orphans")
    inner class DeleteOrphan {
        @Test
        @DisplayName("Should delete orphaned R2 object and return 204")
        fun `delete orphan returns 204`() {
            val storageKey = "uploads/2026/01/orphan-to-delete.jpg"
            val request = DeleteOrphanRequest(storageKey = storageKey)

            mockMvc
                .perform(
                    delete("/api/v1/admin/gallery/r2/orphans")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isNoContent)

            verify(r2StorageService).deleteObject(storageKey)
        }

        @Test
        @DisplayName("Should return 422 when key is linked to a media record")
        fun `delete orphan with linked key returns 422`() {
            val storageKey = "uploads/2026/01/linked-no-delete.jpg"
            seedLinkedMedia(storageKey)

            val request = DeleteOrphanRequest(storageKey = storageKey)

            mockMvc
                .perform(
                    delete("/api/v1/admin/gallery/r2/orphans")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isUnprocessableEntity)
        }

        @Test
        @DisplayName("Should reject blank storage key")
        fun `delete orphan with blank key returns 400`() {
            val request = DeleteOrphanRequest(storageKey = "")

            mockMvc
                .perform(
                    delete("/api/v1/admin/gallery/r2/orphans")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isBadRequest)
        }

        @Test
        @DisplayName("Should return 403 for non-admin user")
        fun `delete orphan as non-admin returns 403`() {
            val request = DeleteOrphanRequest(storageKey = "uploads/2026/01/orphan.jpg")

            mockMvc
                .perform(
                    delete("/api/v1/admin/gallery/r2/orphans")
                        .with(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)),
                ).andExpect(status().isForbidden)
        }
    }
}
