# Nos Ilha API Reference

REST API documentation for the Nos Ilha backend (Spring Boot 4.0 + Kotlin).

**Base URL**: `http://localhost:8080/api/v1` (development)
**Content-Type**: `application/json`
**Authentication**: JWT Bearer tokens (Supabase)

---

## Response Format

All responses use wrappers from `apps/api/src/main/kotlin/com/nosilha/core/shared/api/ApiResult.kt`:

| Type | Fields | Use Case |
|------|--------|----------|
| `ApiResult<T>` | `data`, `timestamp`, `status` | Single resource |
| `PagedApiResult<T>` | `data[]`, `pageable`, `timestamp`, `status` | Paginated lists |
| `ErrorResponse` | `error`, `message`, `path`, `status` | General errors |
| `ValidationErrorResponse` | `error`, `details[]`, `path`, `status` | Validation errors |

---

## Authentication

Include JWT in requests:
```http
Authorization: Bearer <supabase_jwt_token>
```

| Response | Meaning |
|----------|---------|
| 401 | Missing or invalid token |
| 403 | Valid token, insufficient permissions |

---

## Places Module

**Reference**: `apps/api/src/main/kotlin/com/nosilha/core/places/api/`

### Directory Entries

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/directory/entries` | No | List with search, filter, pagination |
| GET | `/directory/entries/{id}` | No | Get by UUID |
| GET | `/directory/slug/{slug}` | No | Get by slug |
| GET | `/directory/entries/{id}/bookmark-status` | Optional | Check bookmark status |
| GET | `/directory/entries/{id}/related` | No | Get 3-5 related entries |
| POST | `/directory/entries` | Yes | Create entry |
| PUT | `/directory/entries/{id}` | Yes | Update entry |
| DELETE | `/directory/entries/{id}` | Yes | Delete entry |

**Query Parameters** (GET /entries):

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| q | string | - | Full-text search (min 2 chars) |
| category | string | - | Restaurant, Hotel, Beach, Heritage, Nature |
| town | string | - | Filter by town |
| sort | string | created_at_desc | name_asc, name_desc, rating_desc, relevance |
| page | int | 0 | Page number |
| size | int | 20 | Page size |

### Towns

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/towns` | No | List with pagination |
| GET | `/towns/all` | No | All towns (for dropdowns) |
| GET | `/towns/{id}` | No | Get by UUID |
| GET | `/towns/slug/{slug}` | No | Get by slug |
| POST | `/towns` | Yes | Create town |
| PUT | `/towns/{id}` | Yes | Update town |
| DELETE | `/towns/{id}` | Yes | Delete town |

---

## Gallery Module

**Reference**: `apps/api/src/main/kotlin/com/nosilha/core/gallery/api/`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/gallery` | No | List active media |
| GET | `/gallery/{id}` | Optional | Get by ID |
| GET | `/gallery/entry/{entryId}` | No | Media for directory entry |
| GET | `/gallery/categories` | No | Distinct categories |
| POST | `/gallery/upload/presign` | Yes | Get presigned URL |
| POST | `/gallery/upload/confirm` | Yes | Confirm upload |
| POST | `/gallery/submit` | Yes | Submit external media |

### Upload Flow (Two-Step)

**Step 1: Get presigned URL**
```bash
curl -X POST "/api/v1/gallery/upload/presign" \
  -H "Authorization: Bearer <token>" \
  -d '{"fileName": "photo.jpg", "contentType": "image/jpeg", "fileSize": 2048576}'
```
Response: `{ "uploadUrl": "https://r2.../presigned", "key": "uploads/...", "expiresAt": "..." }`

**Step 2: Upload to R2, then confirm**
```bash
curl -X POST "/api/v1/gallery/upload/confirm" \
  -H "Authorization: Bearer <token>" \
  -d '{"key": "uploads/...", "originalName": "photo.jpg", "entryId": "uuid", "category": "Nature"}'
```

---

## Engagement Module

**Reference**: `apps/api/src/main/kotlin/com/nosilha/core/engagement/api/`

### Reactions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reactions/content/{contentId}` | Optional | Get counts (includes user's reaction if authed) |
| POST | `/reactions` | Yes | Submit/toggle reaction |
| DELETE | `/reactions/content/{contentId}` | Yes | Remove reaction |

**Types**: `LOVE`, `CELEBRATE`, `INSIGHTFUL`, `SUPPORT`

**Toggle Behavior**:
- Same reaction type → removes it
- Different reaction type → replaces it

```bash
curl -X POST "/api/v1/reactions" \
  -H "Authorization: Bearer <token>" \
  -d '{"contentId": "uuid", "reactionType": "LOVE"}'
```

### Bookmarks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/bookmarks` | Yes | Create bookmark |
| DELETE | `/bookmarks/{entryId}` | Yes | Remove bookmark |

**Limit**: 100 bookmarks per user

### Content Registration

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/content/register` | No | Register content for reactions |

---

## Stories Module

**Reference**: `apps/api/src/main/kotlin/com/nosilha/core/stories/api/`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/stories` | No | List published stories |
| GET | `/stories/slug/{slug}` | No | Get by slug |
| POST | `/stories` | Yes | Submit story |

**Story Types**: `QUICK`, `FULL`, `GUIDED`

---

## Feedback Module

**Reference**: `apps/api/src/main/kotlin/com/nosilha/core/feedback/api/`

### Contact

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/contact` | No | Submit contact message |

**Subjects**: `GENERAL_INQUIRY`, `CONTENT_SUGGESTION`, `TECHNICAL_ISSUE`, `PARTNERSHIP`

### Directory Submissions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/directory-submissions` | Yes | Submit entry for review |

---

## Auth Module

**Reference**: `apps/api/src/main/kotlin/com/nosilha/core/auth/api/`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | Yes | Get profile (auto-creates if missing) |
| PUT | `/users/me` | Yes | Update profile |
| GET | `/users/me/contributions` | Yes | Contribution stats |
| GET | `/users/me/bookmarks` | Yes | User's bookmarks with entries |

---

## Health & Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/actuator/health` | Health check |
| GET | `/actuator/info` | Application info |
| GET | `/actuator/metrics` | Available metrics |
| GET | `/actuator/metrics/{name}` | Specific metric |

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK (GET, PUT) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Validation error |
| 401 | Missing/invalid token |
| 403 | Insufficient permissions |
| 404 | Not found |
| 429 | Rate limit exceeded |
| 500 | Server error |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Profile updates | 10/min per user |
| Reactions | 10/min per user |
| Gallery uploads | 20/hr, 100/day per user |
| Story submissions | 5/hr per IP |
| Contact form | 3/hr per IP |
| Directory submissions | 3/hr per IP |

---

## Related Documentation

- [API Coding Standards](api-coding-standards.md) - Backend patterns
- [Spring Modulith Guide](spring-modulith.md) - Module architecture
- [Architecture Guide](architecture.md) - System overview
