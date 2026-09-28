import type { ParsedFilmLink } from "../hooks/use-film-lookup";

/**
 * Recognises a YouTube or Vimeo link and pulls out its video id (F2/F3).
 * Anything else, including other platforms, is `null` (F4).
 */
export function parseVideoUrl(url: string): ParsedFilmLink | null {
  // youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const youtube = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtube) return { platform: "YOUTUBE", externalId: youtube[1] };

  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { platform: "VIMEO", externalId: vimeo[1] };

  return null;
}

/** The thumbnail a recognised link shows; Vimeo has none (F3). */
export function filmThumbnailUrl(link: ParsedFilmLink | null): string | null {
  return link?.platform === "YOUTUBE"
    ? `https://i.ytimg.com/vi/${link.externalId}/hqdefault.jpg`
    : null;
}
