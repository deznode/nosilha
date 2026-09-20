import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  badgeLabel,
  fetchInstagramPosts,
  fittingCaption,
  relativeAge,
  tileAccessibleName,
  tileImageUrl,
  type InstagramPost,
} from "@/lib/instagram";

const mockPosts: InstagramPost[] = [
  {
    id: "1",
    caption: "Beautiful sunset in Brava",
    media_type: "IMAGE",
    media_url: "https://scontent.cdninstagram.com/image1.jpg",
    timestamp: "2026-03-01T12:00:00+0000",
    permalink: "https://instagram.com/p/abc123",
  },
  {
    id: "2",
    caption: "Morna music session",
    media_type: "VIDEO",
    media_url: "https://scontent.cdninstagram.com/video1.mp4",
    thumbnail_url: "https://scontent.cdninstagram.com/thumb1.jpg",
    timestamp: "2026-03-02T12:00:00+0000",
    permalink: "https://instagram.com/p/def456",
  },
  {
    id: "3",
    media_type: "CAROUSEL_ALBUM",
    media_url: "https://scontent.cdninstagram.com/image2.jpg",
    timestamp: "2026-03-03T12:00:00+0000",
    permalink: "https://instagram.com/p/ghi789",
  },
];

const post = (overrides: Partial<InstagramPost> = {}): InstagramPost => ({
  ...mockPosts[0],
  ...overrides,
});

describe("fetchInstagramPosts", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // `restoreAllMocks` does not undo `stubGlobal`, so without this a stubbed
    // `fetch` outlives the test that installed it.
    vi.unstubAllGlobals();
  });

  it("is unavailable when the token is missing", async () => {
    delete process.env.INSTAGRAM_ACCESS_TOKEN;
    expect(await fetchInstagramPosts()).toEqual({ status: "unavailable" });
  });

  it("fetches posts successfully with token", async () => {
    process.env.INSTAGRAM_ACCESS_TOKEN = "test-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: mockPosts }),
      })
    );

    const feed = await fetchInstagramPosts();

    expect(feed.status).toBe("ok");
    if (feed.status !== "ok") return;
    expect(feed.posts).toHaveLength(3);
    expect(feed.posts[1].thumbnail_url).toBeDefined();
  });

  it("is ok and empty when the account has no posts", async () => {
    process.env.INSTAGRAM_ACCESS_TOKEN = "test-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
    );

    expect(await fetchInstagramPosts()).toEqual({ status: "ok", posts: [] });
  });

  it("asks the API for four posts, with the fields the tiles need", async () => {
    process.env.INSTAGRAM_ACCESS_TOKEN = "test-token";
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await fetchInstagramPosts();

    const defaultUrl = mockFetch.mock.calls[0][0] as string;
    expect(defaultUrl).toContain("graph.instagram.com/v22.0/me/media");
    expect(defaultUrl).toContain("limit=4");
    expect(defaultUrl).toContain(
      "id,caption,media_type,media_url,thumbnail_url"
    );
    expect(defaultUrl).toContain("access_token=test-token");
  });

  it("leaves caching to the caller's cache scope, but bounds the request", async () => {
    process.env.INSTAGRAM_ACCESS_TOKEN = "test-token";
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await fetchInstagramPosts();

    const options = mockFetch.mock.calls[0][1] as {
      next?: unknown;
      signal?: AbortSignal;
    };
    expect(options.next).toBeUndefined();
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });

  it("is unavailable when the API answers with something other than a list", async () => {
    process.env.INSTAGRAM_ACCESS_TOKEN = "test-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { error: "nope" } }),
      })
    );

    expect(await fetchInstagramPosts()).toEqual({ status: "unavailable" });
  });

  it.each([401, 500])("is unavailable on a %i response", async (status) => {
    process.env.INSTAGRAM_ACCESS_TOKEN = "test-token";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status }));

    expect(await fetchInstagramPosts()).toEqual({ status: "unavailable" });
  });

  it("drops a post Meta sent no image for", async () => {
    process.env.INSTAGRAM_ACCESS_TOKEN = "test-token";
    // A Reel with licensed audio: a poster frame, no media_url. Seen live on
    // @nosilha, 2026-09-19 — and one with neither would reach `<Image>` as
    // undefined, so it never leaves the fetch.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              { ...mockPosts[1], media_url: undefined },
              {
                ...mockPosts[2],
                id: "4",
                media_url: undefined,
                thumbnail_url: undefined,
              },
            ],
          }),
      })
    );

    const feed = await fetchInstagramPosts();

    expect(feed.status).toBe("ok");
    if (feed.status !== "ok") return;
    expect(feed.posts.map((p) => p.id)).toEqual(["2"]);
  });

  it("is unavailable on a network error", async () => {
    process.env.INSTAGRAM_ACCESS_TOKEN = "test-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error"))
    );

    expect(await fetchInstagramPosts()).toEqual({ status: "unavailable" });
  });
});

describe("tileImageUrl", () => {
  it("uses the poster frame for a video", () => {
    expect(tileImageUrl(mockPosts[1])).toBe(mockPosts[1].thumbnail_url);
  });

  it("falls back to media_url for a video without a thumbnail", () => {
    expect(tileImageUrl({ ...mockPosts[1], thumbnail_url: undefined })).toBe(
      mockPosts[1].media_url
    );
  });

  it("uses media_url for images and albums", () => {
    expect(tileImageUrl(mockPosts[0])).toBe(mockPosts[0].media_url);
    expect(tileImageUrl(mockPosts[2])).toBe(mockPosts[2].media_url);
  });

  it("is null when Meta sent neither a poster frame nor media", () => {
    expect(
      tileImageUrl({
        ...mockPosts[0],
        media_url: undefined,
        thumbnail_url: undefined,
      })
    ).toBeNull();
  });

  it("uses the poster frame of a video-led album, not its .mp4", () => {
    expect(
      tileImageUrl({
        ...mockPosts[2],
        media_url: "https://scontent.cdninstagram.com/album-video.mp4",
        thumbnail_url: "https://scontent.cdninstagram.com/album-thumb.jpg",
      })
    ).toBe("https://scontent.cdninstagram.com/album-thumb.jpg");
  });
});

describe("badgeLabel", () => {
  it("labels videos and albums, not images", () => {
    expect(badgeLabel(mockPosts[0])).toBeNull();
    expect(badgeLabel(mockPosts[1])).toBe("Video");
    expect(badgeLabel(mockPosts[2])).toBe("Album");
  });
});

describe("fittingCaption", () => {
  it("keeps a first line of 44 characters or fewer", () => {
    expect(
      fittingCaption(
        post({ caption: "Praça de Nova Sintra, domingo de manhã" })
      )
    ).toBe("Praça de Nova Sintra, domingo de manhã");
    expect(fittingCaption(post({ caption: "x".repeat(44) }))).toBe(
      "x".repeat(44)
    );
  });

  it("drops a longer first line rather than cutting it", () => {
    expect(
      fittingCaption(
        post({
          caption: "Furna at first light. Barco di Praia ta txiga 7 hora.",
        })
      )
    ).toBeNull();
  });

  it("judges only the first line", () => {
    expect(
      fittingCaption(
        post({
          caption: "Fajã d’Água.\n\n#brava #caboverde #nosilha #nosterra",
        })
      )
    ).toBe("Fajã d’Água.");
  });

  it("counts an emoji as one character", () => {
    expect(fittingCaption(post({ caption: `${"x".repeat(43)}🌺` }))).toBe(
      `${"x".repeat(43)}🌺`
    );
  });

  it("is null without a caption", () => {
    expect(fittingCaption(post({ caption: undefined }))).toBeNull();
    expect(fittingCaption(post({ caption: "  \nsecond" }))).toBeNull();
  });
});

describe("relativeAge", () => {
  const now = Date.parse("2026-09-19T12:00:00Z");

  it.each([
    ["2026-09-19T11:59:40+0000", "just now"],
    ["2026-09-19T11:55:00+0000", "5 minutes ago"],
    ["2026-09-19T09:00:00+0000", "3 hours ago"],
    ["2026-09-16T12:00:00+0000", "3 days ago"],
    ["2026-09-12T12:00:00+0000", "1 week ago"],
    ["2026-09-05T12:00:00+0000", "2 weeks ago"],
    ["2026-07-19T12:00:00+0000", "2 months ago"],
    ["2025-03-01T12:00:00+0000", "1 year ago"],
  ])("%s → %s", (timestamp, expected) => {
    expect(relativeAge(timestamp, now)).toBe(expected);
  });

  it("does not go negative for a clock-skewed future timestamp", () => {
    expect(relativeAge("2026-09-19T12:05:00+0000", now)).toBe("just now");
  });
});

describe("tileAccessibleName", () => {
  const now = Date.parse("2026-09-19T12:00:00Z");
  const timestamp = "2026-09-16T12:00:00+0000";

  it("names the post by date and the first 80 characters of its caption", () => {
    const caption = `${"a".repeat(78)}\n\nbcdef`;
    expect(tileAccessibleName(post({ caption, timestamp }), now)).toBe(
      `Instagram post, 3 days ago: ${"a".repeat(78)} b`
    );
  });

  it("falls back to the date alone without a caption", () => {
    expect(
      tileAccessibleName(post({ caption: undefined, timestamp }), now)
    ).toBe("Instagram post, 3 days ago");
  });
});
