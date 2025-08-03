# Gallery API Integration Plan

## Overview

This document outlines the comprehensive plan for integrating a backend API with the existing photo gallery UI components. The gallery system will manage photo collections with cultural context, category filtering, and full CRUD operations while leveraging the existing Spring Boot architecture and GCP infrastructure.

## Current UI Analysis

### Frontend Gallery Structure

The gallery UI consists of several well-architected components:

1. **Photo Gallery Overview Page** (`/media/photos/`)
   - Displays gallery collections with category filtering
   - Shows featured vs non-featured galleries
   - Category statistics and photo counts
   - ISR caching with 1-hour revalidation

2. **Individual Gallery Pages** (`/media/photos/[galleryId]/`)
   - Displays individual photos in responsive grid
   - Lightbox functionality for full-screen viewing
   - Photo metadata display (location, date, description)
   - Static generation with `generateStaticParams`

3. **Client Components**
   - `PhotoGalleryFilter` - Category filtering and gallery display
   - `GalleryImageGrid` - Photo grid with lightbox integration
   - `ImageLightbox` - Full-featured lightbox with keyboard navigation

### Current Data Structures (Mocked)

```typescript
interface Photo {
  src: string;        // Image URL/path
  alt: string;        // Accessibility alt text
  location: string;   // Geographic location
  date: string;       // Date taken/created
  description: string; // Cultural/contextual description
}

interface Gallery {
  id: string;             // Unique slug identifier
  title: string;          // Display name
  description: string;    // Rich cultural description
  category: string;       // Nature, Culture, Architecture, Community
  imageCount: number;     // Total photos in gallery
  coverImage: string;     // Cover/hero image URL
  featured: boolean;      // Featured gallery status
  culturalContext: string; // Background cultural information
  location: string;       // Geographic scope/area
  photos: Photo[];        // Array of photos with metadata
}

interface Category {
  name: string;   // Display name (e.g., "Nature")
  value: string;  // Filter value (e.g., "nature")
  count: number;  // Total photos in category
}
```

## Backend API Requirements

### 1. Domain Model Design

#### New Domain Entities

**PhotoGallery Entity**
```kotlin
@Entity
@Table(name = "photo_galleries")
data class PhotoGallery(
    @Id
    @Column(name = "id")
    val id: UUID = UUID.randomUUID(),
    
    @Column(name = "slug", unique = true, nullable = false)
    val slug: String,
    
    @Column(name = "title", nullable = false)
    val title: String,
    
    @Column(name = "description", columnDefinition = "TEXT")
    val description: String?,
    
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    val category: PhotoCategory,
    
    @Column(name = "cover_image_url")
    val coverImageUrl: String?,
    
    @Column(name = "featured", nullable = false)
    val featured: Boolean = false,
    
    @Column(name = "cultural_context", columnDefinition = "TEXT")
    val culturalContext: String?,
    
    @Column(name = "location")
    val location: String?,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    
    @Column(name = "updated_at", nullable = false)
    val updatedAt: Instant = Instant.now(),
    
    @OneToMany(mappedBy = "gallery", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    val photos: List<Photo> = emptyList()
)
```

**Photo Entity**
```kotlin
@Entity
@Table(name = "photos")
data class Photo(
    @Id
    @Column(name = "id")
    val id: UUID = UUID.randomUUID(),
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gallery_id", nullable = false)
    val gallery: PhotoGallery,
    
    @Column(name = "filename", nullable = false)
    val filename: String,
    
    @Column(name = "gcs_url", nullable = false)
    val gcsUrl: String,
    
    @Column(name = "alt_text")
    val altText: String?,
    
    @Column(name = "location")
    val location: String?,
    
    @Column(name = "date_taken")
    val dateTaken: LocalDate?,
    
    @Column(name = "description", columnDefinition = "TEXT")
    val description: String?,
    
    @Column(name = "sort_order", nullable = false)
    val sortOrder: Int = 0,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now()
)
```

**PhotoCategory Enum**
```kotlin
enum class PhotoCategory(val displayName: String, val value: String) {
    NATURE("Nature", "nature"),
    CULTURE("Culture", "culture"),
    ARCHITECTURE("Architecture", "architecture"),
    COMMUNITY("Community", "community");
    
    companion object {
        fun fromValue(value: String): PhotoCategory? = 
            values().find { it.value.equals(value, ignoreCase = true) }
    }
}
```

#### Database Schema

```sql
-- Photo galleries table
CREATE TABLE photo_galleries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    cover_image_url VARCHAR(500),
    featured BOOLEAN DEFAULT false,
    cultural_context TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Photos table
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_id UUID NOT NULL REFERENCES photo_galleries(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    gcs_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(500),
    location VARCHAR(255),
    date_taken DATE,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_photo_galleries_category ON photo_galleries(category);
CREATE INDEX idx_photo_galleries_featured ON photo_galleries(featured);
CREATE INDEX idx_photo_galleries_slug ON photo_galleries(slug);
CREATE INDEX idx_photos_gallery_id ON photos(gallery_id);
CREATE INDEX idx_photos_sort_order ON photos(gallery_id, sort_order);
```

### 2. Required API Endpoints

#### Gallery Collection Management

**GET /api/v1/galleries**
- Query parameters: `category`, `featured`, `page`, `size`
- Returns paginated list of galleries with photo counts
- Public endpoint with caching

**GET /api/v1/galleries/{gallerySlug}**
- Returns specific gallery with all photos
- Public endpoint with aggressive caching
- 404 if gallery not found or not published

**GET /api/v1/galleries/categories**
- Returns category statistics with photo counts
- Public endpoint with long caching

**POST /api/v1/galleries** (Admin)
- Create new gallery
- Requires authentication and admin role
- Auto-generates slug from title

**PUT /api/v1/galleries/{galleryId}** (Admin)
- Update gallery metadata
- Requires authentication and admin role
- Updates `updated_at` timestamp

**DELETE /api/v1/galleries/{galleryId}** (Admin)
- Delete gallery and all associated photos
- Requires authentication and admin role
- Cascades to GCS cleanup

#### Photo Management

**GET /api/v1/galleries/{gallerySlug}/photos**
- Returns paginated photos for specific gallery
- Query parameters: `page`, `size`, `sort`
- Public endpoint

**POST /api/v1/galleries/{galleryId}/photos** (Admin)
- Upload multiple photos to gallery
- Handles multipart file upload
- Triggers AI processing pipeline
- Returns created photo records

**PUT /api/v1/photos/{photoId}** (Admin)
- Update photo metadata (alt text, description, location, etc.)
- Does not handle file replacement
- Requires authentication

**DELETE /api/v1/photos/{photoId}** (Admin)
- Delete photo and cleanup GCS file
- Updates gallery photo count
- Requires authentication

**POST /api/v1/photos/reorder** (Admin)
- Batch update photo sort orders
- Request body: `[{photoId: UUID, sortOrder: number}]`
- Requires authentication

#### Media Processing

**POST /api/v1/media/photos/upload**
- Multi-file upload with AI processing
- Generates thumbnails and optimized sizes
- Extracts metadata via Cloud Vision API
- Returns upload status and generated URLs

**GET /api/v1/media/photos/{filename}**
- Serves optimized images from GCS
- Query parameters: `size`, `quality`, `format`
- CDN-friendly with proper caching headers

### 3. DTO Structure

```kotlin
// Response DTOs
data class PhotoGalleryDto(
    val id: String,
    val slug: String,
    val title: String,
    val description: String?,
    val category: String,
    val imageCount: Int,
    val coverImage: String?,
    val featured: Boolean,
    val culturalContext: String?,
    val location: String?,
    val photos: List<PhotoDto>? = null // Only included in detail view
)

data class PhotoDto(
    val id: String,
    val src: String, // GCS URL
    val alt: String?,
    val location: String?,
    val date: String?, // ISO date string
    val description: String?,
    val sortOrder: Int
)

data class PhotoCategoryDto(
    val name: String,
    val value: String,
    val count: Int
)

// Request DTOs
data class CreateGalleryRequest(
    val title: String,
    val description: String?,
    val category: String,
    val featured: Boolean = false,
    val culturalContext: String?,
    val location: String?
)

data class UpdatePhotoRequest(
    val altText: String?,
    val location: String?,
    val dateTaken: String?, // ISO date string
    val description: String?
)
```

## Integration with Existing Systems

### Leverage Current Infrastructure

**Google Cloud Storage**
- Extend existing `FileStorageService` for gallery-specific paths
- Path structure: `/galleries/{gallerySlug}/{filename}`
- Implement image optimization and thumbnail generation
- Use existing GCS bucket configuration

**Cloud Vision API**
- Extend current `AIService` for photo metadata extraction
- Auto-generate alt text from image recognition
- Extract location data from EXIF when available
- Generate descriptive tags for search

**Firestore Integration**
- Use existing `ImageMetadata` pattern for AI-generated data
- Store Vision API results for each photo
- Cache expensive AI operations

**Authentication System**
- Use existing JWT authentication for admin endpoints
- Leverage current Supabase integration
- Implement role-based access for gallery management

### Service Architecture

**PhotoGalleryService**
```kotlin
@Service
class PhotoGalleryService(
    private val galleryRepository: PhotoGalleryRepository,
    private val photoRepository: PhotoRepository,
    private val fileStorageService: FileStorageService,
    private val aiService: AIService
) {
    fun findAllGalleries(category: PhotoCategory?, featured: Boolean?): List<PhotoGalleryDto>
    fun findGalleryBySlug(slug: String): PhotoGalleryDto?
    fun createGallery(request: CreateGalleryRequest): PhotoGalleryDto
    fun updateGallery(id: UUID, request: UpdateGalleryRequest): PhotoGalleryDto
    fun deleteGallery(id: UUID)
    fun getCategoryStatistics(): List<PhotoCategoryDto>
}
```

**PhotoService**
```kotlin
@Service
class PhotoService(
    private val photoRepository: PhotoRepository,
    private val fileStorageService: FileStorageService,
    private val aiService: AIService
) {
    fun uploadPhotos(galleryId: UUID, files: List<MultipartFile>): List<PhotoDto>
    fun updatePhoto(photoId: UUID, request: UpdatePhotoRequest): PhotoDto
    fun deletePhoto(photoId: UUID)
    fun reorderPhotos(updates: List<PhotoReorderRequest>)
}
```

## Frontend Integration Strategy

### API Client Implementation

**Create `/lib/gallery-api.ts`**
```typescript
import { authenticatedFetch } from '@/lib/api';

export interface Gallery {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  imageCount: number;
  coverImage: string;
  featured: boolean;
  culturalContext: string;
  location: string;
  photos?: Photo[];
}

export interface Photo {
  id: string;
  src: string;
  alt: string;
  location: string;
  date: string;
  description: string;
  sortOrder: number;
}

export async function getGalleries(category?: string): Promise<Gallery[]> {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  
  const url = `/api/v1/galleries?${params.toString()}`;
  const response = await fetch(url, { next: { revalidate: 3600 } });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch galleries: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.data; // Unwrap ApiResponse
}

export async function getGallery(slug: string): Promise<Gallery> {
  const response = await fetch(`/api/v1/galleries/${slug}`, {
    next: { revalidate: 3600 }
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Gallery not found');
    }
    throw new Error(`Failed to fetch gallery: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.data;
}

export async function getGalleryCategories(): Promise<Category[]> {
  const response = await fetch('/api/v1/galleries/categories', {
    next: { revalidate: 3600 }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.data;
}

// Admin functions
export async function uploadPhotos(galleryId: string, files: File[]): Promise<Photo[]> {
  const formData = new FormData();
  files.forEach(file => formData.append('photos', file));
  
  const response = await authenticatedFetch(`/api/v1/galleries/${galleryId}/photos`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`Failed to upload photos: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.data;
}
```

### Update Existing Components

**Modify Gallery Pages**
- Replace mock data with API calls
- Add proper error boundaries and loading states
- Implement fallback behavior for API failures
- Add retry logic with exponential backoff

**Error Handling Strategy**
```typescript
// In gallery pages
try {
  const galleries = await getGalleries(category);
  return galleries;
} catch (error) {
  console.error('Failed to load galleries:', error);
  // Fallback to mock data for development
  return getMockGalleries(category);
}
```

## Admin Interface Requirements

### Gallery Management Dashboard

**Gallery List View**
- Table with title, category, photo count, featured status
- Bulk actions: feature/unfeature, delete, category change
- Search and filtering capabilities
- Pagination with configurable page sizes

**Gallery Editor**
- Rich text editor for description and cultural context
- Image upload for cover photo with preview
- Category selection with validation
- Featured gallery toggle
- SEO fields (meta description, alt text)

**Photo Management Interface**
- Drag & drop photo upload with progress indicators
- Grid view with thumbnail previews
- Inline editing for photo metadata
- Batch operations (delete, reorder, update metadata)
- Photo reordering with drag & drop

### Admin Routes Structure

```
/admin/galleries/
├── page.tsx           # Gallery list and overview
├── new/
│   └── page.tsx       # Create new gallery
├── [galleryId]/
│   ├── page.tsx       # Gallery detail/edit
│   ├── photos/
│   │   ├── page.tsx   # Photo management
│   │   └── upload/
│   │       └── page.tsx # Bulk photo upload
└── components/
    ├── gallery-form.tsx
    ├── photo-uploader.tsx
    └── photo-grid.tsx
```

## Implementation Phases

### Phase 1: Backend Foundation (Week 1-2)

**Database & Domain Models**
- [ ] Create database migration scripts
- [ ] Implement PhotoGallery and Photo entities
- [ ] Create JPA repositories with custom queries
- [ ] Add database indexes for performance

**Core Services**
- [ ] Implement PhotoGalleryService with CRUD operations
- [ ] Implement PhotoService with file handling
- [ ] Add comprehensive error handling and validation
- [ ] Write unit tests for service layer

**REST Controllers**
- [ ] Create PhotoGalleryController with all endpoints
- [ ] Create PhotoController for photo management
- [ ] Implement proper HTTP status codes and responses
- [ ] Add API documentation with OpenAPI/Swagger

### Phase 2: Media Processing Integration (Week 2-3)

**File Storage Enhancement**
- [ ] Extend FileStorageService for gallery-specific paths
- [ ] Implement image optimization and thumbnail generation
- [ ] Add support for multiple image formats and sizes
- [ ] Implement batch file operations

**AI Processing Pipeline**
- [ ] Extend AIService for photo metadata extraction
- [ ] Implement auto-tagging with Cloud Vision API
- [ ] Add EXIF data extraction for location/date
- [ ] Create background job processing for large uploads

**Firestore Integration**
- [ ] Store AI-generated metadata in Firestore
- [ ] Implement caching layer for expensive operations
- [ ] Add metadata search capabilities

### Phase 3: Frontend Integration (Week 3-4)

**API Client Implementation**
- [ ] Create comprehensive gallery API client
- [ ] Replace all mock data with API calls
- [ ] Implement proper TypeScript interfaces
- [ ] Add error handling and fallback mechanisms

**Page Updates**
- [ ] Update gallery overview page with API integration
- [ ] Update individual gallery pages with real data
- [ ] Add loading states and error boundaries
- [ ] Implement ISR caching with proper revalidation

**Performance Optimization**
- [ ] Implement image lazy loading and optimization
- [ ] Add client-side caching for frequently accessed data
- [ ] Optimize bundle size and loading performance

### Phase 4: Admin Interface & Enhancement Features (Week 4-5)

**Admin Dashboard**
- [ ] Create gallery management interface
- [ ] Implement photo upload with drag & drop
- [ ] Add batch editing capabilities
- [ ] Create photo reordering interface

**Advanced Features**
- [ ] Implement photo search and filtering
- [ ] Add gallery sharing capabilities
- [ ] Create photo metadata bulk editing
- [ ] Add gallery analytics and statistics

**Polish & Testing**
- [ ] Comprehensive integration testing
- [ ] Performance testing and optimization
- [ ] Security audit and penetration testing
- [ ] User acceptance testing with stakeholders

## Success Metrics

**Performance Targets**
- Gallery overview page load: < 2 seconds
- Individual gallery page load: < 3 seconds
- Photo upload processing: < 30 seconds per batch
- Image optimization: < 5 seconds per photo

**User Experience Goals**
- Seamless transition from mock to real data
- Zero downtime during deployment
- Responsive design on all device sizes
- Accessible interface meeting WCAG 2.1 standards

**Technical Requirements**
- 99.9% API uptime
- Proper error handling with graceful degradation
- Comprehensive monitoring and alerting
- Automated testing coverage > 80%

This comprehensive plan provides a roadmap for implementing a production-ready gallery system that integrates seamlessly with the existing UI while leveraging the full power of the Spring Boot backend and GCP infrastructure.