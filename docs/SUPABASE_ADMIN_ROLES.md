# Supabase Admin Role Configuration

This document explains how to set up admin roles for the Nos Ilha application using Supabase authentication.

## Overview

The application uses JWT-based authentication with Supabase. Admin access is controlled by roles embedded in the JWT token's `app_metadata` field. The backend extracts these roles and enforces access control for admin endpoints.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Authentication Flow                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. User logs in via Supabase Auth                                      │
│                  ↓                                                       │
│  2. Supabase generates JWT with claims:                                 │
│     • sub: user_id                                                       │
│     • app_metadata: { role: "ADMIN", roles: ["ADMIN"] }                 │
│                  ↓                                                       │
│  3. Frontend stores JWT in session                                       │
│                  ↓                                                       │
│  4. API requests include: Authorization: Bearer <jwt>                   │
│                  ↓                                                       │
│  5. Backend JwtAuthenticationFilter extracts roles                      │
│                  ↓                                                       │
│  6. Spring Security enforces: /api/v1/admin/** → hasRole("ADMIN")       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Backend Role Extraction

The backend extracts roles from JWT in `JwtAuthenticationFilter.kt`:

```kotlin
// Location: backend/src/main/kotlin/com/nosilha/core/auth/security/JwtAuthenticationFilter.kt

private fun extractAuthorities(claims: Claims): List<SimpleGrantedAuthority> {
    val authorities = mutableListOf<SimpleGrantedAuthority>()

    // All authenticated users get this role
    authorities.add(SimpleGrantedAuthority("ROLE_authenticated"))

    // Check for role in top-level claims (e.g., claims["role"] = "ADMIN")
    val role = claims["role"] as? String
    if (role != null) {
        authorities.add(SimpleGrantedAuthority("ROLE_$role"))
    }

    // Check for roles in app_metadata (Supabase pattern)
    val appMetadata = claims["app_metadata"] as? Map<String, Any>
    if (appMetadata != null) {
        // Single role: app_metadata.role
        val appRole = appMetadata["role"] as? String
        if (appRole != null) {
            authorities.add(SimpleGrantedAuthority("ROLE_$appRole"))
        }

        // Multiple roles: app_metadata.roles[]
        val roles = appMetadata["roles"] as? List<String>
        roles?.forEach { r ->
            authorities.add(SimpleGrantedAuthority("ROLE_$r"))
        }
    }

    // Fallback to USER role if no specific role found
    if (authorities.size == 1) {
        authorities.add(SimpleGrantedAuthority("ROLE_USER"))
    }

    return authorities
}
```

### Supported JWT Claim Structures

The backend supports these JWT structures:

**Option 1: Top-level `role` claim**
```json
{
  "sub": "user-uuid",
  "role": "ADMIN"
}
```

**Option 2: `app_metadata.role` (single role)**
```json
{
  "sub": "user-uuid",
  "app_metadata": {
    "role": "ADMIN"
  }
}
```

**Option 3: `app_metadata.roles` (multiple roles)**
```json
{
  "sub": "user-uuid",
  "app_metadata": {
    "roles": ["ADMIN", "MODERATOR"]
  }
}
```

## Security Configuration

Admin endpoints are protected in `SecurityConfig.kt`:

```kotlin
// Location: backend/src/main/kotlin/com/nosilha/core/auth/security/SecurityConfig.kt

.authorizeHttpRequests { requests ->
    requests
        // ... other rules ...

        // Admin endpoints - require ADMIN role
        .requestMatchers("/api/v1/admin/**")
        .hasRole("ADMIN")

        // ... other rules ...
}
```

## Setting Up Admin Role in Supabase

### Method 1: Using Supabase Dashboard (Recommended for Development)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Find the user you want to make an admin
4. Click on the user to view details
5. Scroll to **User Metadata** section
6. In the **App Metadata** field, add:
   ```json
   {
     "role": "ADMIN"
   }
   ```
7. Click **Save**

### Method 2: Using SQL (Recommended for Production)

Run this SQL in Supabase SQL Editor:

```sql
-- Make a specific user an admin by email
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "ADMIN"}'::jsonb
WHERE email = 'admin@example.com';

-- Or by user ID
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "ADMIN"}'::jsonb
WHERE id = 'your-user-uuid-here';
```

**Important**: After updating `raw_app_meta_data`, the user must log out and log back in to get a new JWT with the updated claims.

### Method 3: Using Supabase Admin API

```typescript
import { createClient } from '@supabase/supabase-js'

// Use service role key (never expose in frontend!)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Update user's app_metadata
await supabaseAdmin.auth.admin.updateUserById(userId, {
  app_metadata: { role: 'ADMIN' }
})
```

### Method 4: Custom Access Token Auth Hook (Advanced)

For dynamic role assignment based on database lookups:

1. Create a `user_roles` table:
   ```sql
   CREATE TABLE public.user_roles (
     user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
     role TEXT NOT NULL DEFAULT 'USER'
   );
   ```

2. Create the auth hook function:
   ```sql
   CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
   RETURNS jsonb
   LANGUAGE plpgsql
   AS $$
   DECLARE
     claims jsonb;
     user_role text;
   BEGIN
     -- Get user's role from the database
     SELECT role INTO user_role
     FROM public.user_roles
     WHERE user_id = (event->>'user_id')::uuid;

     -- Default to 'USER' if no role found
     user_role := COALESCE(user_role, 'USER');

     -- Build the claims
     claims := event->'claims';
     claims := jsonb_set(claims, '{app_metadata, role}', to_jsonb(user_role));

     -- Return the modified event
     RETURN jsonb_set(event, '{claims}', claims);
   END;
   $$;
   ```

3. Enable the hook in Supabase Dashboard:
   - Go to **Authentication** → **Hooks**
   - Enable "Customize Access Token" hook
   - Select `custom_access_token_hook` function

## Frontend Role Extraction

The frontend extracts roles in `auth-provider.tsx`:

```typescript
// Location: frontend/src/components/providers/auth-provider.tsx

function extractUserRole(session: Session | null): string | undefined {
  if (!session?.access_token) return undefined;

  try {
    // Decode JWT payload
    const payload = JSON.parse(atob(session.access_token.split(".")[1]));
    return payload.user_role || payload.role;
  } catch (error) {
    console.warn("Failed to extract role from JWT:", error);
    return undefined;
  }
}
```

**Note**: The frontend currently checks `user_role` and `role` but not `app_metadata.role`. Consider updating to also check `app_metadata`:

```typescript
function extractUserRole(session: Session | null): string | undefined {
  if (!session?.access_token) return undefined;

  try {
    const payload = JSON.parse(atob(session.access_token.split(".")[1]));
    // Check multiple locations for role
    return payload.user_role
        || payload.role
        || payload.app_metadata?.role;
  } catch (error) {
    console.warn("Failed to extract role from JWT:", error);
    return undefined;
  }
}
```

## Verification Steps

### 1. Verify User Has Admin Role in Supabase

Run this SQL to check a user's metadata:

```sql
SELECT id, email, raw_app_meta_data
FROM auth.users
WHERE email = 'your-email@example.com';
```

Expected output for an admin:
```json
{
  "role": "ADMIN"
}
```

### 2. Verify JWT Contains Role

After logging in, decode your JWT at [jwt.io](https://jwt.io) or in browser console:

```javascript
// In browser console after logging in
const session = await supabase.auth.getSession();
const jwt = session.data.session.access_token;
const payload = JSON.parse(atob(jwt.split('.')[1]));
console.log('app_metadata:', payload.app_metadata);
```

### 3. Test Admin Endpoint Access

```bash
# Get your JWT from browser dev tools (Network tab, Authorization header)
curl -H "Authorization: Bearer YOUR_JWT_HERE" \
  http://localhost:8080/api/v1/admin/stories

# Expected: 200 OK with data (if admin)
# Expected: 403 Forbidden (if not admin)
```

## Troubleshooting

### Issue: User gets 403 on admin endpoints

**Cause**: User doesn't have ADMIN role in JWT

**Solution**:
1. Check `raw_app_meta_data` in Supabase
2. Add `"role": "ADMIN"` to app_metadata
3. Have user log out and log back in
4. Verify new JWT contains the role

### Issue: Role is set but not appearing in JWT

**Cause**: User session has old JWT

**Solution**:
1. Call `supabase.auth.signOut()`
2. Have user log in again
3. Supabase generates new JWT with updated claims

### Issue: Frontend doesn't recognize admin role

**Cause**: Frontend `extractUserRole` doesn't check `app_metadata`

**Solution**: Update the function to check all role locations:
```typescript
return payload.user_role || payload.role || payload.app_metadata?.role;
```

## Quick Reference

| Action | Command/Location |
|--------|------------------|
| Make user admin (SQL) | `UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data \|\| '{"role": "ADMIN"}'::jsonb WHERE email = 'user@example.com';` |
| Check user role (SQL) | `SELECT email, raw_app_meta_data FROM auth.users WHERE email = 'user@example.com';` |
| Backend role check | `JwtAuthenticationFilter.kt:83-104` |
| Security config | `SecurityConfig.kt:71-72` |
| Frontend role extraction | `auth-provider.tsx:20-31` |

## Related Files

- `backend/src/main/kotlin/com/nosilha/core/auth/security/JwtAuthenticationFilter.kt`
- `backend/src/main/kotlin/com/nosilha/core/auth/security/SecurityConfig.kt`
- `frontend/src/components/providers/auth-provider.tsx`
- `frontend/src/stores/authStore.ts`
