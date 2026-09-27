package com.nosilha.core.gallery

import com.nosilha.core.gallery.domain.ExternalMedia
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import com.nosilha.core.shared.service.FrontendRevalidationService
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.mockito.Mockito.never
import org.mockito.Mockito.reset
import org.mockito.Mockito.times
import org.mockito.Mockito.verify
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

/**
 * Admin gallery edits revalidate the frontend's `gallery` cache tag (spec 038 T-13).
 *
 * The revalidation is registered to run after the transaction commits, synchronously on
 * the request thread, so it has happened by the time MockMvc returns. Failed requests
 * roll back and must not revalidate.
 *
 * gallery_media holds shared seed rows, so this class deletes only the rows it created.
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Gallery admin edits revalidate the frontend")
class GalleryRevalidationIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var galleryMediaRepository: GalleryMediaRepository

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @MockitoBean
    private lateinit var revalidationService: FrontendRevalidationService

    private val adminId = UUID.fromString("00000000-0000-0000-0000-000000000313")
    private val created = mutableListOf<UUID>()

    @BeforeEach
    fun setup() {
        // The audited updated_by column references users, so the acting admin needs a row
        jdbcTemplate.update("INSERT INTO users (id, email) VALUES (?, 'revalidation-admin@test.com') ON CONFLICT DO NOTHING", adminId)
        reset(revalidationService)
    }

    @AfterEach
    fun removeCreatedRows() {
        created.forEach {
            jdbcTemplate.update("DELETE FROM media_moderation_audit WHERE media_id = ?", it)
            jdbcTemplate.update("DELETE FROM gallery_media WHERE id = ?", it)
        }
        created.clear()
        jdbcTemplate.update("DELETE FROM users WHERE id = ?", adminId)
    }

    private fun adminAuth() =
        authentication(
            UsernamePasswordAuthenticationToken(adminId.toString(), null, listOf(SimpleGrantedAuthority("ROLE_ADMIN"))),
        )

    private fun film(mediaStatus: GalleryMediaStatus = GalleryMediaStatus.ACTIVE): ExternalMedia =
        galleryMediaRepository
            .save(
                ExternalMedia().apply {
                    title = "Brava film"
                    externalId = UUID.randomUUID().toString().take(11)
                    status = mediaStatus
                },
            ).also { created += it.id!! }

    private fun patchJson(
        path: String,
        body: String,
    ) = mockMvc.perform(
        patch(path)
            .with(adminAuth())
            .contentType(MediaType.APPLICATION_JSON)
            .content(body),
    )

    @Test
    fun `a metadata PATCH revalidates the gallery tag`() {
        val media = film()

        patchJson("/api/v1/admin/gallery/${media.id}", """{"displayTitle": "Brava from the air"}""")
            .andExpect(status().isOk)

        verify(revalidationService, times(1)).revalidateGallery()
    }

    @Test
    fun `a metadata PATCH that fails validation does not revalidate`() {
        val media = film()

        patchJson("/api/v1/admin/gallery/${media.id}", """{"placeId": "${UUID.randomUUID()}"}""")
            .andExpect(status().isBadRequest)

        verify(revalidationService, never()).revalidateGallery()
    }

    @Test
    fun `a metadata PATCH on a missing record does not revalidate`() {
        patchJson("/api/v1/admin/gallery/${UUID.randomUUID()}", """{"title": "Nothing"}""")
            .andExpect(status().isNotFound)

        verify(revalidationService, never()).revalidateGallery()
    }

    @Test
    fun `approving a record revalidates the gallery tag`() {
        val media = film(GalleryMediaStatus.PENDING_REVIEW)

        patchJson("/api/v1/admin/gallery/${media.id}/status", """{"action": "APPROVE"}""")
            .andExpect(status().isOk)

        verify(revalidationService, times(1)).revalidateGallery()
    }

    @Test
    fun `flagging a record revalidates the gallery tag`() {
        val media = film()

        patchJson("/api/v1/admin/gallery/${media.id}/status", """{"action": "FLAG", "reason": "Check credit"}""")
            .andExpect(status().isOk)

        verify(revalidationService, times(1)).revalidateGallery()
    }

    @Test
    fun `rejecting a record revalidates the gallery tag`() {
        val media = film()

        patchJson("/api/v1/admin/gallery/${media.id}/status", """{"action": "REJECT", "reason": "Duplicate"}""")
            .andExpect(status().isOk)

        verify(revalidationService, times(1)).revalidateGallery()
    }

    @Test
    fun `a rejection without a reason does not revalidate`() {
        val media = film()

        patchJson("/api/v1/admin/gallery/${media.id}/status", """{"action": "REJECT"}""")
            .andExpect(status().is4xxClientError)

        verify(revalidationService, never()).revalidateGallery()
    }

    @Test
    fun `archiving a record revalidates the gallery tag`() {
        val media = film()

        mockMvc
            .perform(delete("/api/v1/admin/gallery/${media.id}").with(adminAuth()))
            .andExpect(status().isNoContent)

        verify(revalidationService, times(1)).revalidateGallery()
    }
}
