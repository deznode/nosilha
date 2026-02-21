# Spring AI Structured Output & Gemini Integration Research

**Research Date:** February 9, 2026
**Context:** Spring Boot 4.0.0 + Kotlin 2.3.0 project currently using `com.google.genai:google-genai:1.37.0`
**Goal:** Evaluate structured output approaches for converting Gemini LLM responses to Kotlin data classes

---

## Executive Summary

For Spring Boot 4.0 projects in 2026, there are **three viable approaches** for getting structured JSON from Gemini:

1. **Spring AI (Recommended for Spring Boot 3.x)**: Production-ready with Spring Boot 3.4+, but **Spring Boot 4.0 support is still in milestone** (2.0.0-M2 as of Jan 2026, GA expected Feb 20, 2026)
2. **Google GenAI SDK Native Structured Output (Recommended for Spring Boot 4.0 NOW)**: The `com.google.genai` SDK you're already using supports native JSON schema mode — most reliable for current Spring Boot 4.0 projects
3. **Manual Prompt Engineering + Jackson (Current Approach)**: Fragile but works if you need to ship immediately

**For your Spring Boot 4.0.0 project TODAY:** Use the Google GenAI SDK's native structured output feature with `response_mime_type: "application/json"` and `response_json_schema`. Migrate to Spring AI 2.0 when it reaches GA (expected Feb 2026).

---

## 1. Spring AI Structured Output

### What It Is

Spring AI provides a **BeanOutputConverter** (formerly BeanOutputParser, renamed in May 2024) that:
- Generates JSON schemas from Java/Kotlin classes
- Augments prompts with formatting instructions
- Deserializes LLM responses into typed objects

### API Pattern

```kotlin
// Define your data structure
data class Recipe(
    val title: String,
    val ingredients: List<String>,
    val instructions: List<String>,
    val prepTimeMinutes: Int
)

// Use ChatClient fluent API
@RestController
class RecipeController(private val chatClient: ChatClient) {

    @GetMapping("/recipe")
    fun generateRecipe(@RequestParam ingredients: String): Recipe {
        return chatClient.prompt()
            .user("Create a recipe using: $ingredients")
            .call()
            .entity(Recipe::class.java) // Type-safe conversion
    }
}
```

### How It Works

1. **Schema Generation**: Analyzes your Kotlin data class and generates JSON schema
2. **Prompt Augmentation**: Adds instructions to the prompt telling the LLM to output JSON matching the schema
3. **Deserialization**: Parses the response text into your Kotlin object using Jackson

### Native Structured Output Mode

Spring AI supports **native structured output** for providers that implement `StructuredOutputChatOptions`:

```kotlin
val chatClient = ChatClient.builder()
    .defaultAdvisors(AdvisorParams.ENABLE_NATIVE_STRUCTURED_OUTPUT)
    .build()
```

**Key Difference:**
- **Without native mode**: Adds formatting instructions to your prompt (prompt engineering approach)
- **With native mode**: Sends JSON schema directly to the LLM API, letting the model enforce it at generation time (more reliable)

### Supported Models (Native Mode)

As of Jan 2026:
- OpenAI GPT-4O+ ✅
- Anthropic Claude ✅
- **Google Gemini via Spring AI** ✅ (both legacy `VertexAiGeminiChatModel` and new `google-genai` models)

### Validation & Retry

Spring AI provides `StructuredOutputValidationAdvisor` to handle malformed JSON:
- Validates responses against expected schema
- Re-prompts the LLM with error feedback if JSON is invalid
- Useful for Gemini models which can produce truncated/malformed JSON

```kotlin
chatClient.prompt()
    .user(prompt)
    .advisors(StructuredOutputValidationAdvisor())
    .call()
    .entity(Recipe::class.java)
```

### Spring Boot 4.0 Compatibility Status

**CRITICAL LIMITATION:** As of Feb 9, 2026:
- **Spring AI 2.0.0-M2** (latest milestone) supports Spring Boot 4.0.0
- **GA release expected: February 20, 2026**
- Spring Boot 3.4.x and 3.5.x are fully supported
- Spring AI 1.x does **NOT** support Spring Boot 4.0

**Source:** GitHub issue #3379 and discussion #5149 confirm Spring AI 2.0 milestone targeting Boot 4.0 compatibility.

**Production Readiness:**
- ✅ Spring Boot 3.4+: Production-ready (Spring AI 1.x)
- ⚠️ Spring Boot 4.0: Milestone only (Spring AI 2.0.0-M2) — **not recommended for production until GA**

---

## 2. Google GenAI SDK Native Structured Output

### What It Is

The `com.google.genai` SDK (the one you're already using) **natively supports structured output** via:
- `response_mime_type: "application/json"`
- `response_json_schema`: JSON Schema definition

This uses Gemini's **controlled generation** feature (also called "controlled decoding") under the hood.

### API Pattern (Kotlin)

```kotlin
import com.google.genai.*

data class Recipe(
    val recipe_name: String,
    val prep_time_minutes: Int?,
    val ingredients: List<Ingredient>,
    val instructions: List<String>
)

data class Ingredient(
    val name: String,
    val quantity: String
)

// Generate JSON schema (manually or via reflection)
val schema = mapOf(
    "type" to "object",
    "properties" to mapOf(
        "recipe_name" to mapOf("type" to "string"),
        "prep_time_minutes" to mapOf("type" to "integer"),
        "ingredients" to mapOf(
            "type" to "array",
            "items" to mapOf(
                "type" to "object",
                "properties" to mapOf(
                    "name" to mapOf("type" to "string"),
                    "quantity" to mapOf("type" to "string")
                ),
                "required" to listOf("name", "quantity")
            )
        ),
        "instructions" to mapOf(
            "type" to "array",
            "items" to mapOf("type" to "string")
        )
    ),
    "required" to listOf("recipe_name", "ingredients", "instructions")
)

val model = GenerativeModel("gemini-2.5-flash")
val response = model.generateContent(
    prompt = "Extract recipe from: ...",
    generationConfig = GenerationConfig(
        responseMimeType = "application/json",
        responseSchema = schema
    )
)

// Parse response with Jackson
val mapper = ObjectMapper().registerKotlinModule()
val recipe = mapper.readValue<Recipe>(response.text)
```

### Improvements (Nov 2025)

Google announced major improvements to Gemini structured outputs:
1. **Full JSON Schema support**: Now supports `anyOf`, `$ref`, nested schemas, enums, etc.
2. **Property order preservation**: Output JSON maintains the same key order as your schema (Gemini 2.5+ models)
3. **Pydantic/Zod integration**: Python/JS SDKs can now auto-generate schemas from type definitions

### Supported Models

All actively supported Gemini models (as of Jan 2026):
- ✅ Gemini 3.0 Flash Preview
- ✅ Gemini 3.0 Pro Preview
- ✅ Gemini 2.5 Flash
- ✅ Gemini 2.5 Flash-Lite
- ✅ Gemini 2.5 Pro
- ✅ Gemini 2.0 Flash (deprecated, but still works)

### How It Works (Controlled Generation)

Gemini's controlled generation uses **controlled decoding** at the token level:
1. You provide a JSON Schema defining the expected structure
2. The schema is compiled into a constraint graph
3. During generation, each token is validated against the constraint graph
4. Invalid tokens are rejected, ensuring output always conforms to the schema

This is **more reliable than prompt engineering** because the model cannot produce invalid JSON — it's enforced at the generation level.

### Advantages

1. **No Spring AI dependency**: Works with Spring Boot 4.0 today
2. **Most reliable**: Controlled decoding prevents malformed JSON at the source
3. **Best performance**: Fewer re-prompts/retries compared to validation-based approaches
4. **Already in your project**: `com.google.genai:google-genai:1.37.0` supports this

### Disadvantages

1. **Manual schema generation**: No automatic conversion from Kotlin data classes (you have to write JSON schemas by hand or use reflection)
2. **Less Spring-idiomatic**: No fluent API, no autoconfiguration
3. **Vendor lock-in**: Tied to Google GenAI SDK (but you're already using it)

---

## 3. Manual Prompt Engineering + Jackson (Current Approach)

### What You're Doing Now

```kotlin
val prompt = """
Return your response as valid JSON with the following structure:
{
  "analysis": "...",
  "confidence": 0.95,
  "categories": ["..."]
}
""".trimIndent()

val response = model.generateContent(prompt)
val json = objectMapper.readValue<AnalysisResult>(response.text)
```

### Problems

1. **Fragile**: Model may ignore instructions, especially with longer prompts
2. **Truncation**: If `maxOutputTokens` is exceeded, you get incomplete JSON → Jackson parsing fails
3. **Malformed JSON**: Model may produce `{"key": "value"` (missing closing brace) or invalid syntax
4. **No schema enforcement**: Model can add extra fields or omit required ones

### When It Fails

Common failure modes reported by developers:
- Response truncated mid-JSON due to token limits → `JsonParseException`
- Model wraps JSON in markdown code blocks → manual regex stripping required
- Model hallucinates extra fields not in your schema → deserialization errors
- Model produces `null` for entire response when limits are hit (GitHub issue #1039)

---

## 4. Comparison: Which Approach to Use?

| Criteria | Spring AI | Google GenAI SDK | Manual Prompting |
|----------|-----------|------------------|------------------|
| **Spring Boot 4.0 Support** | ⚠️ Milestone only (2.0.0-M2) | ✅ Works today | ✅ Works today |
| **Reliability** | ⭐⭐⭐⭐ (with native mode) | ⭐⭐⭐⭐⭐ (best) | ⭐⭐ (fragile) |
| **Type Safety** | ✅ Auto-conversion | ⚠️ Manual schema + Jackson | ⚠️ Manual Jackson |
| **Ease of Use** | ✅ Fluent API | ⚠️ Verbose schema definitions | ✅ Simple (but unreliable) |
| **Vendor Lock-in** | ❌ Provider-agnostic | ⚠️ Google-specific | ❌ Portable |
| **Production Readiness** | ⚠️ Wait for 2.0 GA | ✅ Production-ready | ❌ Not recommended |
| **Truncation Handling** | ⭐⭐⭐ (with retry advisor) | ⭐⭐⭐⭐ (fails fast) | ⭐ (silent corruption) |

---

## 5. Token Limits & Truncation

### The Problem

All approaches face the same fundamental issue: **if the model output exceeds `maxOutputTokens`, the response is truncated**.

When this happens:
- **Manual prompting**: You get incomplete JSON → Jackson parsing fails with `JsonEOFException`
- **Google GenAI SDK**: Response returns `null` for `.text` and `.parsed` (GitHub issue #1039)
- **Spring AI**: Depends on provider; may return partial content or throw exception

### Does Structured Output Help?

**Partially, but not a silver bullet:**

✅ **Helps:**
- Gemini's controlled generation ensures you get **valid JSON up to the truncation point** (but it's still incomplete)
- Spring AI's `StructuredOutputValidationAdvisor` can detect truncation and retry with a larger token limit

❌ **Doesn't solve:**
- Fundamental token limit still exists
- Model still doesn't know when it's about to be cut off
- For very large outputs (e.g., 10+ item lists), you may need pagination or chunking

### Best Practices

1. **Set appropriate `maxOutputTokens`**:
   - Default is often 2048 tokens
   - For structured outputs, estimate: ~4 chars per token
   - If expecting 100-item list, set `maxOutputTokens: 8192` or higher

2. **Design schemas to fit token limits**:
   - Avoid unbounded arrays (`List<String>` with no max length)
   - Use pagination for large datasets (e.g., "return first 20 items")

3. **Handle truncation gracefully**:
   ```kotlin
   try {
       val result = objectMapper.readValue<Recipe>(response.text)
   } catch (e: JsonEOFException) {
       logger.error("Response truncated, retrying with higher token limit")
       // Retry with maxOutputTokens *= 2
   }
   ```

4. **Use streaming for incremental parsing** (not supported for structured output in most SDKs as of 2026)

---

## 6. Recommended Approach for Your Project

**Context:**
- Spring Boot 4.0.0
- Kotlin 2.3.0
- Currently using `com.google.genai:google-genai:1.37.0`
- Need structured output for image analysis results

### Short-Term (Now → Feb 20, 2026)

**Use Google GenAI SDK Native Structured Output**

```kotlin
// 1. Define your Kotlin data classes
data class ImageAnalysisResult(
    val description: String,
    val labels: List<String>,
    val confidence: Double,
    val moderation: ModerationResult
)

data class ModerationResult(
    val safe: Boolean,
    val categories: List<String>
)

// 2. Generate JSON schema (manual or via helper function)
val schema = mapOf(
    "type" to "object",
    "properties" to mapOf(
        "description" to mapOf("type" to "string"),
        "labels" to mapOf(
            "type" to "array",
            "items" to mapOf("type" to "string")
        ),
        "confidence" to mapOf("type" to "number"),
        "moderation" to mapOf(
            "type" to "object",
            "properties" to mapOf(
                "safe" to mapOf("type" to "boolean"),
                "categories" to mapOf(
                    "type" to "array",
                    "items" to mapOf("type" to "string")
                )
            ),
            "required" to listOf("safe", "categories")
        )
    ),
    "required" to listOf("description", "labels", "confidence", "moderation")
)

// 3. Call Gemini with structured output
val model = GenerativeModel(
    modelName = "gemini-2.5-flash",
    apiKey = apiKey
)

val response = model.generateContent(
    prompt = "Analyze this image: $imageBase64",
    generationConfig = GenerationConfig(
        maxOutputTokens = 4096, // Set appropriately
        temperature = 0.2,      // Lower temp for structured output
        responseMimeType = "application/json",
        responseSchema = schema
    )
)

// 4. Parse with Jackson
val mapper = jacksonObjectMapper()
val result = mapper.readValue<ImageAnalysisResult>(response.text)
```

**Why this approach:**
- ✅ Works with Spring Boot 4.0 today
- ✅ Most reliable (controlled generation)
- ✅ You're already using the SDK
- ✅ Production-ready
- ⚠️ Requires manual schema generation (one-time cost)

### Long-Term (After Feb 20, 2026)

**Migrate to Spring AI 2.0**

Once Spring AI 2.0 GA is released:

```kotlin
// 1. Add Spring AI dependency
dependencies {
    implementation("org.springframework.ai:spring-ai-starter-model-google-genai:2.0.0")
    implementation("org.springframework.ai:spring-ai-autoconfigure-model-chat-client:2.0.0")
}

// 2. Configure in application.yml
spring:
  ai:
    google:
      genai:
        api-key: ${GOOGLE_API_KEY}
        model: gemini-2.5-flash
        location: us-central1

// 3. Use fluent API
@Service
class ImageAnalysisService(private val chatClient: ChatClient) {

    fun analyzeImage(imageBase64: String): ImageAnalysisResult {
        return chatClient.prompt()
            .user("Analyze this image: $imageBase64")
            .advisors(AdvisorParams.ENABLE_NATIVE_STRUCTURED_OUTPUT)
            .advisors(StructuredOutputValidationAdvisor())
            .call()
            .entity(ImageAnalysisResult::class.java)
    }
}
```

**Why migrate:**
- ✅ More Spring-idiomatic
- ✅ Automatic schema generation from Kotlin classes
- ✅ Built-in retry/validation
- ✅ Provider-agnostic (easy to switch LLMs)

---

## 7. Code Examples

### Example 1: Google GenAI SDK with Schema Helper

```kotlin
// Helper function to generate JSON schema from Kotlin data class
object SchemaGenerator {
    fun fromDataClass(kClass: KClass<*>): Map<String, Any> {
        val properties = mutableMapOf<String, Map<String, Any>>()
        val required = mutableListOf<String>()

        kClass.memberProperties.forEach { prop ->
            val propName = prop.name
            val propType = prop.returnType.javaType

            properties[propName] = when (propType) {
                String::class.java -> mapOf("type" to "string")
                Int::class.java -> mapOf("type" to "integer")
                Double::class.java -> mapOf("type" to "number")
                Boolean::class.java -> mapOf("type" to "boolean")
                else -> mapOf("type" to "object") // Simplified
            }

            if (!prop.returnType.isMarkedNullable) {
                required.add(propName)
            }
        }

        return mapOf(
            "type" to "object",
            "properties" to properties,
            "required" to required
        )
    }
}

// Usage
val schema = SchemaGenerator.fromDataClass(ImageAnalysisResult::class)
```

### Example 2: Spring AI with Native Mode (Future)

```kotlin
@Configuration
class AiConfig {
    @Bean
    fun chatClient(builder: ChatClient.Builder): ChatClient {
        return builder
            .defaultAdvisors(
                AdvisorParams.ENABLE_NATIVE_STRUCTURED_OUTPUT,
                StructuredOutputValidationAdvisor()
            )
            .build()
    }
}

@Service
class RecipeService(private val chatClient: ChatClient) {
    fun generateRecipe(ingredients: String): Recipe {
        return chatClient.prompt()
            .user("Create a recipe with: $ingredients")
            .call()
            .entity(Recipe::class.java)
    }
}
```

### Example 3: Handling Truncation with Retry

```kotlin
class StructuredOutputService(
    private val model: GenerativeModel,
    private val objectMapper: ObjectMapper
) {
    fun <T> generateWithRetry(
        prompt: String,
        schema: Map<String, Any>,
        targetClass: KClass<T>,
        maxRetries: Int = 3
    ): T {
        var currentMaxTokens = 2048
        var attempt = 0

        while (attempt < maxRetries) {
            try {
                val response = model.generateContent(
                    prompt = prompt,
                    generationConfig = GenerationConfig(
                        maxOutputTokens = currentMaxTokens,
                        responseMimeType = "application/json",
                        responseSchema = schema
                    )
                )

                return objectMapper.readValue(response.text, targetClass.java)

            } catch (e: JsonEOFException) {
                logger.warn("Response truncated at $currentMaxTokens tokens, retrying...")
                currentMaxTokens *= 2
                attempt++
            }
        }

        throw IllegalStateException("Failed after $maxRetries retries")
    }
}
```

---

## 8. Key Takeaways

### For Spring Boot 4.0 Projects (Now)

1. **Use Google GenAI SDK's native structured output** (`response_mime_type` + `response_json_schema`)
2. Generate JSON schemas manually or with a helper function
3. Set `maxOutputTokens` appropriately to avoid truncation
4. Lower `temperature` (0.2-0.4) for more deterministic structured output
5. Implement retry logic with exponential backoff for truncation cases

### For Spring Boot 3.4+ Projects (Production-Ready)

1. Use Spring AI 1.x with `BeanOutputConverter` and `.entity()` API
2. Enable `ENABLE_NATIVE_STRUCTURED_OUTPUT` advisor for best reliability
3. Add `StructuredOutputValidationAdvisor` for automatic retry on malformed JSON

### Migration Path (Feb 2026+)

1. Spring AI 2.0 GA expected February 20, 2026
2. Provides full Spring Boot 4.0 compatibility
3. Plan migration from Google GenAI SDK → Spring AI once GA is released
4. Minimal code changes: replace SDK calls with `chatClient.prompt()` API

### Common Pitfalls

1. **Don't rely on prompt engineering alone** for structured output — use native schema enforcement
2. **Always validate `maxOutputTokens` is sufficient** for your expected response size
3. **Gemini models (especially 2.5) can produce truncated JSON** even with schema mode enabled if token limit is hit
4. **Union types and Optional don't work** with Gemini structured output (throw error in Spring AI)
5. **Property names matter**: Use snake_case in JSON schemas for consistency with Gemini's output

---

## 9. References

### Official Documentation

- [Spring AI Structured Output Docs](https://docs.spring.io/spring-ai/reference/api/structured-output-converter.html)
- [Google Gemini Structured Output Guide](https://ai.google.dev/gemini-api/docs/structured-output)
- [Vertex AI Controlled Generation](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/control-generated-output)
- [Spring Boot 4.0 Release Notes](https://spring.io/blog/2025/11/20/spring-boot-4-0-0-available-now)

### Key GitHub Issues

- [Spring AI Issue #3379](https://github.com/spring-projects/spring-ai/issues/3379) - Spring Boot 4.0 compatibility tracking
- [Spring AI Discussion #5149](https://github.com/spring-projects/spring-ai/discussions/5149) - Spring Boot 4 compatibility timeline
- [Google GenAI Issue #1039](https://github.com/googleapis/python-genai/issues/1039) - Truncation returns None

### Community Articles

- [Medium: Integrating Google Gemini with Spring Boot 4+](https://medium.com/@azarovdeveloper/integrating-google-gemini-with-spring-boot-4-8c03ae5969af)
- [Medium: Schema-Safe AI Responses with Spring Boot 4](https://medium.com/@azarovdeveloper/from-prompts-to-reliability-dynamic-prompt-rendering-and-schema-safe-ai-responses-with-spring-boot-f10bf5f76be4)
- [Google Blog: Improving Structured Outputs in Gemini API](https://blog.google/technology/developers/gemini-api-structured-outputs/)

### Video Tutorials

- [Dan Vega: Native Structured Output in Spring AI](https://www.youtube.com/watch?v=bQUqJnKqDhY) - Jan 2026
- [Learn Code With Durgesh: Google Gemini + Spring Boot](https://www.youtube.com/watch?v=alsxTfbNSPU) - Dec 2025

---

## 10. Action Items for Your Project

### Immediate (This Week)

- [ ] Update current image analysis prompt to use `response_mime_type: "application/json"`
- [ ] Define JSON schema for `ImageAnalysisResult` data class
- [ ] Test with various image inputs to ensure no truncation
- [ ] Increase `maxOutputTokens` to 4096 for safety margin
- [ ] Add try-catch for `JsonEOFException` with retry logic

### Short-Term (Next Sprint)

- [ ] Create `SchemaGenerator` utility to auto-generate schemas from Kotlin data classes
- [ ] Implement exponential backoff retry mechanism for truncated responses
- [ ] Add monitoring for truncation rate and token usage
- [ ] Document structured output patterns for team

### Long-Term (Post-Feb 2026)

- [ ] Evaluate Spring AI 2.0 GA release when available
- [ ] Plan migration from Google GenAI SDK to Spring AI
- [ ] Update documentation and coding standards
- [ ] Train team on Spring AI fluent API patterns

---

**Research completed:** February 9, 2026
**Next review:** After Spring AI 2.0 GA release (estimated Feb 20, 2026)
