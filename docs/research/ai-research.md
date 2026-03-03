# AI Image Analysis Module - Implementation Plan

## Context

The gallery module already has placeholder AI columns in the database (`ai_tags`, `ai_labels`, `ai_alt_text`, `ai_description`, `ai_processed_at`) and partial entity mappings, but no actual AI integration exists. This plan adds a new `ai` Spring Modulith module that provides image analysis via Google Cloud Vision (free tier: labels, OCR, landmarks) and Google Gemini 2.5 Flash (cultural context descriptions, ~$0.40-2/mo). The feature is admin-only, triggered on single items or batch-selected media.

The AI module is designed as a reusable module - any module (gallery, places, stories) can request analysis via events. Provider implementations are swappable via `@ConditionalOnProperty`.

## Architecture Decision: Direct Google SDKs (not Spring AI)

Spring AI 2.0 targets Spring Boot 4 but is still milestone/pre-release. Using stable GA Google SDKs (`google-cloud-vision`, `google-genai`) directly with a custom provider abstraction. Can migrate to Spring AI later if/when it stabilizes - the provider interface insulates all callers.

## Event Flow

```
Admin selects media → POST /api/v1/admin/gallery/{id}/analyze (or /analyze-batch)
  → GalleryModerationService validates (UserUploadedMedia, ACTIVE, has publicUrl)
  → publishes MediaAnalysisRequestedEvent (shared/events/)
  → AI module @ApplicationModuleListener receives event
  → CloudVisionProvider.analyze() [labels, OCR, landmarks]
  → GeminiCulturalProvider.analyze() [cultural context, receives Cloud Vision results]
  → Merges results → publishes MediaAnalysisCompletedEvent (shared/events/)
  → GalleryService @ApplicationModuleListener receives result
  → Updates UserUploadedMedia AI fields
```

Failure: per-provider graceful degradation. If both fail → `MediaAnalysisFailedEvent`. Admin sees items without `ai_processed_at` and can retry.

---

## Phase 1: Foundation (no external API calls)

### 1.1 Create AI module structure

**New files:**
- `apps/api/src/main/kotlin/com/nosilha/core/ai/AiModuleMetadata.kt`
  ```kotlin
  @PackageInfo
  @ApplicationModule(
      displayName = "AI Analysis Module",
      allowedDependencies = ["shared :: api", "shared :: domain", "shared :: events", "shared :: exception"],
      type = ApplicationModule.Type.OPEN,
  )
  ```

- `apps/api/src/main/kotlin/com/nosilha/core/ai/domain/ImageAnalysisProvider.kt` - Provider interface
  ```kotlin
  interface ImageAnalysisProvider {
      val name: String
      fun analyze(request: ImageAnalysisRequest): ImageAnalysisResult
      fun supports(capability: AnalysisCapability): Boolean
      fun isEnabled(): Boolean
  }
  ```

- `apps/api/src/main/kotlin/com/nosilha/core/ai/domain/AnalysisCapability.kt` - Enum: LABELS, OCR, LANDMARKS, CULTURAL_CONTEXT, ALT_TEXT, DESCRIPTION

- `apps/api/src/main/kotlin/com/nosilha/core/ai/domain/ImageAnalysisRequest.kt`
  ```kotlin
  data class ImageAnalysisRequest(
      val imageUrl: String,
      val capabilities: Set<AnalysisCapability> = AnalysisCapability.entries.toSet(),
      val culturalContext: String? = null,
      val priorResults: ImageAnalysisResult? = null,  // Cloud Vision results fed to Gemini
  )
  ```

- `apps/api/src/main/kotlin/com/nosilha/core/ai/domain/ImageAnalysisResult.kt`
  ```kotlin
  data class ImageAnalysisResult(
      val provider: String,
      val labels: List<LabelResult> = emptyList(),
      val textDetected: List<String> = emptyList(),
      val landmarks: List<String> = emptyList(),
      val altText: String? = null,
      val description: String? = null,
      val tags: List<String> = emptyList(),
  )
  data class LabelResult(val label: String, val confidence: Float)
  ```

- `apps/api/src/main/kotlin/com/nosilha/core/ai/domain/ImageAnalysisOrchestrator.kt` - Main service, event listener, orchestrates providers
- `apps/api/src/main/kotlin/com/nosilha/core/ai/domain/CulturalPromptTemplates.kt` - Brava Island cultural context prompt

### 1.2 Create shared events

**New files in `apps/api/src/main/kotlin/com/nosilha/core/shared/events/`:**

- `MediaAnalysisRequestedEvent.kt`
  ```kotlin
  data class MediaAnalysisRequestedEvent(
      val mediaId: UUID,
      val imageUrl: String,
      val mediaTitle: String? = null,
      val locationContext: String? = null,
      val requestedBy: UUID,
      override val occurredAt: Instant = Instant.now(),
  ) : ApplicationModuleEvent
  ```

- `MediaAnalysisCompletedEvent.kt`
  ```kotlin
  data class MediaAnalysisCompletedEvent(
      val mediaId: UUID,
      val tags: List<String>,
      val labels: String,       // JSON string for JSONB column
      val altText: String?,
      val description: String?,
      val providers: List<String>,
      override val occurredAt: Instant = Instant.now(),
  ) : ApplicationModuleEvent
  ```

- `MediaAnalysisFailedEvent.kt`
  ```kotlin
  data class MediaAnalysisFailedEvent(
      val mediaId: UUID,
      val errorMessage: String,
      val provider: String?,
      override val occurredAt: Instant = Instant.now(),
  ) : ApplicationModuleEvent
  ```

### 1.3 Map missing AI entity fields

**Modify:** `apps/api/src/main/kotlin/com/nosilha/core/gallery/domain/UserUploadedMedia.kt`

Add three unmapped columns (already exist in DB):
```kotlin
@Column(name = "ai_labels", columnDefinition = "jsonb")
@JdbcTypeCode(SqlTypes.JSON)
var aiLabels: String? = null

@Column(name = "ai_alt_text", length = 1024)
var aiAltText: String? = null

@Column(name = "ai_description", length = 2048)
var aiDescription: String? = null
```

### 1.4 Add AI fields to DTO

**Modify:** `apps/api/src/main/kotlin/com/nosilha/core/gallery/api/dto/GalleryMediaDto.kt`

Add to `UserUpload` data class:
```kotlin
val aiTags: List<String>?,
val aiAltText: String?,
val aiDescription: String?,
@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
val aiProcessedAt: LocalDateTime?,
```

Update `from(media: UserUploadedMedia)` mapper to include:
```kotlin
aiTags = media.aiTags?.toList(),
aiAltText = media.aiAltText,
aiDescription = media.aiDescription,
aiProcessedAt = media.aiProcessedAt?.let { LocalDateTime.ofInstant(it, ZoneOffset.UTC) },
```

### 1.5 Add gallery-side event listener

**Modify:** `apps/api/src/main/kotlin/com/nosilha/core/gallery/domain/GalleryService.kt`

Add `@ApplicationModuleListener` for `MediaAnalysisCompletedEvent`:
- Find `UserUploadedMedia` by `event.mediaId`
- Set `aiTags`, `aiLabels`, `aiAltText`, `aiDescription`, `aiProcessedAt`
- Save

### 1.6 Add admin analysis trigger endpoints

**Modify:** `apps/api/src/main/kotlin/com/nosilha/core/gallery/api/AdminGalleryController.kt`

Add endpoints:
```
POST /{mediaId}/analyze          → 202 Accepted (single item)
POST /analyze-batch              → 202 Accepted { accepted: N, rejected: N, errors: [...] }
GET  /ai-status?mediaIds=...     → AI processing status for given items
```

**New DTO files:**
- `apps/api/src/main/kotlin/com/nosilha/core/gallery/api/dto/AnalyzeBatchRequest.kt`
- `apps/api/src/main/kotlin/com/nosilha/core/gallery/api/dto/AnalyzeBatchResponse.kt`
- `apps/api/src/main/kotlin/com/nosilha/core/gallery/api/dto/AiStatusResponse.kt`

**Modify:** `apps/api/src/main/kotlin/com/nosilha/core/gallery/domain/GalleryModerationService.kt`

Add methods following existing patterns (like `promoteToHeroImage`):
- `triggerAnalysis(mediaId, adminId)` - validates, publishes `MediaAnalysisRequestedEvent`
- `triggerBatchAnalysis(mediaIds, adminId)` - validates each, returns accepted/rejected counts

---

## Phase 2: Cloud Vision Provider

### 2.1 Add dependency

**Modify:** `apps/api/build.gradle.kts`
```kotlin
implementation("com.google.cloud:google-cloud-vision:3.55.0")
```

### 2.2 Implement provider

**New file:** `apps/api/src/main/kotlin/com/nosilha/core/ai/provider/CloudVisionProvider.kt`
- `@Component` + `@ConditionalOnProperty("nosilha.ai.cloud-vision.enabled")`
- Uses `ImageAnnotatorClient` for label detection, text detection, landmark detection
- Accepts image URL, returns `ImageAnalysisResult`

### 2.3 Configuration

**Modify:** `apps/api/src/main/resources/application.yml`
```yaml
nosilha:
  ai:
    enabled: ${AI_ENABLED:false}
    cloud-vision:
      enabled: ${CLOUD_VISION_ENABLED:false}
      max-labels: 10
      max-text-results: 5
      max-landmark-results: 5
```

**Modify:** `apps/api/src/main/resources/application-local.yml` - add `nosilha.ai.enabled: false`

---

## Phase 3: Gemini Cultural Provider

### 3.1 Add dependency

**Modify:** `apps/api/build.gradle.kts`
```kotlin
implementation("com.google.genai:google-genai:1.0.0")
```

### 3.2 Implement provider

**New file:** `apps/api/src/main/kotlin/com/nosilha/core/ai/provider/GeminiCulturalProvider.kt`
- `@Component` + `@ConditionalOnProperty("nosilha.ai.gemini.enabled")`
- Uses Google GenAI SDK with `gemini-2.5-flash` model
- Sends image + cultural context prompt (from `CulturalPromptTemplates`)
- Receives Cloud Vision results as `priorResults` to enrich with cultural context
- Parses structured JSON response

### 3.3 Configuration

Add to `application.yml` `nosilha.ai` block:
```yaml
    gemini:
      enabled: ${GEMINI_ENABLED:false}
      api-key: ${GEMINI_API_KEY:}
      model: ${GEMINI_MODEL:gemini-2.5-flash}
      max-output-tokens: 500
    batch:
      max-items: 50
```

---

## Phase 4: Admin AI Health Endpoint + Tests

### 4.1 AI module admin endpoint

**New file:** `apps/api/src/main/kotlin/com/nosilha/core/ai/api/AdminAiController.kt`
```
GET /api/v1/admin/ai/health → provider status (enabled/reachable)
```

### 4.2 Tests

**New files:**
- `apps/api/src/test/kotlin/com/nosilha/core/ai/ImageAnalysisOrchestratorTest.kt` - Unit test with mocked providers
- `apps/api/src/test/kotlin/com/nosilha/core/ai/AiModuleIntegrationTest.kt` - Spring Modulith integration test

### 4.3 Update shared DTO

**Modify:** `apps/api/src/main/kotlin/com/nosilha/core/shared/api/MediaMetadataDto.kt`

Update `AIMetadataDto` to include `altText`, `description`, `tags`, `providers` fields.

---

## Files Summary

### New files (15)
| File | Purpose |
|------|---------|
| `core/ai/AiModuleMetadata.kt` | Spring Modulith module declaration |
| `core/ai/domain/ImageAnalysisProvider.kt` | Provider interface |
| `core/ai/domain/AnalysisCapability.kt` | Capability enum |
| `core/ai/domain/ImageAnalysisRequest.kt` | Request DTO |
| `core/ai/domain/ImageAnalysisResult.kt` | Result DTO + LabelResult |
| `core/ai/domain/ImageAnalysisOrchestrator.kt` | Orchestrator service + event listener |
| `core/ai/domain/CulturalPromptTemplates.kt` | Brava Island cultural prompts |
| `core/ai/provider/CloudVisionProvider.kt` | Google Cloud Vision implementation |
| `core/ai/provider/GeminiCulturalProvider.kt` | Google Gemini implementation |
| `core/ai/api/AdminAiController.kt` | AI health/config admin endpoint |
| `core/shared/events/MediaAnalysisRequestedEvent.kt` | Analysis request event |
| `core/shared/events/MediaAnalysisCompletedEvent.kt` | Analysis completed event |
| `core/shared/events/MediaAnalysisFailedEvent.kt` | Analysis failed event |
| `core/gallery/api/dto/AnalyzeBatchRequest.kt` | Batch request DTO |
| `core/gallery/api/dto/AiStatusResponse.kt` | AI status response DTO |

### Modified files (8)
| File | Change |
|------|--------|
| `build.gradle.kts` | Add `google-cloud-vision` and `google-genai` dependencies |
| `application.yml` | Add `nosilha.ai.*` configuration block |
| `application-local.yml` | Add `nosilha.ai.enabled: false` |
| `UserUploadedMedia.kt` | Map `aiLabels`, `aiAltText`, `aiDescription` columns |
| `GalleryMediaDto.kt` | Add AI fields to `UserUpload` DTO and `from()` mapper |
| `AdminGalleryController.kt` | Add analyze, analyze-batch, ai-status endpoints |
| `GalleryModerationService.kt` | Add `triggerAnalysis()`, `triggerBatchAnalysis()` methods |
| `GalleryService.kt` | Add `@ApplicationModuleListener` for `MediaAnalysisCompletedEvent` |

### No migration needed
All AI columns already exist in `V4__create_gallery_media.sql`. GIN index on `ai_tags` already exists.

---

## Verification

1. **Unit tests**: `./gradlew test` - All existing tests pass + new AI orchestrator tests
2. **Spring Modulith verification**: Module boundary tests validate AI module dependencies
3. **Manual test with AI disabled**: Start app with `AI_ENABLED=false` - all existing gallery functionality unchanged
4. **Manual test with Cloud Vision**: Set `CLOUD_VISION_ENABLED=true` + GCP credentials, trigger single analysis via admin endpoint
5. **Manual test with Gemini**: Set `GEMINI_ENABLED=true` + API key, trigger analysis and verify cultural context in results
6. **Batch test**: Select multiple media items, trigger batch analysis, poll `ai-status` endpoint
7. **Code style**: `./gradlew ktlintCheck` passes
