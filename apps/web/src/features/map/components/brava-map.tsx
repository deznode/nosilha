"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import { clsx } from "clsx";
import { useNarrow } from "@/hooks/use-narrow";
import { useMapStore, useModeItems } from "@/stores/mapStore";
import { EXPLORER_VIEW } from "../data/constants";
import { statusCounts } from "../data/locations-adapter";
import { legendRows, overlayOffsets, photographsNote } from "../data/map-copy";
import type { MapItem } from "../data/types";
import {
  useApplyPendingSelection,
  useMapUrlSync,
} from "../hooks/use-map-url-sync";
import {
  useFilteredLocations,
  useSelectedItem,
} from "../hooks/useFilteredLocations";
import { LocationBottomSheet } from "./location-bottom-sheet";
import { LocationDetailCard } from "./location-detail-card";
import { MapCanvas } from "./map-canvas";
import { MapControls, type MapControl } from "./map-controls";
import { MapLegend, PhotographsNote } from "./map-legend";
import { MapSidebar } from "./map-sidebar";

/** Share of the canvas height kept clear below an eased-to pin on a phone. */
const NARROW_EASE_BOTTOM_SHARE = 0.6;

/**
 * The map explorer at `/map`: sidebar and canvas side by side, or a full-bleed canvas
 * under a bottom sheet below 860px. Spec 034 FR-011, FR-012.
 *
 * The narrow layout restructures rather than reflows, so it is chosen by `useNarrow`
 * in render, not by a CSS breakpoint.
 */
export default function BravaMap() {
  const mapRef = useRef<MapRef>(null);
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const narrow = useNarrow();
  const mode = useMapStore((s) => s.mode);
  const satellite = useMapStore((s) => s.satellite);
  const is3D = useMapStore((s) => s.is3D);
  const sheetOpen = useMapStore((s) => s.sheetOpen);
  const isLoading = useMapStore((s) => s.isLoading);
  const fetchError = useMapStore((s) => s.fetchError);
  const photos = useMapStore((s) => s.photos);
  const unlocatedCount = useMapStore((s) => s.unlocatedCount);
  const modeItems = useModeItems();
  const visible = useFilteredLocations();
  const selected = useSelectedItem();

  const pendingSelectionRef = useMapUrlSync();

  useEffect(() => {
    const store = useMapStore.getState();
    // Activity keeps this component's state across a hide; an open sheet or fan from
    // the last visit should not greet the next one.
    store.resetTransient();
    store.fetchData();

    // Prevent iOS Safari body bounce scrolling behind the full-screen map
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
      // The map instance does not survive a hide; wait for the next one to load.
      setMapReady(false);
    };
  }, []);

  // --- Camera ---

  // Read inside callbacks without re-creating them on every breakpoint change.
  const narrowRef = useRef(narrow);
  useEffect(() => {
    narrowRef.current = narrow;
  }, [narrow]);

  const easeToItem = useCallback((item: MapItem) => {
    const map = mapRef.current;
    if (!map) return;
    // On a phone the peeking sheet and the selection card cover the lower half of the
    // canvas, so the pin is eased into the part that stays visible.
    const bottom = narrowRef.current
      ? Math.round(map.getContainer().clientHeight * NARROW_EASE_BOTTOM_SHARE)
      : 0;
    map.easeTo({
      center: [item.coordinates.lng, item.coordinates.lat],
      zoom: EXPLORER_VIEW.SELECT_ZOOM,
      duration: EXPLORER_VIEW.SELECT_DURATION,
      padding: { top: 0, right: 0, bottom, left: 0 },
    });
  }, []);

  /** A pin click selects in place, as prototyped. */
  const selectPin = useCallback((item: MapItem) => {
    useMapStore.getState().select(item.key);
  }, []);

  /**
   * A list row selects and brings the pin into view. On a phone the expanded sheet
   * would hide both the pin and its card, so it drops back to peeking.
   */
  const selectRow = useCallback(
    (item: MapItem) => {
      const store = useMapStore.getState();
      store.select(item.key);
      if (narrowRef.current && store.sheetOpen) store.toggleSheet();
      easeToItem(item);
    },
    [easeToItem]
  );

  const handleMapLoad = useCallback(() => setMapReady(true), []);

  // Pitch follows the 3D toggle, once there is a map to tilt.
  const is3DRef = useRef(is3D);
  useEffect(() => {
    if (!mapReady || is3DRef.current === is3D) return;
    is3DRef.current = is3D;
    mapRef.current?.easeTo({
      pitch: is3D ? EXPLORER_VIEW.PITCH_3D : 0,
      duration: EXPLORER_VIEW.PITCH_DURATION,
    });
  }, [is3D, mapReady]);

  // A deep link's selection waits for the pins and the map, then flies once.
  const dropSelection = useCallback(
    () => useMapStore.getState().clearSelection(),
    []
  );
  useApplyPendingSelection(pendingSelectionRef, {
    ready: mapReady && !isLoading && !fetchError,
    items: visible,
    onFound: easeToItem,
    onMissing: dropSelection,
  });

  const controls: MapControl[] = useMemo(
    () => [
      {
        label: "◐",
        title: "Satellite",
        pressed: satellite,
        onClick: () => useMapStore.getState().toggleSatellite(),
      },
      {
        label: "3D",
        title: "3D terrain",
        pressed: is3D,
        onClick: () => useMapStore.getState().toggle3D(),
      },
      {
        label: "⟲",
        title: "Reset view",
        onClick: () => {
          useMapStore.getState().clearSelection();
          mapRef.current?.easeTo({
            center: [EXPLORER_VIEW.CENTER.lng, EXPLORER_VIEW.CENTER.lat],
            zoom: EXPLORER_VIEW.ZOOM,
            pitch: 0,
            bearing: 0,
            duration: EXPLORER_VIEW.RESET_DURATION,
          });
          if (useMapStore.getState().is3D) useMapStore.getState().toggle3D();
          is3DRef.current = false;
        },
      },
      {
        label: "⌖",
        title: "My location",
        onClick: () => {
          if (!("geolocation" in navigator)) return;
          navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
              const point = { lat: coords.latitude, lng: coords.longitude };
              setUserLocation(point);
              mapRef.current?.easeTo({
                center: [point.lng, point.lat],
                zoom: EXPLORER_VIEW.LOCATE_ZOOM,
                duration: EXPLORER_VIEW.SELECT_DURATION,
              });
            },
            (error) => console.warn("Location unavailable:", error.message)
          );
        },
      },
    ],
    [satellite, is3D]
  );

  const counts = useMemo(() => statusCounts(modeItems), [modeItems]);
  const ready = !isLoading && !fetchError;
  const offsets = overlayOffsets(narrow, sheetOpen);
  const note =
    ready && mode === "photographs" ? photographsNote(unlocatedCount) : null;

  const canvas = (
    <div
      className={clsx(
        narrow
          ? "absolute inset-0"
          : "relative min-h-[420px] min-w-0 flex-[1_1_420px]"
      )}
      style={{ background: "var(--muted)" }}
    >
      <MapCanvas
        mapRef={mapRef}
        onSelect={selectPin}
        onLoad={handleMapLoad}
        userLocation={userLocation}
      />
      <MapControls controls={controls} />
      {ready && (
        <MapLegend
          rows={legendRows(mode, counts, photos, unlocatedCount)}
          bottom={offsets.legend}
        />
      )}
      {note && <PhotographsNote note={note} bottom={offsets.note} />}
      {selected && (
        <LocationDetailCard
          key={selected.key}
          item={selected}
          bottom={offsets.card}
          onClose={() => useMapStore.getState().clearSelection()}
        />
      )}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {selected ? `Selected ${selected.name}, ${selected.eyebrow}.` : ""}
      </div>
    </div>
  );

  // One tree for both layouts, with the canvas in the same slot, so crossing the
  // breakpoint restyles the map rather than rebuilding it.
  return (
    <div
      data-layout={narrow ? "narrow" : "wide"}
      className={clsx(
        "h-full w-full overflow-hidden font-sans",
        narrow ? "relative" : "flex flex-wrap"
      )}
      style={{ color: "var(--foreground)" }}
    >
      {narrow ? null : (
        <aside
          aria-label="Filters and list"
          className="flex h-full max-w-full min-w-[280px] flex-[0_0_348px] flex-col overflow-hidden border-r"
          style={{
            background: "var(--background)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <MapSidebar onSelect={selectRow} />
        </aside>
      )}
      {canvas}
      {narrow ? (
        <LocationBottomSheet
          open={sheetOpen}
          onToggle={() => useMapStore.getState().toggleSheet()}
        >
          {(grabber) => <MapSidebar onSelect={selectRow} header={grabber} />}
        </LocationBottomSheet>
      ) : null}
    </div>
  );
}
