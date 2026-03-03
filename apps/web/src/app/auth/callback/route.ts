import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    console.error("[Auth Callback] OAuth error:", error, errorDescription);
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", errorDescription || error);
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[Auth Callback] Missing Supabase environment variables");
      return NextResponse.redirect(new URL("/login?error=config", origin));
    }

    const cookieStore = await cookies();

    // Use createServerClient from @supabase/ssr to properly set cookies
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    });

    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Use x-forwarded-host to get the correct origin behind load balancer/reverse proxy.
      // Behind Cloud Run (or similar), request.url resolves to the internal container address
      // (e.g. http://0.0.0.0:3000) instead of the public domain. The x-forwarded-host header
      // contains the original host from the client request.
      // See: https://supabase.com/docs/guides/auth/social-login/auth-zoom
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}/`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}/`);
      } else {
        return NextResponse.redirect(`${origin}/`);
      }
    }

    console.error(
      "[Auth Callback] Code exchange error:",
      exchangeError.message
    );
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", exchangeError.message);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to homepage on success
  return NextResponse.redirect(new URL("/", origin));
}
