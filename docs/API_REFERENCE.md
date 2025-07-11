# Nos Ilha API Reference

This document provides comprehensive documentation for the Nos Ilha backend API, including endpoints, request/response formats, authentication, and usage examples.

## 📋 API Overview

**Base URL**: `http://localhost:8080/api/v1` (development) / `https://your-backend-url/api/v1` (production)

**API Version**: v1  
**Response Format**: JSON  
**Authentication**: JWT Bearer tokens (Supabase)  
**Content-Type**: `application/json`

## 🔐 Authentication

### Authentication Flow

The API uses JWT-based authentication with Supabase tokens:

1. User authenticates via frontend with Supabase
2. Frontend receives JWT access token
3. Token is included in API requests via `Authorization` header
4. Backend validates token and extracts user claims

### Authorization Header Format

```http
Authorization: Bearer <supabase_jwt_token>
```

### Authentication Endpoints

While user authentication is handled by Supabase on the frontend, the backend provides validation endpoints:

#### Validate Token
```http
GET /api/v1/auth/validate
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "valid": true,
  "userId": "uuid-string",
  "email": "user@example.com",
  "roles": ["USER"]
}
```

**Response** (401 Unauthorized):
```json
{
  "error": "Invalid or expired token",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🏢 Directory Entries API

### Data Model

The API uses a single-table inheritance pattern for all directory entries:

```typescript
interface DirectoryEntry {
  id: string;                    // UUID
  name: string;                 // Business/landmark name
  slug: string;                 // URL-friendly identifier
  description: string;          // Detailed description
  category: "RESTAURANT" | "HOTEL" | "LANDMARK" | "BEACH";
  town: string;                 // Location town
  latitude: number;             // Geographic coordinate
  longitude: number;            // Geographic coordinate
  imageUrl?: string;            // Primary image URL
  rating?: number;              // Average rating (0-5)
  reviewCount: number;          // Number of reviews
  createdAt: string;            // ISO 8601 timestamp
  updatedAt: string;            // ISO 8601 timestamp
  
  // Type-specific fields (nullable for other types)
  phoneNumber?: string;         // Restaurant/Hotel contact
  openingHours?: string;        // Business hours
  cuisine?: string;             // Restaurant cuisine types
  amenities?: string;           // Hotel amenities
}
```

### Get All Directory Entries

```http
GET /api/v1/directory/entries
```

**Query Parameters**:
- `category` (optional): Filter by category (`RESTAURANT`, `HOTEL`, `LANDMARK`, `BEACH`)
- `town` (optional): Filter by town name
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20)

**Example Request**:
```bash
curl -X GET "http://localhost:8080/api/v1/directory/entries?category=RESTAURANT&town=Vila Nova Sintra" \
  -H "Accept: application/json"
```

**Response** (200 OK):
```json
{
  "content": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Casa do Bacalhau",
      "slug": "casa-do-bacalhau",
      "description": "Traditional Cape Verdean restaurant serving fresh seafood and local specialties.",
      "category": "RESTAURANT",
      "town": "Vila Nova Sintra",
      "latitude": 14.8564,
      "longitude": -24.7144,
      "imageUrl": "https://storage.googleapis.com/bucket/casa-bacalhau.jpg",
      "rating": 4.5,
      "reviewCount": 28,
      "phoneNumber": "+238 283 1234",
      "openingHours": "Mon-Sat 11:00-22:00; Sun 12:00-20:00",
      "cuisine": "Cape Verdean,Seafood",
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-15T14:30:00Z"
    }
  ],
  "pageable": {
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

### Get Directory Entry by ID

```http
GET /api/v1/directory/entries/{id}
```

**Path Parameters**:
- `id`: UUID of the directory entry

**Example Request**:
```bash
curl -X GET "http://localhost:8080/api/v1/directory/entries/123e4567-e89b-12d3-a456-426614174000" \
  -H "Accept: application/json"
```

**Response** (200 OK):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Casa do Bacalhau",
  "slug": "casa-do-bacalhau",
  "description": "Traditional Cape Verdean restaurant serving fresh seafood and local specialties.",
  "category": "RESTAURANT",
  "town": "Vila Nova Sintra",
  "latitude": 14.8564,
  "longitude": -24.7144,
  "imageUrl": "https://storage.googleapis.com/bucket/casa-bacalhau.jpg",
  "rating": 4.5,
  "reviewCount": 28,
  "phoneNumber": "+238 283 1234",
  "openingHours": "Mon-Sat 11:00-22:00; Sun 12:00-20:00",
  "cuisine": "Cape Verdean,Seafood",
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-15T14:30:00Z"
}
```

**Response** (404 Not Found):
```json
{
  "error": "Directory entry not found",
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Get Directory Entry by Slug

```http
GET /api/v1/directory/slug/{slug}
```

**Path Parameters**:
- `slug`: URL-friendly identifier

**Example Request**:
```bash
curl -X GET "http://localhost:8080/api/v1/directory/slug/casa-do-bacalhau" \
  -H "Accept: application/json"
```

**Response**: Same as Get by ID

### Create Directory Entry

```http
POST /api/v1/directory/entries
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "New Restaurant",
  "description": "A wonderful new dining experience on Brava Island.",
  "category": "RESTAURANT",
  "town": "Vila Nova Sintra",
  "latitude": 14.8564,
  "longitude": -24.7144,
  "imageUrl": "https://storage.googleapis.com/bucket/new-restaurant.jpg",
  "phoneNumber": "+238 283 5678",
  "openingHours": "Daily 12:00-23:00",
  "cuisine": "International,Cape Verdean"
}
```

**Response** (201 Created):
```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "name": "New Restaurant",
  "slug": "new-restaurant",
  "description": "A wonderful new dining experience on Brava Island.",
  "category": "RESTAURANT",
  "town": "Vila Nova Sintra",
  "latitude": 14.8564,
  "longitude": -24.7144,
  "imageUrl": "https://storage.googleapis.com/bucket/new-restaurant.jpg",
  "rating": null,
  "reviewCount": 0,
  "phoneNumber": "+238 283 5678",
  "openingHours": "Daily 12:00-23:00",
  "cuisine": "International,Cape Verdean",
  "createdAt": "2024-01-15T15:00:00Z",
  "updatedAt": "2024-01-15T15:00:00Z"
}
```

**Response** (400 Bad Request):
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    },
    {
      "field": "latitude",
      "message": "Latitude must be between -90 and 90"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response** (403 Forbidden):
```json
{
  "error": "Insufficient permissions",
  "message": "Admin role required to create directory entries",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Update Directory Entry

```http
PUT /api/v1/directory/entries/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters**:
- `id`: UUID of the directory entry to update

**Request Body**: Same as Create (all fields required)

**Response** (200 OK): Updated directory entry object

**Response** (404 Not Found): Entry not found

**Response** (403 Forbidden): Insufficient permissions

### Delete Directory Entry

```http
DELETE /api/v1/directory/entries/{id}
Authorization: Bearer <token>
```

**Path Parameters**:
- `id`: UUID of the directory entry to delete

**Response** (204 No Content): Successfully deleted

**Response** (404 Not Found): Entry not found

**Response** (403 Forbidden): Insufficient permissions

## 📱 Media Upload API

### Upload Media File

```http
POST /api/v1/media/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body** (multipart/form-data):
- `file`: The media file to upload
- `category`: Optional category for organization
- `description`: Optional description

**Example Request**:
```bash
curl -X POST "http://localhost:8080/api/v1/media/upload" \
  -H "Authorization: Bearer <token>" \
  -F "file=@restaurant-photo.jpg" \
  -F "category=restaurant" \
  -F "description=Main dining area"
```

**Response** (201 Created):
```json
{
  "id": "789e0123-e89b-12d3-a456-426614174002",
  "fileName": "restaurant-photo.jpg",
  "originalName": "IMG_20240115_123456.jpg",
  "contentType": "image/jpeg",
  "size": 2048576,
  "url": "https://storage.googleapis.com/bucket/media/789e0123-e89b-12d3-a456-426614174002.jpg",
  "category": "restaurant",
  "description": "Main dining area",
  "uploadedAt": "2024-01-15T15:30:00Z",
  "uploadedBy": "user@example.com"
}
```

**Response** (400 Bad Request):
```json
{
  "error": "Invalid file",
  "message": "File type not supported. Allowed types: jpg, jpeg, png, gif, mp4",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Get Media File Metadata

```http
GET /api/v1/media/{id}
```

**Path Parameters**:
- `id`: UUID of the media file

**Response** (200 OK):
```json
{
  "id": "789e0123-e89b-12d3-a456-426614174002",
  "fileName": "restaurant-photo.jpg",
  "originalName": "IMG_20240115_123456.jpg",
  "contentType": "image/jpeg",
  "size": 2048576,
  "url": "https://storage.googleapis.com/bucket/media/789e0123-e89b-12d3-a456-426614174002.jpg",
  "category": "restaurant",
  "description": "Main dining area",
  "uploadedAt": "2024-01-15T15:30:00Z",
  "uploadedBy": "user@example.com",
  "aiMetadata": {
    "labels": ["restaurant", "dining", "interior"],
    "textDetected": ["Casa do Bacalhau", "Menu"],
    "landmarks": [],
    "processedAt": "2024-01-15T15:31:00Z"
  }
}
```

## 🏥 Health & Monitoring

### Health Check

```http
GET /actuator/health
```

**Response** (200 OK):
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 10737418240,
        "free": 8589934592,
        "threshold": 10485760,
        "exists": true
      }
    }
  }
}
```

### Application Info

```http
GET /actuator/info
```

**Response** (200 OK):
```json
{
  "app": {
    "name": "Nos Ilha API",
    "version": "1.0.0",
    "description": "Tourism and cultural heritage platform for Brava Island"
  },
  "build": {
    "time": "2024-01-15T10:00:00.000Z",
    "version": "1.0.0"
  },
  "git": {
    "branch": "main",
    "commit": {
      "id": "abc1234",
      "time": "2024-01-15T09:30:00.000Z"
    }
  }
}
```

### Metrics

```http
GET /actuator/metrics
```

**Response** (200 OK):
```json
{
  "names": [
    "http.server.requests",
    "jvm.memory.used",
    "jvm.memory.max",
    "system.cpu.usage",
    "process.uptime",
    "hikaricp.connections.active",
    "hikaricp.connections.creation",
    "custom.directory.entries.total"
  ]
}
```

### Specific Metric

```http
GET /actuator/metrics/http.server.requests
```

**Response** (200 OK):
```json
{
  "name": "http.server.requests",
  "description": "Duration of HTTP server request handling",
  "baseUnit": "seconds",
  "measurements": [
    {
      "statistic": "COUNT",
      "value": 1247.0
    },
    {
      "statistic": "TOTAL_TIME",
      "value": 123.456789
    },
    {
      "statistic": "MAX",
      "value": 2.345678
    }
  ],
  "availableTags": [
    {
      "tag": "exception",
      "values": ["None", "DataAccessException"]
    },
    {
      "tag": "method",
      "values": ["GET", "POST", "PUT", "DELETE"]
    },
    {
      "tag": "status",
      "values": ["200", "404", "500"]
    }
  ]
}
```

## 🚨 Error Handling

### Standard Error Response Format

All API errors follow a consistent format:

```json
{
  "error": "Brief error description",
  "message": "Detailed error message",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/directory/entries",
  "status": 400
}
```

### HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200  | OK | Successful GET, PUT requests |
| 201  | Created | Successful POST requests |
| 204  | No Content | Successful DELETE requests |
| 400  | Bad Request | Invalid request data |
| 401  | Unauthorized | Missing or invalid authentication |
| 403  | Forbidden | Insufficient permissions |
| 404  | Not Found | Resource not found |
| 409  | Conflict | Resource conflict (e.g., duplicate slug) |
| 422  | Unprocessable Entity | Valid JSON but invalid business logic |
| 500  | Internal Server Error | Server-side error |

### Validation Errors

When request validation fails, the API returns detailed error information:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "rejectedValue": "",
      "message": "Name cannot be empty"
    },
    {
      "field": "latitude",
      "rejectedValue": 95.0,
      "message": "Latitude must be between -90 and 90"
    },
    {
      "field": "email",
      "rejectedValue": "invalid-email",
      "message": "Email must be a valid email address"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/directory/entries",
  "status": 400
}
```

## 🔍 API Usage Examples

### Frontend Integration (TypeScript)

```typescript
// lib/api.ts
import { supabase } from './supabase-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    await supabase.auth.signOut();
    window.location.href = '/login';
    throw new Error('Authentication expired');
  }
  
  return response;
}

// Get directory entries with caching
export async function getEntriesByCategory(category: string) {
  const endpoint = category === 'all'
    ? `${API_BASE_URL}/api/v1/directory/entries`
    : `${API_BASE_URL}/api/v1/directory/entries?category=${category}`;
    
  const response = await fetch(endpoint, { 
    next: { revalidate: 3600 } // 1-hour ISR cache
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch entries: ${response.status}`);
  }
  
  return response.json();
}

// Create new directory entry
export async function createDirectoryEntry(entryData: CreateEntryDto) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/directory/entries`,
    {
      method: 'POST',
      body: JSON.stringify(entryData),
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create entry');
  }
  
  return response.json();
}
```

### cURL Examples

#### Get Restaurants in Vila Nova Sintra
```bash
curl -X GET "http://localhost:8080/api/v1/directory/entries?category=RESTAURANT&town=Vila%20Nova%20Sintra" \
  -H "Accept: application/json"
```

#### Create a New Hotel (Authenticated)
```bash
curl -X POST "http://localhost:8080/api/v1/directory/entries" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hotel Brava Vista",
    "description": "Oceanfront hotel with stunning views of the Atlantic.",
    "category": "HOTEL",
    "town": "Vila Nova Sintra",
    "latitude": 14.8584,
    "longitude": -24.7164,
    "amenities": "Wi-Fi,Pool,Restaurant,Ocean View"
  }'
```

#### Upload Restaurant Photo
```bash
curl -X POST "http://localhost:8080/api/v1/media/upload" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@restaurant-interior.jpg" \
  -F "category=restaurant" \
  -F "description=Interior dining area"
```

## 📝 Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Authenticated users**: 1000 requests per hour
- **Unauthenticated users**: 100 requests per hour
- **Media uploads**: 50 uploads per hour per user

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
```

## 🔒 Security Considerations

### Input Validation
- All input is validated against defined schemas
- SQL injection protection via JPA parameterized queries
- XSS protection through output encoding
- File upload validation (type, size, content)

### Authentication Security
- JWT tokens have configurable expiration
- Token validation includes issuer and audience checks
- Refresh tokens handled by Supabase
- Session invalidation on security events

### CORS Configuration
Development environment allows `localhost:3000`:
```yaml
app:
  cors:
    allowed-origins: "http://localhost:3000"
```

Production uses specific domain configuration.

---

For additional support and examples, refer to:
- **Architecture Guide**: [`ARCHITECTURE.md`](ARCHITECTURE.md)
- **Frontend Integration**: [`FRONTEND_GUIDE.md`](FRONTEND_GUIDE.md)
- **Development Setup**: [`../CLAUDE.md`](../CLAUDE.md)
- **Deployment Guide**: [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md)