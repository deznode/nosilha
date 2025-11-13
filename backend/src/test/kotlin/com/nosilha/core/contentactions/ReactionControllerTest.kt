package com.nosilha.core.contentactions

import com.fasterxml.jackson.databind.ObjectMapper
import com.nosilha.core.contentactions.api.ReactionCreateDto
import com.nosilha.core.contentactions.domain.ReactionType
import com.nosilha.core.contentactions.repository.ReactionRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

/**
 * Integration tests for ReactionController.
 *
 * Tests the full stack from HTTP request to database persistence,
 * including authentication, validation, rate limiting, and business logic
 * (reaction toggle, change, and removal).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ReactionControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var reactionRepository: ReactionRepository

    companion object {
        private val TEST_USER_ID = UUID.randomUUID()
        private val TEST_USER_ID_2 = UUID.randomUUID()
        private val TEST_CONTENT_ID = UUID.randomUUID()
    }

    @BeforeEach
    fun setup() {
        // Clean up database before each test
        reactionRepository.deleteAll()
    }

    @Test
    @DisplayName("POST /api/v1/reactions - Valid reaction should return 201 Created")
    fun `submitReaction with valid data should create reaction and return 201`() {
        val dto =
            ReactionCreateDto(
                contentId = TEST_CONTENT_ID,
                reactionType = ReactionType.LOVE,
            )

        mockMvc.perform(
            post("/api/v1/reactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .with(jwt().jwt { it.subject(TEST_USER_ID.toString()) }),
        )
            .andExpect(status().isCreated)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.status").value(201))
            .andExpect(jsonPath("$.data.id").isNotEmpty)
            .andExpect(jsonPath("$.data.contentId").value(TEST_CONTENT_ID.toString()))
            .andExpect(jsonPath("$.data.reactionType").value("LOVE"))
            .andExpect(jsonPath("$.data.count").value(1))

        // Verify reaction was persisted to database
        val reactions = reactionRepository.findAll()
        assertThat(reactions).hasSize(1)
        assertThat(reactions[0].userId).isEqualTo(TEST_USER_ID)
        assertThat(reactions[0].contentId).isEqualTo(TEST_CONTENT_ID)
        assertThat(reactions[0].reactionType).isEqualTo(ReactionType.LOVE)
    }

    @Test
    @DisplayName("POST /api/v1/reactions - Unauthenticated request should return 401/403")
    fun `submitReaction without authentication should fail`() {
        val dto =
            ReactionCreateDto(
                contentId = TEST_CONTENT_ID,
                reactionType = ReactionType.LOVE,
            )

        mockMvc.perform(
            post("/api/v1/reactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)),
        )
            .andExpect(status().`is`(org.hamcrest.Matchers.either(org.hamcrest.Matchers.`is`(401)).or(org.hamcrest.Matchers.`is`(403))))

        // Verify no reaction was persisted
        val reactions = reactionRepository.findAll()
        assertThat(reactions).isEmpty()
    }

    @Test
    @DisplayName("POST /api/v1/reactions - Same reaction type should toggle off (remove)")
    fun `submitReaction with same type should remove reaction and return 200`() {
        // First, create initial reaction
        val dto =
            ReactionCreateDto(
                contentId = TEST_CONTENT_ID,
                reactionType = ReactionType.LOVE,
            )

        mockMvc.perform(
            post("/api/v1/reactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .with(jwt().jwt { it.subject(TEST_USER_ID.toString()) }),
        )
            .andExpect(status().isCreated)

        // Verify initial reaction was created
        assertThat(reactionRepository.findAll()).hasSize(1)

        // Submit same reaction type again (should toggle off)
        mockMvc.perform(
            post("/api/v1/reactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .with(jwt().jwt { it.subject(TEST_USER_ID.toString()) }),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value(200))
            .andExpect(jsonPath("$.data.reactionType").value("LOVE"))
            .andExpect(jsonPath("$.data.count").value(0))

        // Verify reaction was removed from database
        val reactions = reactionRepository.findAll()
        assertThat(reactions).isEmpty()
    }

    @Test
    @DisplayName("POST /api/v1/reactions - Different reaction type should replace old reaction")
    fun `submitReaction with different type should replace reaction and return 200`() {
        // First, create initial LOVE reaction
        val initialDto =
            ReactionCreateDto(
                contentId = TEST_CONTENT_ID,
                reactionType = ReactionType.LOVE,
            )

        mockMvc.perform(
            post("/api/v1/reactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(initialDto))
                .with(jwt().jwt { it.subject(TEST_USER_ID.toString()) }),
        )
            .andExpect(status().isCreated)

        // Verify initial reaction was created
        var reactions = reactionRepository.findAll()
        assertThat(reactions).hasSize(1)
        assertThat(reactions[0].reactionType).isEqualTo(ReactionType.LOVE)

        // Submit different reaction type (HELPFUL)
        val newDto =
            ReactionCreateDto(
                contentId = TEST_CONTENT_ID,
                reactionType = ReactionType.HELPFUL,
            )

        mockMvc.perform(
            post("/api/v1/reactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newDto))
                .with(jwt().jwt { it.subject(TEST_USER_ID.toString()) }),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value(200))
            .andExpect(jsonPath("$.data.reactionType").value("HELPFUL"))
            .andExpect(jsonPath("$.data.count").value(1))

        // Verify old reaction was replaced (still only 1 reaction in DB)
        reactions = reactionRepository.findAll()
        assertThat(reactions).hasSize(1)
        assertThat(reactions[0].userId).isEqualTo(TEST_USER_ID)
        assertThat(reactions[0].contentId).isEqualTo(TEST_CONTENT_ID)
        assertThat(reactions[0].reactionType).isEqualTo(ReactionType.HELPFUL)
    }

    @Test
    @DisplayName("POST /api/v1/reactions - Rate limit should return 429 after 10 reactions")
    fun `submitReaction exceeding rate limit should return 429 Too Many Requests`() {
        // Submit 10 valid reactions (should all succeed)
        repeat(10) { index ->
            val dto =
                ReactionCreateDto(
                    contentId = UUID.randomUUID(), // Different content IDs
                    reactionType = ReactionType.LOVE,
                )

            mockMvc.perform(
                post("/api/v1/reactions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(dto))
                    .with(jwt().jwt { it.subject(TEST_USER_ID.toString()) }),
            )
                .andExpect(status().isCreated)
        }

        // 11th reaction should be rate limited
        val dto =
            ReactionCreateDto(
                contentId = UUID.randomUUID(),
                reactionType = ReactionType.LOVE,
            )

        mockMvc.perform(
            post("/api/v1/reactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .with(jwt().jwt { it.subject(TEST_USER_ID.toString()) }),
        )
            .andExpect(status().isTooManyRequests)
            .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("reactions")))

        // Verify only 10 reactions were persisted
        val reactions = reactionRepository.findAll()
        assertThat(reactions).hasSize(10)
    }

    @Test
    @DisplayName("DELETE /api/v1/reactions/content/{id} - Successful deletion")
    fun `deleteReaction should remove reaction and return 204`() {
        // First, create a reaction
        val dto =
            ReactionCreateDto(
                contentId = TEST_CONTENT_ID,
                reactionType = ReactionType.LOVE,
            )

        mockMvc.perform(
            post("/api/v1/reactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .with(jwt().jwt { it.subject(TEST_USER_ID.toString()) }),
        )
            .andExpect(status().isCreated)

        // Verify reaction was created
        assertThat(reactionRepository.findAll()).hasSize(1)

        // Delete the reaction
        mockMvc.perform(
            delete("/api/v1/reactions/content/$TEST_CONTENT_ID")
                .with(jwt().jwt { it.subject(TEST_USER_ID.toString()) }),
        )
            .andExpect(status().isNoContent)

        // Verify reaction was deleted
        val reactions = reactionRepository.findAll()
        assertThat(reactions).isEmpty()
    }

    @Test
    @DisplayName("DELETE /api/v1/reactions/content/{id} - Non-existent reaction should return 404")
    fun `deleteReaction for non-existent reaction should return 404`() {
        mockMvc.perform(
            delete("/api/v1/reactions/content/$TEST_CONTENT_ID")
                .with(jwt().jwt { it.subject(TEST_USER_ID.toString()) }),
        )
            .andExpect(status().isNotFound)
    }

    @Test
    @DisplayName("GET /api/v1/reactions/content/{id} - Public access without auth")
    fun `getReactionCounts without authentication should return counts with null userReaction`() {
        // Create some reactions from different users
        createReactionForUser(TEST_USER_ID, TEST_CONTENT_ID, ReactionType.LOVE)
        createReactionForUser(TEST_USER_ID_2, TEST_CONTENT_ID, ReactionType.HELPFUL)

        mockMvc.perform(
            get("/api/v1/reactions/content/$TEST_CONTENT_ID"),
        )
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.data.contentId").value(TEST_CONTENT_ID.toString()))
            .andExpect(jsonPath("$.data.reactions.LOVE").value(1))
            .andExpect(jsonPath("$.data.reactions.HELPFUL").value(1))
            .andExpect(jsonPath("$.data.reactions.INTERESTING").value(0))
            .andExpect(jsonPath("$.data.reactions.THANKYOU").value(0))
            .andExpect(jsonPath("$.data.userReaction").isEmpty)
    }

    @Test
    @DisplayName("GET /api/v1/reactions/content/{id} - Authenticated access includes userReaction")
    fun `getReactionCounts with authentication should return counts with userReaction`() {
        // Create reactions from different users
        createReactionForUser(TEST_USER_ID, TEST_CONTENT_ID, ReactionType.LOVE)
        createReactionForUser(TEST_USER_ID_2, TEST_CONTENT_ID, ReactionType.HELPFUL)

        mockMvc.perform(
            get("/api/v1/reactions/content/$TEST_CONTENT_ID")
                .with(jwt().jwt { it.subject(TEST_USER_ID.toString()) }),
        )
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.data.contentId").value(TEST_CONTENT_ID.toString()))
            .andExpect(jsonPath("$.data.reactions.LOVE").value(1))
            .andExpect(jsonPath("$.data.reactions.HELPFUL").value(1))
            .andExpect(jsonPath("$.data.userReaction").value("LOVE"))
    }

    @Test
    @DisplayName("POST /api/v1/reactions - All reaction types should be accepted")
    fun `submitReaction with each reaction type should succeed`() {
        // Test LOVE
        submitValidReaction(TEST_USER_ID, UUID.randomUUID(), ReactionType.LOVE)
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.data.reactionType").value("LOVE"))

        // Test HELPFUL
        submitValidReaction(TEST_USER_ID, UUID.randomUUID(), ReactionType.HELPFUL)
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.data.reactionType").value("HELPFUL"))

        // Test INTERESTING
        submitValidReaction(TEST_USER_ID, UUID.randomUUID(), ReactionType.INTERESTING)
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.data.reactionType").value("INTERESTING"))

        // Test THANKYOU
        submitValidReaction(TEST_USER_ID, UUID.randomUUID(), ReactionType.THANKYOU)
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.data.reactionType").value("THANKYOU"))

        // Verify all four were persisted with correct types
        val reactions = reactionRepository.findAll()
        assertThat(reactions).hasSize(4)
        assertThat(reactions.map { it.reactionType }).containsExactlyInAnyOrder(
            ReactionType.LOVE,
            ReactionType.HELPFUL,
            ReactionType.INTERESTING,
            ReactionType.THANKYOU,
        )
    }

    @Test
    @DisplayName("POST /api/v1/reactions - Missing contentId should return 400")
    fun `submitReaction with missing contentId should return 400 Bad Request`() {
        val dto =
            mapOf(
                // "contentId" missing
                "reactionType" to "LOVE",
            )

        mockMvc.perform(
            post("/api/v1/reactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .with(jwt().jwt { it.subject(TEST_USER_ID.toString()) }),
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("POST /api/v1/reactions - Missing reactionType should return 400")
    fun `submitReaction with missing reactionType should return 400 Bad Request`() {
        val dto =
            mapOf(
                "contentId" to TEST_CONTENT_ID.toString(),
                // "reactionType" missing
            )

        mockMvc.perform(
            post("/api/v1/reactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .with(jwt().jwt { it.subject(TEST_USER_ID.toString()) }),
        )
            .andExpect(status().isBadRequest)
    }

    /**
     * Helper method to create a reaction for a specific user
     */
    private fun createReactionForUser(
        userId: UUID,
        contentId: UUID,
        reactionType: ReactionType,
    ) {
        val dto = ReactionCreateDto(contentId = contentId, reactionType = reactionType)

        mockMvc.perform(
            post("/api/v1/reactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto))
                .with(jwt().jwt { it.subject(userId.toString()) }),
        )
    }

    /**
     * Helper method to submit a valid reaction with specified parameters
     */
    private fun submitValidReaction(
        userId: UUID,
        contentId: UUID,
        reactionType: ReactionType,
    ) = mockMvc.perform(
        post("/api/v1/reactions")
            .contentType(MediaType.APPLICATION_JSON)
            .content(
                objectMapper.writeValueAsString(
                    ReactionCreateDto(
                        contentId = contentId,
                        reactionType = reactionType,
                    ),
                ),
            )
            .with(jwt().jwt { it.subject(userId.toString()) }),
    )
}
