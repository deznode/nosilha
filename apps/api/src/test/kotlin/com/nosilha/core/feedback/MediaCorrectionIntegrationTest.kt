package com.nosilha.core.feedback

import com.nosilha.core.feedback.api.MediaCorrectionCreateDto
import com.nosilha.core.feedback.repository.SuggestionRepository
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.gallery.domain.UserUploadedMedia
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import tools.jackson.databind.json.JsonMapper
import java.util.UUID
import org.springframework.http.MediaType as HttpMediaType

/**
 * Correction to an existing public gallery media item (spec 039 T-10).
 *
 * Stored as a `CORRECTION` suggestion with `mediaId`, reviewed in the existing admin
 * suggestions queue. gallery_media holds shared seed rows (the Igreja hero among them), so
 * this class deletes only the rows it created.
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class MediaCorrectionIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jsonMapper: JsonMapper

    @Autowired
    private lateinit var galleryMediaRepository: GalleryMediaRepository

    @Autowired
    private lateinit var suggestionRepository: SuggestionRepository

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val createdMedia = mutableListOf<UUID>()
    private val createdSuggestions = mutableListOf<UUID>()
    private val createdUsers = mutableListOf<UUID>()

    @AfterEach
    fun removeCreatedRows() {
        createdSuggestions.forEach { jdbcTemplate.update("DELETE FROM suggestions WHERE id = ?", it) }
        createdSuggestions.clear()
        createdMedia.forEach { jdbcTemplate.update("DELETE FROM gallery_media WHERE id = ?", it) }
        createdMedia.clear()
        createdUsers.forEach { jdbcTemplate.update("DELETE FROM users WHERE id = ?", it) }
        createdUsers.clear()
    }

    /** A row in `users`, so `Suggestion.createdBy` (auditing) satisfies its FK on insert. */
    private fun newAuthedUser(email: String): UUID {
        val id = UUID.randomUUID()
        jdbcTemplate.update("INSERT INTO users (id, email) VALUES (?, ?) ON CONFLICT DO NOTHING", id, email)
        createdUsers += id
        return id
    }

    private fun activePhoto(): UUID {
        val media = UserUploadedMedia().apply {
            this.title = "Fixture photo"
            this.contentType = "image/jpeg"
            this.status = GalleryMediaStatus.ACTIVE
            this.publicUrl = "https://cdn.example.com/fixture.jpg"
        }
        val saved = galleryMediaRepository.save(media)
        createdMedia += saved.id!!
        return saved.id!!
    }

    private fun pendingPhoto(): UUID {
        val media = UserUploadedMedia().apply {
            this.title = "Fixture pending photo"
            this.contentType = "image/jpeg"
            this.status = GalleryMediaStatus.PENDING_REVIEW
        }
        val saved = galleryMediaRepository.save(media)
        createdMedia += saved.id!!
        return saved.id!!
    }

    private fun jwtAuth(
        userId: UUID,
        email: String,
    ) = jwt()
        .jwt { builder -> builder.subject(userId.toString()).claim("email", email) }
        .authorities(SimpleGrantedAuthority("ROLE_USER"))

    private fun adminAuth(adminId: UUID) =
        authentication(UsernamePasswordAuthenticationToken(adminId.toString(), null, listOf(SimpleGrantedAuthority("ROLE_ADMIN"))))

    private fun postCorrection(
        mediaId: UUID,
        message: String,
        auth: org.springframework.test.web.servlet.request.RequestPostProcessor? = null,
    ) = mockMvc.perform(
        post("/api/v1/feedback/media-corrections")
            .apply { if (auth != null) with(auth) }
            .contentType(HttpMediaType.APPLICATION_JSON)
            .content(jsonMapper.writeValueAsString(MediaCorrectionCreateDto(mediaId, message))),
    )

    @Test
    @DisplayName("Should create a CORRECTION suggestion and return 201")
    fun `submitCorrection with valid data should return 201`() {
        val mediaId = activePhoto()
        val userId = newAuthedUser("maria@example.com")

        val result = postCorrection(mediaId, "The date on this photo is wrong, it was taken in 1978.", jwtAuth(userId, "maria@example.com"))
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.data.id").isNotEmpty)
            .andReturn()

        val suggestionId = UUID.fromString(jsonMapper.readTree(result.response.contentAsString)["data"]["id"].asString())
        createdSuggestions += suggestionId

        val suggestion = suggestionRepository.findById(suggestionId).orElseThrow()
        assertThat(suggestion.suggestionType.name).isEqualTo("CORRECTION")
        assertThat(suggestion.mediaId).isEqualTo(mediaId)
        assertThat(suggestion.email).isEqualTo("maria@example.com")
    }

    @Test
    @DisplayName("Should fall back to the whole email when the email's local part is one letter")
    fun `submitCorrection from a one-letter email should use the email as the name`() {
        val mediaId = activePhoto()
        val userId = newAuthedUser("a@example.com")

        val result = postCorrection(mediaId, "Taken at the harbour, not the square.", jwtAuth(userId, "a@example.com"))
            .andExpect(status().isCreated)
            .andReturn()

        val suggestionId = UUID.fromString(jsonMapper.readTree(result.response.contentAsString)["data"]["id"].asString())
        createdSuggestions += suggestionId

        // SuggestionService HTML-escapes the name, so "@" is stored as an entity.
        assertThat(suggestionRepository.findById(suggestionId).orElseThrow().name)
            .startsWith("a")
            .endsWith("example.com")
    }

    @Test
    @DisplayName("Should return 401 when unauthenticated")
    fun `submitCorrection without auth should return 401`() {
        val mediaId = activePhoto()

        postCorrection(mediaId, "This location is actually in Nova Sintra.")
            .andExpect(status().isUnauthorized)
    }

    @Test
    @DisplayName("Should return 404 when the media is not public (PENDING_REVIEW)")
    fun `submitCorrection for a pending media item should return 404`() {
        val mediaId = pendingPhoto()
        val userId = UUID.randomUUID()

        postCorrection(mediaId, "This isn't public yet, so it shouldn't be correctable.", jwtAuth(userId, "user@example.com"))
            .andExpect(status().isNotFound)
    }

    @Test
    @DisplayName("Should return 404 when the media does not exist")
    fun `submitCorrection for an unknown media item should return 404`() {
        val userId = UUID.randomUUID()

        postCorrection(UUID.randomUUID(), "This media item does not exist.", jwtAuth(userId, "user@example.com"))
            .andExpect(status().isNotFound)
    }

    @Test
    @DisplayName("Should return 400 for an empty message")
    fun `submitCorrection with an empty message should return 400`() {
        val mediaId = activePhoto()
        val userId = UUID.randomUUID()

        postCorrection(mediaId, "", jwtAuth(userId, "user@example.com"))
            .andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("Should return 400 for a message longer than 2000 characters")
    fun `submitCorrection with an over-long message should return 400`() {
        val mediaId = activePhoto()
        val userId = UUID.randomUUID()

        postCorrection(mediaId, "a".repeat(2001), jwtAuth(userId, "user@example.com"))
            .andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("Should carry a Retry-After header once the shared per-IP rate limit is exceeded")
    fun `submitCorrection exceeding the rate limit should return 429 with Retry-After`() {
        val mediaId = activePhoto()
        val userId = newAuthedUser("user@example.com")
        val ip = "198.51.100.77"

        repeat(5) { index ->
            mockMvc
                .perform(
                    post("/api/v1/feedback/media-corrections")
                        .with(jwtAuth(userId, "user@example.com"))
                        .header("X-Forwarded-For", ip)
                        .contentType(HttpMediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(MediaCorrectionCreateDto(mediaId, "Correction number $index."))),
                ).andExpect(status().isCreated)
                .andReturn()
                .let {
                    val id = UUID.fromString(jsonMapper.readTree(it.response.contentAsString)["data"]["id"].asString())
                    createdSuggestions += id
                }
        }

        val result = mockMvc
            .perform(
                post("/api/v1/feedback/media-corrections")
                    .with(jwtAuth(userId, "user@example.com"))
                    .header("X-Forwarded-For", ip)
                    .contentType(HttpMediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(MediaCorrectionCreateDto(mediaId, "This one should be rate limited."))),
            ).andExpect(status().isTooManyRequests)
            .andExpect(header().exists("Retry-After"))
            .andReturn()

        val retryAfter = result.response.getHeader("Retry-After")?.toLongOrNull()
        assertThat(retryAfter).isNotNull()
        assertThat(retryAfter!!).isGreaterThanOrEqualTo(1L)
    }

    @Test
    @DisplayName("Should show the correction in the admin suggestions queue")
    fun `submitCorrection should be visible in the admin suggestions queue`() {
        val mediaId = activePhoto()
        val userId = newAuthedUser("reporter@example.com")
        val adminId = UUID.randomUUID()

        val result = postCorrection(mediaId, "The credit should read Maria Silva, not unknown.", jwtAuth(userId, "reporter@example.com"))
            .andExpect(status().isCreated)
            .andReturn()

        val suggestionId = UUID.fromString(jsonMapper.readTree(result.response.contentAsString)["data"]["id"].asString())
        createdSuggestions += suggestionId

        mockMvc
            .perform(get("/api/v1/admin/suggestions/$suggestionId").with(adminAuth(adminId)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.suggestionType").value("CORRECTION"))
            .andExpect(jsonPath("$.data.mediaId").value(mediaId.toString()))
            .andExpect(jsonPath("$.data.email").value("reporter@example.com"))
    }
}
