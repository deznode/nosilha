import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchInstagramPosts } from "@/lib/instagram";

const mockPosts = [
  {
    id: "1",
    caption: "Beautiful sunset in Brava",
    media_type: "IMAGE" as const,
    media_url: "https://scontent.cdninstagram.com/image1.jpg",
    timestamp: "2026-03-01T12:00:00+0000",
    permalink: "https://instagram.com/p/abc123",
  },
  {
    id: "2",
    caption: "Morna music session",
    media_type: "VIDEO" as const,
    media_url: "https://scontent.cdninstagram.com/video1.mp4",
    thumbnail_url: "https://scontent.cdninstagram.com/thumb1.jpg",
    timestamp: "2026-03-02T12:00:00+0000",
    permalink: "https://instagram.com/p/def456",
  },
  {
    id: "3",
    media_type: "CAROUSEL_ALBUM" as const,
    media_url: "https://scontent.cdninstagram.com/image2.jpg",
    timestamp: "2026-03-03T12:00:00+0000",
    permalink: "https://instagram.com/p/ghi789",
  },
];

describe("fetchInstagramPosts", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns empty array when token is missing", async () => {
    delete process.env.INSTAGRAM_ACCESS_TOKEN;
    const posts = await fetchInstagramPosts();
    expect(posts).toEqual([]);
  });

  it("fetches posts successfully with token", async () => {
    process.env.INSTAGRAM_ACCESS_TOKEN = "test-token";

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockPosts }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const posts = await fetchInstagramPosts();

    expect(posts).toHaveLength(3);
    expect(posts[0].id).toBe("1");
    expect(posts[0].media_type).toBe("IMAGE");
    expect(posts[1].media_type).toBe("VIDEO");
    expect(posts[1].thumbnail_url).toBeDefined();
    expect(posts[2].media_type).toBe("CAROUSEL_ALBUM");
  });

  it("passes correct fields and limit to API", async () => {
    process.env.INSTAGRAM_ACCESS_TOKEN = "test-token";

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await fetchInstagramPosts(6);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("graph.instagram.com/v22.0/me/media");
    expect(url).toContain("limit=6");
    expect(url).toContain("id,caption,media_type,media_url,thumbnail_url");
    expect(url).toContain("access_token=test-token");
  });

  it("uses ISR revalidation option", async () => {
    process.env.INSTAGRAM_ACCESS_TOKEN = "test-token";

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await fetchInstagramPosts();

    const options = mockFetch.mock.calls[0][1] as RequestInit;
    expect(options.next).toEqual({ revalidate: 1800 });
  });

  it("returns empty array on non-OK response", async () => {
    process.env.INSTAGRAM_ACCESS_TOKEN = "test-token";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 401 })
    );

    const posts = await fetchInstagramPosts();
    expect(posts).toEqual([]);
  });

  it("returns empty array on network error", async () => {
    process.env.INSTAGRAM_ACCESS_TOKEN = "test-token";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error"))
    );

    const posts = await fetchInstagramPosts();
    expect(posts).toEqual([]);
  });

  it("returns empty array when API returns 500", async () => {
    process.env.INSTAGRAM_ACCESS_TOKEN = "test-token";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );

    const posts = await fetchInstagramPosts();
    expect(posts).toEqual([]);
  });

  it("defaults to limit of 9", async () => {
    process.env.INSTAGRAM_ACCESS_TOKEN = "test-token";

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await fetchInstagramPosts();

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("limit=9");
  });
});
