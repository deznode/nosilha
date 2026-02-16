package com.nosilha.core.ai

import com.nosilha.core.ai.domain.ApiUsageService
import com.nosilha.core.ai.provider.GeminiDirectoryContentOutput
import com.nosilha.core.ai.provider.GeminiPromptsOutput
import com.nosilha.core.ai.provider.TextAiProvider
import com.nosilha.core.shared.exception.RateLimitExceededException
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.mockito.Answers
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.ai.chat.client.AdvisorParams
import org.springframework.ai.chat.client.ChatClient
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertNotNull
import kotlin.test.assertNull

class TextAiProviderTest {
    private val chatClientBuilder = mock<ChatClient.Builder>(defaultAnswer = Answers.RETURNS_DEEP_STUBS)
    private val chatClient = mock<ChatClient>(defaultAnswer = Answers.RETURNS_DEEP_STUBS)
    private val apiUsageService = mock<ApiUsageService>()

    private lateinit var provider: TextAiProvider

    @BeforeEach
    fun setup() {
        whenever(chatClientBuilder.defaultAdvisors(AdvisorParams.ENABLE_NATIVE_STRUCTURED_OUTPUT).build()).thenReturn(chatClient)
        whenever(apiUsageService.checkAndIncrementQuota(eq("gemini-text"), eq(1000))).thenReturn(true)

        provider = TextAiProvider(
            chatClientBuilder = chatClientBuilder,
            apiUsageService = apiUsageService,
            textMonthlyLimit = 1000,
        )
    }

    @Test
    @DisplayName("polishContent - success returns polished text")
    fun `polishContent success returns polished text`() {
        whenever(
            chatClient
                .prompt()
                .user(any<String>())
                .call()
                .content(),
        ).thenReturn("Polished story text")

        val result = provider.polishContent("Original story text")
        assertEquals("Polished story text", result)
    }

    @Test
    @DisplayName("polishContent - quota exceeded throws RateLimitExceededException")
    fun `polishContent quota exceeded throws RateLimitExceededException`() {
        whenever(apiUsageService.checkAndIncrementQuota(eq("gemini-text"), eq(1000))).thenReturn(false)

        assertFailsWith<RateLimitExceededException> {
            provider.polishContent("Original text")
        }
    }

    @Test
    @DisplayName("polishContent - ChatClient failure returns original content")
    fun `polishContent ChatClient failure returns original content`() {
        whenever(
            chatClient
                .prompt()
                .user(any<String>())
                .call()
                .content(),
        ).thenThrow(RuntimeException("Gemini API error"))

        val result = provider.polishContent("Original text")
        assertEquals("Original text", result)
    }

    @Test
    @DisplayName("translateContent - success returns translated text")
    fun `translateContent success returns translated text`() {
        whenever(
            chatClient
                .prompt()
                .user(any<String>())
                .call()
                .content(),
        ).thenReturn("Texto traduzido")

        val result = provider.translateContent("Original text", "PT")
        assertEquals("Texto traduzido", result)
    }

    @Test
    @DisplayName("translateContent - quota exceeded throws RateLimitExceededException")
    fun `translateContent quota exceeded throws RateLimitExceededException`() {
        whenever(apiUsageService.checkAndIncrementQuota(eq("gemini-text"), eq(1000))).thenReturn(false)

        assertFailsWith<RateLimitExceededException> {
            provider.translateContent("Text to translate", "EN")
        }
    }

    @Test
    @DisplayName("generatePrompts - success returns prompts list")
    fun `generatePrompts success returns prompts list`() {
        val expectedOutput = GeminiPromptsOutput(
            prompts = listOf(
                "What sounds do you remember from your childhood?",
                "Can you describe the view from your favorite spot?",
                "Who taught you about the traditions?",
            ),
        )
        whenever(
            chatClient
                .prompt()
                .user(any<String>())
                .call()
                .entity(GeminiPromptsOutput::class.java),
        ).thenReturn(expectedOutput)

        val result = provider.generatePrompts("personal-memory", "I remember the mornas...")
        assertEquals(3, result.size)
        assertEquals("What sounds do you remember from your childhood?", result[0])
    }

    @Test
    @DisplayName("generatePrompts - failure returns empty list")
    fun `generatePrompts failure returns empty list`() {
        whenever(
            chatClient
                .prompt()
                .user(any<String>())
                .call()
                .entity(GeminiPromptsOutput::class.java),
        ).thenThrow(RuntimeException("Gemini API error"))

        val result = provider.generatePrompts("personal-memory", null)
        assertEquals(emptyList(), result)
    }

    @Test
    @DisplayName("generateDirectoryContent - success returns description and tags")
    fun `generateDirectoryContent success returns description and tags`() {
        val expectedOutput = GeminiDirectoryContentOutput(
            description = "A charming family-owned restaurant in Nova Sintra.",
            tags = listOf("traditional", "family-owned", "local-cuisine", "nova-sintra", "hidden-gem"),
        )
        whenever(
            chatClient
                .prompt()
                .user(any<String>())
                .call()
                .entity(GeminiDirectoryContentOutput::class.java),
        ).thenReturn(expectedOutput)

        val result = provider.generateDirectoryContent("Casa da Morna", "Restaurant")
        assertNotNull(result)
        assertEquals("A charming family-owned restaurant in Nova Sintra.", result.description)
        assertEquals(5, result.tags.size)
    }

    @Test
    @DisplayName("generateDirectoryContent - failure returns null")
    fun `generateDirectoryContent failure returns null`() {
        whenever(
            chatClient
                .prompt()
                .user(any<String>())
                .call()
                .entity(GeminiDirectoryContentOutput::class.java),
        ).thenThrow(RuntimeException("Gemini API error"))

        val result = provider.generateDirectoryContent("Test Place", "Heritage")
        assertNull(result)
    }
}
