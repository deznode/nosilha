import type { ImageLoaderProps } from "next/image";

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

  // YouTube thumbnails are already served from Google's global CDN at fixed sizes.
  // Proxying through Cloudflare adds latency for no benefit — serve directly.
  if (src.includes("i.ytimg.com/") || src.includes("img.youtube.com/")) {
    return src;
  }

  // External images (R2, Unsplash, Wikimedia, etc.) — route through Cloudflare Image Resizing
  const params = [`width=${width}`, `quality=${q}`, "format=auto"];
  return `/cdn-cgi/image/${params.join(",")}/${src}`;
}
