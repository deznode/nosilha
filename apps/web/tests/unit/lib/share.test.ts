import { afterEach, describe, expect, it, vi } from "vitest";

import { buildShareLink, isShareArrival, sharePreviewImage } from "@/lib/share";

const params = (url: string) => new URL(url).searchParams;

describe("buildShareLink", () => {
  it("tags a plain link with the moment", () => {
    const link = buildShareLink("https://nosilha.com/photographs/abc", "photo");

    expect(new URL(link).pathname).toBe("/photographs/abc");
    expect(params(link).get("utm_source")).toBe("share");
    expect(params(link).get("utm_medium")).toBe("link");
    expect(params(link).get("utm_campaign")).toBe("photo");
    expect(params(link).has("ask")).toBe(false);
  });

  it("adds ask=1 for the ask moment only", () => {
    expect(
      params(buildShareLink("https://nosilha.com/photographs/abc", "ask")).get(
        "ask"
      )
    ).toBe("1");
    expect(
      params(buildShareLink("https://nosilha.com/films/abc", "film")).has("ask")
    ).toBe(false);
  });

  it("replaces the tags of a link that was itself shared", () => {
    const arrived =
      "https://nosilha.com/photographs/abc?utm_source=share&utm_medium=link&utm_campaign=ask&ask=1&utm_content=x";
    const link = buildShareLink(arrived, "photo");

    expect(params(link).get("utm_campaign")).toBe("photo");
    expect(params(link).has("ask")).toBe(false);
    expect(params(link).has("utm_content")).toBe(false);
    expect(params(link).getAll("utm_source")).toEqual(["share"]);
  });

  it("keeps other parameters and the hash", () => {
    const link = buildShareLink(
      "https://nosilha.com/photographs/abc?place=furna#top",
      "photo"
    );

    expect(params(link).get("place")).toBe("furna");
    expect(new URL(link).hash).toBe("#top");
  });

  it("returns what it was given when that is not a URL", () => {
    expect(buildShareLink("", "photo")).toBe("");
    expect(buildShareLink("not a url", "photo")).toBe("not a url");
  });
});

describe("isShareArrival", () => {
  it("is true only for utm_source=share", () => {
    expect(isShareArrival("?utm_source=share&utm_campaign=photo")).toBe(true);
    expect(isShareArrival("?utm_source=newsletter")).toBe(false);
    expect(isShareArrival("?place=furna")).toBe(false);
    expect(isShareArrival("")).toBe(false);
  });
});

describe("sharePreviewImage", () => {
  afterEach(() => vi.unstubAllEnvs());

  const R2 = "https://media.nosilha.com/uploads/2026/02/a-DJI_0107.JPG";

  it("resizes an archive image to a 1200×630 JPEG in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(sharePreviewImage(R2, "Lomba")).toEqual({
      url: `https://nosilha.com/cdn-cgi/image/width=1200,height=630,fit=cover,quality=75,format=jpeg/${R2}`,
      width: 1200,
      height: 630,
      alt: "Lomba",
      type: "image/jpeg",
    });
  });

  it("uses a YouTube thumbnail as it is", () => {
    vi.stubEnv("NODE_ENV", "production");
    const thumb = "https://img.youtube.com/vi/abc123/hqdefault.jpg";

    expect(sharePreviewImage(thumb, "A film")).toEqual({
      url: thumb,
      width: 480,
      height: 360,
      alt: "A film",
      type: "image/jpeg",
    });
    expect(
      sharePreviewImage("https://i.ytimg.com/vi/abc123/hqdefault.jpg", "A film")
        ?.url
    ).toBe("https://i.ytimg.com/vi/abc123/hqdefault.jpg");
  });

  it("declares the size YouTube serves under each thumbnail name", () => {
    vi.stubEnv("NODE_ENV", "production");
    const size = (file: string) => {
      const image = sharePreviewImage(
        `https://i.ytimg.com/vi/abc123/${file}`,
        "A film"
      );
      return [image?.width, image?.height];
    };

    expect(size("maxresdefault.jpg")).toEqual([1280, 720]);
    expect(size("sddefault.jpg")).toEqual([640, 480]);
    expect(size("mqdefault.jpg")).toEqual([320, 180]);
    expect(size("hqdefault.jpg")).toEqual([480, 360]);
    expect(size("0.jpg")).toEqual([480, 360]);
  });

  it("gives null for anything it cannot vouch for", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(sharePreviewImage(null, "x")).toBeNull();
    expect(sharePreviewImage(undefined, "x")).toBeNull();
    expect(sharePreviewImage("", "x")).toBeNull();
    expect(sharePreviewImage("not a url", "x")).toBeNull();
    expect(sharePreviewImage("https://example.com/a.jpg", "x")).toBeNull();
    expect(
      sharePreviewImage("http://media.nosilha.com/uploads/a.jpg", "x")
    ).toBeNull();
    expect(
      sharePreviewImage("https://media.nosilha.com.evil.test/a.jpg", "x")
    ).toBeNull();
  });

  it("uses the source directly outside production", () => {
    vi.stubEnv("NODE_ENV", "development");

    expect(sharePreviewImage(R2, "Lomba")?.url).toBe(R2);
  });
});
