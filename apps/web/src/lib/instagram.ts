import { createComponentLogger } from "@/lib/logger";

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

interface InstagramApiResponse {
  data: InstagramPost[];
}

const INSTAGRAM_FIELDS =
  "id,caption,media_type,media_url,thumbnail_url,timestamp,permalink";

/**
 * Fetch latest posts from the Instagram Graph API.
 * Server-only — token is never exposed to the client.
 * Returns an empty array on any error for graceful degradation.
 */
export async function fetchInstagramPosts(limit = 9): Promise<InstagramPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    log.debug("INSTAGRAM_ACCESS_TOKEN not set, skipping fetch");
    return [];
  }

  try {
    const url = `https://graph.instagram.com/v22.0/me/media?fields=${INSTAGRAM_FIELDS}&limit=${limit}&access_token=${token}`;

    const response = await fetch(url, {
      next: { revalidate: 1800 }, // 30-minute ISR
    });

    if (!response.ok) {
      log.warn("Instagram API returned non-OK status", {
        status: response.status,
      });
      return [];
    }

    const data: InstagramApiResponse = await response.json();
    return data.data ?? [];
  } catch (error) {
    log.error(
      "Failed to fetch Instagram posts",
      error instanceof Error ? error : new Error(String(error))
    );
    return [];
  }
}
