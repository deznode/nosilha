"use client";

import { useRef, useCallback, useEffect } from "react";
import type { MapRef } from "react-map-gl/mapbox";
import { AnimatePresence } from "framer-motion";
import { useMapStore, useSelectedLocation } from "@/stores/mapStore";
import { calculateBearing, MAP_CONFIG } from "../data/constants";
import type { Location, ViewMode } from "../data/types";
import { MapHeader } from "./map-header";
import { MapSidebar } from "./map-sidebar";
import { MapCanvas } from "./map-canvas";
import { MapControls } from "./map-controls";
import { LocationBottomSheet } from "./location-bottom-sheet";
import { LocationDetailCard } from "./location-detail-card";

export default function BravaMap() {
  const mapRef = useRef<MapRef>(null);
  const pulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedLocation = useSelectedLocation();

  useEffect(() => {
    // Prevent iOS Safari body bounce scrolling behind the full-screen map
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // On mobile, start with sidebar closed so users see the map first
    const isDesktopLayout = window.matchMedia(
      "(min-width: 768px) and (min-height: 500px)"
    ).matches;
    if (!isDesktopLayout) {
      useMapStore.getState().setShowSidebar(false);
    }

    useMapStore.getState().fetchLocations();

    return () => {
      document.body.style.overflow = prevOverflow;
      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current);
      }
    };
  }, []);

  // --- Cross-cutting callbacks (require mapRef) ---

  const handleFlyTo = useCallback((loc: Location) => {
    const state = useMapStore.getState();
    state.setIsOrbiting(false);
    state.setSelectedLocation(loc);

    if (pulseTimeoutRef.current) {
      clearTimeout(pulseTimeoutRef.current);
    }
    state.setIsPulsing(false);

    if (mapRef.current) {
      const isDesktop = window.matchMedia(
        "(min-width: 768px) and (min-height: 500px)"
      ).matches;
      const offset: [number, number] =
        isDesktop && state.showSidebar ? [150, 0] : [0, 0];

      const pitch =
        state.viewMode === "satellite" && state.is3D
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
        useMapStore.getState().setIsPulsing(true);
        pulseTimeoutRef.current = setTimeout(() => {
          useMapStore.getState().setIsPulsing(false);
        }, 3000);
      }, MAP_CONFIG.ANIMATION_DURATION);
    }
  }, []);

  const handleRandomFlyTo = useCallback(() => {
    const { locations, selectedLocation } = useMapStore.getState();
    const available = locations.filter((l) => l.id !== selectedLocation?.id);
    const random = available[Math.floor(Math.random() * available.length)];
    if (random) handleFlyTo(random);
  }, [handleFlyTo]);

  const handleReset = useCallback(() => {
    useMapStore.getState().clearSelection();
    mapRef.current?.flyTo({
      center: [MAP_CONFIG.DEFAULT_CENTER.lng, MAP_CONFIG.DEFAULT_CENTER.lat],
      zoom: MAP_CONFIG.DEFAULT_ZOOM,
      pitch: MAP_CONFIG.PITCH_2D,
      bearing: MAP_CONFIG.DEFAULT_BEARING,
      duration: MAP_CONFIG.RESET_DURATION,
    });
  }, []);

  const handle3DToggle = useCallback(() => {
    const state = useMapStore.getState();
    const newIs3D = !state.is3D;
    state.setIs3D(newIs3D);
    mapRef.current?.easeTo({
      pitch: newIs3D ? MAP_CONFIG.PITCH_3D : MAP_CONFIG.PITCH_2D,
      duration: MAP_CONFIG.EASE_DURATION,
    });
  }, []);

  const handleViewModeToggle = useCallback((mode: ViewMode) => {
    const state = useMapStore.getState();
    if (mode === "illustration" && state.isOrbiting) {
      state.setIsOrbiting(false);
    }
    state.setViewMode(mode);

    if (mode === "illustration" && mapRef.current) {
      mapRef.current.easeTo({
        pitch: MAP_CONFIG.PITCH_2D,
        duration: MAP_CONFIG.EASE_DURATION,
      });
    }
  }, []);

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
        {selectedLocation && <LocationBottomSheet key={selectedLocation.id} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedLocation && <LocationDetailCard />}
      </AnimatePresence>
    </div>
  );
}
