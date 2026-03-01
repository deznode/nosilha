"use client";

import {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
  useLayoutEffect,
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
} from "react-map-gl/mapbox";
import mapboxgl from "mapbox-gl";
import { BaseMap, useMapClustering } from "../shared";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import {
  useViewMode,
  useLayerVisibility,
  useSelectedLocation,
  useIsPulsing,
  useIsOrbiting,
  useMapStore,
} from "@/stores/mapStore";
import { useFilteredLocations } from "../hooks/useFilteredLocations";
import {
  INTRO_CONFIG,
  MAP_CONFIG,
  ILLUSTRATION_BOUNDS,
  ILLUSTRATION_URL,
  ZONES_GEOJSON,
  TRAILS_GEOJSON,
} from "../data/constants";
import type { Location } from "../data/types";

interface MapCanvasProps {
  mapRef: RefObject<MapRef | null>;
  onFlyTo: (location: Location) => void;
}

export function MapCanvas({ mapRef, onFlyTo }: MapCanvasProps) {
  // --- Local state (lifecycle-scoped, not shared) ---
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isIntroPlaying, setIsIntroPlaying] = useState(true);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [zoom, setZoom] = useState<number>(MAP_CONFIG.DEFAULT_ZOOM);
  const [bounds, setBounds] = useState<
    [number, number, number, number] | undefined
  >(undefined);
  const [cursor, setCursor] = useState<string>("auto");

  // --- Local refs ---
  const orbitAnimationRef = useRef<number>(0);
  const orbitStartTimeRef = useRef<number>(0);
  const isOrbitMovingRef = useRef<boolean>(false);
  const introAnimationRef = useRef<number>(0);
  const introTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // --- Store selectors ---
  const viewMode = useViewMode();
  const layerVisibility = useLayerVisibility();
  const selectedLocation = useSelectedLocation();
  const isPulsing = useIsPulsing();
  const isOrbiting = useIsOrbiting();
  const locations = useMapStore((s) => s.locations);
  const setIsOrbiting = useMapStore((s) => s.setIsOrbiting);
  const setSelectedLocation = useMapStore((s) => s.setSelectedLocation);

  // --- Filtered locations for markers ---
  const filteredLocations = useFilteredLocations();

  // --- Clear terrain before Source cleanup removes the DEM source ---
  // useLayoutEffect cleanup runs synchronously during commit, BEFORE any
  // useEffect (passive) cleanups. This ensures terrain is cleared before
  // <Source id="mapbox-dem"> tries to call map.removeSource().
  // See: https://github.com/visgl/react-map-gl/issues/2553
  useLayoutEffect(() => {
    const ref = mapRef.current;
    return () => {
      const map = ref?.getMap();
      if (map) {
        try {
          map.setTerrain(null);
        } catch {
          // Suppress — map may already be recycled
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mapRef is a stable ref, no need to track
  }, []);

  // --- Cleanup timers on unmount ---
  useEffect(() => {
    return () => {
      introTimersRef.current.forEach(clearTimeout);
      introAnimationRef.current = 0;
    };
  }, [mapRef]);

  // --- Cinematic Intro Animation ---
  const runCinematicIntro = useCallback(() => {
    if (!mapRef.current || isIntroComplete) return;

    const { PEAK_POSITION, HOLD_DURATION, SWEEP_DURATION, SETTLE_DURATION } =
      INTRO_CONFIG;
    const targetPosition = MAP_CONFIG.DEFAULT_CENTER;

    mapRef.current.flyTo({
      center: [PEAK_POSITION.lng, PEAK_POSITION.lat],
      zoom: 10,
      pitch: 75,
      bearing: -30,
      duration: 0,
    });

    introTimersRef.current.forEach(clearTimeout);
    introTimersRef.current = [];

    const sweepTimer = setTimeout(() => {
      if (introAnimationRef.current === 0 || !mapRef.current) return;
      mapRef.current.flyTo({
        center: [targetPosition.lng, targetPosition.lat],
        zoom: MAP_CONFIG.DEFAULT_ZOOM + 1,
        pitch: 50,
        bearing: 15,
        duration: SWEEP_DURATION,
      });
    }, HOLD_DURATION);

    const settleTimer = setTimeout(() => {
      if (introAnimationRef.current === 0 || !mapRef.current) return;
      mapRef.current.flyTo({
        center: [targetPosition.lng, targetPosition.lat],
        zoom: MAP_CONFIG.DEFAULT_ZOOM,
        pitch: MAP_CONFIG.PITCH_2D,
        bearing: MAP_CONFIG.DEFAULT_BEARING,
        duration: SETTLE_DURATION,
      });
    }, HOLD_DURATION + SWEEP_DURATION);

    const completeTimer = setTimeout(
      () => {
        if (introAnimationRef.current === 0) return;
        setIsIntroPlaying(false);
        setIsIntroComplete(true);
      },
      HOLD_DURATION + SWEEP_DURATION + SETTLE_DURATION
    );

    introTimersRef.current = [sweepTimer, settleTimer, completeTimer];
    introAnimationRef.current = 1;
  }, [isIntroComplete, mapRef]);

  // --- Cancel intro animation and fly to default position ---
  const cancelIntro = useCallback(() => {
    introTimersRef.current.forEach(clearTimeout);
    introTimersRef.current = [];
    introAnimationRef.current = 0;

    mapRef.current?.flyTo({
      center: [MAP_CONFIG.DEFAULT_CENTER.lng, MAP_CONFIG.DEFAULT_CENTER.lat],
      zoom: MAP_CONFIG.DEFAULT_ZOOM,
      pitch: MAP_CONFIG.PITCH_2D,
      bearing: MAP_CONFIG.DEFAULT_BEARING,
      duration: 800,
    });

    setIsIntroPlaying(false);
    setIsIntroComplete(true);
  }, [mapRef]);

  // Trigger cinematic intro when map loads
  useEffect(() => {
    if (isMapLoaded && !isIntroComplete && isIntroPlaying) {
      const timer = setTimeout(runCinematicIntro, 300);
      return () => clearTimeout(timer);
    }
  }, [isMapLoaded, isIntroComplete, isIntroPlaying, runCinematicIntro]);

  // Keyboard shortcut to skip intro (ESC key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isIntroPlaying && !isIntroComplete) {
        cancelIntro();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isIntroPlaying, isIntroComplete, cancelIntro]);

  // --- Desktop-only orbit animation ---
  useEffect(() => {
    if (!isOrbiting || !mapRef.current) {
      isOrbitMovingRef.current = false;
      return;
    }

    const map = mapRef.current.getMap();
    orbitStartTimeRef.current = Date.now();
    isOrbitMovingRef.current = true;
    let lastFrameTime = 0;

    const rotateCamera = (timestamp: number) => {
      if (timestamp - lastFrameTime < 33) {
        orbitAnimationRef.current = requestAnimationFrame(rotateCamera);
        return;
      }

      lastFrameTime = timestamp;
      const secondsElapsed = (Date.now() - orbitStartTimeRef.current) / 1000;

      const camera = map.getFreeCameraOptions();
      const center = MAP_CONFIG.DEFAULT_CENTER;
      const altitude = 3000;
      const radius = 0.03;
      const speed = 0.1;
      const phase = secondsElapsed * speed;

      camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
        {
          lng: center.lng + Math.cos(phase) * radius,
          lat: center.lat + Math.sin(phase) * radius,
        },
        altitude
      );

      camera.lookAtPoint({ lng: center.lng, lat: center.lat });
      map.setFreeCameraOptions(camera);

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
      if (isIntroPlaying && !isIntroComplete) {
        cancelIntro();
      }
    },
    [isIntroPlaying, isIntroComplete, setIsOrbiting, cancelIntro]
  );

  // --- Handle zone clicks ---
  const handleMapClick = useCallback(
    (event: mapboxgl.MapLayerMouseEvent) => {
      if (event.defaultPrevented) return;

      const feature = event.features?.[0];
      if (feature?.layer?.id === "zone-fills") {
        const geometry = feature.geometry as GeoJSON.Polygon;
        if (geometry.type === "Polygon") {
          setIsOrbiting(false);

          const coordinates = geometry.coordinates[0];
          const b = coordinates.reduce(
            (acc, coord) => acc.extend(coord as [number, number]),
            new mapboxgl.LngLatBounds(
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
      }
    },
    [setIsOrbiting, setSelectedLocation, mapRef]
  );

  // --- Cursor handlers for interactive zones ---
  const onMouseEnterZone = useCallback(() => setCursor("pointer"), []);
  const onMouseLeaveZone = useCallback(() => setCursor("auto"), []);

  // --- Map viewport tracking ---
  const onMove = useCallback(
    (evt: { viewState: { zoom: number }; target: mapboxgl.Map }) => {
      // Skip viewport tracking during intro to avoid rapid state updates
      // from continuous flyTo move events causing "Maximum update depth"
      if (isIntroPlaying) return;

      setZoom(evt.viewState.zoom);
      const b = evt.target.getBounds();
      if (b) {
        setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
      }
    },
    [isIntroPlaying]
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

  const { clusters, expandCluster } = useMapClustering({
    points,
    zoom,
    bounds,
  });

  const handleClusterClick = useCallback(
    (clusterId: number, latitude: number, longitude: number) => {
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

  const handleMapLoad = useCallback(() => {
    setIsMapLoaded(true);
  }, []);

  const handleMapError = useCallback(
    (event: mapboxgl.ErrorEvent) => {
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

  // --- Sticker Markers & Clusters ---
  const markers = useMemo(
    () =>
      clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        const props = cluster.properties as Record<string, unknown>;
        const isCluster = props.cluster as boolean;

        if (isCluster) {
          const pointCount = props.point_count as number;
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
                className="bg-ocean-blue z-30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-white text-sm font-bold text-white shadow-lg"
              >
                {pointCount}
              </motion.div>
            </Marker>
          );
        }

        const loc = locations.find((l) => l.id === props.locationId);
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
              onFlyTo(loc);
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
              onClick={() => onFlyTo(loc)}
              tabIndex={0}
              role="button"
              aria-label={`${loc.name}, ${loc.category}. ${loc.description}`}
              aria-pressed={isSelected}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onFlyTo(loc);
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
                  "pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold tracking-wider whitespace-nowrap text-slate-800 uppercase shadow-xl backdrop-blur",
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
      }),
    [
      clusters,
      selectedLocation,
      isPulsing,
      onFlyTo,
      handleClusterClick,
      locations,
    ]
  );

  return (
    <>
      {/* Map Error State */}
      {mapError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white p-8">
          <div className="max-w-md text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <p className="mb-4 font-bold text-red-600">{mapError}</p>
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

      {/* Skip Intro Button */}
      <AnimatePresence>
        {isIntroPlaying && isMapLoaded && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            onClick={cancelIntro}
            className="absolute bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-black/30 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-black/50"
          >
            Skip Intro
            <span className="text-xs text-white/60">ESC</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mapbox GL Map */}
      <BaseMap
        ref={mapRef}
        style={
          viewMode === "satellite"
            ? "mapbox://styles/mapbox/satellite-streets-v12"
            : "mapbox://styles/mapbox/light-v11"
        }
        onClick={handleMapClick}
        onMove={onMove}
        onLoad={handleMapLoad}
        onError={handleMapError}
        interactiveLayerIds={["zone-fills"]}
        mapProps={{
          terrain:
            viewMode === "satellite"
              ? {
                  source: "mapbox-dem",
                  exaggeration: MAP_CONFIG.TERRAIN_EXAGGERATION,
                }
              : undefined,
          fog:
            viewMode === "satellite"
              ? {
                  range: [0.8, 8],
                  color: "#e8e4e0",
                  "horizon-blend": 0.15,
                  "high-color": "#4a90a4",
                  "space-color": "#1a1a2e",
                  "star-intensity": 0.15,
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
        <Source
          id="mapbox-dem"
          type="raster-dem"
          url="mapbox://mapbox.mapbox-terrain-dem-v1"
          tileSize={MAP_CONFIG.DEM_TILE_SIZE}
          maxzoom={MAP_CONFIG.DEM_MAX_ZOOM}
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

        {/* Zone Layers */}
        {viewMode === "satellite" &&
          (layerVisibility === "all" || layerVisibility === "zones") && (
            <Source id="zones" type="geojson" data={ZONES_GEOJSON}>
              <Layer
                id="zone-fills"
                type="fill"
                paint={{
                  "fill-color": ["get", "color"],
                  "fill-opacity": 0.25,
                }}
              />
              <Layer
                id="zone-lines"
                type="line"
                paint={{
                  "line-color": ["get", "color"],
                  "line-width": 2,
                  "line-dasharray": [2, 1],
                  "line-opacity": 0.8,
                }}
              />
              <Layer
                id="zone-labels"
                type="symbol"
                layout={{
                  "text-field": ["get", "name"],
                  "text-size": 12,
                  "text-transform": "uppercase",
                  "text-letter-spacing": 0.1,
                  "text-font": ["DIN Offc Pro Bold", "Arial Unicode MS Bold"],
                }}
                paint={{
                  "text-color": "#ffffff",
                  "text-halo-color": ["get", "color"],
                  "text-halo-width": 2,
                }}
              />
            </Source>
          )}

        {/* Trail Layers */}
        {viewMode === "satellite" &&
          (layerVisibility === "all" || layerVisibility === "zones") && (
            <Source id="trails" type="geojson" data={TRAILS_GEOJSON}>
              <Layer
                id="trail-glow"
                type="line"
                paint={{
                  "line-color": ["get", "color"],
                  "line-width": 6,
                  "line-opacity": 0.3,
                  "line-blur": 3,
                }}
              />
              <Layer
                id="trail-lines"
                type="line"
                paint={{
                  "line-color": ["get", "color"],
                  "line-width": 3,
                  "line-opacity": 0.9,
                  "line-dasharray": [2, 1],
                }}
              />
              <Layer
                id="trail-labels"
                type="symbol"
                layout={{
                  "symbol-placement": "line-center",
                  "text-field": ["get", "name"],
                  "text-size": 10,
                  "text-font": [
                    "DIN Offc Pro Medium",
                    "Arial Unicode MS Regular",
                  ],
                  "text-rotation-alignment": "viewport",
                }}
                paint={{
                  "text-color": "#ffffff",
                  "text-halo-color": ["get", "color"],
                  "text-halo-width": 1.5,
                }}
              />
            </Source>
          )}

        {markers}
        <NavigationControl position="bottom-right" />
        <GeolocateControl position="bottom-right" />
      </BaseMap>

      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {selectedLocation &&
          `Selected ${selectedLocation.name}. ${selectedLocation.description}`}
      </div>
    </>
  );
}
