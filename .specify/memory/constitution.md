<!--
SYNC IMPACT REPORT
==================
Version Change: Initial → 1.0.0
Modified Principles: N/A (Initial constitution creation)
Added Sections: All sections (initial creation)
Removed Sections: None

Templates Status:
✅ plan-template.md - Reviewed; aligned with constitution principles
✅ spec-template.md - Reviewed; aligned with constitution principles
✅ tasks-template.md - Reviewed; aligned with constitution principles
✅ checklist-template.md - Present; aligned with constitution principles
✅ agent-file-template.md - Present; aligned with constitution principles

Follow-up Actions:
- None; all templates align with established principles
- Constitution ready for project governance
-->

# Nos Ilha Constitution

## Core Principles

### I. Cultural Authenticity First
Every feature, content piece, and design decision MUST prioritize authentic representation of Cape Verdean cultural heritage over all other considerations. Community validation and elder consultation are mandatory for cultural content. Sacred knowledge and cultural intellectual property MUST be protected. No feature ships without cultural verification when heritage content is involved.

**Rationale**: As a community-driven cultural heritage platform, maintaining authenticity and respectful representation is the foundation of trust with the Cape Verdean diaspora, local community, and international visitors.

### II. Community-Driven Development
All development decisions MUST consider the volunteer-supported, open-source nature of the project. Solutions MUST be maintainable by contributors with varying skill levels. Code complexity MUST be justified and documented. The platform serves the community first, technology second.

**Rationale**: Sustainability depends on enabling community contributions and ensuring long-term maintainability without requiring enterprise-level resources.

### III. Mobile-First Experience
All user interfaces MUST be designed and tested for mobile devices first, then progressively enhanced for larger screens. Performance on limited connectivity and lower-end devices is non-negotiable. The platform MUST serve diaspora users worldwide with varying network conditions.

**Rationale**: The primary audience includes diaspora members accessing the platform from mobile devices globally, often with constrained bandwidth.

### IV. Documentation-Driven Architecture
Every architectural decision, API contract, and design pattern MUST be documented before implementation. Specialized agents MUST reference established documentation (ARCHITECTURE.md, API_CODING_STANDARDS.md, DESIGN_SYSTEM.md, etc.) before making changes. Documentation lives in `docs/` for static guides and `plan/` for dynamic feature planning.

**Rationale**: Clear documentation ensures consistency, enables new contributors to onboard effectively, and prevents architectural drift in a community-maintained project.

### V. Modular Architecture with Enforced Boundaries
Backend modules (shared, auth, directory, media) MUST maintain independence through Spring Modulith architecture. Modules communicate via events, never direct dependencies. Frontend components follow clear separation: providers, Catalyst UI, custom UI, admin. Circular dependencies are forbidden and verified through automated testing.

**Rationale**: Modular architecture enables parallel development, simplifies testing, reduces coupling, and allows features to be developed and deployed independently.

### VI. Security & Privacy by Design
All security practices MUST follow least-privilege principles. Secrets management through Google Secret Manager only. No credentials in code or environment files checked into version control. JWT-based authentication with proper token validation. GDPR compliance for user data, especially AI features involving personal information.

**Rationale**: Protecting community data and maintaining trust is paramount. Security breaches would undermine the platform's mission and harm the community it serves.

### VII. Incremental Testing & Validation
Testing is mandatory for complex features but pragmatic based on risk. Backend MUST have integration tests with PostgreSQL. Frontend MUST pass TypeScript checking, ESLint, and build validation. E2E tests using Playwright for critical user flows. All tests MUST pass before merging to main branch.

**Rationale**: Balanced testing strategy ensures quality without overwhelming volunteer contributors. Focus testing efforts on high-risk areas and critical user journeys.

### VIII. Infrastructure as Code & Automation
All infrastructure MUST be defined in Terraform with remote state management. CI/CD pipelines MUST be modular and path-based (backend, frontend, infrastructure). Security scanning (Trivy, detekt, ESLint, tfsec) is mandatory. Deployments to production MUST include automated health checks.

**Rationale**: Reproducible infrastructure and automated deployments reduce operational burden on volunteer maintainers and prevent configuration drift.

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
- PostgreSQL primary database with Flyway migrations
- Google Firestore for AI-processed metadata
- Google Cloud Storage for media assets with CDN
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

### Agent Usage Requirements
Specialized agents (frontend-engineer, backend-engineer, devops-engineer, content-creator, content-verifier, content-planner, search-specialist, mapbox-specialist, design-review) MUST:
- Reference their designated documentation before making changes
- Validate work against established standards
- Cross-reference related documentation when work spans domains
- Adapt approach when standards change

### Complexity Justification
When violating simplicity principles (e.g., adding new third-party services, introducing design patterns beyond established conventions), developers MUST:
- Document the specific problem being solved
- Explain why simpler alternatives are insufficient
- Include justification in implementation plan
- Get approval before proceeding with implementation

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

**Version**: 1.0.0 | **Ratified**: 2025-01-29 | **Last Amended**: 2025-01-29
