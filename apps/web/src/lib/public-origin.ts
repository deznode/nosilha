/**
 * The origin the browser used, for building absolute redirects in route
 * handlers. Behind Cloud Run (or similar), request.url resolves to the
 * internal container address (e.g. https://0.0.0.0:3000) instead of the
 * public domain; the x-forwarded-host header contains the original host from
 * the client request.
 * See: https://supabase.com/docs/guides/auth/social-login/auth-zoom
 */
export function publicOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  return !isLocalEnv && forwardedHost
    ? `https://${forwardedHost}`
    : new URL(request.url).origin;
}
