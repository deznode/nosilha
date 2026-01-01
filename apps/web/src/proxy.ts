import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js Proxy for Route Protection (Next.js 16+)
 *
 * Protects routes at the edge before they render:
 * - /admin/* - Admin dashboard
 * - /contribute/directory - Directory submissions
 * - /contribute/story - Story submissions
 *
 * Unauthenticated users are redirected to login with a return URL.
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

  // Define protected paths
  const protectedPaths = [
    "/admin",
    "/sandbox",
    "/contribute/directory",
    "/contribute/story",
  ];

  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Redirect unauthenticated users to login
  if (isProtected && !session) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
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
