# ADR 0009: Spring AI for Gemini Integration

- **Status**: Accepted
- **Date**: 2026-02-10
- **Decision-makers**: @jcosta

## Context and Problem Statement

The AI module's `GeminiCulturalProvider` used the Google GenAI SDK (`com.google.genai:google-genai:1.37.0`) directly to call the Gemini API. This required manual JSON schema construction for structured output, direct HTTP client management, and custom response parsing — all of which duplicate capabilities already provided by Spring AI. With Spring Boot 4.0 as our framework, how should the Gemini provider integrate with the Gemini API?

## Decision Drivers

- Spring Boot 4.0 alignment — prefer Spring-managed abstractions over direct SDK usage
- Structured output reliability — Gemini's controlled generation (token-level JSON schema enforcement) requires the schema to be sent via the API's `response_schema` field, not prompt instructions
- Maintainability — reduce provider-specific boilerplate (manual schema definitions, response parsing, client configuration)
- Testability — Spring AI's `ChatClient.Builder` is injectable and mockable, simplifying test setup
- Multimodal support — image analysis requires sending image URLs alongside text prompts

## Considered Options

1. Spring AI ChatClient with native structured output
2. Keep Google GenAI SDK with manual schema
3. Spring AI ChatClient with prompt-based structured output

## Decision Outcome

**Chosen option**: "Spring AI ChatClient with native structured output", because it provides reliable JSON schema enforcement at the token level via Gemini's controlled generation API, while eliminating manual schema definitions and aligning with Spring Boot conventions.

### Consequences

**Positive**:
- Eliminated ~50 lines of manual JSON schema construction (`RESPONSE_SCHEMA` companion object)
- Structured output DTO (`GeminiCulturalResponse` data class) replaces manual schema — Spring AI's `BeanOutputConverter` auto-generates the JSON schema
- `ChatClient.Builder` injection replaces manual `@Value` API key/model/token properties
- Multimodal input uses Spring's `UrlResource` + `MimeType` instead of raw SDK content parts
- Provider is now testable via standard Spring `ChatClient.Builder` mocking
- Configuration uses Spring AI auto-configuration properties (`spring.ai.google.genai.*`)

**Negative**:
- Depends on Spring AI 2.0.0-M2 (milestone release, not GA) — requires Spring Milestones repository
- Two-property activation: `spring.ai.model.chat=google-genai` (Spring AI auto-config) AND `nosilha.ai.gemini.enabled=true` (provider bean) — more env vars to manage
- `.entity()` returns nullable type in Kotlin, requiring `!!` assertion

## Pros and Cons of the Options

### Option 1: Spring AI ChatClient with native structured output

Uses `ChatClient.prompt().user{}.call().entity(Class)` with `ENABLE_NATIVE_STRUCTURED_OUTPUT` advisor. Spring AI sends the JSON schema to Gemini's `response_schema` API field, enforcing structure at the token generation level.

- Good, because JSON schema is auto-generated from a Kotlin data class (no manual schema)
- Good, because native mode enforces schema at token level (not just prompt instruction)
- Good, because `ChatClient.Builder` is auto-configured and injectable
- Good, because multimodal support via `.media(MimeType, Resource)` is idiomatic
- Good, because aligns with the project's Spring Boot 4.0 stack
- Bad, because Spring AI 2.0.0-M2 is a milestone release
- Bad, because auto-configuration enabled by default (`matchIfMissing=true`) — must explicitly set `spring.ai.model.chat=none` to disable

### Option 2: Keep Google GenAI SDK with manual schema

Continues using `com.google.genai:google-genai` with `Client.builder().apiKey()` and manually-constructed `Schema` objects for controlled generation.

- Good, because already working in production
- Good, because direct SDK control over all API parameters
- Bad, because ~50 lines of manual schema boilerplate per response type
- Bad, because non-Spring-idiomatic (manual client lifecycle, `@Value` injection of every config property)
- Bad, because response parsing requires manual ObjectMapper deserialization
- Bad, because SDK updates may break schema construction APIs

### Option 3: Spring AI ChatClient with prompt-based structured output

Uses `ChatClient` but relies on prompt instructions (e.g., "respond in JSON with fields: ...") instead of Gemini's native `response_schema` enforcement.

- Good, because simpler setup (no native structured output advisor)
- Good, because works with any model, not just Gemini
- Bad, because LLM may produce malformed JSON despite instructions
- Bad, because requires manual JSON parsing and validation
- Bad, because ignores Gemini's strongest structured output capability

## More Information

### Configuration changes

Spring AI 2.0 introduced a new property for enabling/disabling model auto-configuration:

| Property | Values | Purpose |
|----------|--------|---------|
| `spring.ai.model.chat` | `google-genai` / `none` | Controls Spring AI auto-config (replaces 1.x `spring.ai.google.genai.chat.enabled`) |
| `nosilha.ai.gemini.enabled` | `true` / `false` | Controls `GeminiCulturalProvider` bean creation |

**Production activation** requires both: `SPRING_AI_MODEL_CHAT=google-genai` + `AI_GEMINI_ENABLED=true`.

### Files changed

| File | Change |
|------|--------|
| `apps/api/build.gradle.kts` | Replaced `google-genai:1.37.0` with `spring-ai-starter-model-google-genai` (BOM 2.0.0-M2) |
| `apps/api/src/main/resources/application.yml` | Added `spring.ai.model.chat`, `spring.ai.google.genai.*`; removed `nosilha.ai.batch.max-items` |
| `apps/api/src/test/resources/application-test.yml` | Added `spring.ai.model.chat: none` |
| `apps/api/.../GeminiCulturalProvider.kt` | Rewritten to use `ChatClient` + `GeminiCulturalResponse` DTO |
| `infrastructure/terraform/cloudrun.tf` | Added `SPRING_AI_MODEL_CHAT` env var |

### Impact on ADR-0008

[ADR-0008](0008-ai-api-authentication-strategy.md) documented the use of `Client.builder().apiKey()` for Gemini Developer API authentication. That SDK call is now replaced by Spring AI's auto-configured `ChatClient`, but the underlying authentication mechanism remains the same: API key via Secret Manager passed through `spring.ai.google.genai.api-key`. The Developer API endpoint (`generativelanguage.googleapis.com`) and the future Vertex AI migration path described in ADR-0008 remain valid.

### Related artifacts

- Spec: `plan/arkhe/specs/010-spring-ai-gemini-refactor/`
- Previous decision: [ADR-0008 AI API Authentication Strategy](0008-ai-api-authentication-strategy.md)
- Spring AI docs: [Google GenAI Chat](https://docs.spring.io/spring-ai/reference/api/chat/google-genai-chat.html)
- Spring AI docs: [Structured Output](https://docs.spring.io/spring-ai/reference/2.0/api/structured-output-converter.html)
