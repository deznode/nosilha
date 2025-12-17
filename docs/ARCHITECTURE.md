# Nos Ilha Architecture Documentation

This document provides a comprehensive technical overview of the Nos Ilha platform architecture, component interactions, and system design decisions.

## 🏗️ System Overview

Nos Ilha is a modern, full-stack web application built with a microservices-inspired architecture, featuring:

- **Frontend**: Next.js 16 with React 19.2 (Server Components + Client Components)
- **Backend**: Spring Boot 3.4.7 with Kotlin and domain-driven design
- **Infrastructure**: Google Cloud Platform with Terraform Infrastructure as Code
- **CI/CD**: Modular GitHub Actions workflows with comprehensive security scanning

## 📊 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               Nos Ilha Platform Architecture                             │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                    │
│  │   Users/Clients │    │   GitHub Actions │    │  Google Cloud   │                    │
│  │                 │    │     (CI/CD)      │    │   Platform      │                    │
│  └─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘                    │
│            │                      │                      │                            │
│            ▼                      ▼                      ▼                            │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                    │
│  │    Frontend     │◄──►│   Build & Test  │◄──►│  Infrastructure │                    │
│  │   (Next.js)     │    │   & Security    │    │   (Terraform)   │                    │
│  │                 │    │    Scanning     │    │                 │                    │
│  │ ┌─────────────┐ │    │                 │    │ ┌─────────────┐ │                    │
│  │ │ App Router  │ │    │ ┌─────────────┐ │    │ │ Cloud Run   │ │                    │
│  │ │ ISR Caching │ │    │ │ Path-based  │ │    │ │ Services    │ │                    │
│  │ │ Supabase    │ │    │ │ Triggering  │ │    │ │             │ │                    │
│  │ │ Auth        │ │    │ │ Trivy       │ │    │ │ Auto Scaling│ │                    │
│  │ └─────────────┘ │    │ │ detekt      │ │    │ │ Load Balance│ │                    │
│  └─────────┬───────┘    │ │ ESLint      │ │    │ └─────────────┘ │                    │
│            │            │ │ tfsec       │ │    └─────────┬───────┘                    │
│            │            │ └─────────────┘ │              │                            │
│            ▼            └─────────────────┘              ▼                            │
│  ┌─────────────────┐                            ┌─────────────────┐                    │
│  │    Backend      │                            │    Data Layer   │                    │
│  │ (Spring Boot)   │                            │                 │                    │
│  │                 │                            │ ┌─────────────┐ │                    │
│  │ ┌─────────────┐ │                            │ │ PostgreSQL  │ │                    │
│  │ │Controllers  │ │◄──────────────────────────►│ │ (Primary)   │ │                    │
│  │ │Services     │ │                            │ └─────────────┘ │                    │
│  │ │Repositories │ │                            │ ┌─────────────┐ │                    │
│  │ │JWT Auth     │ │                            │ │ Firestore   │ │                    │
│  │ │Domain Model │ │◄──────────────────────────►│ │ (Metadata)  │ │                    │
│  │ └─────────────┘ │                            │ └─────────────┘ │                    │
│  └─────────┬───────┘                            │ ┌─────────────┐ │                    │
│            │                                    │ │ Cloud       │ │                    │
│            ▼                                    │ │ Storage     │ │                    │
│  ┌─────────────────┐                            │ │ (Media)     │ │                    │
│  │   AI Services   │◄──────────────────────────►│ └─────────────┘ │                    │
│  │                 │                            └─────────────────┘                    │
│  │ ┌─────────────┐ │                                                                   │
│  │ │ Vision API  │ │                                                                   │
│  │ │ OCR         │ │                                                                   │
│  │ │ Landmark    │ │                                                                   │
│  │ │ Recognition │ │                                                                   │
│  │ └─────────────┘ │                                                                   │
│  └─────────────────┘                                                                   │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

### 1. User Authentication Flow

```
User Request ──► Frontend (Next.js) ──► Supabase Auth ──► JWT Token ──► Backend Validation ──► Database Access

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │  Frontend   │    │  Supabase   │    │   Backend   │    │ PostgreSQL  │
│             │    │             │    │    Auth     │    │     API     │    │  Database   │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │                  │
   ┌───▼────┐         ┌───▼────┐         ┌───▼────┐         ┌───▼────┐         ┌───▼────┐
   │Login   │────────►│Generate│────────►│Issue   │────────►│Validate│────────►│Access  │
   │Request │         │Session │         │JWT     │         │Token   │         │Data    │
   └────────┘         └────────┘         └────────┘         └────────┘         └────────┘
```

**Implementation Details:**
- **Frontend**: `components/auth/login-form.tsx` handles user input
- **Auth Provider**: `components/providers/auth-provider.tsx` manages session state
- **Middleware**: `proxy.ts` protects routes and redirects unauthorized users
- **Backend Filter**: `JwtAuthenticationFilter` validates tokens and extracts user claims
- **API Client**: `lib/api.ts` automatically includes JWT headers in requests

### 2. Content Management Flow

```
Admin Action ──► Frontend Form ──► Backend API ──► Database ──► Cache Invalidation ──► User Updates

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Admin     │    │  Add Entry  │    │   Backend   │    │ PostgreSQL  │    │  Frontend   │
│   User      │    │    Form     │    │     API     │    │  Database   │    │   Cache     │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │                  │
   ┌───▼────┐         ┌───▼────┐         ┌───▼────┐         ┌───▼────┐         ┌───▼────┐
   │Create  │────────►│Validate│────────►│Process │────────►│Store   │────────►│Revalidate│
   │Content │         │& Submit│         │Business│         │Entry   │         │ISR Cache│
   └────────┘         └────────┘         │Logic   │         └────────┘         └────────┘
                                         └────────┘
```

**Implementation Details:**
- **Admin Form**: `components/admin/add-entry-form.tsx` with validation
- **API Layer**: `lib/api.ts` with authenticated POST requests
- **Backend Controller**: `DirectoryController.kt` handles CRUD operations
- **Service Layer**: `DirectoryService.kt` implements business logic
- **Repository**: Spring Data JPA with single-table inheritance
- **Cache Strategy**: ISR revalidation triggers on data updates

### 3. Media Processing & AI Integration Flow

```
File Upload ──► GCS Storage ──► Vision API ──► Metadata Extraction ──► Firestore ──► Frontend Display

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │   Google    │    │   Vision    │    │  Firestore  │    │  Frontend   │
│   Upload    │    │   Cloud     │    │     API     │    │  Database   │    │   Display   │
│             │    │   Storage   │    │             │    │             │    │             │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │                  │
   ┌───▼────┐         ┌───▼────┐         ┌───▼────┐         ┌───▼────┐         ┌───▼────┐
   │Upload  │────────►│Store   │────────►│Analyze │────────►│Store   │────────►│Enhanced│
   │Media   │         │Asset   │         │Content │         │Metadata│         │Content │
   │File    │         │Securely│         │(OCR,   │         │Results │         │Display │
   └────────┘         └────────┘         │Labels) │         └────────┘         └────────┘
                                         └────────┘
```

**Implementation Details:**
- **Upload Component**: `components/ui/image-uploader.tsx` with validation
- **Backend Service**: `MediaService.kt` handles GCS operations
- **AI Processing**: `AIService.kt` integrates with Cloud Vision API
- **Metadata Storage**: Firestore collections for flexible schema
- **Frontend Integration**: Image galleries with AI-enhanced metadata

## 🛠️ Component Architecture

### Frontend Architecture (Next.js 16)

```
frontend/
├── src/
│   ├── app/                          # App Router Structure
│   │   ├── layout.tsx               # Root layout with providers
│   │   ├── (auth)/                  # Authentication routes
│   │   │   ├── login/page.tsx       # Login page
│   │   │   └── signup/page.tsx      # Registration page
│   │   ├── (main)/                  # Public routes
│   │   │   ├── page.tsx             # Homepage
│   │   │   ├── directory/
│   │   │   │   ├── [category]/page.tsx    # Category listings
│   │   │   │   └── entry/[slug]/page.tsx  # Entry details
│   │   │   └── map/page.tsx         # Interactive map
│   │   └── (admin)/                 # Protected admin routes
│   │       └── add-entry/page.tsx   # Content management
│   ├── components/
│   │   ├── providers/               # Context providers
│   │   │   └── auth-provider.tsx    # Supabase auth state
│   │   ├── catalyst-ui/             # Design system
│   │   │   ├── button.tsx           # Reusable button component
│   │   │   ├── input.tsx            # Form input components
│   │   │   └── auth-layout.tsx      # Authentication layout
│   │   ├── ui/                      # Custom components
│   │   │   ├── header.tsx           # Site navigation
│   │   │   ├── footer.tsx           # Site footer
│   │   │   ├── directory-card.tsx   # Business listing card
│   │   │   └── interactive-map.tsx  # Leaflet map integration
│   │   └── admin/                   # Admin components
│   │       └── add-entry-form.tsx   # Content creation form
│   ├── lib/
│   │   ├── api.ts                   # Backend API client
│   │   ├── supabase-client.ts       # Auth configuration
│   │   └── mock-api.ts              # Fallback data
│   ├── types/
│   │   └── directory.ts             # TypeScript interfaces
│   └── proxy.ts                     # Route protection
└── Dockerfile                       # Production container build
```

**Key Architectural Decisions:**

1. **Route Groups**: Parentheses `(auth)`, `(main)`, `(admin)` organize routes without affecting URLs
2. **Server Components First**: Prioritize RSCs for data fetching and static content
3. **Client Components**: Only when interactivity is required (`useState`, `useEffect`)
4. **ISR Caching Strategy**: 
   - Directory listings: 1-hour cache
   - Individual entries: 30-minute cache
   - Interactive features: no-cache for real-time updates
5. **Error Boundaries**: Graceful fallback to mock data when API fails

### Backend Architecture (Spring Boot + Kotlin + Spring Modulith)

**Module Organization:**

```
backend/src/main/kotlin/com/nosilha/core/
├── shared/         # Shared Kernel - Common infrastructure (events, audit, exceptions)
├── auth/           # Authentication Module - JWT auth and user management
├── directory/      # Directory Module - Cultural heritage entries (STI pattern)
├── media/          # Media Module - GCS storage and AI processing
└── contentactions/ # Content Actions Module - Reactions, suggestions, related content
```

**Standard Module Structure:**

Each module follows a consistent pattern with these internal layers:
- `PackageInfo.kt` - Declares module API and dependencies
- `api/` - REST controllers (public, exposed to other modules)
- `domain/` - Business entities and services (internal)
- `repository/` - Data access layer (internal)
- `events/` - Domain events (public, exposed to other modules)

**Key Points:**
- See `docs/SPRING_MODULITH.md` for detailed module architecture
- Database migrations: `backend/src/main/resources/db/migration/`
- Configuration: `backend/src/main/resources/application*.yml`

**Key Architectural Decisions:**

1. **Spring Modulith Architecture**: Modular monolith with enforced module boundaries and event-driven communication
2. **Single Table Inheritance**: All directory entries in one table with discriminator column (Directory module)
3. **Event-Driven Communication**: Modules communicate via `@ApplicationModuleListener` without direct dependencies
4. **Module Isolation**: Each module (auth, directory, media, contentactions) has independent domain, API, and repository layers
5. **Shared Kernel**: Common infrastructure (AuditableEntity, events, exceptions) in dedicated shared module
6. **JWT Authentication**: Stateless authentication with Supabase token validation (Auth module)
7. **Actuator Integration**: Health checks and metrics for production monitoring

#### Backend Module Architecture Diagram (Spring Modulith)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│               Backend API (Spring Boot + Spring Modulith)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Shared Kernel (com.nosilha.core.shared)                          │    │
│  │  ├─ domain/AuditableEntity.kt                                     │    │
│  │  ├─ events/ApplicationModuleEvent.kt                              │    │
│  │  ├─ api/ (shared API components)                                  │    │
│  │  └─ exception/ (global exception handling)                        │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                         ▲           ▲           ▲                           │
│                         │           │           │                           │
│        ┌────────────────┘           │           └────────────────┐          │
│        │                            │                            │          │
│  ┌─────┴─────────┐       ┌──────────┴─────────┐       ┌─────────┴─────┐    │
│  │ Auth Module   │       │ Directory Module   │       │ Media Module  │    │
│  │ (auth)        │       │ (directory)        │       │ (media)       │    │
│  ├───────────────┤       ├────────────────────┤       ├───────────────┤    │
│  │ API:          │       │ API:               │       │ API:          │    │
│  │ • AuthController│     │ • DirectoryController│     │ • MediaController│  │
│  ├───────────────┤       ├────────────────────┤       ├───────────────┤    │
│  │ Domain:       │       │ Domain:            │       │ Domain:       │    │
│  │ • UserService │       │ • DirectoryService │       │ • MediaService│    │
│  │ • JwtAuth     │       │ • DirectoryEntry   │       │               │    │
│  │   Service     │       │ • Restaurant       │       │               │    │
│  ├───────────────┤       │ • Hotel, etc.      │       ├───────────────┤    │
│  │ Security:     │       ├────────────────────┤       │ Repository:   │    │
│  │ • JwtFilter   │       │ Repository:        │       │ • FirestoreRepo│   │
│  │ • SecurityCfg │       │ • DirectoryRepo    │       ├───────────────┤    │
│  ├───────────────┤       ├────────────────────┤       │ Events:       │    │
│  │ Events:       │       │ Events:            │       │ • MediaUploaded│   │
│  │ • UserLoggedIn│       │ • EntryCreated ────┼──────►│ • MediaProcessed│ │
│  └───────────────┘       │ • EntryUpdated     │       └───────────────┘    │
│                          │ • EntryDeleted     │                            │
│                          └────────────────────┘                            │
│                                     │                                       │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PostgreSQL Database                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  directory_entries (Single Table Inheritance)                         │  │
│  │  ┌─────────┬──────────┬────────────┬─────────────────┐               │  │
│  │  │   id    │   name   │entry_type  │ type-specific   │               │  │
│  │  │ (UUID)  │ (string) │(discriminator)│    fields    │               │  │
│  │  ├─────────┼──────────┼────────────┼─────────────────┤               │  │
│  │  │abc-123  │Casa Nova │RESTAURANT  │cuisine, hours   │               │  │
│  │  │def-456  │Hotel Mar │HOTEL       │amenities        │               │  │
│  │  │ghi-789  │Lighthouse│LANDMARK    │historical_info  │               │  │
│  │  └─────────┴──────────┴────────────┴─────────────────┘               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  event_publication (Spring Modulith Event Store)                      │  │
│  │  Tracks published events for event replay and debugging               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Note:** The diagram above shows the core modules. The **ContentActions module** (`contentactions/`) is also present and follows the same pattern with:
- `ReactionController`, `SuggestionController`, `ContentController`
- `ReactionService`, `SuggestionService`, `ContentService`
- Domain entities: `Reaction`, `Suggestion`, `Content`

**Module Communication:**
- ✅ **Event-Driven**: Modules communicate via `@ApplicationModuleListener` (e.g., `MediaService` listens to `DirectoryEntryCreatedEvent`)
- ✅ **No Direct Dependencies**: Modules never import services from other modules
- ✅ **Enforced Boundaries**: `ModularityTests` verify zero circular dependencies
- ✅ **Public API Only**: Controllers and events are public; services and repositories are internal

### Database Schema Design

```sql
-- Single Table Inheritance Pattern
CREATE TABLE directory_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,  -- Discriminator column
    town VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    image_url VARCHAR(500),
    rating DOUBLE PRECISION,
    review_count INTEGER DEFAULT 0,
    
    -- Restaurant-specific fields
    phone_number VARCHAR(20),
    opening_hours VARCHAR(200),
    cuisine VARCHAR(100),
    
    -- Hotel-specific fields  
    amenities TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_directory_entries_category ON directory_entries(category);
CREATE INDEX idx_directory_entries_town ON directory_entries(town);
CREATE INDEX idx_directory_entries_location ON directory_entries(latitude, longitude);
```

**Design Rationale:**
- Single table reduces JOINs and improves query performance
- Discriminator column enables type-specific queries
- Nullable columns for subclass-specific fields
- Geographic indexing for location-based queries
- Slug field for SEO-friendly URLs

## 🚀 Infrastructure Architecture

### Google Cloud Platform Resources

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              Google Cloud Platform                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                    │
│  │   Cloud Run     │    │  Artifact       │    │  Cloud Storage  │                    │
│  │   Services      │    │  Registry       │    │   Buckets       │                    │
│  │                 │    │                 │    │                 │                    │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │                    │
│  │ │Backend API  │ │◄──►│ │Docker Images│ │    │ │Media Storage│ │                    │
│  │ │(Spring Boot)│ │    │ │             │ │    │ │Public Read  │ │                    │
│  │ └─────────────┘ │    │ │- Backend    │ │    │ └─────────────┘ │                    │
│  │ ┌─────────────┐ │    │ │- Frontend   │ │    │ ┌─────────────┐ │                    │
│  │ │Frontend UI  │ │◄──►│ │             │ │    │ │Terraform    │ │                    │
│  │ │(Next.js)    │ │    │ └─────────────┘ │    │ │State        │ │                    │
│  │ └─────────────┘ │    └─────────────────┘    │ │Private      │ │                    │
│  └─────────────────┘                           │ └─────────────┘ │                    │
│            │                                   └─────────────────┘                    │
│            ▼                                                                          │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                    │
│  │   IAM & Security│    │  Secret Manager │    │    Firestore    │                    │
│  │                 │    │                 │    │                 │                    │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │                    │
│  │ │Service      │ │    │ │DB Credentials│ │    │ │AI Metadata  │ │                    │
│  │ │Accounts     │ │    │ │JWT Secrets  │ │    │ │Collections  │ │                    │
│  │ │- Backend    │ │    │ │API Keys     │ │    │ │- Images     │ │                    │
│  │ │- Frontend   │ │    │ └─────────────┘ │    │ │- Documents  │ │                    │
│  │ │- CI/CD      │ │    └─────────────────┘    │ └─────────────┘ │                    │
│  │ └─────────────┘ │                           └─────────────────┘                    │
│  └─────────────────┘                                                                  │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Terraform Infrastructure as Code

```hcl
# infrastructure/terraform/main.tf
resource "google_storage_bucket" "media_storage" {
  name          = "nosilha-com-media-storage-useast1"
  location      = "us-east1"
  force_destroy = false
  
  uniform_bucket_level_access = true
  
  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }
}

# infrastructure/terraform/cloudrun.tf
resource "google_cloud_run_v2_service" "nosilha_backend_api" {
  name                = "nosilha-backend-api"
  location            = var.gcp_region
  deletion_protection = true
  
  template {
    service_account = google_service_account.backend_runner.email
    
    containers {
      image = "us-east1-docker.pkg.dev/${var.gcp_project_id}/nosilha-backend/nosilha-core-api:latest"
      
      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }
    }
  }
}
```

**Infrastructure Components:**
- **Cloud Run**: Serverless container platform with auto-scaling
- **Artifact Registry**: Docker image storage with vulnerability scanning
- **Cloud Storage**: Media files with CDN distribution
- **Secret Manager**: Encrypted configuration and credentials
- **IAM**: Least-privilege service accounts and role bindings
- **Firestore**: NoSQL database for AI metadata

## 🔄 CI/CD Pipeline Architecture

### Modular Workflow Design

```
GitHub Repository ──► Path Detection ──► Service-Specific Workflows ──► Production Deployment

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Code Change   │    │   Path Filter   │    │  Build & Test   │    │   Deployment    │
│                 │    │   Detection     │    │   Workflows     │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │                      │
      ┌───▼────┐             ┌───▼────┐             ┌───▼────┐             ┌───▼────┐
      │Push to │            │backend/│            │Backend │            │Cloud   │
      │main or │            │frontend/│            │Frontend│            │Run     │
      │PR      │            │infra/  │            │Infra   │            │Deploy  │
      └────────┘            └────────┘            │Workflows│            └────────┘
                                                  └────────┘
```

### Workflow Structure

1. **Path-Based Triggering** (`dorny/paths-filter@v2`)
   ```yaml
   filters: |
     backend:
       - 'backend/**'
     frontend:
       - 'frontend/**'
     infrastructure:
       - 'infrastructure/**'
   ```

2. **Security Scanning Integration**
   - **Trivy**: Container and dependency vulnerabilities
   - **detekt**: Kotlin static analysis
   - **ESLint**: TypeScript linting and security rules
   - **tfsec**: Terraform security validation
   - **SARIF Upload**: Results to GitHub Security tab

3. **Quality Gates**
   - Unit tests with coverage reporting
   - Type checking and compilation
   - Bundle size analysis (frontend)
   - Infrastructure validation

4. **Deployment Strategy**
   - Production-only environment for cost optimization
   - Blue-green deployments via Cloud Run traffic splitting
   - Health checks before traffic routing
   - Automatic rollback on failure

## 🔒 Security Architecture

### Authentication & Authorization Flow

```
User ──► Frontend ──► Supabase ──► JWT Token ──► Backend ──► Database
  │         │          │            │            │         │
  ▼         ▼          ▼            ▼            ▼         ▼
Login    Session    Identity     Validation   Business   Data
Form     State      Provider     Filter       Logic      Access
```

### Security Layers

1. **Frontend Security**
   - Route protection via middleware
   - JWT token management with auto-refresh
   - Input validation and sanitization
   - HTTPS-only cookie settings

2. **Backend Security**
   - JWT authentication filter
   - Role-based access control
   - Request/response validation
   - SQL injection prevention (JPA)

3. **Infrastructure Security**
   - Least-privilege IAM roles
   - Service account isolation
   - Network security groups
   - Encrypted secrets management

4. **CI/CD Security**
   - Vulnerability scanning at build time
   - Signed container images
   - Secure artifact storage
   - Encrypted environment variables

### Data Privacy & GDPR Compliance

- **Data Minimization**: Only collect necessary user information
- **Consent Management**: Clear opt-in for AI processing features
- **Right to Deletion**: User data removal capabilities
- **Data Portability**: Export functionality for user data
- **Audit Logging**: Track access and modifications

## 📈 Performance & Scalability

### Caching Strategy

1. **Frontend Caching (ISR)**
   ```typescript
   // 1-hour cache for directory listings
   const response = await fetch(endpoint, { 
     next: { revalidate: 3600 } 
   });
   
   // 30-minute cache for individual entries
   const response = await fetch(endpoint, { 
     next: { revalidate: 1800 } 
   });
   
   // No cache for interactive features
   const response = await fetch(endpoint, { 
     cache: "no-store" 
   });
   ```

2. **Backend Optimization**
   - Database connection pooling (HikariCP)
   - JPA query optimization
   - Response compression
   - Actuator metrics monitoring

3. **Infrastructure Scaling**
   - Cloud Run auto-scaling (0-10 instances)
   - Load balancing across regions
   - CDN for static assets
   - Database read replicas (future)

### Monitoring & Observability

1. **Application Monitoring**
   - Spring Boot Actuator endpoints
   - Health checks and metrics
   - Custom business metrics
   - Error rate tracking

2. **Infrastructure Monitoring**
   - Cloud Run instance metrics
   - Database performance
   - Storage usage
   - Network latency

3. **Security Monitoring**
   - Failed authentication attempts
   - Unusual access patterns
   - Vulnerability scan results
   - Compliance audit logs

## 🔮 Future Architecture Considerations

### Current Architectural Implementation

The following architectural improvements have been **successfully implemented** to enhance modularity, maintainability, and developer experience:

#### Backend: Spring Modulith Integration

**Architecture**: Modular monolith with well-defined module boundaries using Spring Modulith

```
Backend Architecture: Spring Modulith
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Modular Backend (Spring Modulith)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │  Shared Kernel Module (com.nosilha.core.shared)                        │ │
│ │  • AuditableEntity (base domain class)                                 │ │
│ │  • DomainEvent, ApplicationModuleEvent (event infrastructure)          │ │
│ │  • Common utilities and base types                                     │ │
│ │  Dependencies: NONE (foundation layer)                                 │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │  Directory Module (com.nosilha.core.directory)                         │ │
│ │  • API: DirectoryController (public REST endpoints)                    │ │
│ │  • Domain: DirectoryEntry, Restaurant, Hotel, Landmark, Beach (STI)    │ │
│ │  • Service: DirectoryService (business logic, event publishing)        │ │
│ │  • Repository: DirectoryEntryRepository (JPA data access)              │ │
│ │  • Events: DirectoryEntryCreatedEvent, UpdatedEvent, DeletedEvent      │ │
│ │  Dependencies: shared                                                   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │ Events                               │
│                                      ▼                                       │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │  Media Module (com.nosilha.core.media)                                 │ │
│ │  • API: MediaController (file upload endpoints)                        │ │
│ │  • Service: MediaService (GCS, AI processing, event listeners)         │ │
│ │  • Repository: FirestoreMediaRepository (metadata storage)             │ │
│ │  • Events: MediaUploadedEvent, MediaProcessedEvent                     │ │
│ │  • Listeners: @ApplicationModuleListener for DirectoryEntryCreated     │ │
│ │  Dependencies: shared                                                   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │  Auth Module (com.nosilha.core.auth)                                   │ │
│ │  • API: AuthController (login, logout, token refresh)                  │ │
│ │  • Security: JwtAuthenticationFilter, SecurityConfig                   │ │
│ │  • Service: JwtAuthenticationService, UserService                      │ │
│ │  • Events: UserLoggedInEvent, UserLoggedOutEvent                       │ │
│ │  Dependencies: shared                                                   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Benefits:**
- **Enforced Module Boundaries**: ModularityTests.kt verifies zero circular dependencies
- **Independent Evolution**: Modules evolve independently via event-driven communication
- **Better Testability**: Modules tested in isolation with Spring Modulith test support
- **Auto-Generated Documentation**: PlantUML diagrams generated in build/modulith/
- **Event-Driven Communication**: @ApplicationModuleListener for async module interactions

**Verification:**
- **Tests**: `backend/src/test/kotlin/com/nosilha/core/ModularityTests.kt`
- **CI/CD**: Module boundary verification in backend CI workflow
- **Dependencies**: Spring Modulith 1.2.5 configured in `build.gradle.kts`

#### Frontend: State Management Architecture

**Architecture**: Centralized state management with Zustand, TanStack Query, and Zod validation

```
Frontend State Management: Zustand + TanStack Query + Zod
┌───────────────────────────────────────────────────────────────────────────┐
│                 Modern State Management Architecture                      │
├───────────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │  Zustand Stores (Client State) - src/stores/                         │ │
│ │  ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │  │ authStore.ts                                                    │ │ │
│ │  │  • State: user, session, isLoading                              │ │ │
│ │  │  • Actions: setUser, setSession, logout                         │ │ │
│ │  │  • Persistence: LocalStorage via zustand/persist                │ │ │
│ │  │  • DevTools: Redux DevTools integration                         │ │ │
│ │  ├─────────────────────────────────────────────────────────────────┤ │ │
│ │  │ uiStore.ts                                                      │ │ │
│ │  │  • State: theme (light/dark), activeModal, filterPanelOpen      │ │ │
│ │  │  • Actions: toggleTheme, openModal, closeModal                  │ │ │
│ │  │  • Persistence: LocalStorage (theme preference)                 │ │ │
│ │  ├─────────────────────────────────────────────────────────────────┤ │ │
│ │  │ filterStore.ts                                                  │ │ │
│ │  │  • State: searchQuery, selectedCategory, selectedLocation       │ │ │
│ │  │  • Actions: setSearch, setCategory, setLocation, clearFilters   │ │ │
│ │  │  • Sync: URL query parameters for shareable views               │ │ │
│ │  └─────────────────────────────────────────────────────────────────┘ │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │  TanStack Query Hooks (Server State) - src/hooks/queries/            │ │
│ │  ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │  │ useDirectoryEntries.ts: ['directory', category] | 5min stale    │ │ │
│ │  │ useDirectoryEntry.ts: ['directory', 'entry', slug] | 10min      │ │ │
│ │  │ useUserProfile.ts: ['user', 'profile', userId] | 5min           │ │ │
│ │  │ useMediaMetadata.ts: ['media', 'metadata', entryId] | 15min     │ │ │
│ │  ├─────────────────────────────────────────────────────────────────┤ │ │
│ │  │ Features: Automatic caching, background refetching,             │ │ │
│ │  │           optimistic updates, cache invalidation                │ │ │
│ │  └─────────────────────────────────────────────────────────────────┘ │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │  Zod Schemas (Runtime Validation) - src/schemas/                     │ │
│ │  ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │  │ directoryEntrySchema.ts: Directory entry validation with STI    │ │ │
│ │  │ authSchema.ts: Login/signup form validation                     │ │ │
│ │  │ filterSchema.ts: Search parameter validation                    │ │ │
│ │  │ userProfileSchema.ts: User profile data validation              │ │ │
│ │  │ mediaMetadataSchema.ts: Media metadata validation               │ │ │
│ │  ├─────────────────────────────────────────────────────────────────┤ │ │
│ │  │ Features: TypeScript type inference, runtime safety,            │ │ │
│ │  │           React Hook Form integration via zodResolver           │ │ │
│ │  └─────────────────────────────────────────────────────────────────┘ │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
```

**Implementation Details:**
- **Zustand for Client State**: Theme preferences, UI state, authentication state, filter selections
- **TanStack Query for Server State**: Directory entries, media metadata, user profiles with smart caching
- **Zod for Runtime Validation**: Type-safe forms, API requests/responses, data parsing with TypeScript inference
- **TypeScript Integration**: Fully typed stores, queries, and schemas for compile-time safety
- **DevTools Support**: Redux DevTools (Zustand) and React Query DevTools for debugging
- **Component Migration**: MapFilterControl, InteractiveMap, LoginForm, ThemeToggle use centralized state

**Benefits:**
- **Eliminated Prop Drilling**: Migrated components use Zustand stores directly
- **Automatic Caching**: TanStack Query handles caching, invalidation, and background updates
- **Better Performance**: Selective re-renders via Zustand subscriptions
- **Developer Experience**: Clear separation between client and server state

**Verification:**
- **Stores**: `frontend/src/stores/{authStore,uiStore,filterStore}.ts`
- **Hooks**: `frontend/src/hooks/queries/{useDirectoryEntries,useDirectoryEntry,useUserProfile,useMediaMetadata}.ts`
- **Schemas**: `frontend/src/schemas/{authSchema,directoryEntrySchema,filterSchema,userProfileSchema,mediaMetadataSchema}.ts`
- **Tests**: `frontend/tests/unit/stores/` and `frontend/tests/unit/hooks/`

#### Testing Infrastructure

**Architecture**: Comprehensive testing across all layers with Playwright, Vitest, and Storybook

```
Testing Infrastructure: Comprehensive Multi-Layer Testing
┌───────────────────────────────────────────────────────────────────────────┐
│                    Complete Testing Architecture                          │
├───────────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │  Playwright (E2E Testing) - tests/e2e/                               │ │
│ │  ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │  │ Configuration: playwright.config.ts                             │ │ │
│ │  │  • Base URL: http://localhost:3000                              │ │ │
│ │  │  • Browsers: Chromium, Mobile Chrome                            │ │ │
│ │  │  • Retries: 2 in CI, 0 locally                                  │ │ │
│ │  │  • Execution: <5 minutes target (FR-001)                        │ │ │
│ │  ├─────────────────────────────────────────────────────────────────┤ │ │
│ │  │ Test Files (6 E2E tests):                                       │ │ │
│ │  │  • auth-login.spec.ts: User authentication flow                 │ │ │
│ │  │  • auth-logout.spec.ts: Session cleanup                         │ │ │
│ │  │  • directory-browsing.spec.ts: Server-rendered content          │ │ │
│ │  │  • directory-filtering.spec.ts: Client-side filtering           │ │ │
│ │  │  • content-creation.spec.ts: Admin form validation              │ │ │
│ │  │  • map-interaction.spec.ts: Mapbox GL integration               │ │ │
│ │  └─────────────────────────────────────────────────────────────────┘ │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │  Vitest (Unit Testing) - tests/unit/                                 │ │
│ │  ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │  │ Configuration: vitest.config.ts                                 │ │ │
│ │  │  • Environment: jsdom for React components                      │ │ │
│ │  │  • Coverage Provider: v8                                        │ │ │
│ │  │  • Thresholds: 70% (lines, functions, branches, statements)    │ │ │
│ │  │  • Projects: unit tests + Storybook integration tests           │ │ │
│ │  ├─────────────────────────────────────────────────────────────────┤ │ │
│ │  │ Test Files (4 unit tests):                                      │ │ │
│ │  │  • stores/authStore.test.ts: Client state management            │ │ │
│ │  │  • stores/uiStore.test.ts: UI state transitions                 │ │ │
│ │  │  • stores/filterStore.test.ts: Filter state with URL sync       │ │ │
│ │  │  • hooks/useDirectoryEntries.test.tsx: Server state caching     │ │ │
│ │  └─────────────────────────────────────────────────────────────────┘ │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │  Storybook 9 (Component Documentation) - src/stories/                │ │
│ │  ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │  │ Configuration: .storybook/main.ts                               │ │ │
│ │  │  • Framework: @storybook/nextjs (Next.js 16 support)            │ │ │
│ │  │  • Addons: chromatic, docs, a11y, vitest                        │ │ │
│ │  │  • Deployment: GitHub Pages (automated)                         │ │ │
│ │  ├─────────────────────────────────────────────────────────────────┤ │ │
│ │  │ Story Files (5 component stories):                              │ │ │
│ │  │  • CatalystButton.stories.tsx: Design system button variants    │ │ │
│ │  │  • DirectoryCard.stories.tsx: Business listing card variants    │ │ │
│ │  │  • PageHeader.stories.tsx: Page navigation patterns             │ │ │
│ │  │  • PhotoGalleryFilter.stories.tsx: Gallery filtering UI         │ │ │
│ │  │  • ThemeToggle.stories.tsx: Dark/light mode switching           │ │ │
│ │  └─────────────────────────────────────────────────────────────────┘ │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
```

**Implementation Details:**
- **Playwright**: 6 E2E tests covering critical user flows (authentication, browsing, filtering, map, content creation)
- **Vitest**: 4 unit tests with >70% coverage threshold enforcement via vitest.config.ts
- **Storybook**: 5 component stories with auto-generated documentation (target: 20+ components ongoing)
- **CI Integration**: Automated E2E and unit tests in GitHub Actions workflows
- **Contract Tests**: 6 contract tests validating Playwright execution time, Vitest coverage, Zustand stores, TanStack Query hooks, Zod schemas, Spring Modulith boundaries

**Benefits:**
- **Confidence in Changes**: E2E tests catch regressions before deployment
- **Living Documentation**: Storybook provides interactive component catalog
- **Fast Feedback**: Unit tests execute <2 min, E2E tests <5 min (FR-001)
- **Quality Gates**: 70% coverage threshold blocks low-quality PRs (FR-002)

**Verification:**
- **Playwright Config**: `frontend/playwright.config.ts`
- **Vitest Config**: `frontend/vitest.config.ts` (lines 36-41 for thresholds)
- **Storybook Config**: `frontend/.storybook/main.ts`
- **E2E Tests**: `frontend/tests/e2e/*.spec.ts` (6 test files)
- **Unit Tests**: `frontend/tests/unit/**/*.test.ts*` (4 test files)
- **Stories**: `frontend/src/stories/*.stories.tsx` (5 story files)

### Long-Term Planned Enhancements

1. **Microservices Evolution**
   - Extract AI processing to dedicated service
   - Separate user management service
   - Event-driven architecture with Pub/Sub

2. **Performance Improvements**
   - Database read replicas
   - Redis caching layer
   - CDN optimization
   - Image optimization service

3. **Feature Additions**
   - Real-time chat/messaging
   - Advanced search with Elasticsearch
   - Mobile app with shared API
   - Analytics and reporting dashboard

4. **Scalability Enhancements**
   - Multi-region deployment
   - Database sharding strategy
   - API rate limiting
   - Cost optimization automation

---

This architecture documentation provides a comprehensive overview of the Nos Ilha platform design. For specific implementation details, refer to:

- **Development Guide**: [`CLAUDE.md`](../CLAUDE.md)
- **CI/CD Pipeline**: [`CI_CD_PIPELINE.md`](CI_CD_PIPELINE.md)
- **API Documentation**: [`API_REFERENCE.md`](API_REFERENCE.md)
- **Design System**: [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md)