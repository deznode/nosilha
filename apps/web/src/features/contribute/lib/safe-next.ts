/**
 * Validates a `next` redirect target against an origin, so the auth
 * callback route (server) and the Google sign-in round trip (browser)
 * can't be sent somewhere else via an open-redirect `next` param.
 *
 * Only a same-origin path (with optional search/hash) is accepted.
 * Anything else — a protocol-relative URL (`//evil.com`), a backslash
 * trick (`/\evil.com`), an absolute URL to another origin, a
 * `javascript:` URL, or an empty/missing value — falls back to `/`.
 */
export function safeNext(
  next: string | null | undefined,
  origin: string
): string {
  if (!next) return "/";

  // Browsers treat a leading "//" as protocol-relative, and some treat a
  // leading "/\" the same way — both would resolve off-origin.
  if (next.startsWith("//") || next.includes("\\")) return "/";
  if (!next.startsWith("/")) return "/";

  try {
    const base = new URL(origin);
    const resolved = new URL(next, base);
    if (resolved.origin !== base.origin) return "/";
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return "/";
  }
}
