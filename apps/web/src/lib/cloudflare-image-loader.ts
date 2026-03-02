import type { ImageLoaderProps } from "next/image";

const normalizeSrc = (src: string) => {
  return src.startsWith("/") ? src.slice(1) : src;
};

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
}: ImageLoaderProps) {
  if (process.env.NODE_ENV === "development") {
    return src;
  }

  // Local images (e.g., /images/hero.jpg) — serve directly, no CF transform
  if (src.startsWith("/")) {
    return src;
  }

  // External images (R2, Unsplash, etc.) — route through Cloudflare Image Resizing
  const params = [`width=${width}`, `quality=${quality || 75}`, "format=auto"];
  return `/cdn-cgi/image/${params.join(",")}/${normalizeSrc(src)}`;
}
