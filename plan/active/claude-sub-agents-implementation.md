# Claude Sub-Agents Implementation Plan

**Status:** Active  
**Priority:** High  
**Estimated Time:** 12-16 hours  
**Dependencies:** None

## What & Why
- **Problem:** Complex cultural heritage & tourism platform requires specialized expertise across multiple domains (backend APIs, frontend React, mapping, content creation, fact-checking, databases, CI/CD, etc.)
- **Solution:** Create 10 specialized Claude sub-agents with domain-specific knowledge and capabilities for both technical development and cultural content accuracy
- **Expected Outcome:** Enhanced development efficiency with specialized agents for technical domains plus accurate, culturally-sensitive content creation

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
**Primary Role**: Multi-database specialist for PostgreSQL and Firestore
**Expertise Areas**:
- **PostgreSQL**: Single Table Inheritance modeling for DirectoryEntry
- **PostgreSQL**: Flyway migration versioning and rollback strategies
- **PostgreSQL**: Performance optimization and connection pooling
- **Firestore**: Document modeling for AI metadata and image processing
- **Firestore**: Real-time updates and offline synchronization
- **Cross-database**: Data consistency patterns between relational and NoSQL

**Key Files**:
- `backend/src/main/kotlin/com/nosilha/core/domain/*.kt`
- `backend/src/main/kotlin/com/nosilha/core/repository/**/*.kt`
- `backend/src/main/resources/db/migration/*.sql`
- Firestore collection structures and security rules
- Database configuration in application properties

**Specialized Knowledge**:
- **PostgreSQL**: PostGIS for geospatial data, JPA entity relationships
- **Firestore**: Image metadata storage, EXIF data, AI-generated tags
- **Integration**: Polyglot persistence patterns for cultural heritage data
- **Performance**: Query optimization across both database systems
- **Migrations**: Schema evolution strategies for both SQL and NoSQL

### 8. Content Copywriter Agent (`nosilha-content-agent`)
**Primary Role**: Cultural heritage content creation and multilingual copywriting
**Expertise Areas**:
- Cape Verdean cultural context and historical sensitivity
- Tourism copywriting that respects local heritage
- Multilingual content creation (English, Portuguese, French)
- Community-focused storytelling and voice
- SEO-optimized content for cultural sites
- Diaspora community engagement writing

**Key Files**:
- Frontend page content and meta descriptions
- Cultural heritage narratives and descriptions
- Business directory descriptions with cultural context
- Historical figure and landmark content
- Community event and festival descriptions

**Specialized Knowledge**:
- Cape Verde cultural nuances and authentic voice
- Tourism marketing that preserves cultural integrity
- Community-inclusive language patterns
- Structured data markup for cultural content (Schema.org)
- Content localization best practices for island communities

### 9. Cultural Fact Checker Agent (`nosilha-factchecker-agent`)
**Primary Role**: Historical and cultural accuracy verification for Brava Island content
**Expertise Areas**:
- Cape Verdean history and Brava Island-specific facts
- Verification of historical figures and dates
- Cultural practice and tradition accuracy
- Community consultation and source validation
- Bias detection in cultural representation
- Authenticity assessment for heritage content

**Key Files**:
- History page content verification
- People page biographical accuracy
- Cultural practice and tradition descriptions
- Historical landmark and site information
- Community event and festival details

**Specialized Knowledge**:
- Primary source research for Cape Verde history
- Community knowledge validation processes
- Oral history preservation and verification
- Cultural sensitivity in historical narrative
- Diaspora community fact-checking networks
- Academic source validation for island history

### 10. Type Safety & Integration Agent (`nosilha-integration-agent`)
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

### Cultural Heritage Content Development
- **Content** + **Fact Checker** + **Frontend** → Authentic, accurate cultural pages with proper presentation
- **Content** + **Media** + **Data** → Rich cultural narratives with verified historical context and multimedia

### Community-Focused Tourism
- **Content** + **Mapbox** + **Motion** → Interactive location pages with culturally-sensitive storytelling
- **Fact Checker** + **Backend** + **Data** → Verified historical data with proper community representation

### User Experience Enhancement  
- **Motion** + **Frontend** → Smooth page transitions and culturally-appropriate micro-interactions
- **Mapbox** + **Media** → Interactive galleries showcasing authentic Brava Island life

### Technical Excellence
- **Integration** + **DevOps** → Full-stack type safety with automated testing
- **Data** + **Backend** → Optimized queries across PostgreSQL and Firestore architectures

## Success Criteria
- [ ] All 10 agents have detailed specifications with cultural heritage focus
- [ ] Agent knowledge bases include Cape Verdean cultural context
- [ ] Content and fact-checking agents have community validation processes
- [ ] Specialized prompts preserve cultural authenticity and accuracy
- [ ] Agent coordination patterns support community-focused development
- [ ] Testing procedures validate both technical functionality and cultural sensitivity
- [ ] Documentation enables culturally-aware agent deployment

---
**Created:** 2025-01-06  
**Last Updated:** 2025-01-06