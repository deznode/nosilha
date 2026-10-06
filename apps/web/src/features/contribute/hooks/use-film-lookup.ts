"use client";

import { useEffect, useRef, useState } from "react";
import { lookupFilmSubmission } from "@/lib/api";
import type { PublicFilmLookup } from "@/types/gallery";

import type { ParsedFilmLink } from "../lib/parse-video-url";

export interface FilmLookupResult {
  status: "idle" | "checking" | "public" | "pending" | "none";
  /** The public film the link matches — set only when `status` is `public`. */
  media?: Omit<PublicFilmLookup, "status">;
}

const DEBOUNCE_MS = 400;
const IDLE: FilmLookupResult = { status: "idle" };

/**
 * Looks up whether a recognised film link is already in the archive (F4/F5).
 *
 * Waits {@link DEBOUNCE_MS} after the link settles before calling the API, so
 * typing doesn't fire a request per keystroke. Each `(platform, externalId)`
 * pair is looked up at most once — the outcome is cached for the hook's
 * lifetime, so revisiting a link already resolved shows its cached status
 * instead of re-querying. A response for a link the caller has since moved
 * on from is ignored, and a failed lookup resolves to `none` rather than
 * leaving the caller stuck on `checking`; a failure isn't cached, so the next
 * visit to that link asks again.
 *
 * `sends` counts the caller's successful sends. A change clears the cache: a
 * link just sent is no longer `none`, and must show as waiting (F6) if pasted
 * again.
 */
export function useFilmLookup(
  parsed: ParsedFilmLink | null,
  sends = 0
): FilmLookupResult {
  const [result, setResult] = useState<FilmLookupResult>(IDLE);
  const cacheRef = useRef(new Map<string, FilmLookupResult>());
  const cachedSendsRef = useRef(sends);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (cachedSendsRef.current !== sends) {
      cachedSendsRef.current = sends;
      cacheRef.current.clear();
    }

    // Every change of link, to none or to a cached one included, supersedes
    // a lookup still in flight for the previous link.
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    if (!parsed) {
      setResult(IDLE);
      return;
    }

    const key = `${parsed.platform}:${parsed.externalId}`;
    const cached = cacheRef.current.get(key);
    if (cached) {
      setResult(cached);
      return;
    }

    setResult({ status: "checking" });

    const timer = setTimeout(() => {
      lookupFilmSubmission(parsed.platform, parsed.externalId)
        .then((lookup): FilmLookupResult => {
          if (lookup.status === "public") {
            const { status, ...media } = lookup;
            return { status, media };
          }
          if (lookup.status === "pending") {
            return { status: "pending" };
          }
          return { status: "none" };
        })
        .then((next) => {
          cacheRef.current.set(key, next);
          return next;
        })
        .catch((): FilmLookupResult => ({ status: "none" }))
        .then((next) => {
          // A later request for a different link may have started (and even
          // finished) while this one was in flight — don't clobber its result.
          if (requestIdRef.current === requestId) setResult(next);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // Depending on the primitives (not the `parsed` object identity) keeps the
    // effect from re-running when the caller re-renders with an equivalent
    // but newly-created object for the same link.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed?.platform, parsed?.externalId, sends]);

  return result;
}
