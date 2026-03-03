"use client";

/**
 * Tracks newsletter submissions on the client so we can provide
 * immediate duplicate feedback without waiting for the ESP response.
 */

const GLOBAL_CACHE_KEY = "__nosIlhaNewsletterEmails";
const STORAGE_KEY = "nosilha-newsletter-subscribers";

type GlobalWithCache = {
  [GLOBAL_CACHE_KEY]?: Set<string>;
};

function getCache(): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }

  const globalObject = window as typeof window & GlobalWithCache;

  if (!globalObject[GLOBAL_CACHE_KEY]) {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    const initial = stored ? (JSON.parse(stored) as string[]) : [];
    globalObject[GLOBAL_CACHE_KEY] = new Set(initial);
  }

  return globalObject[GLOBAL_CACHE_KEY]!;
}

function persist(cache: Set<string>) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(cache)));
}

export function hasSubmittedEmail(email: string): boolean {
  const cache = getCache();
  return cache.has(email.toLowerCase());
}

export function recordSubmittedEmail(email: string) {
  const cache = getCache();
  cache.add(email.toLowerCase());
  persist(cache);
}
