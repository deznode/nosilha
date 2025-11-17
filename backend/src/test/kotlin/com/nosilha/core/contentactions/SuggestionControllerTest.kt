package com.nosilha.core.contentactions

import com.fasterxml.jackson.databind.ObjectMapper
import com.google.cloud.spring.autoconfigure.firestore.GcpFirestoreAutoConfiguration
import com.google.cloud.spring.autoconfigure.storage.GcpStorageAutoConfiguration
import com.nosilha.core.contentactions.api.SuggestionCreateDto
import com.nosilha.core.contentactions.domain.SuggestionType
import com.nosilha.core.contentactions.repository.SuggestionRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.util.UUID

/**
 * Integration tests for SuggestionController.
 *
 * Tests the full stack from HTTP request to database persistence,
 * including validation, rate limiting, and spam protection.
 *
 * Note: GCP services (Firestore, Storage) are excluded because:
 * 1. CI environment (GitHub Actions) doesn't have GCP credentials
 * 2. Emulators aren't running in test profile
 * 3. Tests that specifically need GCP services can enable them individually
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@EnableAutoConfiguration(
    exclude = [
        GcpFirestoreAutoConfiguration::class,
        GcpStorageAutoConfiguration::class,
    ],
)
class SuggestionControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var suggestionRepository: SuggestionRepository

    @BeforeEach
    fun setup() {
        // Clean up database before each test
        suggestionRepository.deleteAll()
    }

    @Test
    @DisplayName("POST /api/v1/suggestions - Valid suggestion should return 201 Created")
    fun `submitSuggestion with valid data should create suggestion and return 201`() {
        val dto =
            SuggestionCreateDto(
                contentId = UUID.randomUUID(),
                pageTitle = "Eugénio Tavares Monument",
                pageUrl = "https://nosilha.local/directory/entry/eugenio-tavares-monument",
                contentType = "landmark",
                name = "Maria Santos",
                email = "maria.santos@example.com",
                suggestionType = SuggestionType.CORRECTION,
                message = "The article states that Eugénio Tavares was born in 1867, but historical records show " +
                    "he was born on October 18, 1867 in Brava Island.",
            )

        mockMvc.perform(
            post("/api/v1/suggestions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .header("X-Forwarded-For", "192.168.1.100"),
        )
            .andExpect(status().isCreated)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.status").value(201))
            .andExpect(jsonPath("$.data.id").isNotEmpty)
            .andExpect(jsonPath("$.data.message").value(org.hamcrest.Matchers.containsString("Thank you")))

        // Verify suggestion was persisted to database
        val suggestions = suggestionRepository.findAll()
        assertThat(suggestions).hasSize(1)
        assertThat(suggestions[0].name).isEqualTo("Maria Santos")
        assertThat(suggestions[0].email).isEqualTo("maria.santos@example.com")
        assertThat(suggestions[0].suggestionType).isEqualTo(SuggestionType.CORRECTION)
    }

    @Test
    @DisplayName("POST /api/v1/suggestions - Honeypot spam should return 201 but not persist")
    fun `submitSuggestion with honeypot field should return success but not persist`() {
        val dto =
            mapOf(
                "contentId" to UUID.randomUUID().toString(),
                "pageTitle" to "Spam Entry",
                "pageUrl" to "https://nosilha.local/directory/spam",
                "contentType" to "landmark",
                "name" to "Spam Bot",
                "email" to "spam@bot.com",
                "suggestionType" to "FEEDBACK",
                "message" to "This is spam content that should be caught by honeypot",
                "honeypot" to "http://spam-link.com", // Honeypot field filled by bot
            )

        mockMvc.perform(
            post("/api/v1/suggestions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .header("X-Forwarded-For", "10.0.0.1"),
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.data.id").isEmpty) // No ID returned for spam

        // Verify suggestion was NOT persisted to database
        val suggestions = suggestionRepository.findAll()
        assertThat(suggestions).isEmpty()
    }

    @Test
    @DisplayName("POST /api/v1/suggestions - Missing required field should return 400")
    fun `submitSuggestion with missing name should return 400 Bad Request`() {
        val dto =
            mapOf(
                "contentId" to UUID.randomUUID().toString(),
                "pageTitle" to "Missing Name Entry",
                "pageUrl" to "https://nosilha.local/directory/missing-name",
                "contentType" to "landmark",
                // "name" missing
                "email" to "test@example.com",
                "suggestionType" to "FEEDBACK",
                "message" to "This is a test message for validation",
            )

        mockMvc.perform(
            post("/api/v1/suggestions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)),
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("POST /api/v1/suggestions - Name too short should return 400")
    fun `submitSuggestion with name less than 2 characters should return 400`() {
        val dto =
            SuggestionCreateDto(
                contentId = UUID.randomUUID(),
                pageTitle = "Validation Entry",
                pageUrl = "https://nosilha.local/directory/validation",
                contentType = "landmark",
                name = "A", // Too short (min 2)
                email = "test@example.com",
                suggestionType = SuggestionType.FEEDBACK,
                message = "This is a test message for validation",
            )

        mockMvc.perform(
            post("/api/v1/suggestions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)),
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("POST /api/v1/suggestions - Invalid email should return 400")
    fun `submitSuggestion with invalid email format should return 400`() {
        val dto =
            SuggestionCreateDto(
                contentId = UUID.randomUUID(),
                pageTitle = "Email Entry",
                pageUrl = "https://nosilha.local/directory/email",
                contentType = "landmark",
                name = "Test User",
                email = "invalid-email", // Invalid format
                suggestionType = SuggestionType.FEEDBACK,
                message = "This is a test message for validation",
            )

        mockMvc.perform(
            post("/api/v1/suggestions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)),
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("POST /api/v1/suggestions - Message too short should return 400")
    fun `submitSuggestion with message less than 10 characters should return 400`() {
        val dto =
            SuggestionCreateDto(
                contentId = UUID.randomUUID(),
                pageTitle = "Message Short Entry",
                pageUrl = "https://nosilha.local/directory/message-short",
                contentType = "landmark",
                name = "Test User",
                email = "test@example.com",
                suggestionType = SuggestionType.FEEDBACK,
                message = "Short", // Too short (min 10)
            )

        mockMvc.perform(
            post("/api/v1/suggestions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)),
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("POST /api/v1/suggestions - Message too long should return 400")
    fun `submitSuggestion with message exceeding 5000 characters should return 400`() {
        val dto =
            SuggestionCreateDto(
                contentId = UUID.randomUUID(),
                pageTitle = "Message Long Entry",
                pageUrl = "https://nosilha.local/directory/message-long",
                contentType = "landmark",
                name = "Test User",
                email = "test@example.com",
                suggestionType = SuggestionType.FEEDBACK,
                message = "x".repeat(5001), // Too long (max 5000)
            )

        mockMvc.perform(
            post("/api/v1/suggestions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)),
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("POST /api/v1/suggestions - Rate limiting should return 429 after 5 submissions")
    fun `submitSuggestion exceeding rate limit should return 429 Too Many Requests`() {
        val ipAddress = "203.0.113.42"
        val contentId = UUID.randomUUID()

        // Submit 5 valid suggestions (should all succeed)
        repeat(5) { index ->
            val dto =
                SuggestionCreateDto(
                    contentId = contentId,
                    pageTitle = "Rate Limit Entry $index",
                    pageUrl = "https://nosilha.local/directory/rate-limit",
                    contentType = "landmark",
                    name = "Test User $index",
                    email = "test$index@example.com",
                    suggestionType = SuggestionType.FEEDBACK,
                    message = "This is test message number $index for rate limiting validation",
                )

            mockMvc.perform(
                post("/api/v1/suggestions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(dto))
                    .header("X-Forwarded-For", ipAddress),
            )
                .andExpect(status().isCreated)
        }

        // 6th submission from same IP should be rate limited
        val dto =
            SuggestionCreateDto(
                contentId = contentId,
                pageTitle = "Rate Limit Entry 6",
                pageUrl = "https://nosilha.local/directory/rate-limit",
                contentType = "landmark",
                name = "Test User 6",
                email = "test6@example.com",
                suggestionType = SuggestionType.FEEDBACK,
                message = "This submission should be rate limited",
            )

        mockMvc.perform(
            post("/api/v1/suggestions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .header("X-Forwarded-For", ipAddress),
        )
            .andExpect(status().isTooManyRequests)
            .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("exceeded")))

        // Verify only 5 suggestions were persisted
        val suggestions = suggestionRepository.findAll()
        assert(suggestions.size == 5)
    }

    @Test
    @DisplayName("POST /api/v1/suggestions - Different IPs should not share rate limit")
    fun `submitSuggestion from different IPs should have independent rate limits`() {
        val contentId = UUID.randomUUID()

        // Submit from IP 1
        val dto1 =
            SuggestionCreateDto(
                contentId = contentId,
                pageTitle = "IP Entry 1",
                pageUrl = "https://nosilha.local/directory/ip-test",
                contentType = "landmark",
                name = "User from IP 1",
                email = "user1@example.com",
                suggestionType = SuggestionType.FEEDBACK,
                message = "This is a suggestion from IP address 1",
            )

        mockMvc.perform(
            post("/api/v1/suggestions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto1))
                .header("X-Forwarded-For", "192.168.1.1"),
        )
            .andExpect(status().isCreated)

        // Submit from IP 2 (should also succeed - different rate limit bucket)
        val dto2 =
            SuggestionCreateDto(
                contentId = contentId,
                pageTitle = "IP Entry 2",
                pageUrl = "https://nosilha.local/directory/ip-test",
                contentType = "landmark",
                name = "User from IP 2",
                email = "user2@example.com",
                suggestionType = SuggestionType.FEEDBACK,
                message = "This is a suggestion from IP address 2",
            )

        mockMvc.perform(
            post("/api/v1/suggestions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto2))
                .header("X-Forwarded-For", "192.168.1.2"),
        )
            .andExpect(status().isCreated)

        // Verify both suggestions were persisted
        val suggestions = suggestionRepository.findAll()
        assert(suggestions.size == 2)
    }

    @Test
    @DisplayName("POST /api/v1/suggestions - All suggestion types should be accepted")
    fun `submitSuggestion with each suggestion type should succeed`() {
        val contentId = UUID.randomUUID()

        // Test CORRECTION
        submitValidSuggestion(contentId, SuggestionType.CORRECTION, "192.168.1.10")
            .andExpect(status().isCreated)

        // Test ADDITION
        submitValidSuggestion(contentId, SuggestionType.ADDITION, "192.168.1.11")
            .andExpect(status().isCreated)

        // Test FEEDBACK
        submitValidSuggestion(contentId, SuggestionType.FEEDBACK, "192.168.1.12")
            .andExpect(status().isCreated)

        // Verify all three were persisted with correct types
        val suggestions = suggestionRepository.findAll()
        assert(suggestions.size == 3)
        assert(suggestions.any { it.suggestionType == SuggestionType.CORRECTION })
        assert(suggestions.any { it.suggestionType == SuggestionType.ADDITION })
        assert(suggestions.any { it.suggestionType == SuggestionType.FEEDBACK })
    }

    /**
     * Helper method to submit a valid suggestion with specified type
     */
    private fun submitValidSuggestion(
        contentId: UUID,
        type: SuggestionType,
        ipAddress: String,
    ) = mockMvc.perform(
        post("/api/v1/suggestions")
            .contentType(MediaType.APPLICATION_JSON)
            .content(
                objectMapper.writeValueAsString(
                    SuggestionCreateDto(
                        contentId = contentId,
                        pageTitle = "Helper Entry",
                        pageUrl = "https://nosilha.local/directory/helper",
                        contentType = type.name.lowercase(),
                        name = "Test User",
                        email = "test@example.com",
                        suggestionType = type,
                        message = "This is a valid test message for $type suggestion type",
                    ),
                ),
            )
            .header("X-Forwarded-For", ipAddress),
    )
}
