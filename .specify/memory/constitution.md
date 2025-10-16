# Nos Ilha Platform Constitution

<!--
Sync Impact Report
==================
Version: 1.0.0 → Initial ratification
Modified principles: N/A (initial version)
Added sections: All sections (initial constitution)
Removed sections: N/A
Templates requiring updates:
  ✅ plan-template.md - Constitution Check section ready
  ✅ spec-template.md - Aligned with principles
  ✅ tasks-template.md - Task categorization supports all principles
Follow-up TODOs: None
-->

## Core Principles

### I. Community-First Development

Every feature and decision must serve the community's needs—local residents, business owners, tourists, and the global Cape Verdean diaspora. The platform is volunteer-supported and open-source, prioritizing:

- Authentic cultural representation and respectful heritage preservation
- Accessibility for users with limited connectivity and diverse technical capabilities
- Sustainable, low-cost infrastructure appropriate for community resources
- Open collaboration and transparent development practices

**Rationale**: As a community-driven cultural heritage platform, the project's legitimacy and value come from serving real community needs, not from technical complexity. Every line of code should justify its existence by directly supporting community goals.

### II. Documentation-Driven Architecture

All architectural decisions, API contracts, and design patterns MUST be documented before implementation. Documentation is not an afterthought but a first-class deliverable that includes:

- Comprehensive architecture documentation (ARCHITECTURE.md, API_REFERENCE.md)
- Clear coding standards for backend (API_CODING_STANDARDS.md) and frontend (DESIGN_SYSTEM.md)
- Agent-specific guidance files (CLAUDE.md) updated incrementally as systems evolve
- Planning documents that capture research, design decisions, and implementation strategies

**Rationale**: Documentation enables volunteer contributors to understand context quickly, ensures consistency across development cycles, and preserves institutional knowledge when contributors rotate. For an open-source community project, documentation IS the interface.

### III. Modular Service Architecture

The platform consists of three independently deployable, loosely coupled services with clear boundaries:

- **Frontend Service**: Next.js 15 + React 19 (UI, SSR, ISR caching, authentication)
- **Backend Service**: Spring Boot 3.4.7 + Kotlin (REST APIs, business logic, data management)
- **Infrastructure Layer**: Terraform + GCP (Cloud Run, databases, storage, CI/CD)

Each service MUST:

- Have independent deployment pipelines with path-based triggering
- Define clear API contracts and integration points
- Support local development via Docker Compose emulation
- Include comprehensive health checks and monitoring

**Rationale**: Modular architecture enables independent scaling, deployment, and maintenance. Community volunteers can contribute to one service without understanding the entire stack. Service isolation reduces blast radius during failures and simplifies troubleshooting.

### IV. Domain-Driven Design & Type Safety

Backend code MUST follow domain-driven design principles with strong type safety:

- **Entities**: Domain models with clear inheritance patterns (Single Table Inheritance for DirectoryEntry hierarchy)
- **DTOs**: Explicit data transfer objects for API boundaries (never expose entities directly)
- **Services**: Business logic encapsulation with clear separation of concerns
- **Repositories**: Data access abstraction with Spring Data JPA
- **Validation**: Bean Validation annotations for compile-time and runtime safety

Frontend code MUST leverage TypeScript for type safety:

- Explicit interfaces for all API responses and component props
- Type-safe API client with error handling
- Server Components first, Client Components only when necessary

**Rationale**: Type safety prevents runtime errors, improves code maintainability, and provides IDE support that accelerates volunteer onboarding. Domain-driven patterns ensure business logic clarity and testability.

### V. Test-First Development (NON-NEGOTIABLE)

Testing is mandatory but pragmatic, proportional to the project's community nature:

**MUST have:**

- **Contract Tests**: API endpoint contracts verified before implementation
- **Integration Tests**: Critical user flows (authentication, content management, search)
- **CI/CD Testing**: Automated lint, type-check, security scan, build verification
- **Manual Testing**: Quickstart validation for major features

**Future considerations:**

- Unit tests for complex business logic (not required for simple CRUD operations)
- E2E tests for critical user journeys (when resources permit)
- Performance testing for high-traffic endpoints

**Rationale**: Community projects have limited testing resources. Focus testing effort on highest-risk areas: API contracts (prevent breaking changes), integration flows (ensure core features work), and security (protect user data). Automated CI/CD testing provides quality gates without manual overhead.

### VI. Security & Privacy by Design

Security is non-negotiable for a community platform handling user data and cultural heritage content:

- **Authentication**: JWT-based authentication via Supabase with token validation
- **Authorization**: Role-based access control for admin operations
- **Data Protection**: Encrypted secrets (Google Secret Manager), secure environment variables
- **Vulnerability Scanning**: Automated security scanning (Trivy, detekt, ESLint, tfsec) in CI/CD
- **Least Privilege**: IAM roles with minimal necessary permissions
- **Privacy Controls**: GDPR-compliant data handling with explicit user consent

**Rationale**: Security breaches erode community trust and can destroy volunteer projects. Automated security scanning and secure-by-default patterns prevent vulnerabilities without requiring security expertise from every contributor.

### VII. Performance & Scalability

The platform MUST be performant for global users with varying connectivity:

- **Frontend**: ISR caching (1hr for directories, 30min for entries), CDN asset delivery, WebP images, lazy loading
- **Backend**: Connection pooling (HikariCP), database indexing, efficient queries
- **Infrastructure**: Auto-scaling Cloud Run services, serverless architecture
- **Mobile-First**: All components optimized for mobile devices and slow connections

**Performance Targets**:

- Page load: <3s on 3G connection
- API response: <200ms p95 latency
- Time to Interactive: <5s on mobile

**Rationale**: Many Cape Verdean users and diaspora members access the platform from areas with limited connectivity. Performance is not a luxury but a requirement for equitable access.

### VIII. Incremental Complexity

Start simple. Add complexity only when justified by specific community needs:

- **Default to simple**: Single-table design before normalization, monolithic deployment before microservices
- **Complexity requires justification**: Document in plan.md Complexity Tracking section with alternatives considered
- **YAGNI principle**: Don't build features for hypothetical future needs
- **Refactor when needed**: Technical debt is acceptable if serving community needs; refactor when pain exceeds benefit

**Examples of acceptable complexity**:

- Single Table Inheritance for DirectoryEntry (justified: polymorphic queries, shared behavior)
- Modular CI/CD workflows (justified: independent deployment cycles, path-based efficiency)
- ISR caching strategy (justified: performance for users with limited connectivity)

**Rationale**: Volunteer projects have limited maintenance capacity. Unnecessary complexity increases cognitive load, slows contributions, and creates technical debt. Every architectural decision should be reversible and justified by current needs.

## Development Workflow

### Planning & Implementation Process
Complex features (3+ hours of work) MUST follow the structured planning workflow:

1. **Specification** (`/specify` command): Define WHAT users need, not HOW to build it
   - User scenarios and acceptance criteria
   - Functional requirements (testable, unambiguous)
   - Key entities without implementation details
   - Output: `.specify/specs/[feature]/spec.md`

2. **Planning** (`/plan` command): Research and design HOW to implement
   - Technical context and architecture decisions
   - Constitution compliance check (validate against principles)
   - Phase 0: Research unknowns and best practices
   - Phase 1: Design contracts, data models, tests
   - Output: `plan.md`, `research.md`, `data-model.md`, `contracts/`, agent file updates

3. **Task Generation** (`/tasks` command): Break design into actionable tasks
   - TDD order: Tests before implementation
   - Dependency order: Models → Services → Endpoints → Polish
   - Mark [P] for parallel execution (different files)
   - Output: `tasks.md` with numbered, ordered tasks

4. **Implementation** (`/implement` command or manual): Execute tasks
   - Commit after each completed task
   - Update todo list to track progress
   - Run tests to verify correctness
   - Update documentation as needed

5. **Review & Validation** (`/analyze` command): Cross-artifact consistency check
   - Verify spec, plan, tasks alignment
   - Check for incomplete implementations
   - Validate constitution compliance
   - Generate improvement recommendations

### Code Review Standards

All pull requests MUST:

- Pass automated CI/CD checks (lint, type-check, security scan, build)
- Include relevant documentation updates
- Reference related specification/plan documents
- Verify constitution compliance for architectural changes
- Include manual testing evidence for user-facing features

## Technology Standards

### Backend Technology Standards

- **Language**: Kotlin with Spring Boot 3.4.7
- **Database**: PostgreSQL 15 (primary), Firestore (metadata), Cloud Storage (media)
- **Migrations**: Flyway for versioned schema evolution
- **Security**: JWT validation, Bean Validation, CORS configuration
- **Monitoring**: Spring Boot Actuator for health checks and metrics
- **Testing**: JUnit for tests, Jacoco for coverage reporting

### Frontend Technology Standards

- **Language**: TypeScript with Next.js 15, React 19
- **Styling**: Tailwind CSS with Catalyst UI component library
- **Authentication**: Supabase Auth with JWT token management
- **Caching**: ISR (Incremental Static Regeneration) for static content
- **Mapping**: Mapbox GL JS for interactive maps
- **Testing**: ESLint for linting, TypeScript for type checking

### Infrastructure Technology Standards

- **Cloud Platform**: Google Cloud Platform (GCP)
- **Deployment**: Cloud Run for serverless auto-scaling containers
- **Infrastructure as Code**: Terraform for reproducible infrastructure
- **Container Registry**: Google Artifact Registry
- **CI/CD**: GitHub Actions with modular, path-based workflows
- **Security Scanning**: Trivy, detekt, ESLint, tfsec with SARIF reporting

## Governance

### Constitution Authority

This constitution supersedes all other practices and conventions. When conflicts arise:

1. Constitution principles take precedence
2. Document specific reasoning in implementation plans
3. Propose constitution amendments if principles are blocking progress

### Amendment Process

Constitution amendments require:

1. **Proposal**: Document proposed change with rationale and impact analysis
2. **Review**: Community review period (minimum 7 days for major changes)
3. **Approval**: Consensus from active maintainers
4. **Migration**: Update dependent templates, documentation, and code
5. **Version**: Increment version per semantic versioning (MAJOR.MINOR.PATCH)

**Version Rules**:

- **MAJOR**: Backward incompatible governance changes or principle removals
- **MINOR**: New principles added or materially expanded guidance
- **PATCH**: Clarifications, wording improvements, typo fixes

### Compliance Review

All feature implementations MUST:

- Reference constitution compliance in plan.md Constitution Check section
- Document complexity deviations in Complexity Tracking
- Justify architectural decisions against core principles
- Update agent guidance files incrementally (not wholesale rewrites)

### Agent-Specific Guidance

This constitution provides universal principles. Agent-specific guidance files (e.g., CLAUDE.md for Claude Code) provide tactical implementation guidance and project-specific context:

- **Universal principles**: Defined in this constitution
- **Agent-specific tactics**: Defined in agent guidance files
- **Incremental updates**: Agent files updated per `.specify/scripts/bash/update-agent-context.sh`
- **Token efficiency**: Agent files kept under 150 lines for optimal context usage

**Version**: 1.0.0 | **Ratified**: 2025-09-29 | **Last Amended**: 2025-09-29
