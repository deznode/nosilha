# Nos Ilha Architecture Documentation

This document provides a comprehensive technical overview of the Nos Ilha platform architecture, component interactions, and system design decisions.

## 🏗️ System Overview

Nos Ilha is a modern, full-stack web application built with a microservices-inspired architecture, featuring:

- **Frontend**: Next.js 15 with React 19 (Server Components + Client Components)
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
- **Middleware**: `middleware.ts` protects routes and redirects unauthorized users
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

### Frontend Architecture (Next.js 15)

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
│   └── middleware.ts                # Route protection
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

### Backend Architecture (Spring Boot + Kotlin)

```
backend/
├── src/main/kotlin/com/nosilha/
│   ├── core/
│   │   ├── domain/                  # Domain entities
│   │   │   ├── DirectoryEntry.kt    # Base entity (single-table inheritance)
│   │   │   ├── Restaurant.kt        # Restaurant-specific fields
│   │   │   ├── Hotel.kt            # Hotel-specific fields
│   │   │   └── Landmark.kt         # Landmark-specific fields
│   │   ├── dto/                    # Data transfer objects
│   │   │   ├── DirectoryEntryDto.kt # API response format
│   │   │   └── CreateEntryDto.kt   # API request format
│   │   ├── repository/             # Data access layer
│   │   │   ├── DirectoryEntryRepository.kt
│   │   │   ├── RestaurantRepository.kt
│   │   │   └── HotelRepository.kt
│   │   ├── service/                # Business logic layer
│   │   │   ├── DirectoryService.kt # CRUD operations
│   │   │   ├── AuthService.kt      # JWT validation
│   │   │   ├── MediaService.kt     # GCS operations
│   │   │   └── AIService.kt        # Vision API integration
│   │   └── controller/             # Web layer
│   │       ├── DirectoryController.kt # REST endpoints
│   │       ├── AuthController.kt   # Authentication endpoints
│   │       └── MediaController.kt  # File upload endpoints
│   ├── config/                     # Configuration classes
│   │   ├── SecurityConfig.kt       # JWT security configuration
│   │   ├── CorsConfig.kt          # Cross-origin request setup
│   │   └── GcpConfig.kt           # Google Cloud configuration
│   └── NosilhaApplication.kt       # Spring Boot main class
├── src/main/resources/
│   ├── application.yml             # Production configuration
│   ├── application-local.yml       # Development configuration
│   └── db/migration/               # Flyway database migrations
│       └── V1__Create_directory_entries.sql
└── build.gradle.kts                # Build configuration
```

**Key Architectural Decisions:**

1. **Single Table Inheritance**: All directory entries in one table with discriminator column
2. **Clean Architecture**: Clear separation between controllers, services, and repositories
3. **Domain-Driven Design**: Rich domain models with behavior, not just data
4. **JWT Authentication**: Stateless authentication with Supabase token validation
5. **Actuator Integration**: Health checks and metrics for production monitoring

#### Backend Service Layer Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API (Spring Boot)                   │
├─────────────────────────────────────────────────────────────────┤
│  Controllers (Web Layer)                                        │
│  ├─ DirectoryController.kt (/api/v1/directory/*)               │
│  ├─ AuthController.kt      (/api/v1/auth/*)                    │
│  └─ MediaController.kt     (/api/v1/media/*)                   │
├─────────────────────────────────────────────────────────────────┤
│  Services (Business Logic)                                      │
│  ├─ DirectoryService.kt    (CRUD operations)                   │
│  ├─ AuthService.kt         (JWT validation)                    │
│  ├─ MediaService.kt        (GCS operations)                    │
│  └─ AIService.kt           (Vision API integration)            │
├─────────────────────────────────────────────────────────────────┤
│  Repositories (Data Access)                                     │
│  ├─ DirectoryEntryRepository.kt                                 │
│  ├─ RestaurantRepository.kt                                     │
│  └─ HotelRepository.kt                                          │
├─────────────────────────────────────────────────────────────────┤
│  Domain Entities                                                │
│  ├─ DirectoryEntry.kt (Base class)                             │
│  ├─ Restaurant.kt (@DiscriminatorValue("RESTAURANT"))           │
│  ├─ Hotel.kt (@DiscriminatorValue("HOTEL"))                     │
│  └─ Landmark.kt (@DiscriminatorValue("LANDMARK"))               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │             directory_entries table                     │   │
│  │  ┌─────────┬──────────┬──────────┬─────────────────┐   │   │
│  │  │   id    │   name   │category  │ type-specific   │   │   │
│  │  │ (UUID)  │ (string) │(ENUM)    │    fields       │   │   │
│  │  ├─────────┼──────────┼──────────┼─────────────────┤   │   │
│  │  │abc-123  │Casa Nova │RESTAURANT│cuisine, hours   │   │   │
│  │  │def-456  │Hotel Mar │HOTEL     │amenities        │   │   │
│  │  │ghi-789  │Lighthouse│LANDMARK  │historical_info  │   │   │
│  │  └─────────┴──────────┴──────────┴─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

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

### Near-Term Architectural Evolution

The following architectural improvements are actively planned for implementation to enhance modularity, maintainability, and developer experience:

#### Backend: Spring Modulith Integration

**Current State**: Monolithic Spring Boot application with layered architecture
**Target State**: Modular monolith with well-defined module boundaries using Spring Modulith

```
Current Backend Architecture           →    Planned Spring Modulith Architecture
┌─────────────────────────┐                 ┌─────────────────────────────────────┐
│   Monolithic Backend    │                 │      Modular Backend                │
│   (Spring Boot)         │                 │      (Spring Modulith)              │
├─────────────────────────┤                 ├─────────────────────────────────────┤
│ • Controllers           │                 │ ┌─────────────────────────────────┐ │
│ • Services              │                 │ │  Directory Module               │ │
│ • Repositories          │                 │ │  • DirectoryController          │ │
│ • Domain Entities       │                 │ │  • DirectoryService             │ │
│ • All in one package    │                 │ │  • DirectoryRepository          │ │
└─────────────────────────┘                 │ └─────────────────────────────────┘ │
                                            │ ┌─────────────────────────────────┐ │
                                            │ │  Media Module                   │ │
                                            │ │  • MediaController              │ │
                                            │ │  • MediaService                 │ │
                                            │ │  • AIService                    │ │
                                            │ └─────────────────────────────────┘ │
                                            │ ┌─────────────────────────────────┐ │
                                            │ │  Auth Module                    │ │
                                            │ │  • AuthController               │ │
                                            │ │  • AuthService                  │ │
                                            │ │  • JwtAuthenticationFilter      │ │
                                            │ └─────────────────────────────────┘ │
                                            └─────────────────────────────────────┘
```

**Benefits:**
- **Enforced Module Boundaries**: Prevent unwanted dependencies between modules
- **Independent Evolution**: Modules can evolve independently within clear boundaries
- **Better Testability**: Test modules in isolation with module-specific test slices
- **Documentation**: Auto-generated module documentation and dependency visualization
- **Event-Driven Communication**: Asynchronous module communication via application events

#### Frontend: State Management Architecture

**Current State**: Component-level state with prop drilling and direct API calls
**Target State**: Centralized state management with Zustand and TanStack Query

```
Current State Management              →    Planned State Management Architecture
┌─────────────────────────┐                 ┌─────────────────────────────────────┐
│   Component State       │                 │      Zustand + TanStack Query       │
├─────────────────────────┤                 ├─────────────────────────────────────┤
│ • useState hooks        │                 │ ┌─────────────────────────────────┐ │
│ • Prop drilling         │                 │ │  Zustand Stores                 │ │
│ • Direct API calls      │                 │ │  • authStore (user, session)    │ │
│ • No global state       │                 │ │  • uiStore (theme, modals)      │ │
│ • Manual caching        │                 │ │  • filterStore (search params)  │ │
└─────────────────────────┘                 │ └─────────────────────────────────┘ │
                                            │ ┌─────────────────────────────────┐ │
                                            │ │  TanStack Query                 │ │
                                            │ │  • Automatic caching            │ │
                                            │ │  • Background refetching        │ │
                                            │ │  • Optimistic updates           │ │
                                            │ │  • Infinite queries             │ │
                                            │ └─────────────────────────────────┘ │
                                            └─────────────────────────────────────┘
```

**Implementation Details:**
- **Zustand for Client State**: Theme preferences, UI state, authentication state, filter selections
- **TanStack Query for Server State**: Directory entries, media metadata, user profiles, API data caching
- **TypeScript Integration**: Fully typed stores and queries for compile-time safety
- **DevTools Support**: Redux DevTools (Zustand) and React Query DevTools for debugging

**Benefits:**
- **Simplified State Management**: Minimal boilerplate with excellent TypeScript support
- **Automatic Caching**: TanStack Query handles caching, invalidation, and background updates
- **Better Performance**: Reduced re-renders and optimized data fetching
- **Developer Experience**: Clear separation between client and server state

#### Testing Infrastructure

**Current State**: Limited testing with basic ESLint validation
**Target State**: Comprehensive testing across all layers

```
Current Testing                       →    Planned Testing Infrastructure
┌─────────────────────────┐                 ┌─────────────────────────────────────┐
│   Minimal Testing       │                 │      Comprehensive Testing          │
├─────────────────────────┤                 ├─────────────────────────────────────┤
│ • ESLint                │                 │ ┌─────────────────────────────────┐ │
│ • TypeScript checking   │                 │ │  Playwright (E2E Testing)       │ │
│ • Build validation      │                 │ │  • Cross-browser testing        │ │
│ • No unit tests         │                 │ │  • User flow validation         │ │
│ • No E2E tests          │                 │ │  • Visual regression tests      │ │
└─────────────────────────┘                 │ │  • Accessibility testing        │ │
                                            │ └─────────────────────────────────┘ │
                                            │ ┌─────────────────────────────────┐ │
                                            │ │  Vitest (Unit Testing)          │ │
                                            │ │  • Component tests              │ │
                                            │ │  • Hook tests                   │ │
                                            │ │  • Utility function tests       │ │
                                            │ │  • Fast, native TypeScript      │ │
                                            │ └─────────────────────────────────┘ │
                                            │ ┌─────────────────────────────────┐ │
                                            │ │  Storybook (Component Docs)     │ │
                                            │ │  • Component library catalog    │ │
                                            │ │  • Visual testing               │ │
                                            │ │  • Design system documentation  │ │
                                            │ │  • Interaction testing          │ │
                                            │ └─────────────────────────────────┘ │
                                            └─────────────────────────────────────┘
```

**Testing Strategy:**
- **Playwright**: Critical user flows (authentication, directory browsing, content creation)
- **Vitest**: Unit tests for components, hooks, utilities, and business logic
- **Storybook**: Component documentation, visual regression, and isolated development
- **CI Integration**: Automated testing in GitHub Actions before deployment

**Benefits:**
- **Confidence in Changes**: Comprehensive test coverage reduces regression risk
- **Better Documentation**: Storybook provides living documentation for components
- **Faster Development**: Isolated component development and visual testing
- **Quality Gates**: Automated testing prevents broken code from reaching production

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