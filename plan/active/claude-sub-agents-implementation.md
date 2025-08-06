# Claude Sub-Agents Implementation Plan

**Status:** Active  
**Priority:** High  
**Estimated Time:** 12-16 hours  
**Dependencies:** None

## What & Why
- **Problem:** Complex full-stack development requires specialized expertise across multiple domains (backend APIs, frontend React, mapping, animations, CI/CD, etc.)
- **Solution:** Create 8 specialized Claude sub-agents with domain-specific knowledge and capabilities
- **Expected Outcome:** Enhanced development efficiency with specialized agents for each technical domain

## Agent Specifications

### 1. Spring Boot API Agent (`nosilha-backend-agent`)
**Primary Role**: Backend development specialist for Kotlin Spring Boot services
**Expertise Areas**:
- Single Table Inheritance patterns for DirectoryEntry hierarchy
- JPA repository design and query optimization
- Flyway database migration management
- JWT authentication with Supabase integration
- Domain-Driven Design architecture
- Spring Boot testing with JUnit and PostgreSQL

**Key Files**:
- `backend/src/main/kotlin/**/*.kt`
- `backend/src/main/resources/db/migration/*.sql`
- `backend/build.gradle.kts`
- `backend/src/main/resources/application*.yml`

**Specialized Knowledge**:
- Spring Boot 3.4.7 configuration patterns
- Kotlin coroutines and null safety
- PostgreSQL connection pooling with HikariCP
- Bean validation and error handling
- Actuator endpoints for monitoring

### 2. Next.js Frontend Agent (`nosilha-frontend-agent`)
**Primary Role**: Modern React development with App Router and TypeScript
**Expertise Areas**:
- Next.js 15 App Router architecture
- React 19 Server Components patterns
- Route Groups organization `(auth)`, `(main)`, `(admin)`
- Tailwind CSS and Catalyst UI component system
- TypeScript strict mode and type safety
- ISR caching strategies for tourism content

**Key Files**:
- `frontend/src/app/**/*.tsx`
- `frontend/src/components/**/*.tsx`
- `frontend/src/lib/*.ts`
- `frontend/next.config.ts`
- `frontend/tailwind.config.ts`

**Specialized Knowledge**:
- Mobile-first responsive design
- Supabase authentication integration
- API client error handling and fallbacks
- Bundle optimization and performance
- Dark mode theming with CSS variables

### 3. Mapbox & GIS Agent (`nosilha-mapbox-agent`)
**Primary Role**: Mapbox GL JS expert and geospatial visualization specialist
**Expertise Areas**:
- Mapbox GL JS v3+ integration with React
- Custom marker creation and category-based styling
- Interactive map controls and user interactions
- Geolocation services and location-based filtering
- Mobile-optimized touch interactions
- Performance optimization for large datasets

**Key Files**:
- `frontend/src/components/ui/interactive-map.tsx`
- `frontend/src/components/ui/map-filter-control.tsx`
- `frontend/src/components/ui/category-marker-icon.tsx`
- Map utility functions and hooks
- Geospatial data transformation utilities

**Specialized Knowledge**:
- Mapbox Studio style customization
- Vector tile optimization for tourism data
- Clustering algorithms for point-of-interest display
- React hooks for map state management
- Accessibility patterns for interactive maps

### 4. Motion & Graphics Agent (`nosilha-motion-agent`)
**Primary Role**: Animation and interactive graphics specialist using Framer Motion
**Expertise Areas**:
- Framer Motion animation patterns and performance
- Micro-interactions and page transitions
- Scroll-triggered animations (scrollytelling)
- Interactive photo galleries and media displays
- Hardware acceleration optimization
- Reduced motion accessibility compliance

**Key Files**:
- Animation-enhanced components across the frontend
- `frontend/src/components/ui/image-gallery.tsx`
- `frontend/src/components/ui/video-hero-section.tsx`
- Transition utilities and animation hooks
- Interactive UI element components

**Specialized Knowledge**:
- Performance-optimized animation patterns
- Mobile gesture recognition and touch interactions
- CSS transform optimization for smooth animations
- Tourism-focused storytelling through motion
- Cross-browser animation compatibility

### 5. CI/CD Pipeline Agent (`nosilha-devops-agent`)
**Primary Role**: GitHub Actions workflows and Google Cloud deployment
**Expertise Areas**:
- Modular GitHub Actions workflow architecture
- Security scanning with Trivy, detekt, tfsec, ESLint
- Google Cloud Run deployment patterns
- Terraform infrastructure management
- SARIF security report integration
- Artifact Registry container management

**Key Files**:
- `.github/workflows/*.yml`
- `infrastructure/terraform/*.tf`
- `scripts/deploy.sh`
- Docker configurations for backend and frontend
- Security scanning configurations

**Specialized Knowledge**:
- Path-based workflow triggering
- Service account permissions and IAM policies
- Blue-green deployment strategies
- Cost optimization for Cloud Run
- Automated security vulnerability management

### 6. Media & AI Integration Agent (`nosilha-media-agent`)
**Primary Role**: Cloud Vision API, GCS storage, and image processing
**Expertise Areas**:
- Google Cloud Storage integration patterns
- Cloud Vision API for image analysis and OCR
- AI-powered metadata extraction
- Image upload workflows and progress tracking
- Gallery API endpoint design
- Firestore integration for metadata storage

**Key Files**:
- `backend/src/main/kotlin/com/nosilha/core/service/FileStorageService.kt`
- `backend/src/main/kotlin/com/nosilha/core/service/AIService.kt`
- `backend/src/main/kotlin/com/nosilha/core/controller/FileUploadController.kt`
- `frontend/src/components/ui/image-uploader.tsx`
- `frontend/src/components/ui/gallery-image-grid.tsx`

**Specialized Knowledge**:
- Image compression and optimization
- Batch processing for media uploads
- AI-enhanced accessibility features
- Content moderation workflows
- Media CDN integration patterns

### 7. Database Architecture Agent (`nosilha-data-agent`)
**Primary Role**: PostgreSQL schema design and Flyway migrations
**Expertise Areas**:
- Single Table Inheritance modeling for DirectoryEntry
- Flyway migration versioning and rollback strategies
- PostgreSQL performance optimization
- JPA entity relationship mapping
- Database indexing for geospatial queries
- Connection pooling and transaction management

**Key Files**:
- `backend/src/main/kotlin/com/nosilha/core/domain/*.kt`
- `backend/src/main/kotlin/com/nosilha/core/repository/**/*.kt`
- `backend/src/main/resources/db/migration/*.sql`
- Database configuration in application properties

**Specialized Knowledge**:
- PostgreSQL PostGIS for geospatial data
- Query optimization for tourism search
- Data archival and cleanup strategies
- Database migration testing patterns
- Performance monitoring and tuning

### 8. Type Safety & Integration Agent (`nosilha-integration-agent`)
**Primary Role**: Full-stack type safety and API integration
**Expertise Areas**:
- Frontend/backend type interface alignment
- API contract validation and testing
- Environment configuration management
- Cross-service integration testing
- Error handling standardization
- Development tooling and debugging

**Key Files**:
- `frontend/src/types/*.ts`
- `frontend/src/lib/api*.ts`
- Backend DTO and mapper classes
- Integration test suites
- Environment configuration files

**Specialized Knowledge**:
- OpenAPI specification generation
- End-to-end type safety patterns
- API mocking and testing strategies
- Development environment consistency
- Cross-platform debugging techniques

## Implementation Steps

1. [x] Define agent specifications and expertise areas
2. [ ] Create agent-specific knowledge bases
3. [ ] Develop specialized system prompts
4. [ ] Establish agent coordination protocols
5. [ ] Implement testing and validation procedures
6. [ ] Create deployment documentation

## Agent Coordination Patterns

### Tourism Feature Development
- **Frontend** + **Mapbox** + **Motion** → Interactive location pages with animated map transitions
- **Backend** + **Media** + **Data** → Location data with rich media and geospatial queries

### User Experience Enhancement  
- **Motion** + **Frontend** → Smooth page transitions and micro-interactions
- **Mapbox** + **Media** → Interactive photo galleries with location context

### Technical Excellence
- **Integration** + **DevOps** → Full-stack type safety with automated testing
- **Data** + **Backend** → Optimized queries and proper database architecture

## Success Criteria
- [ ] All 8 agents have detailed specifications
- [ ] Agent knowledge bases are comprehensive
- [ ] Specialized prompts are effective and tested
- [ ] Agent coordination patterns are documented
- [ ] Testing procedures validate agent effectiveness
- [ ] Documentation enables easy agent deployment

---
**Created:** 2025-01-06  
**Last Updated:** 2025-01-06