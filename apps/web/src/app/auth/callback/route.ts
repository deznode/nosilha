import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    console.error("[Auth Callback] OAuth error:", error, errorDescription);
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", errorDescription || error);
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[Auth Callback] Missing Supabase environment variables");
      return NextResponse.redirect(
        new URL("/login?error=config", requestUrl.origin)
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error(
        "[Auth Callback] Code exchange error:",
        exchangeError.message
      );
      const loginUrl = new URL("/login", requestUrl.origin);
      loginUrl.searchParams.set("error", exchangeError.message);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect to homepage on success
  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
