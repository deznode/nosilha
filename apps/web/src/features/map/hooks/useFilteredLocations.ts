import { useMemo } from "react";
import {
  useMapMode,
  useLocations,
  useSettlements,
  useActiveCategory,
  useMapSearchQuery,
  useLayerVisibility,
} from "@/stores/mapStore";
import { searchLocations } from "../data/locations-adapter";

/**
 * Custom hook that encapsulates location filtering logic.
 * Reads map store selectors and applies category, search, and layer visibility filters.
 * Settlements mode lists settlements; category filtering applies only to place records.
 * Shared by MapSidebar and MapCanvas to avoid duplicating filter logic.
 */
export function useFilteredLocations() {
  const mapMode = useMapMode();
  const locations = useLocations();
  const settlements = useSettlements();
  const activeCategory = useActiveCategory();
  const searchQuery = useMapSearchQuery();
  const layerVisibility = useLayerVisibility();

  return useMemo(() => {
    if (layerVisibility === "none") {
      return [];
    }

    const source = mapMode === "settlements" ? settlements : locations;

    let results = searchQuery.trim()
      ? searchLocations(searchQuery, source)
      : source;

    if (mapMode === "places" && activeCategory !== "All") {
      results = results.filter((l) => l.category === activeCategory);
    }

    return results;
  }, [
    mapMode,
    locations,
    settlements,
    activeCategory,
    searchQuery,
    layerVisibility,
  ]);
}
