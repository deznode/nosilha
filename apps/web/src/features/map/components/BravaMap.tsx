"use client";

import { useRef, useCallback, useEffect } from "react";
import type { MapRef } from "react-map-gl/mapbox";
import { AnimatePresence } from "framer-motion";
import { useMapStore, useSelectedLocation } from "@/stores/mapStore";
import { calculateBearing, MAP_CONFIG } from "../data/constants";
import type { Location, ViewMode } from "../data/types";
import { MapHeader } from "./MapHeader";
import { MapSidebar } from "./MapSidebar";
import { MapCanvas } from "./MapCanvas";
import { MapControls } from "./MapControls";
import { LocationBottomSheet } from "./LocationBottomSheet";
import { LocationDetailCard } from "./LocationDetailCard";

export default function BravaMap() {
  const mapRef = useRef<MapRef>(null);
  const pulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedLocation = useSelectedLocation();
  const store = useMapStore;

  // Fetch locations on mount
  useEffect(() => {
    store.getState().fetchLocations();
  }, [store]);

  // --- Cross-cutting callbacks (require mapRef) ---

  const handleFlyTo = useCallback(
    (loc: Location) => {
      const { showSidebar, is3D, viewMode } = store.getState();
      store.getState().setIsOrbiting(false);
      store.getState().setSelectedLocation(loc);

      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current);
      }
      store.getState().setIsPulsing(false);

      if (mapRef.current) {
        const isDesktop = window.innerWidth > 768;
        const offset: [number, number] =
          isDesktop && showSidebar ? [150, 0] : [0, 0];

        const pitch =
          viewMode === "satellite" && is3D
            ? MAP_CONFIG.PITCH_3D
            : MAP_CONFIG.PITCH_2D;

        const currentCenter = mapRef.current.getCenter();
        const bearing = calculateBearing(
          { lng: currentCenter.lng, lat: currentCenter.lat },
          loc.coordinates
        );

        mapRef.current.flyTo({
          center: [loc.coordinates.lng, loc.coordinates.lat],
          zoom: MAP_CONFIG.LOCATION_ZOOM,
          pitch,
          bearing,
          padding: { left: offset[0], right: 0, top: 0, bottom: 0 },
          duration: MAP_CONFIG.ANIMATION_DURATION,
          essential: true,
        });

        pulseTimeoutRef.current = setTimeout(() => {
          store.getState().setIsPulsing(true);
          pulseTimeoutRef.current = setTimeout(() => {
            store.getState().setIsPulsing(false);
          }, 3000);
        }, MAP_CONFIG.ANIMATION_DURATION);
      }
    },
    [store]
  );

  const handleRandomFlyTo = useCallback(() => {
    const { locations, selectedLocation } = store.getState();
    const available = locations.filter((l) => l.id !== selectedLocation?.id);
    const random = available[Math.floor(Math.random() * available.length)];
    if (random) handleFlyTo(random);
  }, [handleFlyTo, store]);

  const handleReset = useCallback(() => {
    store.getState().setSelectedLocation(null);
    mapRef.current?.flyTo({
      center: [MAP_CONFIG.DEFAULT_CENTER.lng, MAP_CONFIG.DEFAULT_CENTER.lat],
      zoom: MAP_CONFIG.DEFAULT_ZOOM,
      pitch: MAP_CONFIG.PITCH_2D,
      bearing: MAP_CONFIG.DEFAULT_BEARING,
      duration: MAP_CONFIG.RESET_DURATION,
    });
  }, [store]);

  const handle3DToggle = useCallback(() => {
    const newIs3D = !store.getState().is3D;
    store.getState().setIs3D(newIs3D);
    mapRef.current?.easeTo({
      pitch: newIs3D ? MAP_CONFIG.PITCH_3D : MAP_CONFIG.PITCH_2D,
      duration: MAP_CONFIG.EASE_DURATION,
    });
  }, [store]);

  const handleViewModeToggle = useCallback(
    (mode: ViewMode) => {
      const { isOrbiting } = store.getState();
      if (mode === "illustration" && isOrbiting) {
        store.getState().setIsOrbiting(false);
      }
      store.getState().setViewMode(mode);

      if (mode === "illustration" && mapRef.current) {
        mapRef.current.easeTo({
          pitch: MAP_CONFIG.PITCH_2D,
          duration: MAP_CONFIG.EASE_DURATION,
        });
      }
    },
    [store]
  );

  return (
    <div className="bg-background-secondary text-text-primary relative h-screen w-full overflow-hidden font-sans">
      <MapHeader />
      <MapSidebar onFlyTo={handleFlyTo} />
      <MapCanvas mapRef={mapRef} onFlyTo={handleFlyTo} />
      <MapControls
        onRandomFlyTo={handleRandomFlyTo}
        onReset={handleReset}
        on3DToggle={handle3DToggle}
        onViewModeToggle={handleViewModeToggle}
      />
      <AnimatePresence>
        {selectedLocation && <LocationBottomSheet />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedLocation && <LocationDetailCard />}
      </AnimatePresence>
    </div>
  );
}
