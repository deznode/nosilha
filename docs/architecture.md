# Nos Ilha Architecture Documentation

This document provides a comprehensive technical overview of the Nos Ilha platform architecture using the [Arc42](https://arc42.org/) template.

---

## Quick Start for Contributors

New to the codebase? Choose your role for an optimal reading path:

| Role | Start Here | Then Read | Deep Dive |
|------|-----------|-----------|-----------|
| **Frontend Developer** | [§5.1](#51-level-1-system-decomposition), [§5.2](#52-frontend-structure) | [state-management.md](state-management.md) | [design-system.md](design-system.md) |
| **Backend Developer** | [§5.1](#51-level-1-system-decomposition), [§5.3](#53-backend-modules) | [spring-modulith.md](spring-modulith.md) | [api-coding-standards.md](api-coding-standards.md) |
| **DevOps/Infrastructure** | [§7](#7-deployment-view), [§8](#8-cross-cutting-concerns) | [ci-cd-pipeline.md](ci-cd-pipeline.md) | [secret-management.md](secret-management.md) |

**Time to read this document**: ~15 minutes for system overview

---

## 1. Introduction and Goals

### 1.1 Purpose

Nos Ilha is a community-driven cultural heritage hub for Brava Island, Cape Verde. This volunteer-supported, open-source project preserves and celebrates the island's rich cultural memory through an interactive directory of cultural sites, landmarks, and local businesses with mapping functionality.

### 1.2 Quality Goals

| Priority | Quality Goal | Description |
|----------|-------------|-------------|
| 1 | Cultural Authenticity | Content verified by community members and cultural experts |
| 2 | Mobile-First Accessibility | Optimized for mobile devices on varying network conditions |
| 3 | Community Contribution | Low barrier to entry for content submissions |
| 4 | Maintainability | Solo-maintainer friendly architecture |
| 5 | Performance | Fast page loads with intelligent caching |

### 1.3 Stakeholders

| Stakeholder | Role | Expectations |
|-------------|------|--------------|
| Local Community | Primary users, content contributors | Easy navigation, accurate cultural information |
| Cape Verdean Diaspora | Remote users, story contributors | Connection to heritage, community stories |
| Tourists | Discovery users | Practical directory information, maps |
| Developers | Contributors | Clear documentation, modular architecture |
| Cultural Organizations | Partners | Platform for heritage preservation |

---

## 2. Constraints

### 2.1 Technical Constraints

| Constraint | Description |
|------------|-------------|
| Solo-maintained | Single primary maintainer; architecture must be simple to operate |
| Budget-conscious | GCP free tier optimization; Supabase free tier for auth/database |
| Monorepo structure | Frontend and backend in single repository |
| Fixed tech stack | Next.js 16, Spring Boot 4.0, Kotlin 2.3.0, Java 25 |

### 2.2 Organizational Constraints

| Constraint | Description |
|------------|-------------|
| Open source | MIT licensed; community contributions welcome |
| Volunteer-supported | No guaranteed SLA; community-driven development |
| Cultural sensitivity | Content requires community verification |

---

## 3. Context and Scope

### 3.1 System Context

```mermaid
C4Context
    title System Context - Nos Ilha

    Person(community, "Community Member", "Local resident contributing cultural content")
    Person(admin, "Admin/Moderator", "Reviews submissions and manages content")
    Person(tourist, "Tourist", "Discovers Brava Island heritage")

    System(nosilha, "Nos Ilha Platform", "Cultural heritage hub preserving Brava Island memory")

    System_Ext(supabase, "Supabase", "Authentication + PostgreSQL database")
    System_Ext(mapbox, "Mapbox", "Interactive mapping service")
    System_Ext(r2, "Cloudflare R2", "Media file storage")
    System_Ext(gcp, "Google Cloud Platform", "Container hosting, secrets, registry")

    Rel(community, nosilha, "Contributes stories, submits places")
    Rel(admin, nosilha, "Moderates content")
    Rel(tourist, nosilha, "Explores directory and map")
    Rel(nosilha, supabase, "Authenticates users, stores data")
    Rel(nosilha, mapbox, "Renders interactive maps")
    Rel(nosilha, r2, "Stores uploaded media")
    Rel(nosilha, gcp, "Deploys containers")
```

### 3.2 External Interfaces

| System | Purpose | Interface |
|--------|---------|-----------|
| Supabase Auth | User authentication | JWT tokens, OAuth providers |
| Supabase PostgreSQL | Primary database | JDBC connection |
| Mapbox | Interactive maps | GL JS API |
| Cloudflare R2 | Media file storage | S3-compatible API |
| GCP Cloud Run | Container hosting | HTTP/HTTPS |
| GCP Artifact Registry | Docker images | Container Registry API |
| GCP Secret Manager | Secrets storage | Secret Manager API |

---

## 4. Solution Strategy

### 4.1 Technology Decisions

| Decision | Rationale |
|----------|-----------|
| **Modular Monolith** (Spring Modulith) | Simpler than microservices; enforced module boundaries |
| **Event-Driven Communication** | Loose coupling between modules via `@ApplicationModuleListener` |
| **Server-First Rendering** | React Server Components for performance |
| **ISR Caching** | Incremental Static Regeneration for content freshness |
| **Single Table Inheritance** | All place types in one table with discriminator |

### 4.2 Quality Strategy

| Quality Goal | Strategy |
|--------------|----------|
| Maintainability | TypeScript-first frontend, Kotlin backend, module boundary tests |
| Performance | ISR caching (frontend), Caffeine caching (backend) |
| Security | Supabase JWT validation, role-based access control |
| Testability | Module isolation, Testcontainers for integration tests |

---

## 5. Building Block View

### 5.1 Level 1: System Decomposition

```mermaid
C4Container
    title Container Diagram - Nos Ilha

    Person(user, "User", "Community member, tourist, or admin")

    System_Boundary(nosilha, "Nos Ilha Platform") {
        Container(frontend, "Frontend", "Next.js 16, React 19, TypeScript", "Server-rendered web app with App Router, Zustand, TanStack Query")
        Container(backend, "Backend API", "Spring Boot 4.0, Kotlin 2.3", "REST API with 8 Spring Modulith modules")
    }

    System_Ext(supabase, "Supabase", "Auth + PostgreSQL")
    System_Ext(mapbox, "Mapbox", "GL JS mapping API")
    System_Ext(r2, "Cloudflare R2", "S3-compatible storage")

    Rel(user, frontend, "Uses", "HTTPS")
    Rel(frontend, backend, "Calls", "REST/JSON")
    Rel(frontend, mapbox, "Loads maps", "GL JS")
    Rel(backend, supabase, "Authenticates, queries", "JDBC/JWT")
    Rel(backend, r2, "Stores files", "S3 API")
```

### 5.2 Frontend Structure

| Route Group | Purpose | Key Routes |
|-------------|---------|------------|
| `(auth)` | Authentication | `/login`, `/signup` |
| `(main)` | Public content | `/directory`, `/map`, `/stories`, `/gallery` |
| `(admin)` | Administration | `/admin`, `/admin/sandbox` |

For state management (Zustand, TanStack Query, Zod) and component patterns, see [state-management.md](state-management.md) and [design-system.md](design-system.md).

### 5.3 Backend Modules

```mermaid
flowchart TB
    subgraph Backend["⚡ Backend API - Spring Modulith"]
        subgraph Foundation["🏛️ Foundation"]
            shared["shared\n<i>Base entities, events</i>"]
            config["config\n<i>Cache config</i>"]
        end

        subgraph Core["📦 Core Modules"]
            places["places\n<i>Directory entries</i>"]
            gallery["gallery\n<i>Media management</i>"]
            engagement["engagement\n<i>Reactions, bookmarks</i>"]
        end

        subgraph Content["📝 Content Modules"]
            auth["auth\n<i>JWT + profiles</i>"]
            stories["stories\n<i>Narratives, MDX</i>"]
        end

        subgraph Integration["🔗 Integration"]
            feedback["feedback\n<i>Dashboard, suggestions</i>"]
        end
    end

    places --> shared
    gallery --> shared
    engagement --> shared
    engagement -.-> places
    auth --> shared
    stories --> shared
    stories -.-> auth
    stories -.-> places
    feedback --> shared
    feedback -.-> auth
    feedback -.-> places
    feedback -.-> stories
    feedback -.-> gallery

    style shared fill:#f5f5f4,stroke:#78716c,color:#44403c
    style places fill:#dcfce7,stroke:#16a34a,color:#166534
    style gallery fill:#fef3c7,stroke:#d97706,color:#92400e
    style auth fill:#fee2e2,stroke:#dc2626,color:#991b1b
    style stories fill:#fce7f3,stroke:#db2777,color:#9d174d
    style feedback fill:#ffedd5,stroke:#ea580c,color:#9a3412
```

| Module | Purpose | Key Entities |
|--------|---------|--------------|
| `shared` | Foundation layer | AuditableEntity, DomainEvent, exceptions |
| `auth` | Authentication | User, UserProfile, JWT validation |
| `places` | Directory entries | DirectoryEntry (STI: Restaurant, Hotel, Beach, Heritage, Nature) |
| `gallery` | Media management | GalleryMedia, UserUploadedMedia, R2 storage |
| `engagement` | User interactions | Reaction, Bookmark, Content |
| `stories` | Community narratives | StorySubmission, MdxArchive |
| `feedback` | Community input | Suggestion, DirectorySubmission, ContactMessage |
| `config` | Configuration | Caffeine cache manager |

For module communication patterns (events, query services, boundaries), see [spring-modulith.md](spring-modulith.md).

---

## 6. Runtime View

### 6.1 Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    participant U as 👤 User
    participant F as 📱 Frontend
    participant S as 🔐 Supabase Auth
    participant B as ⚡ Backend API
    participant D as 🗄️ PostgreSQL

    rect rgb(59, 130, 246, 0.1)
        Note over U,S: Authentication
        U->>F: Login Request
        F->>S: Authenticate (OAuth/Email)
        S-->>F: JWT Token
        F->>F: Store token (Zustand)
    end

    rect rgb(16, 185, 129, 0.1)
        Note over F,D: API Request
        F->>B: Request + Authorization header
        B->>B: Validate JWT
        B->>D: Query with user context
        D-->>B: Results
        B-->>F: Response
        F-->>U: Display data
    end
```

### 6.2 Event-Driven Module Communication

```mermaid
sequenceDiagram
    autonumber
    participant PS as 📍 PlacesService
    participant EP as 📤 EventPublisher
    participant GS as 🖼️ GalleryService
    participant FS as 💬 FeedbackService

    rect rgb(139, 92, 246, 0.1)
        Note over PS,FS: Event-Driven Communication
        PS->>EP: publishEvent(DirectoryEntryCreatedEvent)
        par Parallel Listeners
            EP->>GS: @ApplicationModuleListener
            GS->>GS: Initialize media placeholder
        and
            EP->>FS: @ApplicationModuleListener
            FS->>FS: Log entry creation
        end
    end
```

### 6.3 Content Caching Strategy

See [§8.4 Caching Strategy](#84-caching-strategy) for cache configuration across all layers.

---

## 7. Deployment View

### 7.1 Infrastructure Diagram

```mermaid
C4Deployment
    title Deployment Diagram - Nos Ilha (Production)

    Deployment_Node(gcp, "Google Cloud Platform", "us-east1") {
        Deployment_Node(cloudrun, "Cloud Run", "Serverless containers") {
            Container(frontend, "nosilha-frontend", "Next.js 16", "Server-rendered frontend")
            Container(backend, "nosilha-backend-api", "Spring Boot 4.0", "REST API")
        }
        Deployment_Node(registry, "Artifact Registry", "Container images") {
            Container(fe_image, "frontend:latest", "Docker")
            Container(be_image, "backend:latest", "Docker")
        }
        Container(secrets, "Secret Manager", "GCP", "Environment configuration")
    }

    Deployment_Node(supabase_cloud, "Supabase Cloud", "Managed services") {
        Container(auth, "Auth Service", "Supabase Auth", "JWT authentication")
        ContainerDb(db, "PostgreSQL", "Supabase DB", "Application data")
    }

    Deployment_Node(cloudflare, "Cloudflare", "Edge services") {
        Container(r2, "R2 Storage", "S3-compatible", "Media files")
    }

    Rel(frontend, backend, "Calls", "HTTPS")
    Rel(backend, db, "Queries", "JDBC")
    Rel(backend, auth, "Validates JWT", "HTTPS")
    Rel(backend, r2, "Stores media", "S3 API")
    Rel(cloudrun, secrets, "Reads")
    Rel(cloudrun, registry, "Pulls images")
```

### 7.2 Deployment Configuration

| Service | Resource Limits | Scaling |
|---------|-----------------|---------|
| Frontend | 1 CPU, 512Mi | 0-10 instances |
| Backend | 1 CPU, 512Mi | 0-10 instances |

**Infrastructure as Code:** Terraform configurations in `/infrastructure/terraform/`

See [docs/ci-cd-pipeline.md](ci-cd-pipeline.md) for CI/CD details.

---

## 8. Cross-cutting Concerns

### 8.1 Security

| Layer | Mechanism |
|-------|-----------|
| Authentication | Supabase JWT with ES256 algorithm |
| Authorization | Role-based access (admin, user) via JWT claims |
| Input Validation | Zod (frontend), Bean Validation (backend) |
| Content Sanitization | OWASP Java HTML Sanitizer |
| CORS | Configured for production domains |

### 8.2 Error Handling

| Layer | Strategy | Failure Mode |
|-------|----------|--------------|
| Frontend | Error boundaries, toast notifications | Graceful degradation to mock data |
| Backend | GlobalExceptionHandler | Structured error responses with problem details |
| API | HTTP status codes (400, 404, 422, 500) | Consistent error envelope format |

**Exception Mapping** (Backend):
- `ResourceNotFoundException` → 404 Not Found
- `BusinessException` → 422 Unprocessable Entity
- `MethodArgumentNotValidException` → 400 Bad Request

For complete error handling patterns, see [api-coding-standards.md](api-coding-standards.md#6-error-handling).

### 8.3 Observability

| Component | Tool | Endpoints/Patterns |
|-----------|------|-------------------|
| Health checks | Spring Boot Actuator | `/actuator/health`, `/actuator/info` |
| Metrics | Actuator + Micrometer | `/actuator/metrics` |
| Application logs | Cloud Run logging | Structured JSON logs in production |
| Request logging | kotlin-logging | Lambda syntax for lazy evaluation |

**Logging Levels**:
- `debug` - Query operations, detailed flow
- `info` - Write operations, significant events
- `warn` - Recoverable errors, rate limits
- `error` - Unhandled exceptions, critical failures

### 8.4 Caching Strategy

| Layer | Tool | TTL | Use Case |
|-------|------|-----|----------|
| Frontend (ISR) | Next.js | 1 hour | Directory listings |
| Frontend (client) | TanStack Query | 5 min | Client-side data |
| Backend | Caffeine | 5 min | Reaction counts, frequently accessed data |

---

## 9. Architecture Decisions

Key decisions are documented in `/docs/adr/`. Each ADR explains the context, alternatives considered, and consequences.

| ADR | Decision | Summary | Status |
|-----|----------|---------|--------|
| [ADR-001](adr/0001-nx-monorepo.md) | Nx for polyglot monorepo | Chose Nx over Turborepo for unified orchestration of Next.js + Spring Boot with task caching and affected commands | Accepted |
| [ADR-002](adr/0002-spring-modulith.md) | Modular monolith | Chose Spring Modulith over microservices for solo-maintainer operational simplicity with enforced module boundaries | Accepted |
| [ADR-003](adr/0003-supabase-auth.md) | Supabase authentication | External auth provider to minimize security surface and maintenance burden (50K free MAU) | Accepted |
| [ADR-004](adr/0004-es256-jwt-algorithm.md) | ES256 JWT algorithm | Custom JwtDecoder for Supabase's asymmetric keys (Spring Security defaults to RS256) | Accepted |

**When to read ADRs**: If you're modifying authentication, module boundaries, or build tooling, read the relevant ADR first to understand constraints and rationale.

---

## 10. Quality Requirements

### 10.1 Quality Scenarios

| Quality | Scenario | Metric |
|---------|----------|--------|
| Performance | Page load on 3G | < 3 seconds |
| Maintainability | Module boundaries | Zero circular dependencies |
| Testability | E2E test suite | < 5 minutes execution |
| Reliability | Unit test coverage | >= 70% threshold |

### 10.2 Testing Strategy

| Type | Tool | Scope |
|------|------|-------|
| Unit tests | Vitest | Stores, hooks, schemas |
| E2E tests | Playwright | Critical user flows |
| Integration tests | Testcontainers | Backend API with PostgreSQL |
| Module tests | Spring Modulith | Module boundary verification |

See [docs/testing.md](testing.md) for details.

---

## 11. Risks and Technical Debt

### 11.1 Current Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Solo maintainer | Bus factor of 1 | Documentation, modular design |
| Single region (us-east1) | Latency for Cape Verde users | Consider eu-west1 in future |
| Supabase dependency | Vendor lock-in | Standard PostgreSQL, JWT patterns |

### 11.2 Technical Debt

| Item | Status | Notes |
|------|--------|-------|
| detekt code analysis | Disabled | Pending Kotlin 2.3.0 compatibility |
| GCS bucket | Provisioned, unused | Using Cloudflare R2 instead |
| Media processing | Not implemented | Future: image optimization, moderation |

---

## 12. Glossary

### Domain Terms

| Term | Definition |
|------|------------|
| Morabeza | Cape Verdean hospitality and warmth |
| Sodade | Deep longing or nostalgia, central to Cape Verdean culture |
| Brava | The smallest inhabited island of Cape Verde |
| Fogo | Volcanic neighboring island visible from Brava |

### Technical Terms

| Term | Definition |
|------|------------|
| ISR | Incremental Static Regeneration (Next.js caching strategy) |
| STI | Single Table Inheritance (JPA pattern for polymorphism) |
| Spring Modulith | Framework for modular monolith architecture with enforced boundaries |
| TanStack Query | Server state management library for React (caching, background refetch) |
| Testcontainers | Library for spinning up real dependencies (PostgreSQL) in integration tests |
| RSC | React Server Components |
| Zustand | Lightweight client state management for React |
| Caffeine | High-performance Java caching library |

---

## Related Documentation

- [Spring Modulith Architecture](spring-modulith.md) - Backend module details
- [State Management](state-management.md) - Frontend state patterns
- [Design System](design-system.md) - UI components and styling
- [API Reference](api-reference.md) - REST API documentation
- [CI/CD Pipeline](ci-cd-pipeline.md) - Build and deployment
- [Testing](testing.md) - Test strategy and execution
