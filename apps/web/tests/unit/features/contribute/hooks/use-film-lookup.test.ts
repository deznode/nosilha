import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useFilmLookup } from "@/features/contribute/hooks/use-film-lookup";
import * as api from "@/lib/api";

vi.mock("@/lib/api");

const youtubeA = { platform: "YOUTUBE" as const, externalId: "aaaaaaaaaaa" };
const youtubeB = { platform: "YOUTUBE" as const, externalId: "bbbbbbbbbbb" };
const vimeo = { platform: "VIMEO" as const, externalId: "218447301" };

describe("useFilmLookup", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(api.lookupFilmSubmission).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is idle with no parsed link, and calls nothing", async () => {
    const { result } = renderHook(() => useFilmLookup(null));

    expect(result.current).toEqual({ status: "idle" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(api.lookupFilmSubmission).not.toHaveBeenCalled();
  });

  it("waits 400ms before calling the lookup, and reports checking meanwhile", async () => {
    vi.mocked(api.lookupFilmSubmission).mockResolvedValue({ status: "none" });

    const { result } = renderHook(() => useFilmLookup(youtubeA));

    expect(result.current).toEqual({ status: "checking" });
    expect(api.lookupFilmSubmission).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(399);
    });
    expect(api.lookupFilmSubmission).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(api.lookupFilmSubmission).toHaveBeenCalledTimes(1);
    expect(api.lookupFilmSubmission).toHaveBeenCalledWith(
      "YOUTUBE",
      "aaaaaaaaaaa"
    );
    expect(result.current).toEqual({ status: "none" });
  });

  it("restarts the debounce when the link changes before it fires, so only the last id is looked up", async () => {
    vi.mocked(api.lookupFilmSubmission).mockResolvedValue({ status: "none" });

    const { rerender } = renderHook(({ parsed }) => useFilmLookup(parsed), {
      initialProps: { parsed: youtubeA as typeof youtubeA | typeof youtubeB },
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    rerender({ parsed: youtubeB });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(api.lookupFilmSubmission).toHaveBeenCalledTimes(1);
    expect(api.lookupFilmSubmission).toHaveBeenCalledWith(
      "YOUTUBE",
      "bbbbbbbbbbb"
    );
  });

  it("looks up a given (platform, id) only once, reusing the cached result on return", async () => {
    vi.mocked(api.lookupFilmSubmission).mockResolvedValue({ status: "none" });

    const { result, rerender } = renderHook(
      ({ parsed }) => useFilmLookup(parsed),
      { initialProps: { parsed: youtubeA as typeof youtubeA | typeof vimeo } }
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(result.current).toEqual({ status: "none" });

    rerender({ parsed: vimeo });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(api.lookupFilmSubmission).toHaveBeenCalledTimes(2);

    // Back to the first link — same pair as before, no new call.
    rerender({ parsed: youtubeA });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(api.lookupFilmSubmission).toHaveBeenCalledTimes(2);
    expect(result.current).toEqual({ status: "none" });
  });

  it("ignores a stale response answered after a newer request has already resolved", async () => {
    let resolveA!: (
      v: Awaited<ReturnType<typeof api.lookupFilmSubmission>>
    ) => void;
    let resolveB!: (
      v: Awaited<ReturnType<typeof api.lookupFilmSubmission>>
    ) => void;
    vi.mocked(api.lookupFilmSubmission)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveA = resolve;
          })
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveB = resolve;
          })
      );

    const { result, rerender } = renderHook(
      ({ parsed }) => useFilmLookup(parsed),
      {
        initialProps: { parsed: youtubeA as typeof youtubeA | typeof youtubeB },
      }
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    rerender({ parsed: youtubeB });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(api.lookupFilmSubmission).toHaveBeenCalledTimes(2);

    // B (the newer request) answers first.
    await act(async () => {
      resolveB({
        status: "public",
        id: "media-b",
        url: "https://example.com/b",
      });
      await Promise.resolve();
    });
    expect(result.current).toEqual({
      status: "public",
      media: { id: "media-b", url: "https://example.com/b" },
    });

    // A (the abandoned, older request) answers late — must not override B.
    await act(async () => {
      resolveA({
        status: "public",
        id: "media-a",
        url: "https://example.com/a",
      });
      await Promise.resolve();
    });
    expect(result.current).toEqual({
      status: "public",
      media: { id: "media-b", url: "https://example.com/b" },
    });
  });

  it("treats a rejected lookup as no duplicate", async () => {
    vi.mocked(api.lookupFilmSubmission).mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useFilmLookup(vimeo));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(result.current).toEqual({ status: "none" });
  });

  it.each([404, 500, 503])(
    "treats an HTTP %i from the lookup as none, not stuck on checking",
    async (status) => {
      // The backend client throws `Failed to look up film submission: <status>`.
      vi.mocked(api.lookupFilmSubmission).mockRejectedValue(
        new Error(`Failed to look up film submission: ${status}`)
      );

      const { result } = renderHook(() => useFilmLookup(youtubeA));
      expect(result.current).toEqual({ status: "checking" });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(400);
      });

      expect(result.current).toEqual({ status: "none" });
    }
  );

  it("maps a pending lookup to status pending, with no media", async () => {
    vi.mocked(api.lookupFilmSubmission).mockResolvedValue({
      status: "pending",
    });

    const { result } = renderHook(() => useFilmLookup(youtubeA));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(result.current).toEqual({ status: "pending" });
  });
});
