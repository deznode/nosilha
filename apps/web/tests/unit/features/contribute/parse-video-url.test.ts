import { describe, expect, it } from "vitest";

import { parseVideoUrl } from "@/features/contribute/lib/parse-video-url";

const ID = "dQw4w9WgXcQ";

describe("parseVideoUrl", () => {
  it.each([
    `https://www.youtube.com/watch?v=${ID}`,
    `https://m.youtube.com/watch?v=${ID}`,
    `https://www.youtube.com/watch?feature=share&v=${ID}`,
    `https://youtu.be/${ID}?t=42`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube-nocookie.com/embed/${ID}`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/live/${ID}`,
  ])("recognises the YouTube link %s", (url) => {
    expect(parseVideoUrl(url)).toEqual({ platform: "YOUTUBE", externalId: ID });
  });

  it.each([
    "https://vimeo.com/76979871",
    "https://player.vimeo.com/video/76979871",
  ])("recognises the Vimeo link %s", (url) => {
    expect(parseVideoUrl(url)).toEqual({
      platform: "VIMEO",
      externalId: "76979871",
    });
  });

  it.each([
    "",
    "https://soundcloud.com/artist/track",
    "https://www.youtube.com/watch?v=short",
    `https://www.youtube.com/watch?v=${ID}xyz`,
    "https://www.youtube.com/@channel",
  ])("rejects %j", (url) => {
    expect(parseVideoUrl(url)).toBeNull();
  });
});
