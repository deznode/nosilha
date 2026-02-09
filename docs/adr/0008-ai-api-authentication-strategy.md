# ADR 0008: AI API Authentication Strategy

- **Status**: Accepted
- **Date**: 2026-02-08
- **Decision-makers**: @jcosta

## Context and Problem Statement

The AI image analysis module (spec 009) integrates two Google APIs: **Cloud Vision API** for label/landmark detection and **Gemini API** for cultural context generation. Each API supports different authentication mechanisms. How should the backend authenticate with these APIs when running on Cloud Run?

## Decision Drivers

- Free tier cost optimization (ADR-0006) — minimize infrastructure complexity
- Security — prefer IAM-based authentication over long-lived credentials where possible
- SDK constraints — the `google-genai` Java SDK's `Client.builder().apiKey()` uses the Developer API endpoint (`generativelanguage.googleapis.com`), which only supports API key authentication
- Operational simplicity — this is a volunteer-maintained project
- Cloud Run ADC (Application Default Credentials) — available automatically via the attached service account

## Considered Options

1. Developer API + API key for Gemini, ADC for Cloud Vision
2. Vertex AI + ADC for both Gemini and Cloud Vision
3. API keys for both Gemini and Cloud Vision

## Decision Outcome

**Chosen option**: "Developer API + API key for Gemini, ADC for Cloud Vision", because it matches the current SDK usage, keeps infrastructure minimal, and leverages ADC where the SDK supports it.

### Consequences

**Positive**:
- No Vertex AI API enablement required — avoids `aiplatform.googleapis.com` and `roles/aiplatform.user`
- Cloud Vision uses ADC natively — `ImageAnnotatorClient.create()` authenticates automatically, just needs `roles/cloudvision.user` on the service account
- API key via Secret Manager is a proven pattern in this project (same approach as `resend_api_key` for the frontend)
- Simpler Terraform — two API enablements + two IAM bindings vs. Vertex AI regional endpoint configuration
- Matches the `google-genai` SDK's `Client.builder().apiKey()` pattern already implemented

**Negative**:
- Gemini API key rotation is manual (via Google AI Studio + Secret Manager version update)
- No IAM audit trail for Gemini API calls (API key auth is not tied to a service account identity)
- Two different auth mechanisms to understand and maintain

## Pros and Cons of the Options

### Option 1: Developer API + API key for Gemini, ADC for Vision

Uses `generativelanguage.googleapis.com` with an API key (stored in Secret Manager) for Gemini, and Application Default Credentials with `roles/cloudvision.user` for Cloud Vision.

- Good, because matches the current `google-genai` SDK implementation (`Client.builder().apiKey()`)
- Good, because Cloud Vision ADC is zero-configuration on Cloud Run
- Good, because no Vertex AI dependency — simpler API enablement
- Good, because API key in Secret Manager is a proven pattern in this project
- Bad, because API key rotation requires manual steps (regenerate key + update secret version)
- Bad, because no IAM audit trail for Gemini calls

### Option 2: Vertex AI + ADC for both

Uses `aiplatform.googleapis.com` with ADC for Gemini (via Vertex AI path), and ADC for Cloud Vision. Both authenticate via the service account's IAM roles.

- Good, because unified IAM authentication for both APIs
- Good, because full audit trail via Cloud Audit Logs for all API calls
- Good, because no secrets to manage — only IAM roles
- Bad, because requires enabling `aiplatform.googleapis.com` API
- Bad, because requires `roles/aiplatform.user` IAM role and regional endpoint configuration
- Bad, because requires SDK code changes — `Client.builder()` must use the Vertex AI path instead of `apiKey()`
- Bad, because Vertex AI adds complexity disproportionate to a volunteer project's needs

### Option 3: API keys for both

Uses API keys stored in Secret Manager for both Gemini and Cloud Vision.

- Good, because consistent authentication pattern across both APIs
- Good, because no IAM role grants needed beyond Secret Manager access
- Bad, because Cloud Vision SDK uses ADC by default — API key auth requires extra configuration
- Bad, because two secrets to manage instead of one
- Bad, because ignores ADC, which is the recommended approach for Google Cloud-native services

## More Information

### Authentication mechanism summary

| API | Endpoint | Auth Method | IAM Role | Secret |
|-----|----------|-------------|----------|--------|
| Cloud Vision | `vision.googleapis.com` | ADC (automatic) | `roles/cloudvision.user` | None |
| Gemini | `generativelanguage.googleapis.com` | API key | None (key-based) | `gemini_api_key` |

### Future migration path

If IAM audit compliance or organization policy requires it, Gemini can be migrated to the Vertex AI path:
1. Enable `aiplatform.googleapis.com`
2. Grant `roles/aiplatform.user` to the backend service account
3. Change `Client.builder().apiKey(key)` to use Vertex AI initialization
4. Remove the `gemini_api_key` secret

### Related artifacts

- Spec: `plan/arkhe/specs/009-ai-image-analysis/`
- SDK usage: `core/ai/domain/provider/GeminiCulturalProvider.kt` (API key), `core/ai/domain/provider/CloudVisionProvider.kt` (ADC)
- Infrastructure: ADR-0006 Free Tier Cost Optimization
- Module architecture: [ADR-0007 AI Module Endpoint Ownership](0007-ai-module-endpoint-ownership.md)
