import { vi } from "vitest";

type Listener = (event: MediaQueryListEvent) => void;

/**
 * A controllable `window.matchMedia` for unit tests.
 *
 * jsdom ships no `matchMedia`. Every list returned for the same query shares one
 * match state and one listener set, so a hook that re-reads `matches` on each
 * snapshot sees the value `setMatches` last wrote, and a change fires every
 * subscriber exactly as a browser would.
 *
 * ```ts
 * const media = mockMatchMedia({ "(max-width: 860px)": true });
 * act(() => media.setMatches("(max-width: 860px)", false));
 * media.restore();
 * ```
 */
export function mockMatchMedia(initial: Record<string, boolean> = {}) {
  const original = window.matchMedia;
  const matches = new Map(Object.entries(initial));
  const listeners = new Map<string, Set<Listener>>();

  const listenersFor = (query: string) => {
    let set = listeners.get(query);
    if (!set) {
      set = new Set();
      listeners.set(query, set);
    }
    return set;
  };

  const matchMedia = vi.fn((query: string) => {
    const list = {
      media: query,
      get matches() {
        return matches.get(query) ?? false;
      },
      onchange: null,
      addEventListener: (_type: string, listener: Listener) =>
        listenersFor(query).add(listener),
      removeEventListener: (_type: string, listener: Listener) =>
        listenersFor(query).delete(listener),
      addListener: (listener: Listener) => listenersFor(query).add(listener),
      removeListener: (listener: Listener) =>
        listenersFor(query).delete(listener),
      dispatchEvent: () => true,
    };
    return list as unknown as MediaQueryList;
  });

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: matchMedia,
  });

  return {
    matchMedia,
    setMatches(query: string, value: boolean) {
      matches.set(query, value);
      const event = { matches: value, media: query } as MediaQueryListEvent;
      for (const listener of [...listenersFor(query)]) listener(event);
    },
    listenerCount: (query: string) => listenersFor(query).size,
    restore() {
      Object.defineProperty(window, "matchMedia", {
        configurable: true,
        writable: true,
        value: original,
      });
    },
  };
}
