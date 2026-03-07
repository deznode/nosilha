import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch for font loading and ImageResponse
vi.stubGlobal(
  "fetch",
  vi.fn().mockResolvedValue({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  })
);

vi.mock("next/og", () => ({
  ImageResponse: vi.fn().mockImplementation((_jsx, options) => {
    const headers = new Headers(options?.headers);
    headers.set("content-type", "image/png");
    return new Response("mock-image", {
      status: 200,
      headers,
    });
  }),
}));

// Dynamic import after mocks
const { GET } = await import("@/app/api/og/route");

function createRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost:3000/api/og");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString());
}

describe("GET /api/og", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a response for default type", async () => {
    const request = createRequest({ type: "default", title: "Test Title" });
    const response = await GET(request as never);

    expect(response.status).toBe(200);
  });

  it("returns a response for directory type", async () => {
    const request = createRequest({
      type: "directory",
      title: "Restaurant",
      category: "Restaurant",
    });
    const response = await GET(request as never);

    expect(response.status).toBe(200);
  });

  it("returns a response for article type", async () => {
    const request = createRequest({
      type: "article",
      title: "History of Brava",
      category: "History",
    });
    const response = await GET(request as never);

    expect(response.status).toBe(200);
  });

  it("returns a response for gallery type", async () => {
    const request = createRequest({ type: "gallery", title: "Gallery" });
    const response = await GET(request as never);

    expect(response.status).toBe(200);
  });

  it("returns 400 for invalid type parameter", async () => {
    const request = createRequest({ type: "invalid" });
    const response = await GET(request as never);

    expect(response.status).toBe(400);
  });

  it("sets Cache-Control headers", async () => {
    const request = createRequest({ type: "default", title: "Test" });
    const response = await GET(request as never);

    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=86400, s-maxage=604800"
    );
  });

  it("uses default title when none provided", async () => {
    const request = createRequest({});
    const response = await GET(request as never);

    expect(response.status).toBe(200);
  });
});
