"use client";

import {
  Component,
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Marker,
  NavigationControl,
  GeolocateControl,
  Source,
  Layer,
  type MapRef,
  type MarkerEvent,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import { BaseMap, useMapClustering } from "../shared";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import {
  useViewMode,
  useSelectedLocation,
  useIsPulsing,
  useIsOrbiting,
  useIs3D,
  useMapStore,
} from "@/stores/mapStore";
import { useFilteredLocations } from "../hooks/useFilteredLocations";
import {
  MAP_CONFIG,
  MAP_STYLES,
  TERRAIN_DEM,
  ILLUSTRATION_BOUNDS,
  ILLUSTRATION_URL,
} from "../data/constants";
import type { Location } from "../data/types";
import { CoincidentFan } from "./coincident-fan";

// ---------------------------------------------------------------------------
// MapRecoveryBoundary — catches Activity-reconnect crashes from react-map-gl
// ---------------------------------------------------------------------------
// When cacheComponents (Activity) restores the map route, react-map-gl's
// Marker/control useEffects fire addTo() on the destroyed map instance.
// setState in useLayoutEffect does NOT trigger a re-render before passive
// effects during Activity reconnect, so we cannot guard against this in React
// lifecycle. Instead, this error boundary catches the crash and forces a
// complete remount via an incremented key, giving the map a fresh start.

interface RecoveryState {
  hasError: boolean;
  retryKey: number;
}

class MapRecoveryBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  RecoveryState
> {
  state: RecoveryState = { hasError: false, retryKey: 0 };
  private recovering = false;

  static getDerivedStateFromError(): Partial<RecoveryState> {
    return { hasError: true };
  }

  componentDidCatch() {
    // Guard against re-entry: during Activity reconnect, multiple Marker/Control
    // effects may throw in the same frame. Only schedule recovery once.
    if (this.recovering) return;
    this.recovering = true;

    // Schedule recovery on the next frame so React can paint the fallback
    // before we trigger the fresh mount.
    requestAnimationFrame(() => {
      this.recovering = false;
      this.setState((prev) => ({
        hasError: false,
        retryKey: prev.retryKey + 1,
      }));
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    // Key change forces React to unmount the old subtree and mount fresh,
    // ensuring all react-map-gl effects run on a live map instance.
    return <div key={this.state.retryKey}>{this.props.children}</div>;
  }
}

// ---------------------------------------------------------------------------

interface MapCanvasProps {
  mapRef: RefObject<MapRef | null>;
  onFlyTo: (location: Location) => void;
}

export function MapCanvas({ mapRef, onFlyTo }: MapCanvasProps) {
  // --- Local state (lifecycle-scoped, not shared) ---
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(MAP_CONFIG.DEFAULT_ZOOM);
  const [bounds, setBounds] = useState<
    [number, number, number, number] | undefined
  >(undefined);
  const [cursor, setCursor] = useState<string>("auto");
  // The coincident group whose records are fanned out, if any.
  const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null);

  // --- Local refs ---
  const orbitAnimationRef = useRef<number>(0);
  const isOrbitMovingRef = useRef<boolean>(false);

  // --- Store selectors ---
  const viewMode = useViewMode();
  const selectedLocation = useSelectedLocation();
  const isPulsing = useIsPulsing();
  const isOrbiting = useIsOrbiting();
  const is3D = useIs3D();
  const setIsOrbiting = useMapStore((s) => s.setIsOrbiting);
  const setSelectedLocation = useMapStore((s) => s.setSelectedLocation);

  // --- Filtered locations for markers ---
  const filteredLocations = useFilteredLocations();

  // --- Reset stale state on Activity restore ---
  // Activity preserves useState across hide/show. This resets lifecycle
  // state so the loading overlay shows while the new map instance loads.
  // Note: this does NOT prevent the Marker/control crash during Activity
  // reconnect — MapRecoveryBoundary handles that via error boundary + remount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setIsMapLoaded(false);
    setMapError(null);
    setExpandedGroupKey(null);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // --- Desktop-only orbit animation ---
  useEffect(() => {
    if (!isOrbiting || !mapRef.current) {
      isOrbitMovingRef.current = false;
      return;
    }

    const map = mapRef.current.getMap();
    isOrbitMovingRef.current = true;
    let lastFrameTime = 0;

    const rotateCamera = (timestamp: number) => {
      if (timestamp - lastFrameTime < 33) {
        orbitAnimationRef.current = requestAnimationFrame(rotateCamera);
        return;
      }

      lastFrameTime = timestamp;
      map.setBearing((map.getBearing() + 0.2) % 360);
      orbitAnimationRef.current = requestAnimationFrame(rotateCamera);
    };

    orbitAnimationRef.current = requestAnimationFrame(rotateCamera);

    return () => {
      isOrbitMovingRef.current = false;
      if (orbitAnimationRef.current) {
        cancelAnimationFrame(orbitAnimationRef.current);
      }
    };
  }, [isOrbiting, mapRef]);

  // --- Stop orbiting on map interaction ---
  const handleStopOrbit = useCallback(
    (e: ViewStateChangeEvent) => {
      // originalEvent is undefined for programmatic moves (flyTo/easeTo)
      const original = (e as unknown as { originalEvent?: Event })
        .originalEvent;
      if (!original) return;
      if (isOrbitMovingRef.current) return;

      setIsOrbiting(false);
    },
    [setIsOrbiting]
  );

  // --- Handle zone clicks ---
  const handleMapClick = useCallback(
    (event: maplibregl.MapLayerMouseEvent) => {
      if (event.defaultPrevented) return;

      // A click on a marker bubbles to the map too. Pins stop it at the marker
      // element, but the coincident fan cannot — that would also stop its own React
      // handlers — so marker clicks are ignored here instead.
      const target = event.originalEvent?.target;
      if (target instanceof Element && target.closest(".maplibregl-marker")) {
        return;
      }

      const feature = event.features?.[0];
      if (feature?.layer?.id === "zone-fills") {
        const geometry = feature.geometry as GeoJSON.Polygon;
        if (geometry.type === "Polygon") {
          setIsOrbiting(false);

          const coordinates = geometry.coordinates[0];
          const b = coordinates.reduce(
            (acc, coord) => acc.extend(coord as [number, number]),
            new maplibregl.LngLatBounds(
              coordinates[0] as [number, number],
              coordinates[0] as [number, number]
            )
          );

          mapRef.current?.fitBounds(b, {
            padding: 100,
            pitch: 40,
            duration: 1500,
          });
        }
      } else {
        setSelectedLocation(null);
        setExpandedGroupKey(null);
      }
    },
    [setIsOrbiting, setSelectedLocation, mapRef]
  );

  // --- Cursor handlers for interactive zones ---
  const onMouseEnterZone = useCallback(() => setCursor("pointer"), []);
  const onMouseLeaveZone = useCallback(() => setCursor("auto"), []);

  // --- Map viewport tracking ---
  const syncViewport = useCallback((map: maplibregl.Map) => {
    setZoom(map.getZoom());
    const b = map.getBounds();
    if (b) {
      setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
    }
  }, []);

  const onMove = useCallback(
    (evt: { target: maplibregl.Map }) => syncViewport(evt.target),
    [syncViewport]
  );

  // --- Clustering ---
  const points = useMemo(
    () =>
      filteredLocations.map((l) => ({
        type: "Feature" as const,
        properties: {
          cluster: false,
          locationId: l.id,
          category: l.category,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [l.coordinates.lng, l.coordinates.lat],
        },
      })),
    [filteredLocations]
  );

  const { grouped, expandCluster } = useMapClustering({
    points,
    zoom,
    bounds,
  });

  const locationsById = useMemo(
    () => new Map(filteredLocations.map((l) => [l.id, l])),
    [filteredLocations]
  );

  const handleClusterClick = useCallback(
    (clusterId: number, latitude: number, longitude: number) => {
      setExpandedGroupKey(null);
      const expansionZoom = expandCluster(clusterId);
      if (expansionZoom != null) {
        mapRef.current?.flyTo({
          center: [longitude, latitude],
          zoom: expansionZoom,
          duration: 1000,
        });
      }
    },
    [expandCluster, mapRef]
  );

  const selectPin = useCallback(
    (loc: Location) => {
      setExpandedGroupKey(null);
      onFlyTo(loc);
    },
    [onFlyTo]
  );

  // Clustering yields no markers until bounds are known, and a map that has not
  // moved has fired no move event, so seed the viewport once the map loads.
  const handleMapLoad = useCallback(() => {
    setIsMapLoaded(true);
    const map = mapRef.current?.getMap();
    if (map) syncViewport(map);
  }, [mapRef, syncViewport]);

  const handleMapError = useCallback(
    (event: maplibregl.ErrorEvent) => {
      console.error("Map error:", event.error);
      // Only show error screen for failures during initial load.
      // Post-load errors (e.g. source cleanup during unmount) are harmless.
      if (!isMapLoaded) {
        setMapError(
          "Failed to load map. Please check your connection and try again."
        );
      }
    },
    [isMapLoaded]
  );

  // --- Sticker Markers, Clusters & Coincident Groups ---
  const markers = useMemo(() => {
    const clusterMarkers = grouped.clusters.map((cluster) => {
      const [longitude, latitude] = cluster.geometry.coordinates;
      const pointCount = cluster.properties.point_count;
      return (
        <Marker
          key={`cluster-${cluster.id}`}
          longitude={longitude}
          latitude={latitude}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={(e) => {
              e.stopPropagation();
              handleClusterClick(cluster.id as number, latitude, longitude);
            }}
            className="bg-ocean-blue shadow-floating z-30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-white text-sm font-bold text-white"
          >
            {pointCount}
          </motion.div>
        </Marker>
      );
    });

    const groupMarkers = grouped.groups.map((group) => {
      const members = group.leaves
        .map((leaf) => locationsById.get(leaf.properties.locationId))
        .filter((loc): loc is Location => loc !== undefined);
      if (members.length === 0) return null;

      // A selected member keeps the fan open, or the selection would be hidden.
      const holdsSelection = members.some((m) => m.id === selectedLocation?.id);
      const expanded = expandedGroupKey === group.key || holdsSelection;
      const collapse = () => {
        setExpandedGroupKey(null);
        if (holdsSelection) setSelectedLocation(null);
      };

      return (
        <Marker
          key={`group-${group.key}`}
          longitude={group.longitude}
          latitude={group.latitude}
          style={{ zIndex: expanded ? 60 : 20 }}
        >
          <CoincidentFan
            locations={members}
            expanded={expanded}
            selectedId={selectedLocation?.id ?? null}
            onToggle={
              expanded ? collapse : () => setExpandedGroupKey(group.key)
            }
            onSelect={(loc) => {
              setExpandedGroupKey(group.key);
              onFlyTo(loc);
            }}
            onCollapse={collapse}
          />
        </Marker>
      );
    });

    const pinMarkers = grouped.points.map((point) => {
      const loc = locationsById.get(point.properties.locationId);
      if (!loc) return null;

      const isSelected = selectedLocation?.id === loc.id;
      const Icon = loc.icon;

      return (
        <Marker
          key={loc.id}
          longitude={loc.coordinates.lng}
          latitude={loc.coordinates.lat}
          anchor="bottom"
          onClick={(e: MarkerEvent<MouseEvent>) => {
            e.originalEvent?.stopPropagation();
            selectPin(loc);
          }}
        >
          <motion.div
            className="group relative cursor-pointer"
            initial={{ scale: 0, y: 0 }}
            animate={{
              scale: isSelected ? 1.2 : 1,
              y: isSelected ? -10 : 0,
              zIndex: isSelected ? 50 : 1,
            }}
            whileHover={{ scale: 1.15, zIndex: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => selectPin(loc)}
            tabIndex={0}
            role="button"
            aria-label={`${loc.name}, ${loc.category}. ${loc.description}`}
            aria-pressed={isSelected}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectPin(loc);
              }
            }}
            style={{ zIndex: isSelected ? 50 : 1 }}
          >
            {/* 1. The Sticker Body */}
            <div
              className={clsx(
                "relative flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white shadow-[0_8px_16px_rgba(0,0,0,0.3)] transition-shadow duration-300",
                isSelected && "shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
              )}
              style={{ backgroundColor: loc.color }}
            >
              <Icon
                className="text-white drop-shadow-md"
                size={20}
                strokeWidth={2.5}
              />
              {/* Pulse Ring */}
              {isSelected && isPulsing && (
                <span
                  className="absolute inset-0 rounded-full opacity-60"
                  style={{
                    backgroundColor: loc.color,
                    animation:
                      "marker-ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite",
                  }}
                />
              )}
            </div>

            {/* 2. The Triangle "Nub" */}
            <div className="absolute -bottom-1 left-1/2 h-0 w-0 -translate-x-1/2 border-t-[8px] border-r-[6px] border-l-[6px] border-white border-r-transparent border-l-transparent" />
            <div
              className="absolute -bottom-[3px] left-1/2 h-0 w-0 -translate-x-1/2 border-t-[6px] border-r-[4px] border-l-[4px] border-r-transparent border-l-transparent"
              style={{ borderTopColor: loc.color }}
            />

            {/* 3. Floating Label */}
            <motion.div
              className={clsx(
                "text-basalt-800 shadow-floating pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold tracking-wider whitespace-nowrap uppercase backdrop-blur",
                isSelected
                  ? "opacity-100"
                  : "opacity-0 transition-opacity group-hover:opacity-100"
              )}
              initial={false}
            >
              {loc.name}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white/95" />
            </motion.div>
          </motion.div>
        </Marker>
      );
    });

    return [...clusterMarkers, ...pinMarkers, ...groupMarkers];
  }, [
    grouped,
    locationsById,
    selectedLocation,
    isPulsing,
    expandedGroupKey,
    onFlyTo,
    selectPin,
    handleClusterClick,
    setSelectedLocation,
  ]);

  return (
    <>
      {/* Map Error State */}
      {mapError && (
        <div className="bg-canvas absolute inset-0 z-50 flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <AlertCircle className="text-status-error mx-auto mb-4 h-12 w-12" />
            <p className="text-status-error mb-4 font-bold">{mapError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-xl px-6 py-3 font-bold text-white transition-colors"
            >
              Reload Map
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      <AnimatePresence>
        {!isMapLoaded && !mapError && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-surface-alt absolute inset-0 z-40 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="text-brand h-10 w-10 animate-spin" />
              <p className="text-brand animate-pulse font-serif text-lg font-bold">
                Loading Brava...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MapLibre GL Map — wrapped in error boundary for Activity restore crashes */}
      <MapRecoveryBoundary
        fallback={
          <div className="bg-surface-alt absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="text-brand h-10 w-10 animate-spin" />
              <p className="text-brand animate-pulse font-serif text-lg font-bold">
                Loading Brava...
              </p>
            </div>
          </div>
        }
      >
        <BaseMap
          ref={mapRef}
          style={
            viewMode === "satellite" ? MAP_STYLES.voyager : MAP_STYLES.positron
          }
          onClick={handleMapClick}
          onMove={onMove}
          onLoad={handleMapLoad}
          onError={handleMapError}
          interactiveLayerIds={["zone-fills"]}
          mapProps={{
            terrain:
              viewMode === "satellite" && isMapLoaded && is3D
                ? {
                    source: TERRAIN_DEM.SOURCE_ID,
                    exaggeration: MAP_CONFIG.TERRAIN_EXAGGERATION,
                  }
                : undefined,
            maxPitch: MAP_CONFIG.MAX_PITCH,
            style: {
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              cursor,
            },
            onDragStart: handleStopOrbit,
            onZoomStart: handleStopOrbit,
            onMouseEnter: onMouseEnterZone,
            onMouseLeave: onMouseLeaveZone,
            "aria-label":
              "Interactive map of Brava Island showing tourist destinations",
          }}
        >
          {isMapLoaded && (
            <>
              <Source
                id={TERRAIN_DEM.SOURCE_ID}
                type="raster-dem"
                tiles={[...TERRAIN_DEM.TILES]}
                encoding={TERRAIN_DEM.ENCODING}
                tileSize={TERRAIN_DEM.TILE_SIZE}
                maxzoom={TERRAIN_DEM.MAX_ZOOM}
              />

              {/* Illustration Mode Layer */}
              {viewMode === "illustration" && (
                <Source
                  id="brava-illustration"
                  type="image"
                  url={ILLUSTRATION_URL}
                  coordinates={ILLUSTRATION_BOUNDS}
                >
                  <Layer
                    id="brava-illustration-layer"
                    type="raster"
                    paint={{
                      "raster-fade-duration": 0,
                      "raster-opacity": 1,
                    }}
                    beforeId="waterway-label"
                  />
                </Source>
              )}

              {markers}
              <NavigationControl position="bottom-right" />
              <GeolocateControl position="bottom-right" />
            </>
          )}
        </BaseMap>
      </MapRecoveryBoundary>

      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {selectedLocation &&
          `Selected ${selectedLocation.name}. ${selectedLocation.description}`}
      </div>
    </>
  );
}
