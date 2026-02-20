# ADR-001: Unified AI Provider Interface and DB-Backed Global Toggle

**Date:** 2026-02-19
**Status:** Accepted
**Context:** 001-ai-admin-dashboard feature enhancement

## Context

The AI module has two provider categories — image analysis (Cloud Vision, Gemini Cultural) and text operations (Gemini Text) — with no shared contract. The admin health endpoint only reported `ImageAnalysisProvider` instances, leaving `TextAiProvider` invisible in the dashboard.

Additionally, the global AI toggle (`nosilha.ai.enabled`) was an environment-only property requiring redeployment to change. Domain-level toggles (gallery, stories, directory) were already DB-backed and runtime-toggleable via `ai_feature_config`, creating an inconsistency.

## Decision

### 1. Base `AiProvider` interface

Introduced `AiProvider` in `ai/domain/` as the base interface for all AI providers:

```kotlin
interface AiProvider {
    val name: String
    val monthlyLimit: Int
    fun isEnabled(): Boolean
    fun capabilities(): Set<String>
}
```

`ImageAnalysisProvider` extends `AiProvider` with a default `capabilities()` implementation that maps its typed `supports(): Set<AnalysisCapability>` enum to strings. `TextAiProvider` implements `AiProvider` directly with string-based capabilities (`POLISH`, `TRANSLATE`, `PROMPTS`, `DIRECTORY_CONTENT`).

**Why string-based capabilities?** Image and text capabilities are fundamentally different domains. A unified enum would force semantically incorrect mixing (e.g., `AnalysisCapability.POLISH` alongside `AnalysisCapability.LABELS`). String-based capabilities at the base level allow each provider category to define its own typed capability system while sharing a common health-reporting contract.

### 2. DB-backed global toggle

Added a `global` row to the existing `ai_feature_config` table (V24 migration), seeded as `enabled=true` to match production behavior. The `AiFeatureConfigService` gains:

- `isGloballyEnabled()` — reads DB row, falls back to `nosilha.ai.enabled` property
- `isOperational(domain)` — enforces `isGloballyEnabled() && isEnabled(domain)`
- `getDomainConfigs()` — excludes global row from domain toggle display

### 3. Guard chain ordering

All AI guard checks now use `isOperational(domain)` which enforces: **global enabled → domain enabled → provider availability**. When global is off, all AI operations are disabled regardless of individual domain settings.

## Consequences

### Positive

- All providers visible in health dashboard (no invisible providers)
- Runtime global kill-switch without environment restart
- Consistent guard chain across all AI operations
- Minimal breaking changes — `ImageAnalysisProvider` callers (orchestrator) unchanged

### Negative

- `TextAiProvider.isAvailable()` renamed to `isEnabled()` (one caller update)
- One additional DB query per guard check (global config lookup)
- `@MockitoBean` tests need `monthlyLimit` and `capabilities()` stubs

### Neutral

- `AdminAiController` simplified (removed hardcoded monthly limit map)
- Global toggle reuses existing `PUT /config/{domain}` endpoint with `domain=global`

## Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| Separate health-only interface (`AiHealthReporter`) | Duplicates `name`/`isEnabled()` across interfaces |
| Add text capabilities to `AnalysisCapability` enum | Semantically incorrect mixing of image/text domains |
| Separate `ai_global_config` table | Over-engineered for a single boolean; `ai_feature_config` reuse is simpler |
| Event-driven property sync for global toggle | Over-engineering for a single-row DB lookup |
| Keep global as env-only (no runtime toggle) | Inconsistent with domain toggles; admins need quick kill-switch |
