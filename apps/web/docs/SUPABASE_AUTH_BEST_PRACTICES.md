# Supabase Authentication Best Practices for Next.js

> Research conducted December 2024 for Nos Ilha project.
> Based on official Supabase documentation and Next.js authentication guides.

## Current Implementation Status

Our current auth implementation uses:

- `@supabase/supabase-js` (v2.50.0) - direct client
- Client-side auth with `signInWithPassword`, `signUp`, `signInWithOAuth`
- Simple OAuth callback route at `/auth/callback`

**This works for basic flows but lacks proper SSR session management.**

---

## Recommended Upgrade: @supabase/ssr Package

Supabase recommends using `@supabase/ssr` for Next.js App Router applications. The `auth-helpers` package is deprecated.

### Installation

```bash
pnpm add @supabase/ssr
```

Note: Keep `@supabase/supabase-js` installed - it's a peer dependency.

---

## Key Architecture Changes

### 1. Create Separate Client Utilities

Create two client factories in `lib/supabase/`:

#### Browser Client (`lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

#### Server Client (`lib/supabase/server.ts`)

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component - ignore
          }
        },
      },
    }
  );
}
```

### 2. Add Middleware for Session Refresh

Create `middleware.ts` in the project root:

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Use getClaims() not getSession() for security
  // getClaims() validates the JWT signature
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Optional: Redirect unauthenticated users from protected routes
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Skip static files and images
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### 3. Update OAuth Callback Route

```typescript
// app/auth/callback/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${error.message}`);
    }
  }

  return NextResponse.redirect(origin);
}
```

---

## Security Best Practices

### Critical: getClaims() vs getSession()

```typescript
// BAD - Never trust in server code
const {
  data: { session },
} = await supabase.auth.getSession();

// GOOD - Validates JWT signature
const {
  data: { user },
} = await supabase.auth.getUser();
```

**Why?** `getSession()` reads from storage without revalidating the JWT. `getUser()` makes a request to Supabase to verify the token is valid.

### Protected Server Components

```typescript
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <div>Welcome, {user.email}</div>
}
```

### Protected Server Actions

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Safe to proceed with user operations
}
```

---

## OAuth Provider Configuration

### Supabase Dashboard Setup

1. Go to **Authentication > Providers** in Supabase Dashboard
2. Enable Google and/or Facebook
3. Add your OAuth credentials from each provider
4. Set redirect URL to: `https://your-domain.com/auth/callback`

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
4. Copy Client ID and Secret to Supabase

### Facebook OAuth Setup

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create an app and add Facebook Login
3. Add redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
4. Copy App ID and Secret to Supabase

---

## Migration Checklist

- [ ] Install `@supabase/ssr` package
- [ ] Create `lib/supabase/client.ts` (browser client)
- [ ] Create `lib/supabase/server.ts` (server client)
- [ ] Create `middleware.ts` for session refresh
- [ ] Update `auth/callback/route.ts` to use server client
- [ ] Update `auth-form.tsx` to use browser client
- [ ] Update `AuthProvider` to use new client pattern
- [ ] Replace all `getSession()` calls with `getUser()` in server code
- [ ] Configure OAuth providers in Supabase Dashboard
- [ ] Test all auth flows (login, signup, OAuth, logout)

---

## File Structure After Migration

```
frontend/
├── src/
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts      # Browser client factory
│   │       └── server.ts      # Server client factory
│   ├── app/
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts   # OAuth callback handler
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   └── middleware.ts      # Session refresh middleware
│   └── components/
│       └── auth/
│           └── auth-form.tsx  # Unified auth component
└── middleware.ts              # Root middleware
```

---

## References

- [Supabase SSR Guide for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase SSR Advanced Guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide)
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication)
- [Migrating from Auth Helpers to SSR](https://supabase.com/docs/guides/auth/server-side/migrating-to-ssr-from-auth-helpers)
