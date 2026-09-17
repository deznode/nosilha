import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { MapItem, MapMode, StatusFilter } from "@/features/map/data/types";
import {
  getEntriesForMap,
  getGalleryFacets,
  getGalleryMedia,
  getTownStatusSummary,
} from "@/lib/api";
import {
  photoItems,
  recordItems,
  settlementItems,
} from "@/features/map/data/locations-adapter";

/**
 * The map explorer's state. Spec 034 FR-011, FR-012.
 *
 * The store is the source of truth; the URL mirrors `mode`, `status`, `query` and
 * `selectedKey` one way (`useMapUrlSync`). Not persisted — a returning visitor's
 * state comes from the link they followed, not from their last visit.
 */

/** The public gallery's page cap. The archive's located photographs fit in one. */
const PHOTO_PAGE_SIZE = 100;

export interface MapQueryState {
  mode: MapMode;
  status: StatusFilter;
  query: string;
  /** `s:` / `r:` / `p:` key of the selected pin. */
  selectedKey: string | null;
}

interface MapState extends MapQueryState {
  /** The coincident group whose records are fanned out. */
  expandedGroupKey: string | null;
  satellite: boolean;
  is3D: boolean;
  /** Narrow layout only: whether the bottom sheet is expanded. */
  sheetOpen: boolean;

  settlements: MapItem[];
  records: MapItem[];
  photos: MapItem[];
  /** Archive photographs with no coordinates, which the map cannot show. */
  unlocatedCount: number;
  isLoading: boolean;
  fetchError: string | null;

  /** The selection belongs to the mode it was made in, so switching clears it. */
  setMode: (mode: MapMode) => void;
  setStatus: (status: StatusFilter) => void;
  setQuery: (query: string) => void;
  select: (key: string) => void;
  clearSelection: () => void;
  setExpandedGroup: (key: string | null) => void;
  toggleSatellite: () => void;
  toggle3D: () => void;
  toggleSheet: () => void;
  /** Applies a deep link in one step; `setMode` would clear its selection. */
  hydrate: (state: MapQueryState) => void;
  /** Closes what an Activity restore should not bring back open. */
  resetTransient: () => void;
  fetchData: () => Promise<void>;
}

export const initialMapState = {
  mode: "settlements" as MapMode,
  status: "all" as StatusFilter,
  query: "",
  selectedKey: null,
  expandedGroupKey: null,
  satellite: false,
  // Terrain stays available but opt-in. Spec 033 FR-012.
  is3D: false,
  sheetOpen: false,
  settlements: [],
  records: [],
  photos: [],
  unlocatedCount: 0,
  isLoading: true,
  fetchError: null,
} satisfies Partial<MapState>;

/** Identifies the newest `fetchData` call. */
let latestRequest = 0;

export const useMapStore = create<MapState>()(
  devtools(
    (set) => ({
      ...initialMapState,

      setMode: (mode) =>
        set({ mode, selectedKey: null, expandedGroupKey: null }),
      setStatus: (status) => set({ status, selectedKey: null }),
      setQuery: (query) => set({ query }),
      select: (key) => set({ selectedKey: key }),
      clearSelection: () => set({ selectedKey: null, expandedGroupKey: null }),
      setExpandedGroup: (key) => set({ expandedGroupKey: key }),
      toggleSatellite: () => set((s) => ({ satellite: !s.satellite })),
      toggle3D: () => set((s) => ({ is3D: !s.is3D })),
      toggleSheet: () => set((s) => ({ sheetOpen: !s.sheetOpen })),
      hydrate: ({ mode, status, query, selectedKey }) =>
        set({ mode, status, query, selectedKey, expandedGroupKey: null }),
      resetTransient: () => set({ sheetOpen: false, expandedGroupKey: null }),

      fetchData: async () => {
        // Under Activity every return to `/map` loads again. Say so, so nothing that
        // waits for data acts on the previous visit's items, and let only the newest
        // load write: a slow earlier answer must not replace a later one.
        const request = ++latestRequest;
        set({ isLoading: true, fetchError: null });
        try {
          // All or nothing: a mode that failed to load would otherwise render as an
          // empty archive, and its footer would state that emptiness as fact.
          const [entries, towns, media, facets] = await Promise.all([
            getEntriesForMap("all"),
            getTownStatusSummary(),
            getGalleryMedia({ hasPlace: true, size: PHOTO_PAGE_SIZE }),
            getGalleryFacets(),
          ]);

          if (entries.pagination && entries.pagination.totalPages > 1) {
            console.warn(
              `[MapStore] Only fetched page 1 of ${entries.pagination.totalPages} — ${entries.pagination.totalElements} entries exist.`
            );
          }
          if (media.totalPages > 1) {
            console.warn(
              `[MapStore] Only fetched page 1 of ${media.totalPages} — ${media.totalItems} located photographs exist.`
            );
          }

          if (request !== latestRequest) return;

          const townSlugs = Object.fromEntries(
            towns
              .filter((town) => town.id)
              .map((town) => [town.id as string, town.slug])
          );

          set({
            settlements: settlementItems(towns),
            records: recordItems(entries.items, townSlugs),
            photos: photoItems(media.items, towns),
            unlocatedCount: facets.withoutPlace,
            isLoading: false,
            fetchError: null,
          });
        } catch (err) {
          if (request !== latestRequest) return;
          console.error("Failed to fetch map data:", err);
          set({
            isLoading: false,
            fetchError:
              "The map could not load the archive. Try refreshing the page.",
          });
        }
      },
    }),
    { name: "MapStore" }
  )
);

/** The unfiltered items of the active mode. */
export function selectModeItems(state: MapState): MapItem[] {
  switch (state.mode) {
    case "settlements":
      return state.settlements;
    case "records":
      return state.records;
    case "photographs":
      return state.photos;
  }
}

export const useMapMode = () => useMapStore((state) => state.mode);
export const useMapStatus = () => useMapStore((state) => state.status);
export const useMapQuery = () => useMapStore((state) => state.query);
export const useSelectedKey = () => useMapStore((state) => state.selectedKey);
export const useModeItems = () => useMapStore(selectModeItems);
