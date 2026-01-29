# Supabase Admin Role Configuration

How to set up admin roles for the Nos Ilha application using Supabase authentication.

## Overview

Admin access is controlled by roles embedded in JWT tokens. The backend extracts roles from `app_metadata` and enforces access control for `/api/v1/admin/**` endpoints.

## How It Works

```
User logs in via Supabase Auth
        ↓
Supabase generates JWT with app_metadata: { role: "ADMIN" }
        ↓
Frontend stores JWT, sends with API requests
        ↓
Backend extracts roles from JWT claims
        ↓
Spring Security enforces: /api/v1/admin/** → hasRole("ADMIN")
```

**Role extraction (all matching roles are added):**
1. Top-level `role` claim (if present)
2. `app_metadata.role` (single role)
3. `app_metadata.roles[]` (multiple roles)
4. Fallback to `USER` if none of the above found

## Setting Up Admin Role

### Method 1: Supabase Dashboard (Development)

1. Go to **Authentication** → **Users**
2. Click on the user
3. In **App Metadata**, add:
   ```json
   { "role": "ADMIN" }
   ```
4. Click **Save**

### Method 2: SQL (Production)

```sql
-- Make user admin by email
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "ADMIN"}'::jsonb
WHERE email = 'admin@example.com';

-- Or by user ID
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "ADMIN"}'::jsonb
WHERE id = 'your-user-uuid-here';
```

### Method 3: Supabase Admin API

```typescript
await supabaseAdmin.auth.admin.updateUserById(userId, {
  app_metadata: { role: 'ADMIN' }
})
```

> **Important:** After updating metadata, the user must log out and log back in to get a new JWT with the updated claims.

## Verification

### Check user metadata in Supabase

```sql
SELECT email, raw_app_meta_data FROM auth.users WHERE email = 'your-email@example.com';
```

### Decode JWT in browser console

```javascript
const session = await supabase.auth.getSession();
const payload = JSON.parse(atob(session.data.session.access_token.split('.')[1]));
console.log('app_metadata:', payload.app_metadata);
```

### Test admin endpoint

```bash
curl -H "Authorization: Bearer YOUR_JWT" http://localhost:8080/api/v1/admin/stories
# 200 OK = admin, 403 Forbidden = not admin
```

## FAQ

**User gets 403 on admin endpoints**
→ Check `raw_app_meta_data` in Supabase, add `"role": "ADMIN"`, have user re-login.

**Role is set but not in JWT**
→ User has old session. Call `supabase.auth.signOut()` and log in again.

**Frontend doesn't recognize admin role**
→ Check that `extractUserRole` in auth-provider.tsx reads `app_metadata.role`.

## Source Files

| Component | File |
|-----------|------|
| Backend role extraction | `apps/api/.../auth/security/SupabaseJwtAuthenticationConverter.kt` |
| Security configuration | `apps/api/.../auth/security/SecurityConfig.kt` |
| Frontend role extraction | `apps/web/src/components/providers/auth-provider.tsx` |
| Auth store | `apps/web/src/stores/authStore.ts` |
