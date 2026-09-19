import { cacheLife, cacheTag } from "next/cache";

import { env } from "@/lib/env";
import { createComponentLogger } from "@/lib/logger";
import { trimmed } from "@/lib/text";

const log = createComponentLogger("Instagram");

export interface InstagramPost {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  timestamp: string;
  permalink: string;
}

/**
 * What the home's Instagram section renders from. "unavailable" covers a missing
 * token, a non-OK response and a network failure alike: the visitor does not need
 * to know which, but the page must not pretend the account is silent.
 */
export type InstagramFeed =
  { status: "ok"; posts: InstagramPost[] } | { status: "unavailable" };

interface InstagramApiResponse {
  data: InstagramPost[];
}

const INSTAGRAM_FIELDS =
  "id,caption,media_type,media_url,thumbnail_url,timestamp,permalink";

/** Four posts: three on desktop, a full 2×2 on mobile, from one request. */
export const INSTAGRAM_FEED_SIZE = 4;

export const INSTAGRAM_PROFILE_URL = "https://instagram.com/nosilha";

/**
 * Fetch the latest posts from the Instagram Graph API.
 * Server-only — the token is never exposed to the client. Not cached here:
 * `getInstagramFeed` decides how long a success, or a failure, is held.
 */
export async function fetchInstagramPosts(): Promise<InstagramFeed> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    log.debug("INSTAGRAM_ACCESS_TOKEN not set, skipping fetch");
    return { status: "unavailable" };
  }

  try {
    const url = `https://graph.instagram.com/v22.0/me/media?fields=${INSTAGRAM_FIELDS}&limit=${INSTAGRAM_FEED_SIZE}&access_token=${token}`;

    const response = await fetch(url);

    if (!response.ok) {
      // Production went months on an expired token because this was a warning
      // nobody saw. Dev tokens are routinely stale, so only prod escalates.
      const context = { status: response.status };
      if (env.isDev) {
        log.debug("Instagram API returned non-OK status", context);
      } else {
        log.error("Instagram API returned non-OK status", undefined, context);
      }
      return { status: "unavailable" };
    }

    const data: InstagramApiResponse = await response.json();
    return { status: "ok", posts: data.data ?? [] };
  } catch (error) {
    log.error(
      "Failed to fetch Instagram posts",
      error instanceof Error ? error : new Error(String(error))
    );
    return { status: "unavailable" };
  }
}

/**
 * The home's feed, in its own cache scope. A success is held by the `instagram`
 * profile (`next.config.ts`); a failure only for minutes, so a restored token shows up
 * quickly and an outage is never pinned into the page. `fetchedAt` is the "now" the
 * relative dates are computed against: they age with the entry, by at most its
 * lifetime, which is the other reason that lifetime is short.
 */
export async function getInstagramFeed(): Promise<{
  feed: InstagramFeed;
  fetchedAt: number;
}> {
  "use cache";
  cacheTag("instagram");

  const feed = await fetchInstagramPosts();
  if (feed.status === "ok") {
    cacheLife("instagram");
  } else {
    cacheLife("minutes");
  }

  return { feed, fetchedAt: Date.now() };
}

/** The image a tile shows: a video's poster frame, otherwise the media itself. */
export function tileImageUrl(post: InstagramPost): string {
  return post.media_type === "VIDEO"
    ? post.thumbnail_url || post.media_url
    : post.media_url;
}

/** Text badge, never an icon, so it is announced. Plain images get none. */
export function badgeLabel(post: InstagramPost): string | null {
  switch (post.media_type) {
    case "VIDEO":
      return "Video";
    case "CAROUSEL_ALBUM":
      return "Album";
    default:
      return null;
  }
}

/** Roughly what fits a 255px desktop tile at 13px. */
const CAPTION_FIT_CHARS = 44;

/**
 * The caption's first line when it fits a desktop tile, otherwise null. A longer
 * line is dropped rather than cut: a caption clipped mid-hashtag reads as noise.
 */
export function fittingCaption(post: InstagramPost): string | null {
  const firstLine = trimmed(post.caption?.split(/\r?\n/)[0]);
  if (!firstLine) return null;
  return Array.from(firstLine).length <= CAPTION_FIT_CHARS ? firstLine : null;
}

const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "always" });

const AGE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
];

/** "3 days ago", "2 weeks ago" — the only honest metadata the API gives us. */
export function relativeAge(timestamp: string, now: number): string {
  const seconds = Math.max(0, (now - new Date(timestamp).getTime()) / 1000);
  for (const [unit, size] of AGE_UNITS) {
    if (seconds >= size) {
      return relativeFormat.format(-Math.floor(seconds / size), unit);
    }
  }
  return "just now";
}

const ACCESSIBLE_CAPTION_CHARS = 80;

/**
 * No alt text exists upstream, so the image is hidden and the tile's anchor
 * carries the name: "Instagram post, 3 days ago: {first 80 characters}".
 */
export function tileAccessibleName(post: InstagramPost, now: number): string {
  const name = `Instagram post, ${relativeAge(post.timestamp, now)}`;
  const caption = trimmed(post.caption?.replace(/\s+/g, " "));
  if (!caption) return name;
  return `${name}: ${Array.from(caption).slice(0, ACCESSIBLE_CAPTION_CHARS).join("")}`;
}
