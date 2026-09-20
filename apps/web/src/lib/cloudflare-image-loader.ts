import type { ImageLoaderProps } from "next/image";

/**
 * Hosts served straight from their own CDN, never through `/cdn-cgi/image/`.
 *
 * YouTube's thumbnails already sit on Google's global CDN at fixed sizes, so a
 * transform adds latency for no benefit. Instagram answers the `/cdn-cgi/image/`
 * fetch with a 403 (ADR 0013), and its signed URLs rotate on every refresh, so a
 * transform cache key would never be reused — Meta serves that media from both
 * `cdninstagram.com` and `fbcdn.net`, and missing either one turns a tile blank.
 *
 * An entry starting with a dot matches the host and any subdomain of it.
 */
const DIRECT_HOSTS = [
  "i.ytimg.com",
  "img.youtube.com",
  ".cdninstagram.com",
  ".fbcdn.net",
];

/** Matched on the parsed hostname, so the pattern cannot appear in a path or query. */
function isDirectHost(src: string): boolean {
  let hostname: string;
  try {
    hostname = new URL(src).hostname;
  } catch {
    return false;
  }
  return DIRECT_HOSTS.some((host) =>
    host.startsWith(".") ? hostname.endsWith(host) : hostname === host
  );
}

/**
 * Cloudflare Image Resizing loader for Next.js.
 *
 * Routes external images (R2, Unsplash, Wikimedia, YouTube) through
 * Cloudflare's edge CDN for on-the-fly resizing, format negotiation
 * (AVIF/WebP), and global caching. Local images are served as-is
 * since Cloudflare Image Resizing cannot fetch from the same origin.
 *
 * URL format: /cdn-cgi/image/{params}/{source}
 *
 * @see https://developers.cloudflare.com/images/transform-images/integrate-with-frameworks/
 */
export default function cloudflareLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  const q = quality || 75;

  if (process.env.NODE_ENV === "development") {
    // Serve images directly but include width/quality to satisfy Next.js loader contract
    const sep = src.includes("?") ? "&" : "?";
    return `${src}${sep}w=${width}&q=${q}`;
  }

  // Local images (e.g., /images/hero.jpg) — serve directly, no CF transform
  // Query params are ignored by static file servers but enable proper srcset generation
  if (src.startsWith("/")) {
    return `${src}?w=${width}&q=${q}`;
  }

  if (isDirectHost(src)) {
    return src;
  }

  // External images (R2, Unsplash, Wikimedia, etc.) — route through Cloudflare Image Resizing
  const params = [`width=${width}`, `quality=${q}`, "format=auto"];
  return `/cdn-cgi/image/${params.join(",")}/${src}`;
}
