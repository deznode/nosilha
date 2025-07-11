# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nos Ilha is a community-driven tourism and cultural heritage platform for Brava Island, Cape Verde. This volunteer-supported, open-source project is a full-stack web application featuring an interactive directory of businesses, landmarks, and cultural sites with mapping functionality and AI-enhanced media management.

### System Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │  Infrastructure │
│   (Next.js)     │    │ (Spring Boot)   │    │     (GCP)       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • React 19      │◄──►│ • Kotlin/JVM    │◄──►│ • Cloud Run     │
│ • App Router    │    │ • PostgreSQL    │    │ • Artifact Reg. │
│ • Tailwind CSS  │    │ • JWT Auth      │    │ • Cloud Storage │
│ • ISR Caching   │    │ • Domain-Driven │    │ • Secret Mgr.   │
│ • Supabase Auth │    │ • RESTful APIs  │    │ • IAM Security  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
           │                      │                      │
           └──────────────────────┼──────────────────────┘
                                  │
                    ┌─────────────────┐
                    │    CI/CD        │
                    │ (GitHub Actions)│
                    ├─────────────────┤
                    │ • Modular Flows │
                    │ • Security Scan │
                    │ • Auto Deploy   │
                    │ • Health Checks │
                    └─────────────────┘
```

## Architecture

This is a **full-stack application** with four main components:

- **Frontend**: Next.js 15 (App Router) with React 19, TypeScript, and Tailwind CSS
- **Backend**: Spring Boot 3.4.7 with Kotlin, PostgreSQL (primary), and Google Cloud integrations
- **Infrastructure**: Docker Compose for local development, Terraform for cloud deployment
- **CI/CD**: Modular GitHub Actions workflows with automated security scanning and deployment

### Component Integration Flows

#### 1. User Authentication Flow
```
User → Frontend → Supabase Auth → JWT Token → Backend Validation → Database Access
  ↓                    ↓              ↓              ↓                 ↓
Login      Generate      Access       Verify         Authorized
Request    JWT Token     Protected    JWT Claims     Operations
                         Resources
```

#### 2. Content Management Flow
```
Admin UI → Backend API → PostgreSQL → Cache Invalidation → Frontend Update
   ↓           ↓            ↓              ↓                    ↓
Create/       Process      Store          Clear ISR            Display
Update        Business     Directory      Cache Tags           Updated
Content       Logic        Entry                               Content
```

#### 3. Media Processing Flow
```
File Upload → GCS Storage → Cloud Vision API → Metadata → Firestore → Frontend
     ↓            ↓              ↓               ↓           ↓          ↓
  Validate    Store Asset    AI Analysis     Extract     Store      Display
  & Upload    Securely      (OCR, Tags)     Features    Metadata   Enhanced
                                                                    Content
```

#### 4. CI/CD Deployment Flow
```
Git Push → GitHub Actions → Security Scan → Build → Deploy → Health Check
    ↓           ↓              ↓            ↓        ↓         ↓
 Trigger    Path-based      Trivy,        Docker   Cloud    Validate
 Service    Workflow        detekt,       Images   Run      Service
 Changes    Selection       ESLint                         Health
```

## Common Development Commands

### Frontend (Next.js)
```bash
cd frontend
npm install              # Install dependencies
npm run dev             # Start development server with Turbopack
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
```

### Backend (Spring Boot + Kotlin)
```bash
cd backend
./gradlew bootRun       # Start development server
./gradlew build         # Build JAR
./gradlew test          # Run tests
./gradlew bootBuildImage # Build Docker image
```

### Infrastructure (Docker Compose)
```bash
cd infrastructure/docker
docker-compose up -d    # Start PostgreSQL, Firestore & GCS emulators
docker-compose down     # Stop all services
```

## Key Architecture Patterns

### Backend (Spring Boot + Kotlin)
- **Domain-Driven Design**: Domain entities, DTOs, and services are clearly separated
- **Single Table Inheritance**: `DirectoryEntry` is the base class for `Restaurant`, `Hotel`, `Landmark`, etc.
- **Clean Architecture**: Controllers are lightweight and return DTOs; business logic lives in services
- **API Versioning**: All REST endpoints are prefixed with `/api/v1/`
- **Authentication**: JWT-based authentication with Supabase token validation
- **Database Strategy**: PostgreSQL primary with Flyway migrations, connection pooling via HikariCP
- **Security**: CORS configuration, input validation, and role-based access control

#### Backend Service Architecture
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

### Frontend (Next.js App Router)
- **Route Groups**: Uses parentheses for logical organization `(auth)`, `(main)`, `(admin)` without affecting URLs
- **Server Components First**: Prioritizes React Server Components for performance; Client Components only when interactivity is needed
- **Dynamic Routing**: 
  - `/directory/[category]` - Category listing pages
  - `/directory/entry/[slug]` - Individual business/landmark pages
- **Mobile-First Design**: All components are responsive and mobile-optimized
- **Standalone Output**: Configured for containerized deployment with `output: "standalone"` in `next.config.ts`
- **Authentication**: Supabase Auth provider with JWT token management and auto-refresh
- **Caching Strategy**: ISR (Incremental Static Regeneration) for content, no-cache for interactive features
- **API Integration**: Centralized API client with error handling and fallback to mock data

#### Frontend Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 15)                       │
├─────────────────────────────────────────────────────────────────┤
│  App Router Structure                                           │
│  app/                                                           │
│  ├─ layout.tsx              (Root layout + providers)          │
│  ├─ (auth)/                 (Authentication pages)             │
│  │  ├─ login/page.tsx                                           │
│  │  └─ signup/page.tsx                                          │
│  ├─ (main)/                 (Public pages)                     │
│  │  ├─ page.tsx             (Homepage)                          │
│  │  ├─ directory/[category]/page.tsx                            │
│  │  ├─ directory/entry/[slug]/page.tsx                          │
│  │  └─ map/page.tsx                                             │
│  └─ (admin)/                (Protected admin pages)            │
│     └─ add-entry/page.tsx                                       │
├─────────────────────────────────────────────────────────────────┤
│  Components Architecture                                        │
│  components/                                                    │
│  ├─ providers/              (Context providers)                │
│  │  └─ auth-provider.tsx    (Supabase auth state)              │
│  ├─ catalyst-ui/            (Design system components)         │
│  │  ├─ button.tsx, input.tsx, etc.                             │
│  │  └─ auth-layout.tsx                                          │
│  ├─ ui/                     (Custom UI components)             │
│  │  ├─ header.tsx, footer.tsx                                  │
│  │  ├─ directory-card.tsx                                       │
│  │  └─ interactive-map.tsx                                      │
│  └─ admin/                  (Admin-specific components)        │
│     └─ add-entry-form.tsx                                       │
├─────────────────────────────────────────────────────────────────┤
│  Data Fetching & State                                          │
│  lib/                                                           │
│  ├─ api.ts                  (Backend API client)               │
│  ├─ supabase-client.ts      (Auth configuration)               │
│  └─ mock-api.ts             (Fallback data)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Flow Strategy                           │
│                                                                 │
│  ISR Caching (Static-ish content):                             │
│  ┌─ getEntriesByCategory() ─► 1 hour cache ─► Directory pages  │
│  └─ getEntryBySlug() ─────► 30 min cache ─► Detail pages      │
│                                                                 │
│  Real-time (Interactive features):                             │
│  ┌─ getEntriesForMap() ───► no-cache ─────► Interactive map    │
│  └─ createDirectoryEntry() ─► revalidate ──► Admin operations  │
│                                                                 │
│  Authentication Flow:                                           │
│  User ─► Supabase Auth ─► JWT Token ─► API Requests ─► Backend │
└─────────────────────────────────────────────────────────────────┘
```

### Database Strategy
- **PostgreSQL**: Primary database for structured data (directory entries, user accounts)
- **Google Firestore**: Flexible metadata storage for AI-processed images and documents
- **Google Cloud Storage**: Media asset storage with CDN integration

#### Database Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                      Data Storage Strategy                     │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL (Primary - Structured Data)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Tables:                                                │   │
│  │  ├─ directory_entries (Single Table Inheritance)       │   │
│  │  │  ├─ Common: id, name, slug, description, town       │   │
│  │  │  ├─ Restaurant: cuisine, hours, phone_number        │   │
│  │  │  ├─ Hotel: amenities                                 │   │
│  │  │  └─ Landmark: historical_info                       │   │
│  │  ├─ flyway_schema_history (Migration tracking)        │   │
│  │  └─ [Future: users, reviews, ratings]                 │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  Google Cloud Storage (Media Assets)                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Buckets:                                               │   │
│  │  ├─ nosilha-com-media-storage-useast1                  │   │
│  │  │  ├─ images/ (Business photos, landmarks)            │   │
│  │  │  ├─ videos/ (Promotional content)                   │   │
│  │  │  └─ documents/ (Historical documents, menus)        │   │
│  │  └─ Public read access for CDN distribution            │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  Google Firestore (AI Metadata)                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Collections:                                           │   │
│  │  ├─ image_metadata/                                     │   │
│  │  │  ├─ vision_api_results (Labels, text, landmarks)    │   │
│  │  │  ├─ processing_status (Success, error states)       │   │
│  │  │  └─ extracted_features (Colors, objects, text)      │   │
│  │  └─ document_metadata/                                  │   │
│  │     ├─ ocr_results (Extracted text from documents)     │   │
│  │     └─ content_analysis (Language, sentiment)          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### AI & Media Processing
- **Google Cloud Vision API**: Automated image analysis and metadata extraction
- **AI Service**: Processes uploaded media to generate descriptions and extract features
- **Image Metadata Repository**: Firestore-based storage for AI-generated content insights

#### AI Processing Workflow
```
┌─────────────────────────────────────────────────────────────────┐
│                     AI Media Processing Flow                   │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: Media Upload                                          │
│  Frontend ─► Backend API ─► GCS Bucket                         │
│     ↓             ↓              ↓                              │
│  Validate    Authorize       Store Asset                       │
│  File Type   User Access     Securely                          │
├─────────────────────────────────────────────────────────────────┤
│  Step 2: AI Analysis (Async)                                   │
│  Backend ─► Cloud Vision API ─► Analysis Results               │
│     ↓             ↓                    ↓                       │
│  Trigger      Process Image         Extract:                   │
│  Analysis     Recognition           • Labels & Categories      │
│                                     • Text (OCR)               │
│                                     • Landmark Detection       │
│                                     • Object Recognition       │
├─────────────────────────────────────────────────────────────────┤
│  Step 3: Metadata Storage                                      │
│  Results ─► Firestore ─► Backend API ─► Frontend               │
│     ↓           ↓            ↓              ↓                  │
│  Structure   Store in     Update DB      Display Enhanced     │
│  Metadata    Collection   References     Content to Users      │
├─────────────────────────────────────────────────────────────────┤
│  AI Features Enabled:                                          │
│  • Automatic image tagging and categorization                  │
│  • Text extraction from historical documents                   │
│  • Landmark identification for tourist sites                   │
│  • Content accessibility improvements                          │
│  • Search optimization with AI-generated keywords             │
└─────────────────────────────────────────────────────────────────┘
```

## Development Environment Setup

### Prerequisites
- **Node.js 18+** and npm
- **Java 21** (for backend)
- **Docker** and Docker Compose
- **PostgreSQL** (or use Docker Compose setup)

### Local Development
1. **Start infrastructure services**:
   ```bash
   cd infrastructure/docker && docker-compose up -d
   ```

2. **Backend setup**:
   ```bash
   cd backend
   # Database will auto-migrate on startup via Flyway
   ./gradlew bootRun --args='--spring.profiles.active=local'
   ```

3. **Frontend setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Environment Configuration

### Local Development URLs
- **Frontend**: `http://localhost:3000` (Next.js development server with Turbopack)
- **Backend API**: `http://localhost:8080/api/v1/` (Spring Boot with live reload)
- **Database**: `localhost:5432` (PostgreSQL: database=`nosilha_db`, user=`nosilha`, password=`nosilha`)
- **Firestore Emulator**: `http://localhost:8081` (AI metadata storage)
- **GCS Emulator**: `http://localhost:8082` (Media file storage)

### Key Health Endpoints
- **Backend Health**: `http://localhost:8080/actuator/health`
- **Backend Metrics**: `http://localhost:8080/actuator/metrics`
- **API Directory**: `http://localhost:8080/api/v1/directory/entries`

### Production Environment
- **Cloud Platform**: Google Cloud Platform (GCP)
- **Region**: `us-east1`
- **Services**: Cloud Run (auto-scaling serverless containers)
- **Registry**: Google Artifact Registry (`us-east1-docker.pkg.dev`)
- **Authentication**: Supabase Auth with JWT tokens

### Verification Steps
```bash
# Test backend health
curl http://localhost:8080/actuator/health

# Test API endpoint
curl http://localhost:8080/api/v1/directory/entries

# Test frontend
open http://localhost:3000

# Check database connectivity
docker-compose exec postgres psql -U nosilha -d nosilha_db -c "SELECT version();"
```

## Important Code Patterns

### API Integration
- Frontend uses `/lib/api.ts` for backend communication
- All API calls should handle errors gracefully and return proper types
- Backend endpoints follow RESTful conventions with proper HTTP status codes
- Authentication flow: Frontend → Supabase Auth → JWT → Backend validation → Database

### Authentication & Security Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                     Authentication Flow                        │
├─────────────────────────────────────────────────────────────────┤
│  1. User Login                                                  │
│     Frontend (login-form.tsx) ─► Supabase Auth                │
│                                                                 │
│  2. Token Management                                            │
│     Supabase ─► JWT Token ─► AuthProvider (auth-provider.tsx)   │
│                                                                 │
│  3. API Requests                                                │
│     Frontend ─► api.ts ─► JWT Header ─► Backend API            │
│                                                                 │
│  4. Backend Validation                                          │
│     JwtAuthenticationFilter ─► Validate Token ─► Authorize     │
│                                                                 │
│  5. Protected Routes                                            │
│     middleware.ts ─► Check Auth State ─► Allow/Redirect       │
└─────────────────────────────────────────────────────────────────┘
```

### Database Access
- Use JPA repositories for database operations
- All entities extend proper base classes and use UUID primary keys
- Flyway handles database migrations in `backend/src/main/resources/db/`
- Single Table Inheritance pattern for `DirectoryEntry` and its subclasses (`Restaurant`, `Hotel`, `Landmark`, `Beach`)

### Frontend Design System & Styling

#### Design System Documentation
- **Main Documentation**: [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) - Comprehensive styling guide and component library
- **Brand Identity**: "Clean, inviting, authentic, and lush" - digital extension of Brava Island
- **Design Philosophy**: Reflects Cape Verde's natural beauty and cultural richness

#### Color Palette (Brava-Inspired)
- **Ocean Blue** (`#005A8D`): Primary brand color, navigation highlights, CTAs
- **Valley Green** (`#3E7D5A`): Secondary brand color, success states, nature elements  
- **Bougainvillea Pink** (`#D90368`): Accent color for CTAs and highlights
- **Sunny Yellow** (`#F7B801`): Warning states and cheerful accents
- **Volcanic Gray** (`#6C757D`, `#343A40`): Text and neutral elements
- **Off White** (`#F8F9FA`): Clean background color

#### Typography System
- **Headings**: Merriweather (serif) - elegant, storytelling typeface for titles
- **Body Text**: Lato (sans-serif) - clean, modern, highly readable for content
- **Font Loading**: Google Fonts with CSS variables and optimized performance

#### Component Architecture
- **Catalyst UI**: Professional component library (25+ components) in `frontend/src/components/catalyst-ui/`
  - Button, Input, Card, Dialog, Dropdown, Table, Avatar, Badge, etc.
- **Custom Components**: Project-specific implementations in `frontend/src/components/ui/`
  - DirectoryCard, PageHeader, ThemeToggle, StarRating, InteractiveMap
- **Mobile-First**: All components responsive with Tailwind breakpoints
- **Dark Mode**: Class-based theming with system preference detection

#### Key Styling Files
- `frontend/src/app/globals.css:4-28` - CSS custom properties for colors and dark mode
- `frontend/tailwind.config.ts` - Tailwind configuration with custom theme tokens  
- `frontend/src/app/layout.tsx:12-22` - Font configuration (Lato + Merriweather)
- `frontend/src/components/ui/theme-toggle.tsx:13-72` - Theme switching logic
- `frontend/src/components/catalyst-ui/button.tsx:6-158` - Button component with all variants

## Testing Strategy

### Backend Testing
```bash
# Run all tests with PostgreSQL integration
cd backend && ./gradlew test

# Run with coverage report
./gradlew test jacocoTestReport

# Run specific test class
./gradlew test --tests "DirectoryEntryControllerTest"

# Run linting and static analysis
./gradlew detekt
```
**Configuration**: Tests use PostgreSQL service in CI/CD workflows
**Coverage**: Jacoco reports generated for code coverage analysis

### Frontend Testing
```bash
# Type checking
cd frontend && npx tsc --noEmit

# Linting
npm run lint

# Build validation (tests compilation)
npm run build

# Bundle size analysis
npx bundlesize
```
**Configuration**: ESLint with TypeScript, bundle size monitoring in PRs
**Future**: Unit testing framework to be added

### Integration Testing
```bash
# Cross-service integration tests
# Workflow: .github/workflows/integration-ci.yml
# - API endpoint validation
# - End-to-end user flows
# - Performance testing
# - Security header validation
```

### Security Testing
```bash
# Automated security scanning
# - Trivy: Container and dependency vulnerabilities
# - detekt: Kotlin static analysis
# - ESLint: TypeScript security rules
# - tfsec: Terraform security validation
```

## CI/CD Pipeline Architecture

The project uses a **modular CI/CD architecture** with service-specific workflows that maintain comprehensive security and testing while enabling independent deployment cycles.

### Workflow Overview
- **Backend CI/CD** (`.github/workflows/backend-ci.yml`) - Spring Boot/Kotlin service pipeline
- **Frontend CI/CD** (`.github/workflows/frontend-ci.yml`) - Next.js/React application pipeline  
- **Infrastructure CI/CD** (`.github/workflows/infrastructure-ci.yml`) - Terraform infrastructure management
- **PR Validation** (`.github/workflows/pr-validation.yml`) - Consolidated PR validation and reporting
- **Integration Tests** (`.github/workflows/integration-ci.yml`) - Cross-service integration and E2E testing

### Key Features
- **Path-based Triggering**: Workflows only run when relevant files change
- **Comprehensive Security**: Trivy vulnerability scanning, tfsec, detekt, ESLint with SARIF reporting
- **Quality Gates**: Automated testing, linting, type checking, and bundle size analysis
- **Reusable Workflows**: Service workflows can be called from PR validation for consolidated testing
- **Smart Deployment**: Direct deployment to production from main branch
- **Health Monitoring**: Automated health checks and deployment validation

#### CI/CD Flow Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                         GitHub Actions CI/CD                      │
├─────────────────────────────────────────────────────────────────┤
│  Trigger: Push to main / Pull Request                             │
│                               │                                  │
│                               ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    Path Detection                          │  │
│  │   (dorny/paths-filter determines changed components)         │  │
│  └────────────────────┬──────────────────────────────────────────┘  │
│                               │                                  │
│       ┌───────────────────┼─────────────────────────┐       │
│       │                                                      │       │
│       ▼                    ▼                    ▼                │
│  ┌───────────┐  ┌───────────┐  ┌─────────────────┐       │
│  │  Backend   │  │  Frontend  │  │  Infrastructure │       │
│  │   CI/CD    │  │   CI/CD    │  │      CI/CD       │       │
│  ├───────────┤  ├───────────┤  ├─────────────────┤       │
│  │• Security  │  │• Security  │  │• tfsec Scan      │       │
│  │• Tests     │  │• Lint/Type │  │• Terraform        │       │
│  │• Docker    │  │• Bundle    │  │  Validation      │       │
│  │• Deploy    │  │• Docker    │  │• Infrastructure   │       │
│  │• Health    │  │• Deploy    │  │  Deployment      │       │
│  └───────────┘  └───────────┘  └─────────────────┘       │
│       │                    │                    │                │
│       └───────────────────┼─────────────────────────┘       │
│                               │                                  │
│                               ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    Artifact Registry                        │  │
│  │    ┌────────────────────────────────────────────────┐    │  │
│  │    │ nosilha-backend/nosilha-core-api:latest       │    │  │
│  │    │ nosilha-frontend/nosilha-web-ui:latest        │    │  │
│  │    └────────────────────────────────────────────────┘    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                               │                                  │
│                               ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  Cloud Run Services                         │  │
│  │    ┌──────────────────────┐  ┌───────────────────────┐    │  │
│  │    │ nosilha-backend-api  │  │ nosilha-frontend     │    │  │
│  │    │ (Spring Boot)        │  │ (Next.js)            │    │  │
│  │    │ /actuator/health     │  │ Public web app       │    │  │
│  │    └──────────────────────┘  └───────────────────────┘    │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Security & Compliance
- **Vulnerability Scanning**: Trivy scans for dependencies and container vulnerabilities
- **Static Analysis**: detekt (Kotlin), ESLint (TypeScript), tfsec (Terraform)
- **SARIF Integration**: Security findings uploaded to GitHub Security tab (when Advanced Security is enabled)
- **Graceful Degradation**: Workflows continue even if SARIF upload fails (e.g., repositories without Advanced Security)
- **Dependency Review**: Automated dependency vulnerability and license checking
- **Advanced Security Ready**: Workflows configured for when Advanced Security is enabled

#### Security Scanning Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                    Integrated Security Scanning                    │
├─────────────────────────────────────────────────────────────────┤
│  Every PR & Push to Main:                                        │
│                                                                 │
│  Backend Security:                 Frontend Security:           │
│  ┌───────────────────────┐  ┌───────────────────────┐  │
│  │ Trivy (Dependencies)   │  │ Trivy (Dependencies)   │  │
│  │ detekt (Kotlin)        │  │ ESLint (TypeScript)    │  │
│  │ Docker Scan            │  │ Docker Scan            │  │
│  │ SARIF Upload           │  │ SARIF Upload           │  │
│  └───────────────────────┘  └───────────────────────┘  │
│                                                                 │
│  Infrastructure Security:          Global Security:             │
│  ┌───────────────────────┐  ┌───────────────────────┐  │
│  │ tfsec (Terraform)      │  │ Repository Scan        │  │
│  │ Resource Validation    │  │ Dependency Review      │  │
│  │ IAM Policy Review      │  │ License Compliance     │  │
│  │ SARIF Upload           │  │ SARIF Upload           │  │
│  └───────────────────────┘  └───────────────────────┘  │
│                                                                 │
│                              │                                │
│                              ▼                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                GitHub Security Tab                        │  │
│  │  - Vulnerability alerts and remediation guidance         │  │
│  │  - Security findings from all SARIF uploads             │  │
│  │  - Dependency vulnerability tracking                     │  │
│  │  - Automated security notifications                      │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Testing Strategy
- **Backend**: JUnit tests with PostgreSQL integration, Jacoco coverage reporting
- **Frontend**: ESLint, TypeScript checking, build validation, bundle size monitoring
- **Infrastructure**: Terraform validation, security scanning, plan review
- **Integration**: API integration tests, E2E testing, performance validation
- **Security Integration**: Security headers validation, deployment health checks

### Deployment Environment
- **Production**: Deployed from `main` branch to production Cloud Run services  
- **Registry**: Google Artifact Registry (us-east1-docker.pkg.dev)
- **Region**: us-east1 for Cloud Run deployments

### Required GitHub Secrets
- `GCP_SA_KEY`: Google Cloud service account key for authentication
- `GCP_PROJECT_ID`: Google Cloud project ID
- `PRODUCTION_API_URL`: Backend API URL for production environment
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`: Mapbox API access token for map functionality
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL for authentication and database
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous access key for client-side authentication

### Workflow Triggers
- **Push to main**: Full CI/CD pipeline with production deployment
- **Pull Requests**: Comprehensive validation without deployment
- **Manual Dispatch**: On-demand production deployment

## Cloud Deployment
- **Google Cloud Platform** with Terraform configurations in `/infrastructure/terraform/`
- **Cloud Run** for both backend and frontend deployment
- **Google Artifact Registry** for container image storage (us-east1-docker.pkg.dev)
- **Google Cloud Storage** for media asset storage
- **Google Secret Manager** for secure configuration management

## Key Files to Know

### Frontend Architecture Files
- `frontend/src/app/layout.tsx` - Root layout with global providers and font configuration
- `frontend/src/lib/api.ts` - API client with authentication, caching, and error handling
- `frontend/src/components/providers/auth-provider.tsx` - Supabase authentication context
- `frontend/src/middleware.ts` - Route protection and authentication checks
- `frontend/next.config.ts` - Next.js configuration with standalone output for Cloud Run
- `frontend/Dockerfile` - Multi-stage Docker build optimized for production

### Backend Architecture Files
- `backend/src/main/kotlin/com/nosilha/core/domain/DirectoryEntry.kt` - Core domain model with single-table inheritance
- `backend/src/main/resources/application.yml` - Production configuration with environment variable binding
- `backend/src/main/resources/application-local.yml` - Local development configuration
- `backend/build.gradle.kts` - Kotlin/Spring Boot build with Docker image generation
- `backend/src/main/resources/db/migration/` - Flyway database migration scripts

### Infrastructure & Deployment Files
- `infrastructure/terraform/main.tf` - Core GCP infrastructure (GCS, Artifact Registry, state management)
- `infrastructure/terraform/cloudrun.tf` - Cloud Run services with environment configuration
- `infrastructure/terraform/iam.tf` - Service accounts, IAM roles, and security permissions
- `infrastructure/docker/docker-compose.yml` - Local development environment setup
- `scripts/deploy.sh` - Manual deployment script for production

### CI/CD & Security Files
- `.github/workflows/pr-validation.yml` - Consolidated PR validation with path-based triggering
- `.github/workflows/backend-ci.yml` - Backend build, test, security scan, and deployment
- `.github/workflows/frontend-ci.yml` - Frontend build, lint, bundle analysis, and deployment
- `.github/workflows/infrastructure-ci.yml` - Terraform validation, planning, and infrastructure deployment
- `.github/workflows/integration-ci.yml` - Cross-service integration and E2E testing
- `docs/SECURITY.md` - Security policy and vulnerability reporting procedures

### Documentation Files
- `CLAUDE.md` - Comprehensive development guide and architecture documentation (this file)
- `docs/ARCHITECTURE.md` - Detailed technical architecture with system flows and diagrams
- `docs/DESIGN_SYSTEM.md` - Complete frontend design system and component library guide
- `docs/API_REFERENCE.md` - Backend API documentation with endpoints and examples
- `docs/CI_CD_PIPELINE.md` - Detailed CI/CD setup and troubleshooting guide
- `docs/CI_CD_TESTING.md` - Comprehensive testing procedures for CI/CD pipeline
- `README.md` - Project overview and quick start guide for public repository

## Troubleshooting Common Issues

### Development Environment Issues

**Issue**: Backend fails to start with database connection errors
**Solution**: 
```bash
# Check if PostgreSQL is running via Docker
cd infrastructure/docker && docker-compose ps

# Restart PostgreSQL service
docker-compose restart postgres

# Verify database connectivity
docker-compose exec postgres psql -U nosilha -d nosilha_db -c "\dt"
```
**File Reference**: `infrastructure/docker/docker-compose.yml:82-95`

**Issue**: Frontend API calls fail with CORS errors
**Solution**: 
```bash
# Check backend CORS configuration
# File: backend/src/main/resources/application-local.yml:8
# Ensure CORS_ALLOWED_ORIGINS includes frontend URL
```

**Issue**: JWT authentication fails between frontend and backend
**Solution**: 
```bash
# Verify Supabase configuration
# File: frontend/src/lib/supabase-client.ts
# Check environment variables in .env.local

# Verify backend JWT secret configuration
# File: backend/src/main/resources/application.yml:54-55
```

### CI/CD Pipeline Issues

**Issue**: Workflow fails with "Advanced Security must be enabled" warnings
**Solution**: These warnings are expected for repositories without GitHub Advanced Security license. Workflows use `continue-on-error: true` to prevent failures.
**File Reference**: All workflow files use this pattern for SARIF uploads

**Issue**: Docker build fails in CI/CD
**Solution**: 
```bash
# Check Artifact Registry authentication
# File: .github/workflows/backend-ci.yml:106-112
# Verify GCP_SA_KEY secret is valid JSON

# Test Docker build locally
cd backend && ./gradlew bootBuildImage
cd frontend && docker build -t test-frontend .
```

**Issue**: Terraform state lock errors
**Solution**: Infrastructure workflows include automatic state lock cleanup
**File Reference**: `infrastructure-ci.yml:106-125`, `226-244`

### Production Deployment Issues

**Issue**: Cloud Run service fails health checks
**Solution**: 
```bash
# Check service logs
gcloud logs read --service=nosilha-backend-api --limit=50

# Verify environment variables
gcloud run services describe nosilha-backend-api --region=us-east1

# Test health endpoint
curl -f https://your-service-url/actuator/health
```
**File Reference**: `backend-ci.yml:173-182`, `frontend-ci.yml:252-261`

**Issue**: Media uploads fail to GCS
**Solution**: 
```bash
# Check service account permissions
# File: infrastructure/terraform/iam.tf:74-79
# Verify backend service account has storage.objectAdmin role

# Check bucket configuration
# File: infrastructure/terraform/main.tf:28-43
```

### Database Issues

**Issue**: Flyway migration fails
**Solution**: 
```bash
# Check migration file syntax
# Directory: backend/src/main/resources/db/migration/

# Manual migration repair if needed
./gradlew flywayRepair
```

**Issue**: Single Table Inheritance mapping errors
**Solution**: 
```bash
# Verify entity discriminator values
# File: backend/src/main/kotlin/com/nosilha/core/domain/DirectoryEntry.kt:22-47
# Check subclass @DiscriminatorValue annotations
```

### Security & Permissions Issues

**Issue**: GitHub Actions workflow permission denied
**Solution**: 
```bash
# Verify GitHub secrets are configured:
# - GCP_SA_KEY (base64 encoded service account JSON)
# - GCP_PROJECT_ID
# - All NEXT_PUBLIC_* variables

# Check service account permissions in GCP Console
# File: infrastructure/terraform/iam.tf for required roles
```

### Performance Issues

**Issue**: Frontend pages load slowly
**Solution**: 
```bash
# Check ISR cache configuration
# File: frontend/src/lib/api.ts:77-80 (1 hour cache)
# File: frontend/src/lib/api.ts:107-109 (30 min cache)

# Review bundle size
npm run build && npx bundlesize
```

**Issue**: Backend API response times are high
**Solution**: 
```bash
# Check database connection pool settings
# File: backend/src/main/resources/application.yml:19-21

# Monitor with Actuator endpoints
curl https://your-backend-url/actuator/metrics
```

### Getting Help

For additional support:
1. **CI/CD Issues**: Refer to `docs/CI_CD_PIPELINE.md` and `docs/CI_CD_TESTING.md`
2. **Security Issues**: Follow procedures in `docs/SECURITY.md`
3. **Architecture Questions**: Review this file (CLAUDE.md) for comprehensive component documentation
4. **Infrastructure Issues**: Check Terraform state and GCP Console for resource status

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.