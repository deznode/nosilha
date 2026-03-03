# ADR 0007: AI Module Endpoint Ownership

- **Status**: Accepted
- **Date**: 2026-02-07
- **Decision-makers**: @jcosta

## Context and Problem Statement

During implementation of spec 009-ai-image-analysis, the original specification placed all AI-related admin endpoints under the gallery module's namespace (`/api/v1/admin/gallery/ai-status`, `/api/v1/admin/gallery/ai-batches`). During implementation, it became clear that these endpoints query entities owned by the AI module (`AnalysisRun`, `AnalysisBatch`), not the gallery module. This raised the question: which module should own endpoints that bridge two modules?

## Decision Drivers

- Spring Modulith module boundary enforcement (`@ApplicationModule` with `allowedDependencies`)
- Entity ownership principle: the module that owns the data should own the endpoints that query it
- Consistency with existing project conventions (each module has its own `/api/v1/admin/{module}` namespace)
- Separation of "triggering an action" vs "querying action results"
- Neither the AI module nor the gallery module declares a dependency on the other

## Considered Options

1. All endpoints in gallery module
2. Split: triggers in gallery, status/moderation in AI
3. All endpoints in AI module

## Decision Outcome

**Chosen option**: "Split: triggers in gallery, status/moderation in AI", because it respects entity ownership while keeping the trigger close to the user action context.

**The split:**
- **Gallery module** (`/api/v1/admin/gallery`): `POST /{mediaId}/analyze`, `POST /analyze-batch` — these operate on gallery media selection and validation
- **AI module** (`/api/v1/admin/ai`): `GET /status`, `GET /batches`, `GET /batches/{batchId}`, `GET /review-queue`, `POST /review/.../approve|reject`, `GET /health` — these query or modify AI-owned entities

### Consequences

**Positive**:
- Respects Spring Modulith module boundaries — no cross-module repository access needed
- Each module's controller only queries its own entities
- All AI-related status/moderation endpoints are cohesive in one controller
- Gallery module remains focused on media management; AI module owns the AI lifecycle
- Establishes a clear pattern for future cross-module features

**Negative**:
- Admin frontend will need to call two different base paths for the full AI workflow
- Original spec required updating to reflect the split (spec drift during implementation)

## Pros and Cons of the Options

### Option 1: All endpoints in gallery module

Place all AI endpoints (`analyze`, `status`, `batches`, `review`, `health`) in `AdminGalleryController`.

- Good, because single base path for the admin to interact with
- Good, because matches the original spec as written
- Bad, because gallery module would need to query `AnalysisRun` and `AnalysisBatch` entities owned by the AI module
- Bad, because violates `allowedDependencies` — gallery module does not declare a dependency on the AI module
- Bad, because creates tight coupling between gallery and AI data structures

### Option 2: Split — triggers in gallery, status/moderation in AI

Gallery owns trigger endpoints, AI owns status/moderation/health endpoints.

- Good, because respects entity ownership principle
- Good, because maintains module boundary enforcement
- Good, because each controller only accesses its own module's repositories
- Good, because cohesive: all AI lifecycle endpoints in one place
- Bad, because two base paths for the admin workflow

### Option 3: All endpoints in AI module

Move everything (including `analyze` triggers) to `AdminAiController`.

- Good, because all AI-related endpoints in one place
- Bad, because the trigger endpoints need to validate gallery media (type, status, publicUrl), which requires access to gallery entities
- Bad, because AI module would need to declare a dependency on the gallery module
- Bad, because breaks the event-driven decoupling pattern

## More Information

This decision establishes a pattern for cross-module features: **the module that triggers an action exposes the trigger endpoint, while the module that owns the resulting entities exposes the query/status endpoints.** Communication between modules happens exclusively via Spring Application Events.

Related artifacts:
- Spec: `plan/arkhe/specs/009-ai-image-analysis/`
- API Contract: `plan/arkhe/specs/009-ai-image-analysis/api-contract.md` (v1.1.0)
- Module metadata: `core/ai/AiModuleMetadata.kt`, `core/gallery/GalleryModuleMetadata.kt`
- Architecture: [ADR-0002 Spring Modulith](0002-spring-modulith.md)
