import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getEntryBySlug: vi.fn(),
  getTownStatusSummary: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  getEntryBySlug: mocks.getEntryBySlug,
  getTownStatusSummary: mocks.getTownStatusSummary,
}));

import { GET } from "@/app/directory/[category]/[slug]/route";

const TOWNS = [{ id: "t-1", slug: "nova-sintra", name: "Nova Sintra" }];

async function visit(
  category: string,
  slug: string,
  base = "https://nosilha.com",
  headers?: HeadersInit
) {
  const request = new NextRequest(
    `${base}/directory/${category}/${slug}?ref=old`,
    { headers }
  );
  return GET(request, { params: Promise.resolve({ category, slug }) });
}

/**
 * Spec 034 T-38 / FR-015 — `/directory/:category/:slug` and the older
 * `/directory/entry/:slug` resolve the record and move to `/<town>/<entry>`.
 */
describe("GET /directory/[category]/[slug]", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.getEntryBySlug.mockReset();
    mocks.getTownStatusSummary.mockReset().mockResolvedValue(TOWNS);
  });

  it("moves a record permanently to its address under its settlement", async () => {
    mocks.getEntryBySlug.mockResolvedValue({
      slug: "igreja",
      townId: "t-1",
      town: "Nova Sintra",
    });

    const response = await visit("heritage", "igreja");

    expect(mocks.getEntryBySlug).toHaveBeenCalledWith("igreja");
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://nosilha.com/nova-sintra/igreja"
    );
  });

  it("redirects to the public host behind a proxy, not the container address", async () => {
    mocks.getEntryBySlug.mockResolvedValue({
      slug: "igreja",
      townId: "t-1",
      town: "Nova Sintra",
    });

    const moved = await visit("heritage", "igreja", "https://0.0.0.0:3000", {
      "x-forwarded-host": "www.nosilha.com",
    });
    expect(moved.headers.get("location")).toBe(
      "https://www.nosilha.com/nova-sintra/igreja"
    );

    const fallback = await visit(
      "heritage",
      "not a slug",
      "https://0.0.0.0:3000",
      {
        "x-forwarded-host": "www.nosilha.com",
      }
    );
    expect(fallback.headers.get("location")).toBe(
      "https://www.nosilha.com/settlements"
    );
  });

  it("serves the older /directory/entry/:slug shape the same way", async () => {
    mocks.getEntryBySlug.mockResolvedValue({
      slug: "igreja",
      townId: "t-1",
      town: "Nova Sintra",
    });

    const response = await visit("entry", "igreja");

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://nosilha.com/nova-sintra/igreja"
    );
  });

  it("sends an unknown record to the settlements, temporarily", async () => {
    mocks.getEntryBySlug.mockResolvedValue(undefined);

    const response = await visit("heritage", "gone");

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://nosilha.com/settlements"
    );
  });

  it("sends a record no settlement owns to the settlements, temporarily", async () => {
    mocks.getEntryBySlug.mockResolvedValue({
      slug: "adrift",
      town: "Elsewhere",
    });

    const response = await visit("nature", "adrift");

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://nosilha.com/settlements"
    );
  });

  it("falls back to the settlements when the lookup fails", async () => {
    mocks.getEntryBySlug.mockRejectedValue(new Error("API down"));

    const response = await visit("heritage", "igreja");

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://nosilha.com/settlements"
    );
  });

  it("never looks up a slug that is not a slug", async () => {
    const response = await visit("heritage", "..");

    expect(mocks.getEntryBySlug).not.toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://nosilha.com/settlements"
    );
  });
});
