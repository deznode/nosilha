<!--
SYNC IMPACT REPORT
==================
Version Change: 1.0.0 → 1.1.0
Modified Principles:
  - REMOVED: II. Community-Driven Development
  - MODIFIED: VII → VI. Developer-Discretion Testing (developer discretion, no TDD mandate)
  - MODIFIED: VIII → VII. Infrastructure as Code (Terraform exceptions allowed)
  - RENUMBERED: III-VIII → II-VII

Technical Standards Updated:
  - Database & Storage: Removed Firestore/GCS, updated to PostgreSQL + Cloudflare R2

Added Sections:
  - Planning Agents (frontend-engineer, backend-engineer)
  - Constitution Compliance Checklist format

Removed Sections:
  - Agent Usage Requirements (replaced by Planning Agents)

Templates Status:
✅ plan-template.md - Principle references updated
✅ spec-template.md - No changes needed
✅ tasks-template.md - No changes needed
✅ checklist-template.md - No changes needed
✅ agent-file-template.md - No changes needed

Follow-up Actions:
- ✅ Agent files updated with Constitution Compliance Checklist format
-->

# Nos Ilha Constitution

## Core Principles

### I. Cultural Authenticity First
Every feature, content piece, and design decision MUST prioritize authentic representation of Cape Verdean cultural heritage over all other considerations. Community validation and elder consultation are mandatory for cultural content. Sacred knowledge and cultural intellectual property MUST be protected. No feature ships without cultural verification when heritage content is involved.

**Rationale**: As a community-driven cultural heritage platform, maintaining authenticity and respectful representation is the foundation of trust with the Cape Verdean diaspora, local community, and international visitors.

### II. Mobile-First Experience
All user interfaces MUST be designed and tested for mobile devices first, then progressively enhanced for larger screens. Performance on limited connectivity and lower-end devices is non-negotiable. The platform MUST serve diaspora users worldwide with varying network conditions.

**Rationale**: The primary audience includes diaspora members accessing the platform from mobile devices globally, often with constrained bandwidth.

### III. Documentation-Driven Architecture
Every architectural decision, API contract, and design pattern MUST be documented before implementation. Specialized agents MUST reference established documentation (ARCHITECTURE.md, API_CODING_STANDARDS.md, DESIGN_SYSTEM.md, etc.) before making changes. Documentation lives in `docs/` for static guides and `plan/` for dynamic feature planning.

**Rationale**: Clear documentation ensures consistency, enables new contributors to onboard effectively, and prevents architectural drift in a community-maintained project.

### IV. Modular Architecture with Enforced Boundaries
Backend modules (shared, auth, directory, media) MUST maintain independence through Spring Modulith architecture. Modules communicate via events, never direct dependencies. Frontend components follow clear separation: providers, Catalyst UI, custom UI, admin. Circular dependencies are forbidden and verified through automated testing.

**Rationale**: Modular architecture enables parallel development, simplifies testing, reduces coupling, and allows features to be developed and deployed independently.

### V. Security & Privacy by Design
All security practices MUST follow least-privilege principles. Secrets management through Google Secret Manager only. No credentials in code or environment files checked into version control. JWT-based authentication with proper token validation. GDPR compliance for user data, especially AI features involving personal information.

**Rationale**: Protecting community data and maintaining trust is paramount. Security breaches would undermine the platform's mission and harm the community it serves.

### VI. Developer-Discretion Testing
Testing is at developer discretion. Complex features SHOULD be tested, but the scope and depth are determined by the developer based on risk and complexity. All code MUST pass TypeScript checking, ESLint validation, and build verification before merge.

**Rationale**: Developer judgment determines appropriate test coverage. Complex features warrant testing, but rigid test requirements are counterproductive.

### VII. Infrastructure as Code & Automation
Infrastructure SHOULD be defined in Terraform where supported. Exceptions are permitted for resources not supported by Terraform providers. CI/CD pipelines MUST be modular and path-based (backend, frontend, infrastructure). Security scanning is mandatory. Production deployments MUST include automated health checks.

**Rationale**: Reproducible infrastructure reduces operational burden. Terraform exceptions acknowledged for provider limitations.

## Technical Standards

### API Development
- All REST endpoints MUST use `/api/v1/` prefix
- HTTP status codes MUST follow RESTful conventions (see API_CODING_STANDARDS.md)
- Bean Validation MUST be used for input validation
- DTOs MUST be used for API contracts, never expose domain entities directly
- JPA repositories for database access, Flyway for migrations
- Single Table Inheritance pattern for DirectoryEntry and subclasses

### Frontend Development
- React Server Components by default; Client Components only when interactivity required
- Tailwind CSS with design system tokens from DESIGN_SYSTEM.md
- ISR caching (1hr for directories, 30min for entries)
- Centralized API client (`lib/api.ts`) with error handling
- Supabase Auth for authentication with JWT token management
- Dark/light theme support mandatory for all components

### State Management
- Zustand for client state (UI preferences, auth, filters)
- TanStack Query for server state (directory entries, profiles, metadata)
- Zod schemas for runtime validation (forms, API responses, parsing)
- Avoid prop drilling; use context appropriately

### Database & Storage
- PostgreSQL primary database with Flyway migrations (single source of truth)
- Cloudflare R2 for media assets (S3-compatible)
- PostgreSQL for all metadata including media metadata
- UUID primary keys for all entities
- Auditing fields (created_at, updated_at) on all entities

## Development Workflow

### Feature Development Process
1. **Specification**: Create feature spec using spec-template.md in `specs/###-feature-name/`
2. **Planning**: Generate implementation plan using plan-template.md
3. **Constitution Check**: Verify compliance with all principles before proceeding
4. **Design Artifacts**: Create research.md, data-model.md, contracts/, quickstart.md
5. **Task Generation**: Generate tasks.md from design artifacts
6. **Implementation**: Execute tasks with continuous testing and validation
7. **Review**: Code review, design review, cultural verification (if applicable)
8. **Deployment**: Merge to main triggers automated CI/CD pipeline

### Branch Strategy
- `main`: Production branch, protected, requires PR approval
- Feature branches: `###-feature-name` format
- Hotfix branches: `hotfix/description` format
- All PRs MUST pass CI/CD validation before merge

## Planning Agents

Planning agents are specialized assistants that design architecture and create specifications. They MUST NOT write code.

### frontend-engineer

**Scope**: Plans Next.js 16 + React 19.2 + TypeScript frontend architecture

**Mandatory Reference**: `docs/DESIGN_SYSTEM.md`

**Output**: Architectural decisions, component structures, TypeScript interfaces, design system compliance

### backend-engineer

**Scope**: Plans Spring Boot 4 + Kotlin backend API architecture

**Mandatory Reference**: `docs/API_CODING_STANDARDS.md`

**Output**: API designs, data models, module interactions, database schemas

### Planning Agent Rules

1. Planning agents create specifications only - they MUST NOT write code
2. The main agent implements specifications using appropriate skills
3. All planning output MUST include a Constitution Compliance Checklist

### Constitution Compliance Checklist Format

All planning agent output MUST include this table:

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Cultural Authenticity First | ✅/⚠️/❌ | Explanation if not N/A |
| II. Mobile-First Experience | ✅/⚠️/❌ | ... |
| III. Documentation-Driven Architecture | ✅/⚠️/❌ | ... |
| IV. Modular Architecture | ✅/⚠️/❌ | ... |
| V. Security & Privacy by Design | ✅/⚠️/❌ | ... |
| VI. Developer-Discretion Testing | ✅/⚠️/❌ | ... |
| VII. Infrastructure as Code | ✅/⚠️/❌ | ... |

**Legend**: ✅ Compliant | ⚠️ Partial/Exception | ❌ Non-compliant (requires justification)

### Complexity Justification

When violating simplicity principles (e.g., adding new third-party services, introducing design patterns beyond established conventions), planning agents MUST document:
- The specific problem being solved
- Why simpler alternatives are insufficient
- Justification in the implementation plan

## Governance

### Amendment Procedure
1. Propose amendment with clear rationale and impact analysis
2. Document affected templates, docs, and code areas
3. Update constitution with version bump (semantic versioning)
4. Propagate changes across all dependent artifacts
5. Sync Impact Report at top of constitution file

### Versioning Policy
- **MAJOR**: Backward incompatible governance changes, principle removals/redefinitions
- **MINOR**: New principles added, materially expanded guidance
- **PATCH**: Clarifications, wording improvements, non-semantic refinements

### Compliance Review
- All PRs MUST verify constitution compliance during review
- Constitution violations MUST be explicitly justified and documented
- Unjustified violations result in PR rejection
- CI/CD pipelines enforce automated compliance checks where possible

### Living Document
This constitution is a living document that evolves with the project. Community feedback is encouraged. Amendments follow the procedure above to maintain consistency and traceability.

**Version**: 1.1.0 | **Ratified**: 2025-01-29 | **Last Amended**: 2025-12-24
