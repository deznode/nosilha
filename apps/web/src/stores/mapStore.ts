import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  Location,
  ViewMode,
  LayerVisibility,
} from "@/features/map/data/types";
import type { CategoryType } from "@/features/map/data/categories";
import { getEntriesForMap } from "@/lib/api";
import { transformEntries } from "@/features/map/data/locations-adapter";

/**
 * Zustand store for shared map state.
 * Owns state that flows between two or more extracted BravaMap components.
 * Does not persist — map state is ephemeral.
 */

interface MapState {
  // State
  locations: Location[];
  isLoadingLocations: boolean;
  locationsFetchError: string | null;
  activeCategory: CategoryType;
  searchQuery: string;
  layerVisibility: LayerVisibility;
  selectedLocation: Location | null;
  isPulsing: boolean;
  is3D: boolean;
  viewMode: ViewMode;
  isOrbiting: boolean;
  showSidebar: boolean;

  // Actions
  setLocations: (locations: Location[]) => void;
  setIsLoadingLocations: (loading: boolean) => void;
  setActiveCategory: (category: CategoryType) => void;
  setSearchQuery: (query: string) => void;
  setLayerVisibility: (visibility: LayerVisibility) => void;
  setSelectedLocation: (location: Location | null) => void;
  setIsPulsing: (pulsing: boolean) => void;
  setIs3D: (is3D: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  setIsOrbiting: (orbiting: boolean) => void;
  setShowSidebar: (show: boolean) => void;

  // Convenience actions
  toggleSidebar: () => void;
  clearSelection: () => void;
  toggleOrbit: () => void;
  fetchLocations: () => Promise<void>;
}

export const useMapStore = create<MapState>()(
  devtools(
    (set) => ({
      // Initial state
      locations: [],
      isLoadingLocations: true,
      locationsFetchError: null,
      activeCategory: "All",
      searchQuery: "",
      layerVisibility: "all",
      selectedLocation: null,
      isPulsing: false,
      is3D: true,
      viewMode: "satellite",
      isOrbiting: false,
      showSidebar: true,

      // Simple setters
      setLocations: (locations) => set({ locations }),
      setIsLoadingLocations: (loading) => set({ isLoadingLocations: loading }),
      setActiveCategory: (category) => set({ activeCategory: category }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setLayerVisibility: (visibility) => set({ layerVisibility: visibility }),
      setSelectedLocation: (location) => set({ selectedLocation: location }),
      setIsPulsing: (pulsing) => set({ isPulsing: pulsing }),
      setIs3D: (is3D) => set({ is3D }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setIsOrbiting: (orbiting) => set({ isOrbiting: orbiting }),
      setShowSidebar: (show) => set({ showSidebar: show }),

      // Convenience actions
      toggleSidebar: () =>
        set((state) => ({ showSidebar: !state.showSidebar })),
      clearSelection: () => set({ selectedLocation: null }),
      toggleOrbit: () => set((state) => ({ isOrbiting: !state.isOrbiting })),

      fetchLocations: async () => {
        try {
          const result = await getEntriesForMap("all");
          if (result.pagination && result.pagination.totalPages > 1) {
            console.warn(
              `[MapStore] Only fetched page 1 of ${result.pagination.totalPages} — ${result.pagination.totalElements} total entries exist. Increase page size.`
            );
          }
          set({
            locations: transformEntries(result.items),
            isLoadingLocations: false,
            locationsFetchError: null,
          });
        } catch (err) {
          console.error("Failed to fetch map locations:", err);
          set({
            isLoadingLocations: false,
            locationsFetchError:
              "Failed to load map data. Please try refreshing the page.",
          });
        }
      },
    }),
    { name: "MapStore" }
  )
);

// Selectors for optimized re-renders
export const useLocations = () => useMapStore((state) => state.locations);
export const useIsLoadingLocations = () =>
  useMapStore((state) => state.isLoadingLocations);
export const useLocationsFetchError = () =>
  useMapStore((state) => state.locationsFetchError);
export const useActiveCategory = () =>
  useMapStore((state) => state.activeCategory);
export const useMapSearchQuery = () =>
  useMapStore((state) => state.searchQuery);
export const useLayerVisibility = () =>
  useMapStore((state) => state.layerVisibility);
export const useSelectedLocation = () =>
  useMapStore((state) => state.selectedLocation);
export const useIsPulsing = () => useMapStore((state) => state.isPulsing);
export const useIs3D = () => useMapStore((state) => state.is3D);
export const useViewMode = () => useMapStore((state) => state.viewMode);
export const useIsOrbiting = () => useMapStore((state) => state.isOrbiting);
export const useShowSidebar = () => useMapStore((state) => state.showSidebar);
