# Gallery Media Integration Plan

**Date**: 2025-12-27
**Status**: Research Complete - Ready for Implementation
**Related**: [implementation-gaps.md](./implementation-gaps.md) (Gap 1.1 Media Gallery)

---

## Problem Statement

The current gallery page (`/gallery`) uses hardcoded mock data for photos and videos. The existing backend `Media` entity is designed for user-uploaded files to R2 storage, not for curated external content like YouTube embeds.

**Current State:**
- Frontend: `apps/web/src/app/(main)/gallery/page.tsx` imports `mockMediaApi`
- Mock data: `apps/web/src/lib/mocks/media.ts` (6 photos, 4 videos with YouTube embeds)
- Backend: `MediaController` handles R2 uploads, not external references

**Requirement:**
- Gallery primarily displays YouTube videos (embedded)
- May include videos from other sources (Vimeo, self-hosted)
- Photos can be external URLs or self-hosted
- Podcasts/audio content needed in future

---

## Research Summary

### Industry Patterns Analyzed

| Source | Pattern | Key Insight |
|--------|---------|-------------|
| Shopify Hydrogen | `ExternalVideo` component | Separates external video from uploaded media |
| React Chrono | `media.source.url` with type | Supports YouTube embeds and local files |
| CKEditor | Embed URL transformation | YouTube URL → embed iframe |
| PhotoPrism | Polymorphic media entity | Single table with type discrimination |
| GeeksforGeeks DAM | Category-based media tables | Separate concerns by media type |

### Common External Video Structure

```typescript
{
  type: "VIDEO",
  platform: "youtube",
  externalId: "dQw4w9WgXcQ",           // Video ID only
  embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  title: "Video Title",
  description: "..."
}
```

### YouTube Thumbnail Auto-Generation

YouTube provides automatic thumbnails from video ID:
- `https://img.youtube.com/vi/{VIDEO_ID}/default.jpg` (120x90)
- `https://img.youtube.com/vi/{VIDEO_ID}/mqdefault.jpg` (320x180)
- `https://img.youtube.com/vi/{VIDEO_ID}/hqdefault.jpg` (480x360)
- `https://img.youtube.com/vi/{VIDEO_ID}/maxresdefault.jpg` (1280x720)

---

## Recommended Approach: Separate GalleryMedia Entity

### Why Not Extend Existing Media Entity?

| Aspect | Existing `Media` | New `GalleryMedia` |
|--------|------------------|-------------------|
| **Purpose** | User-uploaded files | Curated external content |
| **Storage** | R2 (storageKey, fileSize, contentType) | URL references only |
| **Workflow** | Upload → Moderation → Approve | Admin creates directly |
| **Scope** | Attached to directory entries | Standalone gallery items |
| **Content** | User-generated | Editorially curated |

**Decision**: Create separate `GalleryMedia` entity to maintain clean separation of concerns.

---

## Backend Implementation

### Entity Design

**File**: `apps/api/src/main/kotlin/com/nosilha/core/gallery/domain/GalleryMedia.kt`

```kotlin
package com.nosilha.core.gallery.domain

import com.nosilha.core.shared.domain.BaseEntity
import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "gallery_media")
class GalleryMedia : BaseEntity() {

    // Type of media: IMAGE, VIDEO, AUDIO
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var mediaType: GalleryMediaType = GalleryMediaType.IMAGE

    // Source platform: YOUTUBE, VIMEO, SOUNDCLOUD, SELF_HOSTED
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    var platform: MediaPlatform = MediaPlatform.SELF_HOSTED

    // For YouTube/Vimeo: the video ID (e.g., "dQw4w9WgXcQ")
    // For SoundCloud: track ID
    @Column(length = 100)
    var externalId: String? = null

    // Direct URL for self-hosted content
    // Or full embed URL if platform doesn't support ID-based embedding
    @Column(length = 1024)
    var url: String? = null

    // Thumbnail/poster image URL
    // For YouTube: auto-generated from externalId if null
    @Column(length = 1024)
    var thumbnailUrl: String? = null

    // Content metadata
    @Column(nullable = false, length = 255)
    var title: String = ""

    @Column(length = 2048)
    var description: String? = null

    @Column(length = 100)
    var author: String? = null

    // Display date (flexible format: "Oct 2025", "1965", "2024")
    @Column(length = 50)
    var publishedDate: String? = null

    // Category for filtering: Landmark, Historical, Nature, Culture, Event, Interview
    @Column(length = 50)
    var category: String? = null

    // Display order within gallery (lower = first)
    @Column(nullable = false)
    var displayOrder: Int = 0

    // Content status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var status: GalleryMediaStatus = GalleryMediaStatus.ACTIVE

    // Optional: link to a directory entry
    @Column(name = "entry_id")
    var entryId: UUID? = null

    // Helper: Generate embed URL for known platforms
    fun getEmbedUrl(): String? = when (platform) {
        MediaPlatform.YOUTUBE -> externalId?.let { "https://www.youtube.com/embed/$it" }
        MediaPlatform.VIMEO -> externalId?.let { "https://player.vimeo.com/video/$it" }
        MediaPlatform.SOUNDCLOUD -> url // SoundCloud requires full embed URL
        MediaPlatform.SELF_HOSTED -> url
    }

    // Helper: Generate thumbnail URL for YouTube if not provided
    fun getThumbnailUrl(): String? = thumbnailUrl ?: when (platform) {
        MediaPlatform.YOUTUBE -> externalId?.let { "https://img.youtube.com/vi/$it/hqdefault.jpg" }
        else -> null
    }
}

enum class GalleryMediaType {
    IMAGE,
    VIDEO,
    AUDIO
}

enum class MediaPlatform {
    YOUTUBE,
    VIMEO,
    SOUNDCLOUD,
    SELF_HOSTED
}

enum class GalleryMediaStatus {
    DRAFT,
    ACTIVE,
    ARCHIVED
}
```

### Database Migration

**File**: `apps/api/src/main/resources/db/migration/V{next}__create_gallery_media_table.sql`

```sql
CREATE TABLE gallery_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_type VARCHAR(20) NOT NULL,
    platform VARCHAR(30) NOT NULL,
    external_id VARCHAR(100),
    url VARCHAR(1024),
    thumbnail_url VARCHAR(1024),
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2048),
    author VARCHAR(100),
    published_date VARCHAR(50),
    category VARCHAR(50),
    display_order INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    entry_id UUID REFERENCES directory_entries(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_gallery_media_type ON gallery_media(media_type);
CREATE INDEX idx_gallery_media_category ON gallery_media(category);
CREATE INDEX idx_gallery_media_status ON gallery_media(status);
CREATE INDEX idx_gallery_media_platform ON gallery_media(platform);
CREATE INDEX idx_gallery_media_display_order ON gallery_media(display_order);

-- Seed with existing mock data
INSERT INTO gallery_media (media_type, platform, url, thumbnail_url, title, description, category, published_date, author, display_order) VALUES
('IMAGE', 'SELF_HOSTED', 'https://picsum.photos/id/1018/800/600', NULL, 'Nova Sintra Town Square (1960s)', 'A rare color photo of the central plaza before the renovation.', 'Historical', '1965', 'Archive', 1),
('IMAGE', 'SELF_HOSTED', 'https://picsum.photos/id/1036/800/600', NULL, 'Furna Harbor at Sunset', 'The ferry arriving from Fogo.', 'Landmark', '2024', 'João Pereira', 2),
('IMAGE', 'SELF_HOSTED', 'https://picsum.photos/id/1015/800/600', NULL, 'Fajã d''Água Cliffs', 'The dramatic coastline on the western side.', 'Nature', '2023', 'Maria Silva', 3),
('IMAGE', 'SELF_HOSTED', 'https://picsum.photos/id/292/800/600', NULL, 'Procession of São João', 'Community members carrying the flag.', 'Event', '2022', 'Community Upload', 4),
('IMAGE', 'SELF_HOSTED', 'https://picsum.photos/id/305/800/600', NULL, 'Misty Mountains', 'The eternal fog of Brava covering the peaks.', 'Nature', '2023', 'Pedro Nunes', 5),
('IMAGE', 'SELF_HOSTED', 'https://picsum.photos/id/110/800/600', NULL, 'Traditional House in Nossa Senhora do Monte', 'Colonial architecture preserved in the highlands.', 'Landmark', '2024', 'Ana Gomes', 6);

-- Note: Replace YouTube video IDs with real content before production
INSERT INTO gallery_media (media_type, platform, external_id, thumbnail_url, title, description, category, published_date, display_order) VALUES
('VIDEO', 'YOUTUBE', 'dQw4w9WgXcQ', 'https://picsum.photos/id/158/800/450', 'Nos Ilha Podcast Ep. 1: The Departure', 'Sr. Antonio recounts his journey leaving Brava in 1978 and his first winter in Boston.', 'Interview', 'Oct 2025', 1),
('VIDEO', 'YOUTUBE', 'dQw4w9WgXcQ', 'https://picsum.photos/id/178/800/450', 'Aerial View: Nova Sintra Gardens', 'Drone footage of the flower capital of Cape Verde in full bloom.', 'Nature', 'Sep 2025', 2),
('VIDEO', 'YOUTUBE', 'dQw4w9WgXcQ', 'https://picsum.photos/id/234/800/450', 'Life in the 1950s: A Grandmother''s Tale', 'An interview about daily life, water scarcity, and community spirit before modern amenities.', 'Historical', 'Aug 2025', 3),
('VIDEO', 'YOUTUBE', 'dQw4w9WgXcQ', 'https://picsum.photos/id/1023/800/450', 'Fajã d''Água Coastline Walk', 'A relaxing visual journey along the rugged coast to the natural pools.', 'Nature', 'July 2025', 4);
```

### Repository

**File**: `apps/api/src/main/kotlin/com/nosilha/core/gallery/repository/GalleryMediaRepository.kt`

```kotlin
package com.nosilha.core.gallery.repository

import com.nosilha.core.gallery.domain.GalleryMedia
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.gallery.domain.GalleryMediaType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.UUID

interface GalleryMediaRepository : JpaRepository<GalleryMedia, UUID> {

    fun findByStatusOrderByDisplayOrderAsc(
        status: GalleryMediaStatus,
        pageable: Pageable
    ): Page<GalleryMedia>

    fun findByMediaTypeAndStatusOrderByDisplayOrderAsc(
        mediaType: GalleryMediaType,
        status: GalleryMediaStatus,
        pageable: Pageable
    ): Page<GalleryMedia>

    fun findByCategoryAndStatusOrderByDisplayOrderAsc(
        category: String,
        status: GalleryMediaStatus,
        pageable: Pageable
    ): Page<GalleryMedia>

    fun findByMediaTypeAndCategoryAndStatusOrderByDisplayOrderAsc(
        mediaType: GalleryMediaType,
        category: String,
        status: GalleryMediaStatus,
        pageable: Pageable
    ): Page<GalleryMedia>

    @Query("""
        SELECT DISTINCT g.category FROM GalleryMedia g
        WHERE g.status = :status AND g.category IS NOT NULL
        ORDER BY g.category
    """)
    fun findDistinctCategories(status: GalleryMediaStatus): List<String>
}
```

### Controller

**File**: `apps/api/src/main/kotlin/com/nosilha/core/gallery/api/GalleryController.kt`

```kotlin
package com.nosilha.core.gallery.api

import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.gallery.domain.GalleryMediaType
import com.nosilha.core.gallery.service.GalleryService
import com.nosilha.core.shared.api.ApiResult
import org.springframework.data.domain.PageRequest
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/gallery")
class GalleryController(
    private val galleryService: GalleryService
) {

    @GetMapping
    fun getGalleryMedia(
        @RequestParam(required = false) type: GalleryMediaType?,
        @RequestParam(required = false) category: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ApiResult<GalleryPageResponse> {
        val pageable = PageRequest.of(page, size.coerceAtMost(100))
        val result = galleryService.getGalleryMedia(type, category, pageable)
        return ApiResult.success(result)
    }

    @GetMapping("/categories")
    fun getCategories(): ApiResult<List<String>> {
        val categories = galleryService.getCategories()
        return ApiResult.success(categories)
    }

    @GetMapping("/{id}")
    fun getById(@PathVariable id: UUID): ApiResult<GalleryMediaResponse> {
        val media = galleryService.getById(id)
        return ApiResult.success(media)
    }
}
```

### API Response DTOs

**File**: `apps/api/src/main/kotlin/com/nosilha/core/gallery/api/dto/GalleryMediaResponse.kt`

```kotlin
package com.nosilha.core.gallery.api.dto

import com.nosilha.core.gallery.domain.GalleryMedia
import com.nosilha.core.gallery.domain.GalleryMediaType
import com.nosilha.core.gallery.domain.MediaPlatform
import java.util.UUID

data class GalleryMediaResponse(
    val id: UUID,
    val mediaType: GalleryMediaType,
    val platform: MediaPlatform,
    val externalId: String?,
    val url: String?,
    val embedUrl: String?,
    val thumbnailUrl: String?,
    val title: String,
    val description: String?,
    val author: String?,
    val publishedDate: String?,
    val category: String?,
    val displayOrder: Int
) {
    companion object {
        fun from(entity: GalleryMedia) = GalleryMediaResponse(
            id = entity.id!!,
            mediaType = entity.mediaType,
            platform = entity.platform,
            externalId = entity.externalId,
            url = entity.url,
            embedUrl = entity.getEmbedUrl(),
            thumbnailUrl = entity.getThumbnailUrl(),
            title = entity.title,
            description = entity.description,
            author = entity.author,
            publishedDate = entity.publishedDate,
            category = entity.category,
            displayOrder = entity.displayOrder
        )
    }
}

data class GalleryPageResponse(
    val items: List<GalleryMediaResponse>,
    val totalItems: Long,
    val totalPages: Int,
    val currentPage: Int
)
```

---

## Frontend Implementation

### API Client Update

**File**: `apps/web/src/lib/backend-api.ts`

Add new methods:

```typescript
// Gallery Media API
getGalleryMedia: async (params?: {
  type?: 'IMAGE' | 'VIDEO' | 'AUDIO';
  category?: string;
  page?: number;
  size?: number;
}): Promise<GalleryPageResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.append('type', params.type);
  if (params?.category) searchParams.append('category', params.category);
  if (params?.page) searchParams.append('page', String(params.page));
  if (params?.size) searchParams.append('size', String(params.size));

  const response = await fetch(
    `${env.apiUrl}/api/v1/gallery?${searchParams.toString()}`
  );
  const result = await response.json();
  return result.data;
},

getGalleryCategories: async (): Promise<string[]> => {
  const response = await fetch(`${env.apiUrl}/api/v1/gallery/categories`);
  const result = await response.json();
  return result.data;
},
```

### Type Definitions

**File**: `apps/web/src/types/gallery.ts`

```typescript
export type GalleryMediaType = 'IMAGE' | 'VIDEO' | 'AUDIO';
export type MediaPlatform = 'YOUTUBE' | 'VIMEO' | 'SOUNDCLOUD' | 'SELF_HOSTED';

export interface GalleryMediaItem {
  id: string;
  mediaType: GalleryMediaType;
  platform: MediaPlatform;
  externalId?: string;
  url?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  title: string;
  description?: string;
  author?: string;
  publishedDate?: string;
  category?: string;
  displayOrder: number;
}

export interface GalleryPageResponse {
  items: GalleryMediaItem[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
```

### Gallery Page Update

**File**: `apps/web/src/app/(main)/gallery/page.tsx`

Replace mock API calls with real API:

```typescript
"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";  // Use real API
import type { GalleryMediaItem, GalleryMediaType } from "@/types/gallery";

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");
  const [items, setItems] = useState<GalleryMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  useEffect(() => {
    async function loadMedia() {
      setIsLoading(true);
      try {
        const mediaType: GalleryMediaType = activeTab === "photos" ? "IMAGE" : "VIDEO";
        const response = await api.getGalleryMedia({
          type: mediaType,
          category: categoryFilter !== "All" ? categoryFilter : undefined,
        });
        setItems(response.items);
      } catch (error) {
        console.error("Failed to load gallery:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadMedia();
  }, [activeTab, categoryFilter]);

  // ... rest of component
}
```

---

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/gallery` | None | List gallery media with filters |
| GET | `/api/v1/gallery?type=VIDEO` | None | Videos only |
| GET | `/api/v1/gallery?type=IMAGE` | None | Photos only |
| GET | `/api/v1/gallery?type=AUDIO` | None | Podcasts only |
| GET | `/api/v1/gallery?category=Historical` | None | Filter by category |
| GET | `/api/v1/gallery/categories` | None | List available categories |
| GET | `/api/v1/gallery/{id}` | None | Single item details |
| POST | `/api/v1/gallery` | Admin | Create new gallery item |
| PUT | `/api/v1/gallery/{id}` | Admin | Update gallery item |
| DELETE | `/api/v1/gallery/{id}` | Admin | Delete gallery item |

---

## Implementation Checklist

### Backend Tasks
- [ ] Create `GalleryMedia` entity in `apps/api/src/main/kotlin/com/nosilha/core/gallery/domain/`
- [ ] Create enums: `GalleryMediaType`, `MediaPlatform`, `GalleryMediaStatus`
- [ ] Create `GalleryMediaRepository`
- [ ] Create `GalleryService`
- [ ] Create `GalleryController` with public endpoints
- [ ] Create `AdminGalleryController` for CRUD operations
- [ ] Create DTOs: `GalleryMediaResponse`, `GalleryPageResponse`, `CreateGalleryMediaRequest`
- [ ] Add Flyway migration for `gallery_media` table
- [ ] Seed initial data from mock data
- [ ] Write integration tests

### Frontend Tasks
- [ ] Add `GalleryMediaItem` types to `apps/web/src/types/`
- [ ] Add gallery API methods to `apps/web/src/lib/backend-api.ts`
- [ ] Update `apps/web/src/app/(main)/gallery/page.tsx` to use real API
- [ ] Update `PhotoGrid` component for new data structure
- [ ] Update `VideoSection` component for embed URLs
- [ ] Remove or archive mock data from `apps/web/src/lib/mocks/media.ts`

---

## Cross-References

| Document | Section | Notes |
|----------|---------|-------|
| [implementation-gaps.md](./implementation-gaps.md) | Gap 1.1 Media Gallery | Original gap identification |
| `apps/web/src/lib/mocks/media.ts` | Mock data source | Data structure to migrate |
| `apps/api/.../media/` | Existing Media module | Separate concern (user uploads) |

---

## Future Enhancements

1. **Admin UI**: Gallery management in admin dashboard
2. **Bulk Import**: CSV/JSON import for gallery items
3. **YouTube API Integration**: Auto-fetch title, description, thumbnail from YouTube Data API
4. **Podcast Support**: Add SoundCloud/Spotify embed support
5. **Entry Association**: Link gallery items to directory entries
6. **User Submissions**: Allow users to suggest gallery additions (moderation queue)
