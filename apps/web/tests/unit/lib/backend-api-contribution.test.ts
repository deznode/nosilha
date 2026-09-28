import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiError } from "@/lib/api-error";
import type { ApiClient } from "@/lib/api-contracts";

/**
 * Contract tests for the spec 039 API client surface, checked against
 * plan/arkhe/specs/039-contribution-flow/api-contract.md: Retry-After on 429s,
 * the URL/method/body of the three new calls, the extended submit and confirm
 * bodies, and parity of the mock client.
 */

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/supabase-client", () => ({
  supabase: {
    auth: { getSession: mocks.getSession, signOut: mocks.signOut },
  },
}));

import { BackendApiClient } from "@/lib/backend-api";
import { env } from "@/lib/env";
import { MockApiClient } from "@/lib/mock-api";

const API = env.apiUrl;
const TOKEN = "test-access-token";
const TOWN_ID = "11111111-1111-4111-8111-111111111111";
const MEDIA_ID = "22222222-2222-4222-8222-222222222222";

const fetchMock = vi.fn();

function jsonResponse(
  body: unknown,
  init: { status?: number; headers?: Record<string, string> } = {}
): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
}

function lastCall(): { url: string; init: RequestInit } {
  const [url, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit];
  return { url, init: init ?? {} };
}

function headerOf(init: RequestInit, name: string): string | undefined {
  const headers = (init.headers ?? {}) as Record<string, string>;
  return headers[name];
}

function submitRequest() {
  return {
    title: "Festa de Sao Joao",
    mediaType: "VIDEO" as const,
    platform: "YOUTUBE" as const,
    url: "https://www.youtube.com/watch?v=abc123",
  };
}

beforeEach(() => {
  fetchMock.mockReset();
  mocks.getSession.mockReset();
  mocks.signOut.mockReset();
  mocks.getSession.mockResolvedValue({
    data: { session: { access_token: TOKEN } },
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("429 Retry-After through submitExternalMedia", () => {
  async function failWith(headers: Record<string, string>) {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { message: "Too many submissions" },
        { status: 429, headers }
      )
    );
    const error = await new BackendApiClient()
      .submitExternalMedia(submitRequest())
      .then(
        () => null,
        (e: unknown) => e
      );
    expect(error).toBeInstanceOf(ApiError);
    return error as ApiError;
  }

  it("reads Retry-After: 120 as 120 seconds with status 429", async () => {
    const error = await failWith({ "Retry-After": "120" });
    expect(error.status).toBe(429);
    expect(error.retryAfterSeconds).toBe(120);
  });

  it("leaves retryAfterSeconds undefined when the header is missing", async () => {
    const error = await failWith({});
    expect(error.status).toBe(429);
    expect(error.retryAfterSeconds).toBeUndefined();
  });

  it("leaves retryAfterSeconds undefined when the header is invalid", async () => {
    const error = await failWith({ "Retry-After": "abc" });
    expect(error.status).toBe(429);
    expect(error.retryAfterSeconds).toBeUndefined();
  });

  it("converts an HTTP-date Retry-After to seconds from now", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-21T07:26:00Z"));
    const error = await failWith({
      "Retry-After": "Wed, 21 Oct 2026 07:28:00 GMT",
    });
    expect(error.status).toBe(429);
    expect(error.retryAfterSeconds).toBe(120);
  });

  it("still reports a non-429 failure as an ApiError with its status", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 500 }));
    const error = await new BackendApiClient()
      .submitExternalMedia(submitRequest())
      .then(
        () => null,
        (e: unknown) => e
      );
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(500);
    expect((error as ApiError).retryAfterSeconds).toBeUndefined();
  });
});

describe("lookupFilmSubmission", () => {
  it("GETs /gallery/submissions/lookup with platform and externalId, unauthenticated", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ data: { status: "pending" } })
    );

    const result = await new BackendApiClient().lookupFilmSubmission(
      "VIMEO",
      "76979871"
    );

    const { url, init } = lastCall();
    const parsed = new URL(url);
    expect(`${parsed.origin}${parsed.pathname}`).toBe(
      `${API}/api/v1/gallery/submissions/lookup`
    );
    expect(parsed.searchParams.get("platform")).toBe("VIMEO");
    expect(parsed.searchParams.get("externalId")).toBe("76979871");
    expect(init.method ?? "GET").toBe("GET");
    expect(headerOf(init, "Authorization")).toBeUndefined();
    expect(result).toEqual({ status: "pending" });
  });

  it("returns the public shape with id and url", async () => {
    const body = { status: "public", id: MEDIA_ID, url: `/films/${MEDIA_ID}` };
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: body }));

    await expect(
      new BackendApiClient().lookupFilmSubmission("YOUTUBE", "abc123")
    ).resolves.toEqual(body);
  });

  it("throws on a 400", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 400 }));
    await expect(
      new BackendApiClient().lookupFilmSubmission("YOUTUBE", "")
    ).rejects.toThrow(/400/);
  });

  // useFilmLookup turns any rejection into "none"; the client must reject,
  // not resolve a half-shaped result, when the endpoint is missing or down.
  it.each([404, 500, 503])("rejects on a %i", async (status) => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status }));
    await expect(
      new BackendApiClient().lookupFilmSubmission("YOUTUBE", "abc123")
    ).rejects.toThrow(String(status));
  });
});

describe("getTownFirstPhoto", () => {
  it("GETs /gallery/towns/{id}/first-photo and unwraps the photo", async () => {
    const photo = { id: MEDIA_ID, title: "Faja d'Agua" };
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: photo }));

    const result = await new BackendApiClient().getTownFirstPhoto(TOWN_ID);

    const { url, init } = lastCall();
    expect(url).toBe(`${API}/api/v1/gallery/towns/${TOWN_ID}/first-photo`);
    expect(init.method ?? "GET").toBe("GET");
    expect(headerOf(init, "Authorization")).toBeUndefined();
    expect(result).toEqual(photo);
  });

  it("returns null on a 204", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(
      new BackendApiClient().getTownFirstPhoto(TOWN_ID)
    ).resolves.toBeNull();
  });

  it("throws on a server error", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 500 }));
    await expect(
      new BackendApiClient().getTownFirstPhoto(TOWN_ID)
    ).rejects.toThrow(/500/);
  });
});

describe("submitMediaCorrection", () => {
  it("POSTs { mediaId, message } to /feedback/media-corrections with a bearer token", async () => {
    const created = { id: "sugg-1", message: "Thank you" };
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ data: created }, { status: 201 })
    );

    const result = await new BackendApiClient().submitMediaCorrection(
      MEDIA_ID,
      "The year is 1962, not 1926."
    );

    const { url, init } = lastCall();
    expect(url).toBe(`${API}/api/v1/feedback/media-corrections`);
    expect(init.method).toBe("POST");
    expect(headerOf(init, "Authorization")).toBe(`Bearer ${TOKEN}`);
    expect(headerOf(init, "Content-Type")).toBe("application/json");
    expect(JSON.parse(init.body as string)).toEqual({
      mediaId: MEDIA_ID,
      message: "The year is 1962, not 1926.",
    });
    expect(result).toEqual(created);
  });

  it("surfaces a 429 as an ApiError with retryAfterSeconds", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { message: "Slow down" },
        { status: 429, headers: { "Retry-After": "45" } }
      )
    );
    const error = await new BackendApiClient()
      .submitMediaCorrection(MEDIA_ID, "x")
      .then(
        () => null,
        (e: unknown) => e
      );
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(429);
    expect((error as ApiError).retryAfterSeconds).toBe(45);
    expect((error as ApiError).message).toBe("Slow down");
  });

  it("surfaces a 404 (media not public) with its status", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 404 }));
    const error = await new BackendApiClient()
      .submitMediaCorrection(MEDIA_ID, "x")
      .then(
        () => null,
        (e: unknown) => e
      );
    expect((error as ApiError).status).toBe(404);
  });
});

describe("extended submit and confirm bodies", () => {
  it("POST /gallery/submit carries townId, locationName, approximateDate and description", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ data: { id: "sub-1", message: "ok" } })
    );

    await new BackendApiClient().submitExternalMedia({
      ...submitRequest(),
      description: "Filmed at the church square",
      townId: TOWN_ID,
      locationName: "Praca da Igreja",
      approximateDate: "circa 1985",
    });

    const { url, init } = lastCall();
    expect(url).toBe(`${API}/api/v1/gallery/submit`);
    expect(init.method).toBe("POST");
    expect(headerOf(init, "Authorization")).toBe(`Bearer ${TOKEN}`);
    expect(JSON.parse(init.body as string)).toMatchObject({
      townId: TOWN_ID,
      locationName: "Praca da Igreja",
      approximateDate: "circa 1985",
      description: "Filmed at the church square",
    });
  });

  it("POST /gallery/upload/confirm carries townId, title and description", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ data: { id: MEDIA_ID, publicUrl: null } })
    );

    await new BackendApiClient().confirmUpload({
      key: "uploads/2026/01/photo.png",
      originalName: "photo.png",
      contentType: "image/png",
      fileSize: 10,
      townId: TOWN_ID,
      title: "Harbour at dawn",
      description: "Taken from the pier",
    });

    const { url, init } = lastCall();
    expect(url).toBe(`${API}/api/v1/gallery/upload/confirm`);
    expect(init.method).toBe("POST");
    expect(headerOf(init, "Authorization")).toBe(`Bearer ${TOKEN}`);
    expect(JSON.parse(init.body as string)).toMatchObject({
      key: "uploads/2026/01/photo.png",
      townId: TOWN_ID,
      title: "Harbour at dawn",
      description: "Taken from the pier",
    });
  });

  it("POST /gallery/upload/presign 429 carries retryAfterSeconds", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { message: "Upload limit" },
        { status: 429, headers: { "Retry-After": "300" } }
      )
    );
    const error = await new BackendApiClient()
      .getPresignedUploadUrl({
        fileName: "a.png",
        contentType: "image/png",
        fileSize: 1,
      })
      .then(
        () => null,
        (e: unknown) => e
      );
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).retryAfterSeconds).toBe(300);
  });
});

describe("MockApiClient parity", () => {
  // Every ApiClient method added for spec 039. Typed against the interface so a
  // rename in api-contracts.ts fails the type check here.
  const specMethods = [
    "lookupFilmSubmission",
    "getTownFirstPhoto",
    "submitMediaCorrection",
  ] as const satisfies readonly (keyof ApiClient)[];

  it.each(specMethods)("has %s on the mock and the backend client", (name) => {
    expect(typeof new MockApiClient()[name]).toBe("function");
    expect(typeof new BackendApiClient()[name]).toBe("function");
  });

  // The mock's methods take no parameters; call through the interface, as app code does.
  const mock: ApiClient = new MockApiClient();

  it("lookupFilmSubmission resolves { status: 'none' }", async () => {
    await expect(
      mock.lookupFilmSubmission("YOUTUBE", "abc123")
    ).resolves.toEqual({ status: "none" });
  });

  it("getTownFirstPhoto resolves null", async () => {
    await expect(mock.getTownFirstPhoto(TOWN_ID)).resolves.toBeNull();
  });

  it("submitMediaCorrection resolves a { id, message } response", async () => {
    const result = await mock.submitMediaCorrection(MEDIA_ID, "correction");
    expect(result).toEqual({
      id: expect.any(String),
      message: expect.any(String),
    });
  });
});
