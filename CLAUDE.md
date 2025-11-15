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

- **`plan/`** - Git submodule containing SpecKit specifications and planning documents (see plan repository README for details)
- **`docs/`** - Static project documentation (architecture, design system, API reference, etc.)

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
- **Single Table Inheritance**: `DirectoryEntry` is the base class for `Restaurant`, `Hotel`, `Landmark`, etc.
- **API Versioning**: All REST endpoints are prefixed with `/api/v1/`
- **Authentication**: JWT-based authentication with Supabase token validation
- **Database Strategy**: PostgreSQL primary with Flyway migrations, connection pooling via HikariCP

> **Detailed Architecture**: See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/SPRING_MODULITH.md`](docs/SPRING_MODULITH.md) for complete details.

### Frontend (Next.js App Router)
- **Route Groups**: Uses parentheses for logical organization `(auth)`, `(main)`, `(admin)` without affecting URLs
- **Server Components First**: Prioritizes React Server Components for performance
- **Dynamic Routing**: `/directory/[category]`, `/directory/entry/[slug]`
- **Mobile-First Design**: All components are responsive and mobile-optimized
- **Authentication**: Supabase Auth provider with JWT token management
- **Caching Strategy**: ISR (Incremental Static Regeneration) for content
- **API Integration**: Centralized API client with error handling and fallback to mock data

### Database Strategy
- **PostgreSQL**: Primary database for structured data (directory entries, user accounts)
- **Google Firestore**: Flexible metadata storage for AI-processed images and documents
- **Google Cloud Storage**: Media asset storage with CDN integration

### AI & Media Processing
**Cloud Vision API**: Image analysis and metadata extraction with OCR, labeling, landmark detection
**Workflow**: Upload → GCS → AI Analysis → Firestore → Enhanced Frontend Content

## Development Environment Setup

### Prerequisites
- **Node.js 18+** and npm
- **Java 21** (for backend)
- **Docker** and Docker Compose
- **PostgreSQL** (or use Docker Compose setup)

### Local Development
1. **Start infrastructure services**: `cd infrastructure/docker && docker-compose up -d`
2. **Backend setup**: `cd backend && ./gradlew bootRun --args='--spring.profiles.active=local'`
3. **Frontend setup**: `cd frontend && npm install && npm run dev`

## Environment Configuration

### Local Development URLs
- **Frontend**: `http://localhost:3000` (Next.js with Turbopack)
- **Backend API**: `http://localhost:8080/api/v1/` (Spring Boot)
- **Database**: `localhost:5432` (PostgreSQL: database=`nosilha_db`, user=`nosilha`, password=`nosilha`)
- **Firestore Emulator**: `http://localhost:8081`
- **GCS Emulator**: `http://localhost:8082`

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

### Production Environment
- **Cloud Platform**: Google Cloud Platform (GCP)
- **Region**: `us-east1`
- **Services**: Cloud Run (auto-scaling serverless containers)
- **Registry**: Google Artifact Registry (`us-east1-docker.pkg.dev`)
- **Authentication**: Supabase Auth with JWT tokens

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

### search-specialist
**Purpose**: Expert web researcher for cultural and historical topics using advanced search techniques and multi-source verification
**Key Responsibilities**:
- Advanced search query formulation for cultural research
- Domain-specific searching and filtering for authoritative sources
- Multi-source fact verification and cross-referencing
- Information synthesis across academic and community sources
- Historical and trend analysis for Cape Verdean heritage

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

## Testing Strategy

### Backend Testing
```bash
cd backend && ./gradlew test  # All tests with PostgreSQL
./gradlew test jacocoTestReport  # With coverage
./gradlew detekt  # Linting and static analysis
```

### Frontend Testing
```bash
cd frontend && npx tsc --noEmit  # Type checking
npm run lint && npm run build  # Linting and build
npx bundlesize  # Bundle analysis
```

### Integration & Security Testing
**Integration**: API validation, E2E flows, performance, security headers (`.github/workflows/integration-ci.yml`)
**Security**: Trivy (containers/deps), detekt (Kotlin), ESLint (TypeScript), tfsec (Terraform)

## CI/CD Pipeline

The project uses a **modular CI/CD architecture** with service-specific workflows. For comprehensive details, see [`docs/CI_CD_PIPELINE.md`](docs/CI_CD_PIPELINE.md).

**Key Workflows**:
- **Backend CI/CD**: `.github/workflows/backend-ci.yml` - Spring Boot/Kotlin service pipeline
- **Frontend CI/CD**: `.github/workflows/frontend-ci.yml` - Next.js/React application pipeline
- **Infrastructure CI/CD**: `.github/workflows/infrastructure-ci.yml` - Terraform infrastructure management
- **PR Validation**: `.github/workflows/pr-validation.yml` - Consolidated PR validation
- **Integration Tests**: `.github/workflows/integration-ci.yml` - Cross-service integration and E2E testing

**Key Features**: Path-based triggering, comprehensive security scanning, automated testing, direct deployment to production from main branch, health monitoring

## Cloud Deployment

- **Google Cloud Platform** with Terraform configurations in `/infrastructure/terraform/`
- **Cloud Run** for both backend and frontend deployment
- **Google Artifact Registry** for container image storage (us-east1-docker.pkg.dev)
- **Google Cloud Storage** for media asset storage
- **Google Secret Manager** for secure configuration management

## Key Documentation Files

### Core Documentation
- `docs/ARCHITECTURE.md` - Detailed technical architecture with system flows and diagrams
- `docs/DESIGN_SYSTEM.md` - Complete frontend design system and component library guide
- `docs/API_REFERENCE.md` - Backend API documentation with endpoints and examples
- `docs/API_CODING_STANDARDS.md` - Comprehensive backend coding standards
- `docs/CI_CD_PIPELINE.md` - Detailed CI/CD setup and troubleshooting guide
- `docs/TROUBLESHOOTING.md` - Common issues and solutions

### Module Architecture Documentation
- `docs/TESTING.md` - Comprehensive testing guide (Playwright E2E, Vitest unit tests, Storybook)
- `docs/STATE_MANAGEMENT.md` - State management patterns guide (Zustand, TanStack Query, Zod)
- `docs/SPRING_MODULITH.md` - Backend module architecture guide (Module structure, event-driven communication)

### Additional Documentation
- `docs/SECRET_MANAGEMENT.md` - Comprehensive secret management guide
- `docs/CULTURAL_HERITAGE_VERIFICATION.md` - Cultural heritage content verification protocols
- `docs/SITEMAP.md` - Frontend route structure and navigation architecture
- `docs/SECURITY.md` - Security policy and vulnerability reporting procedures

## Troubleshooting

For common development, CI/CD, deployment, database, and performance issues, see [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md).

**Quick Help**:
- **CI/CD Issues**: `docs/CI_CD_PIPELINE.md` and `docs/CI_CD_TESTING.md`
- **Security Issues**: `docs/SECURITY.md`
- **Architecture Questions**: `docs/ARCHITECTURE.md` and this file
- **Infrastructure Issues**: Check Terraform state and GCP Console

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

## Active Technologies
- TypeScript 5.x, React 19, Next.js 15 (App Router) + Tailwind CSS, Framer Motion (animations), Radix UI (accessible primitives), Lucide React (icons) (005-action-toolbar-refactor)
- N/A (frontend-only refactoring, uses existing backend API from feature 004) (005-action-toolbar-refactor)

## Recent Changes
- 005-action-toolbar-refactor: Added TypeScript 5.x, React 19, Next.js 15 (App Router) + Tailwind CSS, Framer Motion (animations), Radix UI (accessible primitives), Lucide React (icons)
