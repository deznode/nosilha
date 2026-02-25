import { describe, it, expect, beforeEach, vi } from "vitest";
import { useMapStore } from "@/stores/mapStore";
import type { Location } from "@/features/map/data/types";
import { Mountain } from "lucide-react";

// Mock API
vi.mock("@/lib/api", () => ({
  getEntriesForMap: vi.fn(),
}));

vi.mock("@/features/map/data/locations-adapter", () => ({
  transformEntries: vi.fn((items) => items),
}));

const initialState = {
  locations: [],
  isLoadingLocations: true,
  activeCategory: "All" as const,
  searchQuery: "",
  layerVisibility: "all" as const,
  selectedLocation: null,
  isPulsing: false,
  is3D: true,
  viewMode: "satellite" as const,
  isOrbiting: false,
  showSidebar: true,
};

const mockLocation: Location = {
  id: "1",
  name: "Monte Fontainhas",
  namePortuguese: "Monte Fontainhas",
  category: "Nature",
  description: "Highest peak on Brava Island",
  coordinates: { lat: 14.851, lng: -24.708 },
  elevation: 976,
  rating: 4.8,
  reviews: 24,
  image: "/images/fontainhas.jpg",
  tags: ["hiking"],
  icon: Mountain,
  color: "#3e7d5a",
};

describe("mapStore", () => {
  beforeEach(() => {
    useMapStore.setState(initialState);
  });

  describe("Initial State", () => {
    it("should have correct initial values", () => {
      const state = useMapStore.getState();

      expect(state.locations).toEqual([]);
      expect(state.isLoadingLocations).toBe(true);
      expect(state.activeCategory).toBe("All");
      expect(state.searchQuery).toBe("");
      expect(state.layerVisibility).toBe("all");
      expect(state.selectedLocation).toBeNull();
      expect(state.isPulsing).toBe(false);
      expect(state.is3D).toBe(true);
      expect(state.viewMode).toBe("satellite");
      expect(state.isOrbiting).toBe(false);
      expect(state.showSidebar).toBe(true);
    });
  });

  describe("Setter Actions", () => {
    it("setLocations updates locations", () => {
      useMapStore.getState().setLocations([mockLocation]);
      expect(useMapStore.getState().locations).toHaveLength(1);
      expect(useMapStore.getState().locations[0].id).toBe("1");
    });

    it("setIsLoadingLocations updates loading state", () => {
      useMapStore.getState().setIsLoadingLocations(false);
      expect(useMapStore.getState().isLoadingLocations).toBe(false);
    });

    it("setActiveCategory updates active category", () => {
      useMapStore.getState().setActiveCategory("Beach");
      expect(useMapStore.getState().activeCategory).toBe("Beach");
    });

    it("setSearchQuery updates search query", () => {
      useMapStore.getState().setSearchQuery("church");
      expect(useMapStore.getState().searchQuery).toBe("church");
    });

    it("setLayerVisibility updates visibility", () => {
      useMapStore.getState().setLayerVisibility("zones");
      expect(useMapStore.getState().layerVisibility).toBe("zones");
    });

    it("setSelectedLocation updates selected location", () => {
      useMapStore.getState().setSelectedLocation(mockLocation);
      expect(useMapStore.getState().selectedLocation?.id).toBe("1");
    });

    it("setIsPulsing updates pulsing state", () => {
      useMapStore.getState().setIsPulsing(true);
      expect(useMapStore.getState().isPulsing).toBe(true);
    });

    it("setIs3D updates 3D state", () => {
      useMapStore.getState().setIs3D(false);
      expect(useMapStore.getState().is3D).toBe(false);
    });

    it("setViewMode updates view mode", () => {
      useMapStore.getState().setViewMode("illustration");
      expect(useMapStore.getState().viewMode).toBe("illustration");
    });

    it("setIsOrbiting updates orbiting state", () => {
      useMapStore.getState().setIsOrbiting(true);
      expect(useMapStore.getState().isOrbiting).toBe(true);
    });

    it("setShowSidebar updates sidebar state", () => {
      useMapStore.getState().setShowSidebar(false);
      expect(useMapStore.getState().showSidebar).toBe(false);
    });
  });

  describe("Convenience Actions", () => {
    it("toggleSidebar flips showSidebar", () => {
      expect(useMapStore.getState().showSidebar).toBe(true);

      useMapStore.getState().toggleSidebar();
      expect(useMapStore.getState().showSidebar).toBe(false);

      useMapStore.getState().toggleSidebar();
      expect(useMapStore.getState().showSidebar).toBe(true);
    });

    it("clearSelection resets selectedLocation to null", () => {
      useMapStore.setState({ selectedLocation: mockLocation });
      expect(useMapStore.getState().selectedLocation).not.toBeNull();

      useMapStore.getState().clearSelection();
      expect(useMapStore.getState().selectedLocation).toBeNull();
    });

    it("toggleOrbit flips isOrbiting", () => {
      expect(useMapStore.getState().isOrbiting).toBe(false);

      useMapStore.getState().toggleOrbit();
      expect(useMapStore.getState().isOrbiting).toBe(true);

      useMapStore.getState().toggleOrbit();
      expect(useMapStore.getState().isOrbiting).toBe(false);
    });
  });

  describe("fetchLocations", () => {
    it("calls API and sets locations on success", async () => {
      const { getEntriesForMap } = await import("@/lib/api");
      const { transformEntries } = await import(
        "@/features/map/data/locations-adapter"
      );

      vi.mocked(getEntriesForMap).mockResolvedValueOnce({
        items: [mockLocation as never],
        pagination: null,
      });
      vi.mocked(transformEntries).mockReturnValueOnce([mockLocation]);

      await useMapStore.getState().fetchLocations();

      expect(getEntriesForMap).toHaveBeenCalledWith("all");
      expect(useMapStore.getState().locations).toEqual([mockLocation]);
      expect(useMapStore.getState().isLoadingLocations).toBe(false);
    });

    it("sets isLoadingLocations false on error", async () => {
      const { getEntriesForMap } = await import("@/lib/api");
      vi.mocked(getEntriesForMap).mockRejectedValueOnce(
        new Error("Network error")
      );

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await useMapStore.getState().fetchLocations();

      expect(useMapStore.getState().isLoadingLocations).toBe(false);
      expect(useMapStore.getState().locations).toEqual([]);
      consoleSpy.mockRestore();
    });
  });
});
