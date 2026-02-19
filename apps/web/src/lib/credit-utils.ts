/**
 * Credit Detection Utility
 *
 * Frontend mirror of the backend CreditParser for instant visual feedback.
 * NOT authoritative — the backend is the source of truth for credit parsing.
 */

export type CreditPlatform =
  | "YOUTUBE"
  | "INSTAGRAM"
  | "FACEBOOK"
  | "TWITTER"
  | "TIKTOK";

export interface DetectedCredit {
  platform: CreditPlatform;
  handle: string;
  profileUrl: string;
}

/** Maps platform to profile URL builder */
export const PLATFORM_PROFILE_URLS: Record<
  CreditPlatform,
  (handle: string) => string
> = {
  YOUTUBE: (h) => `https://youtube.com/@${h}`,
  INSTAGRAM: (h) => `https://instagram.com/${h}`,
  FACEBOOK: (h) => `https://facebook.com/${h}`,
  TWITTER: (h) => `https://x.com/${h}`,
  TIKTOK: (h) => `https://tiktok.com/@${h}`,
};

/** Platform display names */
export const PLATFORM_LABELS: Record<CreditPlatform, string> = {
  YOUTUBE: "YouTube",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  TWITTER: "X",
  TIKTOK: "TikTok",
};

interface PlatformPattern {
  platform: CreditPlatform;
  urlPatterns: RegExp[];
  shorthands: string[];
}

const PLATFORM_PATTERNS: PlatformPattern[] = [
  {
    platform: "YOUTUBE",
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/@?([\w\-.]+)/i,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/@?([\w\-.]+)/i,
    ],
    shorthands: ["youtube", "yt"],
  },
  {
    platform: "INSTAGRAM",
    urlPatterns: [/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([\w\-.]+)/i],
    shorthands: ["instagram", "ig"],
  },
  {
    platform: "FACEBOOK",
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([\w\-.]+)/i,
      /(?:https?:\/\/)?(?:www\.)?fb\.com\/([\w\-.]+)/i,
    ],
    shorthands: ["facebook", "fb"],
  },
  {
    platform: "TWITTER",
    urlPatterns: [
      /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/@?([\w\-.]+)/i,
    ],
    shorthands: ["twitter", "x"],
  },
  {
    platform: "TIKTOK",
    urlPatterns: [/(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@?([\w\-.]+)/i],
    shorthands: ["tiktok"],
  },
];

const SHORTHAND_PATTERN = /^(\w+)\/@?([\w\-.]+)$/i;

/**
 * Detects a social media platform and handle from raw text input.
 * Returns null for plain names (no platform detected).
 */
export function detectCreditPlatform(input: string): DetectedCredit | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const cleaned = trimmed.replace(/\/+$/, "").split("?")[0];

  // Try full URL match
  for (const pp of PLATFORM_PATTERNS) {
    for (const urlPattern of pp.urlPatterns) {
      const match = cleaned.match(urlPattern);
      if (match) {
        const handle = match[1].replace(/^@/, "").toLowerCase();
        return {
          platform: pp.platform,
          handle,
          profileUrl: PLATFORM_PROFILE_URLS[pp.platform](handle),
        };
      }
    }
  }

  // Try shorthand match
  const shorthandMatch = cleaned.match(SHORTHAND_PATTERN);
  if (shorthandMatch) {
    const prefix = shorthandMatch[1].toLowerCase();
    const handle = shorthandMatch[2].replace(/^@/, "").toLowerCase();
    for (const pp of PLATFORM_PATTERNS) {
      if (pp.shorthands.includes(prefix)) {
        return {
          platform: pp.platform,
          handle,
          profileUrl: PLATFORM_PROFILE_URLS[pp.platform](handle),
        };
      }
    }
  }

  return null;
}
