"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useMapStore, type MapQueryState } from "@/stores/mapStore";
import type { MapItem, MapMode, StatusFilter } from "../data/types";

/**
 * The map's state in its URL. Spec 034 FR-011, handoff SPECS §4.
 *
 * `?mode=&status=&q=&sel=`. The store is the source of truth and the URL a one-way
 * mirror of it:
 *
 * - **Read** from `location.search` on mount — which under `cacheComponents` is also
 *   every time Activity shows the route again, so a link followed from another screen
 *   while the map was hidden is honoured.
 * - **Write** with `history.replaceState`, never `router.replace`: the router call
 *   runs the App Router reducer and re-renders every router-context consumer, and a
 *   map moving pins does not need a navigation. Each write keeps the history entry's
 *   own state, which the router stores there.
 * - A `lastSynced` string guards against writing what the URL already says, and the
 *   query is debounced so typing does not write per keystroke.
 *
 * SPECS §4 also lists `&theme=`. It is deliberately left out (decided 2026-09-16): the
 * theme is the visitor's own setting, persisted site-wide, and a link that carried it
 * would override that choice for a basemap colour nobody asked to share.
 */

export const QUERY_DEBOUNCE_MS = 300;

const MODES: readonly MapMode[] = ["settlements", "records", "photographs"];
const STATUSES: readonly StatusFilter[] = [
  "all",
  "documented",
  "partial",
  "name",
];
const SELECTION_PREFIX: Record<MapMode, string> = {
  settlements: "s:",
  records: "r:",
  photographs: "p:",
};

const isMode = (value: string | null): value is MapMode =>
  MODES.includes(value as MapMode);
const isStatus = (value: string | null): value is StatusFilter =>
  STATUSES.includes(value as StatusFilter);

/** Unknown values fall back to the defaults rather than failing the page. */
export function parseMapParams(search: string): MapQueryState {
  const params = new URLSearchParams(search);
  const rawMode = params.get("mode");
  const rawStatus = params.get("status");
  const sel = params.get("sel");

  const mode = isMode(rawMode) ? rawMode : "settlements";
  // A key from another mode could never be found, so it is not a selection.
  const selectedKey =
    sel && sel.startsWith(SELECTION_PREFIX[mode]) && sel.length > 2
      ? sel
      : null;

  return {
    mode,
    status: isStatus(rawStatus) ? rawStatus : "all",
    query: params.get("q") ?? "",
    selectedKey,
  };
}

/** Defaults are left out, so the plain map has the plain URL `/map`. */
export function serializeMapState(state: MapQueryState): string {
  const params = new URLSearchParams();
  if (state.mode !== "settlements") params.set("mode", state.mode);
  if (state.status !== "all") params.set("status", state.status);
  const query = state.query.trim();
  if (query) params.set("q", query);
  if (state.selectedKey) params.set("sel", state.selectedKey);
  return params.toString();
}

function currentState(): MapQueryState {
  const { mode, status, query, selectedKey } = useMapStore.getState();
  return { mode, status, query, selectedKey };
}

/**
 * Keeps the URL and the store in step while the map is shown.
 *
 * @returns A ref holding the deep link's selection until `useApplyPendingSelection`
 *   can act on it — the pin it names does not exist until the data has loaded.
 */
export function useMapUrlSync(): RefObject<string | null> {
  const pendingSelectionRef = useRef<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    const parsed = parseMapParams(window.location.search);

    useMapStore.getState().hydrate(parsed);
    pendingSelectionRef.current = parsed.selectedKey;

    let lastSynced = serializeMapState(currentState());
    let lastQuery = useMapStore.getState().query;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const write = () => {
      timer = null;
      // Never write into a route the reader has already left.
      if (window.location.pathname !== path) return;

      const next = serializeMapState(currentState());
      if (next === lastSynced) return;

      window.history.replaceState(
        window.history.state,
        "",
        next ? `${path}?${next}` : path
      );
      lastSynced = next;
    };

    const onChange = () => {
      const { query: nextQuery } = useMapStore.getState();
      if (nextQuery !== lastQuery) {
        lastQuery = nextQuery;
        if (timer) clearTimeout(timer);
        timer = setTimeout(write, QUERY_DEBOUNCE_MS);
        return;
      }
      if (timer) return; // the pending write will carry this change too
      write();
    };

    const unsubscribe = useMapStore.subscribe(onChange);

    return () => {
      unsubscribe();
      // Dropped, not flushed: by now the URL may belong to another route.
      if (timer) clearTimeout(timer);
    };
  }, []);

  return pendingSelectionRef;
}

interface PendingSelectionOptions {
  /** The map has loaded and the items are the loaded ones. */
  ready: boolean;
  items: MapItem[];
  onFound: (item: MapItem) => void;
  onMissing: () => void;
}

/**
 * Acts once on a deep link's selection when there is something to act on: flies to
 * the pin, or drops a selection the archive does not hold so no card waits for it.
 */
export function useApplyPendingSelection(
  pendingRef: RefObject<string | null>,
  { ready, items, onFound, onMissing }: PendingSelectionOptions
) {
  useEffect(() => {
    const key = pendingRef.current;
    if (!ready || key === null) return;
    pendingRef.current = null;

    const item = items.find((candidate) => candidate.key === key);
    if (item) onFound(item);
    else onMissing();
  }, [pendingRef, ready, items, onFound, onMissing]);
}
