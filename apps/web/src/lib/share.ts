import type { OpenGraphImage } from "@/types/metadata";

/**
 * Shared links, their preview images, and recognising a visit that came from one.
 * Spec 040 FR-001, FR-003, FR-006.
 */

/** What was shared: it names the campaign a visit is counted under. */
export type ShareMoment = "photo" | "film" | "town" | "entry" | "ask";

const SHARE_SOURCE = "share";

/**
 * The link a share control sends: the address with this share's tags and no one
 * else's. A chat app sends no referrer, so the tags are the only way a visit from a
 * shared link is counted as one.
 */
export function buildShareLink(url: string, moment: ShareMoment): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  // A link that was itself shared arrives carrying tags; they describe that share.
  for (const key of [...parsed.searchParams.keys()]) {
    if (key.startsWith("utm_") || key === "ask") {
      parsed.searchParams.delete(key);
    }
  }

  if (moment === "ask") parsed.searchParams.set("ask", "1");
  parsed.searchParams.set("utm_source", SHARE_SOURCE);
  parsed.searchParams.set("utm_medium", "link");
  parsed.searchParams.set("utm_campaign", moment);
  return parsed.toString();
}

/** Whether a query string (`location.search`) marks a visit from a shared link. */
export function isShareArrival(search: string): boolean {
  return new URLSearchParams(search).get("utm_source") === SHARE_SOURCE;
}

/** `/cdn-cgi/image/` exists only behind Cloudflare, on the production origin. */
const RESIZE_ORIGIN = "https://nosilha.com";
const RESIZED_HOSTS = ["media.nosilha.com"];
/** Already small JPEGs on the host's own CDN; the resizer adds nothing. */
const DIRECT_HOSTS = ["img.youtube.com", "i.ytimg.com"];

/**
 * The image a chat app shows beside a shared link, or null to keep the text card.
 *
 * WhatsApp drops a preview image above about 600 KB and the archive's originals run
 * to several megabytes, so an archive image is cropped to 1200×630 and re-encoded as
 * JPEG by Cloudflare (about 100 KB). A host this function does not know gives null
 * rather than a preview that may never load.
 */
export function sharePreviewImage(
  src: string | null | undefined,
  alt: string
): OpenGraphImage | null {
  if (!src) return null;

  let parsed: URL;
  try {
    parsed = new URL(src);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;

  if (DIRECT_HOSTS.includes(parsed.hostname)) {
    return { url: src, width: 480, height: 360, alt, type: "image/jpeg" };
  }
  if (!RESIZED_HOSTS.includes(parsed.hostname)) return null;

  const url =
    process.env.NODE_ENV === "production"
      ? `${RESIZE_ORIGIN}/cdn-cgi/image/width=1200,height=630,fit=cover,quality=75,format=jpeg/${src}`
      : src;
  return { url, width: 1200, height: 630, alt, type: "image/jpeg" };
}
