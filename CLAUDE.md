# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nos Ilha is a community-driven cultural heritage hub for Brava Island, Cape Verde. This volunteer-supported, open-source project is a full-stack web application that preserves and celebrates the island's rich cultural memory through an interactive directory of cultural sites, landmarks, and local businesses, with mapping functionality and AI-enhanced media management.

### System Architecture Overview

**Frontend** (Next.js 15): React 19, App Router, Tailwind CSS, ISR Caching, Supabase Auth  
**Backend** (Spring Boot): Kotlin/JVM, PostgreSQL, JWT Auth, Domain-Driven, RESTful APIs  
**Infrastructure** (GCP): Cloud Run, Artifact Registry, Cloud Storage, Secret Manager, IAM  
**CI/CD** (GitHub Actions): Modular workflows, security scanning, auto-deployment, health checks

## Architecture

This is a **full-stack application** with four main components:

- **Frontend**: Next.js 15 (App Router) with React 19, TypeScript, and Tailwind CSS
- **Backend**: Spring Boot 3.4.7 with Kotlin, PostgreSQL (primary), and Google Cloud integrations
- **Infrastructure**: Docker Compose for local development, Terraform for cloud deployment
- **CI/CD**: Modular GitHub Actions workflows with automated security scanning and deployment

## Project Organization

The project follows a clear organizational structure:

- **`plan/`** - Dynamic planning documents for future features, research, and implementation strategies
- **`docs/`** - Static project documentation (architecture, design system, API reference, etc.)
- **`prompts/`** - Historical prompts and content used for development and AI interactions

### Planning & Template System

#### Planning Directory Organization  
- **`plan/active/`** - Plans currently being implemented
- **`plan/pending/`** - Future work that depends on active plans
- **`plan/completed/`** - Archive of successfully implemented plans
- **`plan/templates/`** - Reusable templates and patterns

#### Creating New Plans
When creating new planning documents:
1. **Use Template**: Always start with `plan/templates/plan-template.md`
2. **Proper Directory**: Place in appropriate directory based on status
3. **Naming Convention**: Use descriptive names like `[topic]-[action].md`
4. **File References**: Include specific file paths and line numbers
5. **Actionable Steps**: Each step should be implementable

#### When to Create Plans
- Complex multi-step implementations (3+ hours of work)
- Breaking down large features into phases
- Coordinating work across multiple files/systems
- User explicitly requests planning

#### Planning Process
- Plans are dynamic and should evolve as work progresses
- Move plans between directories as status changes
- Archive completed plans for future reference
- Claude Code can discover current plans using LS tool as needed

### Key Integration Flows

**Authentication**: User → Frontend → Supabase Auth → JWT Token → Backend Validation → Database Access  
**Content Management**: Admin UI → Backend API → PostgreSQL → Cache Invalidation → Frontend Update  
**Media Processing**: File Upload → GCS Storage → Cloud Vision API → Metadata → Firestore → Frontend  
**CI/CD Deployment**: Git Push → GitHub Actions → Security Scan → Build → Deploy → Health Check

## Common Development Commands

### Frontend (Next.js)
```bash
cd frontend
npm install              # Install dependencies
npm run dev             # Start development server with Turbopack
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npx tsc --noEmit        # TypeScript type checking
```

### Backend (Spring Boot + Kotlin)
```bash
cd backend
./gradlew bootRun       # Start development server
./gradlew build         # Build JAR
./gradlew test          # Run tests
./gradlew detekt        # Run Kotlin code analysis
./gradlew test jacocoTestReport  # Run tests with coverage reports
./gradlew bootBuildImage # Build Docker image
```

### Infrastructure (Docker Compose)
```bash
cd infrastructure/docker
docker-compose up -d    # Start PostgreSQL, Firestore & GCS emulators
docker-compose down     # Stop all services
# Database management
docker-compose exec postgres psql -U nosilha -d nosilha_db  # Access PostgreSQL
docker-compose exec postgres pg_dump -U nosilha nosilha_db > backup.sql  # Create backup
```

## Key Architecture Patterns

### Backend (Spring Boot + Kotlin + Spring Modulith)
- **Spring Modulith Architecture**: Modular monolith with enforced module boundaries (`shared`, `auth`, `directory`, `media`)
- **Event-Driven Communication**: Modules communicate via `@ApplicationModuleListener` without direct dependencies
- **Module Isolation**: Each module has independent domain, API, and repository layers with verified boundaries
- **Single Table Inheritance**: `DirectoryEntry` is the base class for `Restaurant`, `Hotel`, `Landmark`, etc. (Directory module)
- **Clean Architecture**: Controllers (public API), services (internal business logic), repositories (internal data access)
- **API Versioning**: All REST endpoints are prefixed with `/api/v1/`
- **Authentication**: JWT-based authentication with Supabase token validation (Auth module)
- **Database Strategy**: PostgreSQL primary with Flyway migrations, connection pooling via HikariCP
- **Security**: CORS configuration, input validation, and role-based access control

> **Detailed Architecture**: See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for complete backend module diagrams, file structure, and Spring Modulith patterns. See [`docs/SPRING_MODULITH.md`](docs/SPRING_MODULITH.md) for module architecture and event-driven communication patterns.

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
**App Router**: (auth)/ login/signup, (main)/ homepage/directory/map, (admin)/ protected pages  
**Components**: providers/ (auth-provider), catalyst-ui/ (design system), ui/ (custom), admin/ (forms)  
**Data Layer**: api.ts (backend client), supabase-client.ts (auth), mock-api.ts (fallback)  
**Caching**: ISR for directory pages (1hr), real-time for map, authentication via Supabase JWT

### Database Strategy
- **PostgreSQL**: Primary database for structured data (directory entries, user accounts)
- **Google Firestore**: Flexible metadata storage for AI-processed images and documents
- **Google Cloud Storage**: Media asset storage with CDN integration

#### Database Architecture
**PostgreSQL**: directory_entries (Single Table Inheritance), flyway_schema_history, [Future: users, reviews]  
**Google Cloud Storage**: nosilha-com-media-storage-useast1 (images/, videos/, documents/)  
**Google Firestore**: image_metadata/ (vision_api_results, processing_status), document_metadata/ (ocr_results, content_analysis)

### AI & Media Processing
**Cloud Vision API**: Image analysis and metadata extraction with OCR, labeling, landmark detection  
**Workflow**: Upload → GCS → AI Analysis → Firestore → Enhanced Frontend Content  
**Features**: Auto-tagging, text extraction, accessibility improvements, search optimization

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

### Required Environment Variables

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Backend (Environment Variables)
```bash
SPRING_PROFILES_ACTIVE=local
DATABASE_URL=jdbc:postgresql://localhost:5432/nosilha_db
DATABASE_USERNAME=nosilha  
DATABASE_PASSWORD=nosilha
```

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
curl http://localhost:8080/actuator/health  # Backend health
curl http://localhost:8080/api/v1/directory/entries  # API test
open http://localhost:3000  # Frontend test
docker-compose exec postgres psql -U nosilha -d nosilha_db -c "SELECT version();"  # DB test
```

## Specialized Agent Definitions

When working with this codebase, Claude Code can utilize specialized agents for domain-specific tasks. Each agent MUST reference the appropriate documentation to ensure consistency with established standards.

### frontend-engineer
**Purpose**: Next.js 15 + React 19 + TypeScript frontend specialist for Nos Ilha cultural heritage platform  
**Documentation Reference**: MUST reference [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) for all UI/styling decisions  
**Key Responsibilities**:
- React components and Next.js App Router pages
- Tailwind CSS styling following design system standards
- Mobile-first responsive design implementation
- Component library usage (Catalyst UI + Custom UI)
- Client-side features and interactivity
- Frontend performance optimization
- Dark/light theme implementation

**Required Documentation Compliance**:
- Follow brand colors and typography from DESIGN_SYSTEM.md
- Use semantic color tokens and CSS variables
- Implement mobile-first responsive patterns
- Adhere to component architecture guidelines

### backend-engineer  
**Purpose**: Spring Boot + Kotlin API development specialist for Nos Ilha cultural heritage platform  
**Documentation Reference**: MUST reference [`docs/API_CODING_STANDARDS.md`](docs/API_CODING_STANDARDS.md) for all development patterns  
**Key Responsibilities**:
- REST API development with proper HTTP status codes
- JPA entities and repository implementations
- Service layer business logic
- JWT authentication and authorization
- Bean Validation for input validation
- Database operations and Flyway migrations
- Kotlin backend development best practices

**Required Documentation Compliance**:
- Follow Single Table Inheritance patterns for DirectoryEntry
- Implement proper entity auditing and validation
- Use established DTO mapping patterns
- Adhere to API versioning conventions (/api/v1/)

### database-engineer
**Purpose**: PostgreSQL + Firestore multi-database specialist for Nos Ilha platform data architecture  
**Documentation Reference**: Reference API_CODING_STANDARDS.md for entity patterns and migration standards  
**Key Responsibilities**:
- Database schema design and migrations
- JPA entity relationships and mappings
- Query optimization and performance
- Firestore operations for AI metadata
- Data modeling for cultural heritage content
- Database connection pooling and configuration

### devops-engineer
**Purpose**: CI/CD deployment and Google Cloud Platform infrastructure specialist  
**Documentation References**: [`docs/CI_CD_PIPELINE.md`](docs/CI_CD_PIPELINE.md) and infrastructure documentation  
**Key Responsibilities**:
- GitHub Actions workflow management
- GCP deployment and Cloud Run configuration
- Terraform infrastructure as code
- Docker containerization and registry management
- Security scanning and compliance
- Monitoring and health checks

### content-creator
**Purpose**: Cultural heritage content creation and multilingual specialist for authentic Cape Verdean storytelling
**Key Responsibilities**:
- Cultural content creation and validation
- Copywriting for heritage descriptions
- Community-focused narrative development
- Content review and accuracy verification
- Multilingual content management

### content-verifier
**Purpose**: Historical accuracy and cultural authenticity verification specialist ensuring respectful representation of Cape Verdean heritage content
**Documentation Reference**: Reference `docs/CULTURAL_HERITAGE_VERIFICATION.md` for verification protocols
**Key Responsibilities**:
- Historical fact verification with community validation
- Cultural practice authentication through elder consultation
- Biographical verification for historical figures
- Bias detection and correction (colonial perspectives, tourism exoticism)
- Community consultation coordination
- Source validation with evidence trail documentation

**Required Documentation Compliance**:
- Prioritize community knowledge over external academic sources
- Protect sacred knowledge and cultural intellectual property
- Ensure community benefit and authentic representation
- Maintain comprehensive evidence trails with multiple source verification

### mapbox-specialist
**Purpose**: Mapbox GL JS + React integration specialist for Brava Island interactive mapping
**Key Responsibilities**:
- Interactive map development and customization
- Geospatial data visualization
- Location-based filtering and search
- Custom marker and popup implementations
- Map performance optimization

### design-review
**Purpose**: Comprehensive design review specialist for frontend pull requests using Playwright MCP for automated testing
**Documentation Reference**: Uses Playwright MCP toolset for browser automation and visual testing
**Key Responsibilities**:
- UI component and pull request design review
- Visual consistency and accessibility compliance (WCAG 2.1 AA)
- Responsive design testing across viewports
- Interactive state testing (hover, active, disabled)
- Browser console error checking
- User flow validation with live preview environment

**Required Review Standards**:
- Follow "Live Environment First" principle
- Use triage matrix (Blocker, High-Priority, Medium-Priority, Nitpick)
- Provide evidence-based feedback with screenshots
- Verify keyboard navigation and focus states
- Test mobile/tablet/desktop viewports
- Validate design token usage and pattern consistency

### content-planner
**Purpose**: Cultural heritage content planning specialist creating detailed content strategies for Brava Island educational pages with cultural authenticity prioritized over SEO optimization
**Documentation Reference**: Reference `docs/DESIGN_SYSTEM.md` for brand voice and cultural values
**Key Responsibilities**:
- Content plan creation for cultural heritage educational pages (80% of work)
- Diaspora connection content planning (15% of work)
- Directory entry content planning with heritage context (5% of work)
- Cultural authenticity first, SEO optimization second
- Multilingual strategy planning (English primary, Portuguese, French)
- Cultural verification checkpoint planning
- E-E-A-T signal integration for diaspora discovery

**Content Planning Workflow**:
- Cultural context analysis for Brava Island topics
- SEO strategy development for diaspora keywords
- Content outline creation with living tradition focus
- Multilingual adaptation strategy
- Schema markup and technical SEO planning
- Output to `plan/content/` directory structure

### search-specialist
**Purpose**: Expert web researcher for cultural and historical topics using advanced search techniques and multi-source verification
**Key Responsibilities**:
- Advanced search query formulation for cultural research
- Domain-specific searching and filtering for authoritative sources
- Multi-source fact verification and cross-referencing
- Information synthesis across academic and community sources
- Historical and trend analysis for Cape Verdean heritage
- Research output storage in `plan/content/cultural-research/` directory

**Research Output**:
- Comprehensive markdown files with citations
- Works cited sections with numbered references
- Credibility assessment of sources
- Topic-specific directory placement (brava-history/, brava-notable-figures/)
- Summary reports with key findings and gaps identified

## Available MCP Server Tools

Claude Code has access to Model Context Protocol (MCP) servers that provide additional capabilities. These are **not sub-agents** but rather tool servers that extend Claude Code's capabilities.

### Playwright MCP Server
**Type**: MCP Tool Server (browser automation capabilities)
**Documentation**: See [`frontend/README-MCP.md`](frontend/README-MCP.md) for comprehensive setup and usage guide
**Configuration Files**:
- `frontend/.mcp/server-config.json` - Playwright MCP server configuration (headless by default)
- `.mcp.json` - MCP client configuration for Claude Code integration

**Available Tools**:
- `mcp__playwright__browser_navigate` - Navigate to URLs in automated browser
- `mcp__playwright__browser_click` - Click elements on the page
- `mcp__playwright__browser_take_screenshot` - Capture screenshots for visual testing
- `mcp__playwright__browser_snapshot` - Get DOM snapshot for analysis
- `mcp__playwright__browser_evaluate` - Execute JavaScript in browser context
- And more (see README-MCP.md for complete tool list)

**Common Use Cases**:
- Automated browser testing and interaction
- Visual testing and screenshot generation for design review
- Accessibility testing and WCAG compliance validation
- PDF generation from web pages
- Interactive development assistance with live preview
- Performance testing and Core Web Vitals monitoring

**MCP Server Commands**:
- `npm run mcp:server:headless` - Start MCP server in headless mode (recommended for most tasks)
- `npm run mcp:server` - Start MCP server with GUI browser (for visual debugging and interactive development)
- `npm run mcp:server:port` - Start MCP server with HTTP transport on port 8931 (for web-based integrations)
- Configuration uses **headless mode by default** for optimal performance and resource usage

## Agent Usage Guidelines

### When to Use Specialized Agents
- **Frontend tasks**: Always use frontend-engineer for UI/component work
- **Backend API tasks**: Always use backend-engineer for Spring Boot/Kotlin development
- **Infrastructure tasks**: Use devops-engineer for deployment and infrastructure changes
- **Content creation**: Use content-creator for cultural heritage content, content-planner for content strategy
- **Research tasks**: Use search-specialist for cultural and historical research
- **Design review**: Use design-review for comprehensive UI/UX review with Playwright MCP

### Documentation Compliance Requirements
- **MANDATORY**: All agents must reference their specified documentation before making changes
- **Validation**: Agents should validate their work against established standards
- **Consistency**: Cross-reference related documentation when work spans multiple domains
- **Updates**: When standards change, agents must adapt their approach accordingly

### Cross-Agent Coordination
- frontend-engineer and backend-engineer coordinate on API contracts and TypeScript interfaces
- devops-engineer ensures deployment compatibility with all service agents
- content-creator executes content plans created by content-planner
- content-verifier validates accuracy for content-creator and content-planner
- search-specialist provides research foundation for cultural content creation

## Important Code Patterns

### API Integration
- Frontend uses `/lib/api.ts` for backend communication (see [`docs/API_CODING_STANDARDS.md`](docs/API_CODING_STANDARDS.md))
- All API calls should handle errors gracefully and return proper types
- Backend endpoints follow RESTful conventions with proper HTTP status codes
- Authentication flow: Frontend → Supabase Auth → JWT → Backend validation → Database

### Authentication & Security Flow
**Login**: Frontend (login-form.tsx) → Supabase Auth → JWT Token → AuthProvider (auth-provider.tsx)  
**API Requests**: Frontend → api.ts → JWT Header → Backend API → JwtAuthenticationFilter → Validate & Authorize  
**Protected Routes**: middleware.ts → Check Auth State → Allow/Redirect

### Database Access
- Use JPA repositories for database operations (see [`docs/API_CODING_STANDARDS.md`](docs/API_CODING_STANDARDS.md))
- All entities extend proper base classes and use UUID primary keys
- Flyway handles database migrations in `backend/src/main/resources/db/`
- Single Table Inheritance pattern for `DirectoryEntry` and its subclasses (`Restaurant`, `Hotel`, `Landmark`, `Beach`)

### Frontend Design System & Styling
**Documentation**: See [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) for comprehensive styling guide
**Brand**: "Clean, inviting, authentic, and lush" - digital extension of Brava Island
**Colors**: Ocean Blue (#005A8D), Valley Green (#3E7D5A), Bougainvillea Pink (#D90368), Sunny Yellow (#F7B801)
**Typography**: Merriweather (headings), Lato (body text), Google Fonts with CSS variables
**Components**: Catalyst UI (25+ components), Custom UI (DirectoryCard, PageHeader, ThemeToggle), mobile-first with dark mode
**Key Files**: globals.css, tailwind.config.ts, layout.tsx, theme-toggle.tsx, button.tsx

### Content Action Section Pattern

The Content Action Section provides cultural heritage engagement features for sharing, reacting, and contributing to heritage content.

**Architecture**:
- **Location**: `frontend/src/components/content-actions/`
- **Backend API**: `/api/v1/reactions`, `/api/v1/suggestions`, `/api/v1/directory/entries/{id}/related`
- **Database**: PostgreSQL tables (`reactions`, `suggestions`)
- **Authentication**: Supabase Auth with JWT validation (reactions only)
- **Caching**: ISR with 5-minute revalidation for counts and related content

**Core Components**:

1. **ContentActionToolbar** (`ContentActionToolbar.tsx`)
   - ARIA toolbar pattern for accessibility (role="toolbar")
   - Hybrid placement: fixed left rail (desktop lg+), horizontal in-flow (mobile/tablet)
   - Integrates all action buttons with proper keyboard navigation
   - File: `frontend/src/components/content-actions/ContentActionToolbar.tsx`

2. **ShareButton** (`ShareButton.tsx`)
   - Web Share API with clipboard fallback
   - Native share dialog on supported devices
   - Copy link confirmation with visual feedback (2-second CheckIcon)
   - ARIA live region for screen reader announcements
   - File: `frontend/src/components/content-actions/ShareButton.tsx`

3. **ReactionButton** (`ReactionButton.tsx`)
   - Authenticated user reactions (❤️ Love, 👍 Helpful, 🤔 Interesting, 🙏 Thank You)
   - Optimistic UI updates with rollback on error
   - Public reaction counts for all users
   - Rate limiting: 10 reactions/minute per user
   - File: `frontend/src/components/content-actions/ReactionButton.tsx`

4. **SuggestImprovementForm** (`SuggestImprovementForm.tsx`)
   - Community contribution modal form
   - Three suggestion types: CORRECTION, ADDITION, FEEDBACK
   - Honeypot spam protection
   - Rate limiting: 5 submissions/hour per IP
   - File: `frontend/src/components/content-actions/SuggestImprovementForm.tsx`

5. **PrintButton** (`print-button.tsx`)
   - Browser-native print dialog (window.print())
   - Print stylesheet for clean layout
   - Citation URL in footer
   - File: `frontend/src/components/ui/print-button.tsx`
   - Stylesheet: `frontend/src/styles/print.css`

6. **RelatedContent** (`RelatedContent.tsx`)
   - Content discovery algorithm (category + town + cuisine matching)
   - Responsive layout: horizontal scroll (mobile), 2-col (tablet), 3-col (desktop)
   - Displays 3-5 related heritage items
   - File: `frontend/src/components/content-actions/RelatedContent.tsx`

**Backend Services** (`backend/src/main/kotlin/com/nosilha/core/`):
- **ReactionService**: Business logic with rate limiting
- **ReactionController**: REST API endpoints (POST, DELETE, GET)
- **SuggestionService**: Email notifications and spam protection
- **SuggestionController**: Public submission endpoint
- **RelatedContentService**: Three-tier relevance algorithm
- **RelatedContentController**: Content discovery endpoint

**API Endpoints**:
```
POST   /api/v1/reactions                    - Submit reaction (auth required)
DELETE /api/v1/reactions/content/{id}       - Remove reaction (auth required)
GET    /api/v1/reactions/content/{id}       - Get reaction counts (public)
POST   /api/v1/suggestions                  - Submit suggestion (public)
GET    /api/v1/directory/entries/{id}/related?limit=5 - Get related content (public)
```

**Usage Example**:
```tsx
import { ContentActionToolbar } from '@/components/content-actions/ContentActionToolbar';

// In heritage page component
<ContentActionToolbar
  contentId={entry.id}
  title={entry.name}
  description={entry.description}
  image={entry.imageUrl || undefined}
/>
```

**Accessibility Features**:
- WCAG 2.1 AA compliant
- Keyboard navigation (Tab, Arrow keys, Enter, Escape)
- Screen reader support (NVDA, JAWS, VoiceOver)
- 44×44px minimum touch targets on mobile
- Visible focus indicators (3:1 contrast minimum)
- ARIA live regions for dynamic content announcements

**Performance**:
- Bundle size: <15KB per page (verified)
- ISR caching: 5-minute revalidation
- Optimistic UI for instant feedback
- First Input Delay target: <100ms
- Time to Interactive target: <3s on 3G

**Testing**:
- Backend integration tests: `ReactionControllerTest.kt`, `SuggestionControllerTest.kt`, `RelatedContentControllerTest.kt`
- Frontend E2E tests: `frontend/tests/e2e/content-actions.spec.ts`
- Accessibility tests: `frontend/tests/e2e/accessibility.spec.ts`

**Documentation**:
- Feature spec: `plan/specs/004-content-action-section/spec.md`
- Implementation plan: `plan/specs/004-content-action-section/plan.md`
- API contracts: `plan/specs/004-content-action-section/contracts/`
- Developer quickstart: `plan/specs/004-content-action-section/quickstart.md`

## Testing Strategy

### Backend Testing
```bash
cd backend && ./gradlew test  # All tests with PostgreSQL
./gradlew test jacocoTestReport  # With coverage
./gradlew test --tests "DirectoryEntryControllerTest"  # Specific test
./gradlew detekt  # Linting and static analysis
```
**Configuration**: PostgreSQL service in CI/CD, Jacoco coverage reports

### Frontend Testing
```bash
cd frontend && npx tsc --noEmit  # Type checking
npm run lint && npm run build  # Linting and build
npx bundlesize  # Bundle analysis
```
**Configuration**: ESLint with TypeScript, bundle size monitoring, unit testing TBD

### Integration & Security Testing
**Integration**: API validation, E2E flows, performance, security headers (`.github/workflows/integration-ci.yml`)  
**Security**: Trivy (containers/deps), detekt (Kotlin), ESLint (TypeScript), tfsec (Terraform)

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
**Trigger**: Push to main / Pull Request → Path Detection (dorny/paths-filter)  
**Services**: Backend CI/CD (security, tests, Docker, deploy), Frontend CI/CD (security, lint, bundle, Docker, deploy), Infrastructure CI/CD (tfsec, Terraform validation)  
**Registry**: Google Artifact Registry (nosilha-backend/nosilha-core-api:latest, nosilha-frontend/nosilha-web-ui:latest)  
**Deploy**: Cloud Run Services (nosilha-backend-api, nosilha-frontend with health checks)

### Security & Compliance
- **Vulnerability Scanning**: Trivy scans for dependencies and container vulnerabilities
- **Static Analysis**: detekt (Kotlin), ESLint (TypeScript), tfsec (Terraform)
- **SARIF Integration**: Security findings uploaded to GitHub Security tab (when Advanced Security is enabled)
- **Graceful Degradation**: Workflows continue even if SARIF upload fails (e.g., repositories without Advanced Security)
- **Dependency Review**: Automated dependency vulnerability and license checking
- **Advanced Security Ready**: Workflows configured for when Advanced Security is enabled

#### Security Scanning Flow
**Backend**: Trivy (dependencies), detekt (Kotlin), Docker scan, SARIF upload  
**Frontend**: Trivy (dependencies), ESLint (TypeScript), Docker scan, SARIF upload  
**Infrastructure**: tfsec (Terraform), resource validation, IAM policy review, SARIF upload  
**Global**: Repository scan, dependency review, license compliance → GitHub Security Tab

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
- `GCP_PROJECT_ID`: Google Cloud project ID
- `NEXT_PUBLIC_API_URL`: Production backend API URL for frontend builds
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`: Mapbox API access token for map functionality
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL for authentication and database
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous access key for client-side authentication

### Authentication Method
- **GCP Authentication**: Uses OpenID Connect (OIDC) workload identity provider instead of service account keys
- **Workload Identity Provider**: `projects/936816281178/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider`
- **Service Account**: `nosilha-cicd-deployer@nosilha.iam.gserviceaccount.com`

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

#### Core Project Documentation (`docs/`)
- `docs/ARCHITECTURE.md` - Detailed technical architecture with system flows and diagrams (**Updated: Shows implemented modular architecture**)
- `docs/DESIGN_SYSTEM.md` - Complete frontend design system and component library guide
- `docs/API_REFERENCE.md` - Backend API documentation with endpoints and examples
- `docs/API_CODING_STANDARDS.md` - Comprehensive backend coding standards with Bean Validation, auditing, and internationalization patterns
- `docs/CI_CD_PIPELINE.md` - Detailed CI/CD setup and troubleshooting guide
- `docs/CI_CD_TESTING.md` - Comprehensive testing procedures for CI/CD pipeline

#### Modular Architecture Documentation (NEW - Phase 1-3 Implementation)
- `docs/TESTING.md` - **Comprehensive testing guide** (Playwright E2E, Vitest unit tests, Storybook component docs)
- `docs/STATE_MANAGEMENT.md` - **State management patterns guide** (Zustand, TanStack Query, Zod validation)
- `docs/SPRING_MODULITH.md` - **Backend module architecture guide** (Module structure, event-driven communication, verification)

#### Additional Documentation
- `docs/SECRET_MANAGEMENT.md` - Comprehensive secret management guide with monitoring and cost optimization
- `docs/CULTURAL_HERITAGE_VERIFICATION.md` - Cultural heritage content verification protocols and seed data validation
- `docs/SITEMAP.md` - Frontend route structure and navigation architecture
- `docs/GCLOUD_CLOUD_RUN_TROUBLESHOOTING.md` - Operational troubleshooting guide for Cloud Run services
- `docs/SECURITY.md` - Security policy and vulnerability reporting procedures
- `docs/monitoring/` - Operational runbooks for monitoring and cost management

#### Planning & Strategy Documents (`plan/`)
- `plan/GALLERY_API_INTEGRATION.md` - Implementation strategy for gallery API integration
- `plan/IMAGE_ASSET_RESEARCH_PLAN.md` - Research plan for image asset management
- `plan/MVP_PRODUCTION_READINESS_ASSESSMENT.md` - Production readiness assessment
- `plan/UI_API_INTEGRATION_ANALYSIS.md` - UI and API integration analysis
- `plan/CONTENT_REVIEW_PLAN.md` - Content review and validation strategy
- `plan/LLM_RESEARCH_PROMPTS.md` - LLM interaction research and prompts

#### Root Documentation
- `CLAUDE.md` - Comprehensive development guide and architecture documentation (this file)
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
