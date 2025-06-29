# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nos Ilha is a comprehensive tourism and cultural heritage platform for Brava Island, Cape Verde. It's a full-stack web application featuring an interactive directory of businesses, landmarks, and cultural sites with mapping functionality and AI-enhanced media management.

## Architecture

This is a **full-stack application** with three main components:

- **Frontend**: Next.js 15 (App Router) with React 19, TypeScript, and Tailwind CSS
- **Backend**: Spring Boot 3.4.7 with Kotlin, PostgreSQL (primary), and Google Cloud integrations
- **Infrastructure**: Docker Compose for local development, Terraform for cloud deployment

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

### Frontend (Next.js App Router)
- **Route Groups**: Uses parentheses for logical organization `(auth)`, `(main)`, `(admin)` without affecting URLs
- **Server Components First**: Prioritizes React Server Components for performance; Client Components only when interactivity is needed
- **Dynamic Routing**: 
  - `/directory/[category]` - Category listing pages
  - `/directory/entry/[slug]` - Individual business/landmark pages
- **Mobile-First Design**: All components are responsive and mobile-optimized
- **Standalone Output**: Configured for containerized deployment with `output: "standalone"` in `next.config.ts`

### Database Strategy
- **PostgreSQL**: Primary database for structured data (directory entries, user accounts)
- **Firestore**: Flexible metadata storage for AI-processed images and documents
- **Google Cloud Storage**: Media asset storage with CDN integration

### AI & Media Processing
- **Google Cloud Vision API**: Automated image analysis and metadata extraction
- **AI Service**: Processes uploaded media to generate descriptions and extract features
- **Image Metadata Repository**: Firestore-based storage for AI-generated content insights

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
   ./gradlew bootRun
   ```

3. **Frontend setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api/v1/`
- PostgreSQL: `localhost:5432`
- Firestore Emulator: `http://localhost:8081`
- GCS Emulator: `http://localhost:8082`

## Important Code Patterns

### API Integration
- Frontend uses `/lib/api.ts` for backend communication
- All API calls should handle errors gracefully and return proper types
- Backend endpoints follow RESTful conventions with proper HTTP status codes

### Authentication & Security
- JWT-based authentication implemented in backend (`JwtAuthenticationFilter`)
- Frontend uses `AuthProvider` context for state management
- Protected routes use Next.js middleware (`middleware.ts`)

### Database Access
- Use JPA repositories for database operations
- All entities extend proper base classes and use UUID primary keys
- Flyway handles database migrations in `backend/src/main/resources/db/`
- Single Table Inheritance pattern for `DirectoryEntry` and its subclasses (`Restaurant`, `Hotel`, `Landmark`, `Beach`)

### Styling & UI
- **Tailwind CSS** with custom design system colors
- **Headless UI** components for accessibility
- **Catalyst UI** component library in `/components/catalyst-ui/`
- Custom fonts: Lato (primary) and Merriweather (headings)

## Testing
- Backend: Use `./gradlew test` to run JUnit tests
- Frontend: Testing setup should be added (currently not configured)

## Cloud Deployment
- **Google Cloud Platform** with Terraform configurations in `/infrastructure/terraform/`
- **Cloud Run** for both backend and frontend deployment
- **Google Artifact Registry** for container image storage
- **Google Cloud Storage** for media asset storage
- **Google Secret Manager** for secure configuration management

## Key Files to Know
- `frontend/src/app/layout.tsx` - Root layout with global providers
- `backend/src/main/kotlin/com/nosilha/core/domain/DirectoryEntry.kt` - Core domain model
- `frontend/src/lib/api.ts` - API client configuration
- `frontend/next.config.ts` - Next.js configuration with standalone output
- `frontend/Dockerfile` - Multi-stage Docker build for Cloud Run deployment
- `backend/build.gradle.kts` - Kotlin/Spring Boot build configuration
- `backend/src/main/resources/application.yml` - Production configuration
- `infrastructure/docker/docker-compose.yml` - Local development environment
- `infrastructure/terraform/cloudrun.tf` - Cloud Run deployment configuration
- `infrastructure/terraform/main.tf` - Core GCP infrastructure (GCS, Artifact Registry)