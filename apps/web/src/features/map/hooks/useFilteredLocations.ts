import { useMemo } from "react";
import {
  useMapQuery,
  useMapStatus,
  useModeItems,
  useSelectedKey,
} from "@/stores/mapStore";
import { filterItems } from "../data/locations-adapter";
import type { MapItem } from "../data/types";

/**
 * The active mode's items after the status chip and the search box. The list and the
 * pins both read this, so they can never disagree about what is shown.
 */
export function useFilteredLocations(): MapItem[] {
  const items = useModeItems();
  const status = useMapStatus();
  const query = useMapQuery();

  return useMemo(
    () => filterItems(items, status, query),
    [items, status, query]
  );
}

/**
 * The selected item, if it is among the shown ones. A selection the filter hides has
 * no pin to point at, so it has no card either — as prototyped.
 */
export function useSelectedItem(): MapItem | null {
  const visible = useFilteredLocations();
  const selectedKey = useSelectedKey();

  return useMemo(
    () => visible.find((item) => item.key === selectedKey) ?? null,
    [visible, selectedKey]
  );
}
