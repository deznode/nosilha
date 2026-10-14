import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Session } from "@supabase/supabase-js";
import createIntlProxy from "next-intl/middleware";

import { LOCALE_COOKIE, LOCALES, PORTUGUESE_ENABLED } from "@/i18n/config";
import { routing } from "@/i18n/routing";

const intlProxy = createIntlProxy(routing);

/** The areas behind the Supabase guard. Whole segments: `/administrator` is not one. */
const GUARDED = /^\/(admin|sandbox)(\/|$)/;

/** A guarded address with a locale in front of it: `/pt/admin/x` → `/admin/x`. */
const PREFIXED_GUARDED = new RegExp(
  `^/(?:${LOCALES.join("|")})(/(?:admin|sandbox)(?:/.*)?)$`
);

/** `/en` and `/en/...`; English is served unprefixed. */
const ENGLISH_PREFIX = /^\/en(\/.*)?$/;

/** Redirects are built from `nextUrl`: on Cloud Run `request.url` is the bind address. */
function redirectTo(
  request: NextRequest,
  pathname: string,
  status: 307 | 308 = 307
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url, status);
}

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
 * Next.js Proxy (Next.js 16+): locale routing and route protection.
 *
 * In order:
 * 1. `/pt/admin/*`, `/pt/sandbox/*` (and `/en/...`) redirect to the unprefixed
 *    address. The admin area is English only and has no locale prefix.
 * 2. `/admin/*` requires the ADMIN role and `/sandbox/*` a session. Nothing below
 *    runs for them, and nothing above or below calls Supabase.
 * 3. `/en` and `/en/*` redirect permanently to the unprefixed address.
 * 4. `/` redirects to `/pt` for a visitor who chose Portuguese (the `nosilha-lang`
 *    cookie), while Portuguese is enabled. No other address redirects.
 * 5. Everything else goes to the next-intl proxy, which serves unprefixed
 *    addresses from the English tree.
 *
 * Unauthenticated users are redirected to login with a return URL.
 * Non-admin users accessing /admin/* are redirected to home.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const prefixedGuarded = pathname.match(PREFIXED_GUARDED);
  if (prefixedGuarded) return redirectTo(request, prefixedGuarded[1]);

  if (GUARDED.test(pathname)) return guard(request);

  const englishPrefixed = pathname.match(ENGLISH_PREFIX);
  if (englishPrefixed)
    return redirectTo(request, englishPrefixed[1] ?? "/", 308);

  if (
    PORTUGUESE_ENABLED &&
    pathname === "/" &&
    request.cookies.get(LOCALE_COOKIE)?.value === "pt"
  ) {
    return redirectTo(request, "/pt");
  }

  return intlProxy(request);
}

/** The Supabase session and role check for `/admin` and `/sandbox`. */
async function guard(request: NextRequest) {
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

  const pathname = request.nextUrl.pathname;

  // Redirect unauthenticated users to login
  if (!session) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect non-admin users from admin routes
  if (/^\/admin(\/|$)/.test(pathname)) {
    const role = extractUserRole(session);
    if (role?.toUpperCase() !== "ADMIN") {
      return redirectTo(request, "/");
    }
  }

  return response;
}

export const config = {
  matcher: [
    // The guard. These stay explicit entries: the general entry below skips any
    // address with a file extension, and `/admin/x.json` must not skip the guard.
    "/admin/:path*",
    "/sandbox/:path*",
    "/:locale(en|pt)/admin/:path*",
    "/:locale(en|pt)/sandbox/:path*",
    // Every other page. Left out: Next internals, route handlers, the legacy
    // `/directory` redirects, the search index, the sitemap, robots and files.
    // Prefixes are whole segments, so `/apiary` is still a page.
    "/((?!(?:_next|api|auth/callback|directory|pagefind|admin|sandbox)(?:/|$)|sitemap\\.xml$|robots\\.txt$|.*\\.[^/]+$).*)",
  ],
};
