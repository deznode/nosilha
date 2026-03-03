# ADR 0003: Supabase as External Authentication Provider

## Status

Accepted

## Date

2025-12-26

## Context

Nos Ilha requires user authentication for features like story submissions, bookmarks, and admin moderation. As a volunteer-maintained open-source project with budget constraints, we needed an authentication solution that minimizes operational overhead while providing enterprise-grade security.

### Technical Requirements

- JWT-based authentication for stateless API authorization
- Role-based access control (USER, ADMIN roles)
- Social login capabilities for future expansion
- Secure token management without storing passwords in our database

### Operational Requirements

- Minimal maintenance burden for a solo maintainer
- Cost-effective (ideally free tier for initial traffic)
- Reduced security surface area

## Decision

Use **Supabase Auth** as our external authentication provider.

### Implementation

**Frontend (`auth-provider.tsx`)**:
- Supabase client handles login/logout flows
- JWT tokens extracted and decoded for role information
- Auth state managed via React context and Zustand store

**Backend (`JwtAuthenticationFilter.kt`)**:
- Validates JWT signatures using Supabase JWT secret
- Extracts roles from `app_metadata` claims
- Maps to Spring Security authorities (`ROLE_ADMIN`, `ROLE_USER`)

### Integration Flow

```
User Login -> Supabase Auth -> JWT Token (with app_metadata.role)
     |
     v
Frontend stores token -> API requests include Bearer token
     |
     v
Backend JwtAuthenticationFilter -> Validate signature -> Extract authorities
     |
     v
Spring Security enforces access -> /api/v1/admin/** requires ADMIN role
```

## Alternatives Considered

### Self-hosted Keycloak

- **Pros**: Full control, extensive features, industry standard
- **Cons**: Significant operational overhead, requires dedicated infrastructure, complex configuration for a small project
- **Rejected**: Too complex for solo maintainer

### Spring Security with Custom JWT

- **Pros**: No external dependencies, full control over auth logic
- **Cons**: Must implement password hashing, token generation, refresh logic, and security best practices from scratch
- **Rejected**: Higher maintenance burden, increased security risk from custom implementation

### Auth0

- **Pros**: Mature platform, excellent documentation, similar managed approach
- **Cons**: Free tier limited to 7,500 monthly active users, pricing escalates quickly
- **Rejected**: More expensive than Supabase at scale

## Consequences

### Positive

- **Reduced security surface**: Authentication handled by security specialists
- **Managed infrastructure**: No auth server to maintain, patch, or scale
- **Built-in JWT management**: Token generation, refresh, and validation handled automatically
- **Social login ready**: OAuth providers (Google, GitHub) can be enabled without code changes
- **Row-Level Security**: Future option for database-level access control
- **Budget-conscious**: 50,000 monthly active users on free tier

### Negative

- **External dependency**: Auth availability depends on Supabase uptime
- **Limited customization**: Constrained to Supabase's auth flows and token structure
- **JWT secret management**: Must securely share Supabase JWT secret with backend

### Neutral

- Supabase PostgreSQL used for auth metadata; primary application data remains in our own PostgreSQL instance

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- `/docs/SUPABASE_ADMIN_ROLES.md` - Role configuration guide
- `/apps/web/src/components/providers/auth-provider.tsx` - Frontend auth implementation
- `/apps/api/src/main/kotlin/com/nosilha/core/auth/security/JwtAuthenticationFilter.kt` - Backend JWT validation
