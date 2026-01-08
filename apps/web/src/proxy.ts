import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Session } from "@supabase/supabase-js";

/**
 * Extracts user role from JWT access token.
 * Note: payload.role is Supabase's system role ("authenticated"), not app role.
 * See: https://supabase.com/docs/guides/auth/jwt-fields
 */
function extractUserRole(session: Session | null): string | undefined {
  if (!session?.access_token) return undefined;

  try {
    const payload = JSON.parse(
      Buffer.from(session.access_token.split(".")[1], "base64").toString()
    );
    return (
      payload.user_role || // Custom hook claim (if configured)
      payload.app_metadata?.role || // App role from user metadata
      payload.app_metadata?.roles?.[0] // Fallback for roles array
    );
  } catch {
    return undefined;
  }
}

/**
 * Next.js Proxy for Route Protection (Next.js 16+)
 *
 * Protects routes at the edge before they render:
 * - /admin/* - Admin dashboard (requires ADMIN role)
 * - /contribute/directory - Directory submissions
 * - /contribute/story - Story submissions
 *
 * Unauthenticated users are redirected to login with a return URL.
 * Non-admin users accessing /admin/* are redirected to home.
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Skip middleware if Supabase is not configured (dev/test environments)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Allow requests through in non-configured environments
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Define paths requiring authentication
  const authRequiredPaths = [
    "/admin",
    "/sandbox",
    "/contribute/directory",
    "/contribute/story",
  ];

  // Define paths requiring ADMIN role
  const adminRequiredPaths = ["/admin"];

  const pathname = request.nextUrl.pathname;
  const requiresAuth = authRequiredPaths.some((path) =>
    pathname.startsWith(path)
  );
  const requiresAdmin = adminRequiredPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Redirect unauthenticated users to login
  if (requiresAuth && !session) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect non-admin users from admin routes
  if (requiresAdmin && session) {
    const role = extractUserRole(session);
    if (role?.toUpperCase() !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/sandbox/:path*",
    "/contribute/directory",
    "/contribute/story",
  ],
};
