package com.nosilha.core.gallery

import com.nosilha.core.gallery.api.dto.SubmitExternalMediaRequest
import com.nosilha.core.gallery.domain.ExternalMedia
import com.nosilha.core.gallery.domain.ExternalPlatform
import com.nosilha.core.gallery.domain.MediaType
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import tools.jackson.databind.json.JsonMapper
import java.util.UUID
import org.springframework.http.MediaType as HttpMediaType

/**
 * User submission of external media (spec 039 T-01/T-02): townId, locationName and
 * approximateDate on `/gallery/submit`, plus the per-user submission rate limit.
 *
 * gallery_media and towns hold shared seed rows (the Igreja hero among them), so this
 * class deletes only the rows it created.
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class GallerySubmitIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jsonMapper: JsonMapper

    @Autowired
    private lateinit var galleryMediaRepository: GalleryMediaRepository

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    private val created = mutableListOf<UUID>()
    private val createdUsers = mutableListOf<UUID>()
    private lateinit var townId: UUID

    @BeforeEach
    fun setup() {
        townId = jdbcTemplate.queryForObject("SELECT id FROM towns ORDER BY slug LIMIT 1", UUID::class.java)!!
    }

    @AfterEach
    fun removeCreatedRows() {
        created.forEach { jdbcTemplate.update("DELETE FROM gallery_media WHERE id = ?", it) }
        created.clear()
        createdUsers.forEach { jdbcTemplate.update("DELETE FROM users WHERE id = ?", it) }
        createdUsers.clear()
    }

    private fun newAuthedUser(): UUID {
        val id = UUID.randomUUID()
        jdbcTemplate.update("INSERT INTO users (id, email) VALUES (?, 'submit-$id@test.com') ON CONFLICT DO NOTHING", id)
        createdUsers += id
        return id
    }

    private fun userAuth(userId: UUID) =
        authentication(UsernamePasswordAuthenticationToken(userId.toString(), null, listOf(SimpleGrantedAuthority("ROLE_USER"))))

    private fun baseRequest(
        townId: UUID? = null,
        locationName: String? = null,
        approximateDate: String? = null,
    ) = SubmitExternalMediaRequest(
        mediaType = MediaType.VIDEO,
        platform = ExternalPlatform.YOUTUBE,
        externalId = "dQw4w9WgXcQ",
        title = "Cultural Festival",
        townId = townId,
        locationName = locationName,
        approximateDate = approximateDate,
    )

    private fun submit(
        userId: UUID,
        request: SubmitExternalMediaRequest,
    ) = mockMvc.perform(
        post("/api/v1/gallery/submit")
            .with(userAuth(userId))
            .contentType(HttpMediaType.APPLICATION_JSON)
            .content(jsonMapper.writeValueAsString(request)),
    )

    @Test
    @DisplayName("Should store townId, locationName and approximateDate")
    fun `submit with town, location and date should store all three`() {
        val user = newAuthedUser()
        val request = baseRequest(townId = townId, locationName = "Vila Nova Sintra", approximateDate = "circa 1975")

        submit(user, request)
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.data.placeId").value(townId.toString()))
            .andExpect(jsonPath("$.data.locationName").value("Vila Nova Sintra"))
            .andExpect(jsonPath("$.data.approximateDate").value("circa 1975"))

        val media = galleryMediaRepository.findAll().single { it.title == "Cultural Festival" } as ExternalMedia
        created += media.id!!
        assertThat(media.placeId).isEqualTo(townId)
        assertThat(media.locationName).isEqualTo("Vila Nova Sintra")
        assertThat(media.approximateDate).isEqualTo("circa 1975")
    }

    @Test
    @DisplayName("Should submit successfully when town, location and date are omitted")
    fun `submit without town, location or date should still work`() {
        val user = newAuthedUser()

        submit(user, baseRequest())
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.data.placeId").isEmpty)
            .andExpect(jsonPath("$.data.locationName").isEmpty)
            .andExpect(jsonPath("$.data.approximateDate").isEmpty)

        val media = galleryMediaRepository.findAll().single { it.title == "Cultural Festival" } as ExternalMedia
        created += media.id!!
        assertThat(media.placeId).isNull()
        assertThat(media.locationName).isNull()
        assertThat(media.approximateDate).isNull()
    }

    @Test
    @DisplayName("Should reject submit with an unknown townId")
    fun `submit with unknown townId should return 400`() {
        val user = newAuthedUser()

        submit(user, baseRequest(townId = UUID.randomUUID()))
            .andExpect(status().isBadRequest)

        assertThat(galleryMediaRepository.findAll().filter { it.title == "Cultural Festival" }).isEmpty()
    }

    @Test
    @DisplayName("Should not spend a rate-limit token on a rejected townId")
    fun `submit with unknown townId should not consume the rate limit`() {
        val user = newAuthedUser()

        repeat(10) {
            submit(user, baseRequest(townId = UUID.randomUUID()))
                .andExpect(status().isBadRequest)
        }

        submit(user, baseRequest())
            .andExpect(status().isCreated)

        galleryMediaRepository.findAll().filter { it.title == "Cultural Festival" }.forEach { created += it.id!! }
    }

    @Test
    @DisplayName("Should reject a locationName longer than 255 characters")
    fun `submit with an over-long locationName should return 400`() {
        val user = newAuthedUser()

        submit(user, baseRequest(locationName = "a".repeat(256)))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.details[0].field").value("locationName"))
    }

    @Test
    @DisplayName("Should reject an approximateDate longer than 100 characters")
    fun `submit with an over-long approximateDate should return 400`() {
        val user = newAuthedUser()

        submit(user, baseRequest(approximateDate = "a".repeat(101)))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.details[0].field").value("approximateDate"))
    }

    @Test
    @DisplayName("Should carry a Retry-After header once the per-user submit rate limit is exceeded")
    fun `submit exceeding the rate limit should return 429 with Retry-After`() {
        val user = newAuthedUser()

        // The submit bucket allows 10 submissions/hour; the 11th request is rejected.
        repeat(10) { index ->
            submit(user, baseRequest().copy(externalId = "vid-$index"))
                .andExpect(status().isCreated)
        }

        val result = submit(user, baseRequest().copy(externalId = "vid-overflow"))
            .andExpect(status().isTooManyRequests)
            .andExpect(header().exists("Retry-After"))
            .andReturn()

        val retryAfter = result.response.getHeader("Retry-After")?.toLongOrNull()
        assertThat(retryAfter).isNotNull()
        assertThat(retryAfter!!).isGreaterThanOrEqualTo(1L)

        galleryMediaRepository.findAll().filter { it.title == "Cultural Festival" }.forEach { created += it.id!! }
    }

    @Test
    @DisplayName("Should keep independent rate limit buckets per user")
    fun `submit from different users should have independent rate limits`() {
        val userA = newAuthedUser()
        val userB = newAuthedUser()

        repeat(10) { index ->
            submit(userA, baseRequest().copy(externalId = "a-$index"))
                .andExpect(status().isCreated)
        }

        submit(userB, baseRequest().copy(externalId = "b-0"))
            .andExpect(status().isCreated)

        galleryMediaRepository.findAll().filter { it.title == "Cultural Festival" }.forEach { created += it.id!! }
    }
}
