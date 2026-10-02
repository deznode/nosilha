import type { FilmPlatform } from "@/types/gallery";

export interface ParsedFilmLink {
  platform: FilmPlatform;
  externalId: string;
}

export const FILM_PLATFORM_LABEL: Record<FilmPlatform, string> = {
  YOUTUBE: "YouTube",
  VIMEO: "Vimeo",
};

/**
 * Recognises a YouTube or Vimeo link and pulls out its video id (F2/F3).
 * Anything else, including other platforms, is `null` (F4).
 */
export function parseVideoUrl(url: string): ParsedFilmLink | null {
  // youtube.com/watch?v=ID (v= anywhere in the query), youtu.be/ID, and the
  // /embed/, /shorts/ and /live/ paths, on youtube.com or youtube-nocookie.com.
  // Stricter than lib/films.ts: a submitted id must be a full 11 characters.
  const youtube = url.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?![a-zA-Z0-9_-])/
  );
  if (youtube) return { platform: "YOUTUBE", externalId: youtube[1] };

  // vimeo.com/ID and player.vimeo.com/video/ID
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { platform: "VIMEO", externalId: vimeo[1] };

  return null;
}

/** The thumbnail a recognised link shows; Vimeo has none (F3). */
export function filmThumbnailUrl(link: ParsedFilmLink | null): string | null {
  return link?.platform === "YOUTUBE"
    ? `https://i.ytimg.com/vi/${link.externalId}/hqdefault.jpg`
    : null;
}
