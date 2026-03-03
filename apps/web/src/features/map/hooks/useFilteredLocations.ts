import { useMemo } from "react";
import {
  useLocations,
  useActiveCategory,
  useMapSearchQuery,
  useLayerVisibility,
} from "@/stores/mapStore";
import { searchLocations } from "../data/locations-adapter";

/**
 * Custom hook that encapsulates location filtering logic.
 * Reads map store selectors and applies category, search, and layer visibility filters.
 * Shared by MapSidebar and MapCanvas to avoid duplicating filter logic.
 */
export function useFilteredLocations() {
  const locations = useLocations();
  const activeCategory = useActiveCategory();
  const searchQuery = useMapSearchQuery();
  const layerVisibility = useLayerVisibility();

  return useMemo(() => {
    if (layerVisibility === "zones" || layerVisibility === "none") {
      return [];
    }

    let results = searchQuery.trim()
      ? searchLocations(searchQuery, locations)
      : locations;

    if (activeCategory !== "All") {
      results = results.filter((l) => l.category === activeCategory);
    }

    return results;
  }, [locations, activeCategory, searchQuery, layerVisibility]);
}
