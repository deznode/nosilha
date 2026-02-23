"use client";

import {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
  useDeferredValue,
} from "react";
import useSupercluster from "use-supercluster";
import Map, {
  Marker,
  NavigationControl,
  GeolocateControl,
  Source,
  Layer,
  type MapRef,
  type MarkerEvent,
} from "react-map-gl/mapbox";
import mapboxgl from "mapbox-gl";
import type { FeatureCollection, Polygon } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  X,
  Navigation,
  Search,
  Layers,
  Star,
  List,
  Info,
  AlertCircle,
  RotateCcw,
  Loader2,
  Globe,
  Image as ImageIcon,
  Shuffle,
  Home,
  EyeOff,
  MapPin,
  Map as MapIcon,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Data Imports ---
import { getEntriesForMap } from "@/lib/api";
import { transformEntries, searchLocations } from "../data/locations-adapter";
import type { Location } from "../data/types";
import { CATEGORIES, type CategoryType } from "../data/categories";
import zonesData from "../data/zones.json";
import trailsData from "../data/trails.json";

// --- Utility: Tailwind Class Merger ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Utility: Calculate Bearing Between Two Points ---
function calculateBearing(
  from: { lng: number; lat: number },
  to: { lng: number; lat: number }
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// --- Cinematic Intro Configuration ---
const INTRO_CONFIG = {
  PEAK_POSITION: { lng: -24.708, lat: 14.851 }, // Monte Fontainhas
  START_ALTITUDE: 4000,
  END_ALTITUDE: 2000,
  HOLD_DURATION: 1500,
  SWEEP_DURATION: 4000,
  SETTLE_DURATION: 1000,
  ORBIT_RADIUS: 0.025,
} as const;

// --- Map Configuration Constants ---
const MAP_CONFIG = {
  DEFAULT_CENTER: { lng: -24.7, lat: 14.86 },
  DEFAULT_ZOOM: 12.5,
  LOCATION_ZOOM: 15,
  PITCH_3D: 60,
  PITCH_2D: 0,
  DEFAULT_BEARING: 0,
  LOCATION_BEARING: -10,
  TERRAIN_EXAGGERATION: 1.5,
  ANIMATION_DURATION: 2000,
  RESET_DURATION: 1500,
  EASE_DURATION: 500,
  MAX_PITCH: 85,
  DEM_TILE_SIZE: 512,
  DEM_MAX_ZOOM: 14,
} as const;

// --- Illustration Mode Configuration ---
const ILLUSTRATION_BOUNDS: [
  [number, number],
  [number, number],
  [number, number],
  [number, number],
] = [
  [-24.75, 14.89],
  [-24.66, 14.89],
  [-24.66, 14.83],
  [-24.75, 14.83],
];

const ILLUSTRATION_URL = "/brava-illustration.jpg";

const ENABLE_ILLUSTRATION_MODE = false;

// View mode type
type ViewMode = "satellite" | "illustration";

// Layer visibility type
type LayerVisibility = "all" | "pois" | "zones" | "none";

// --- GeoJSON Data (imported from files) ---
const ZONES_GEOJSON = zonesData as FeatureCollection<
  Polygon,
  { name: string; color: string; zoomTo?: number }
>;
const TRAILS_GEOJSON = trailsData as FeatureCollection;

// --- Sub-Components ---

const CategoryPill = ({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold whitespace-nowrap shadow-sm backdrop-blur-md transition-all duration-300",
      active
        ? "bg-ocean-blue border-ocean-blue shadow-ocean-blue/20 text-white"
        : "border-border-primary text-volcanic-gray hover:border-ocean-blue/50 hover:text-ocean-blue bg-white/80 hover:bg-white"
    )}
  >
    <Icon size={14} />
    {label}
  </button>
);

const LocationCard = ({
  location,
  active,
  onClick,
}: {
  location: Location;
  active: boolean;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className={cn(
      "group flex cursor-pointer gap-4 rounded-2xl border p-3 transition-all duration-300",
      active
        ? "bg-ocean-blue/5 border-ocean-blue/30 shadow-sm"
        : "hover:bg-background-secondary hover:border-border-secondary border-transparent bg-transparent"
    )}
  >
    <div className="bg-background-tertiary relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
      <img
        src={location.image}
        alt={location.name}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
    </div>
    <div className="flex min-w-0 flex-col justify-center">
      <h3
        className={cn(
          "truncate font-serif text-sm font-bold",
          active ? "text-ocean-blue" : "text-text-primary"
        )}
      >
        {location.name}
      </h3>
      <div className="text-text-secondary mb-1 flex items-center gap-1 font-sans text-[11px] font-medium">
        <span className="tracking-wider uppercase">{location.category}</span>
        <span>&bull;</span>
        <span className="text-sunny-yellow flex items-center gap-0.5">
          <Star size={10} fill="currentColor" /> {location.rating}
        </span>
      </div>
      <p className="text-text-secondary mb-2 line-clamp-2 font-sans text-xs leading-relaxed">
        {location.description}
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={cn(
          "flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors",
          active
            ? "bg-ocean-blue shadow-ocean-blue/20 text-white shadow-md"
            : "bg-background-tertiary text-text-secondary hover:bg-ocean-blue hover:text-white"
        )}
      >
        <Navigation
          size={12}
          className={active ? "text-white" : "text-current"}
        />
        Fly to
      </button>
    </div>
  </div>
);

// --- Main Map Component ---

export default function BravaMap() {
  const mapRef = useRef<MapRef>(null);

  // --- API Data State ---
  const [locations, setLocations] = useState<Location[]>([]);
  const [_isLoadingLocations, setIsLoadingLocations] = useState(true);

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [activeCategory, setActiveCategory] = useState<CategoryType>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [is3D, setIs3D] = useState(true);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [cursor, setCursor] = useState<string>("auto");
  const [viewMode, setViewMode] = useState<ViewMode>("satellite");
  const [layerVisibility, setLayerVisibility] =
    useState<LayerVisibility>("all");

  // Cinematic intro state
  const [isIntroPlaying, setIsIntroPlaying] = useState(true);
  const [isIntroComplete, setIsIntroComplete] = useState(false);

  // Pulse animation state for selected marker
  const [isPulsing, setIsPulsing] = useState(false);
  const pulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs for orbit animation
  const orbitAnimationRef = useRef<number>(0);
  const orbitStartTimeRef = useRef<number>(0);
  const isOrbitMovingRef = useRef<boolean>(false);

  // Refs for cinematic intro
  const introAnimationRef = useRef<number>(0);
  const introTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // --- Fetch locations from API on mount ---
  useEffect(() => {
    let cancelled = false;
    async function fetchLocations() {
      try {
        const { items } = await getEntriesForMap("all");
        if (!cancelled) {
          setLocations(transformEntries(items));
          setIsLoadingLocations(false);
        }
      } catch (err) {
        console.error("Failed to fetch map locations:", err);
        if (!cancelled) {
          setIsLoadingLocations(false);
        }
      }
    }
    fetchLocations();
    return () => {
      cancelled = true;
    };
  }, []);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        const map = mapRef.current.getMap();
        map.remove();
      }
      introTimersRef.current.forEach(clearTimeout);
      introAnimationRef.current = 0;
    };
  }, []);

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
  }, [isIntroComplete]);

  // Skip intro handler
  const handleSkipIntro = useCallback(() => {
    introTimersRef.current.forEach(clearTimeout);
    introTimersRef.current = [];
    introAnimationRef.current = 0;

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [MAP_CONFIG.DEFAULT_CENTER.lng, MAP_CONFIG.DEFAULT_CENTER.lat],
        zoom: MAP_CONFIG.DEFAULT_ZOOM,
        pitch: MAP_CONFIG.PITCH_2D,
        bearing: MAP_CONFIG.DEFAULT_BEARING,
        duration: 800,
      });
    }

    setIsIntroPlaying(false);
    setIsIntroComplete(true);
  }, []);

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
        handleSkipIntro();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isIntroPlaying, isIntroComplete, handleSkipIntro]);

  // Desktop-only orbit animation effect
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
  }, [isOrbiting]);

  // Stop orbiting on map interaction
  const handleStopOrbit = useCallback(() => {
    if (isOrbitMovingRef.current) return;

    setIsOrbiting(false);
    if (isIntroPlaying && !isIntroComplete) {
      introTimersRef.current.forEach(clearTimeout);
      introTimersRef.current = [];
      introAnimationRef.current = 0;

      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [
            MAP_CONFIG.DEFAULT_CENTER.lng,
            MAP_CONFIG.DEFAULT_CENTER.lat,
          ],
          zoom: MAP_CONFIG.DEFAULT_ZOOM,
          pitch: MAP_CONFIG.PITCH_2D,
          bearing: MAP_CONFIG.DEFAULT_BEARING,
          duration: 800,
        });
      }

      setIsIntroPlaying(false);
      setIsIntroComplete(true);
    }
  }, [isIntroPlaying, isIntroComplete]);

  // Handle zone clicks
  const handleMapClick = useCallback((event: mapboxgl.MapLayerMouseEvent) => {
    if (event.defaultPrevented) return;

    const feature = event.features?.[0];
    if (feature && feature.layer && feature.layer.id === "zone-fills") {
      const geometry = feature.geometry as GeoJSON.Polygon;
      if (geometry.type === "Polygon") {
        setIsOrbiting(false);

        const coordinates = geometry.coordinates[0];
        const bounds = coordinates.reduce(
          (bounds, coord) => bounds.extend(coord as [number, number]),
          new mapboxgl.LngLatBounds(
            coordinates[0] as [number, number],
            coordinates[0] as [number, number]
          )
        );

        mapRef.current?.fitBounds(bounds, {
          padding: 100,
          pitch: 40,
          duration: 1500,
        });
      }
    } else {
      setSelectedLocation(null);
    }
  }, []);

  // Cursor handlers for interactive zones
  const onMouseEnterZone = useCallback(() => setCursor("pointer"), []);
  const onMouseLeaveZone = useCallback(() => setCursor("auto"), []);

  const filteredLocations = useMemo(() => {
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
  }, [activeCategory, searchQuery, layerVisibility, locations]);

  // Sort locations so selected marker is always rendered last (on top)
  const _sortedLocations = useMemo(() => {
    return [...filteredLocations].sort(
      (a, b) =>
        (selectedLocation?.id === a.id ? 1 : 0) -
        (selectedLocation?.id === b.id ? 1 : 0)
    );
  }, [filteredLocations, selectedLocation]);

  // --- Clustering State ---
  const [bounds, setBounds] = useState<
    [number, number, number, number] | undefined
  >(undefined);
  const [zoom, setZoom] = useState<number>(MAP_CONFIG.DEFAULT_ZOOM);

  const onMove = useCallback(
    (evt: { viewState: { zoom: number }; target: mapboxgl.Map }) => {
      setZoom(evt.viewState.zoom);
      const b = evt.target.getBounds();
      if (b) {
        setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
      }
    },
    []
  );

  // Prepare points for supercluster
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

  // Get clusters
  const { clusters: rawClusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom,
    options: { radius: 50, maxZoom: 14 },
  });

  const clusters = useDeferredValue(rawClusters);

  const handleClusterClick = useCallback(
    (clusterId: number, latitude: number, longitude: number) => {
      if (supercluster) {
        const expansionZoom = Math.min(
          supercluster.getClusterExpansionZoom(clusterId),
          20
        );
        mapRef.current?.flyTo({
          center: [longitude, latitude],
          zoom: expansionZoom,
          duration: 1000,
        });
      }
    },
    [supercluster]
  );

  // --- Handlers ---
  const handleFlyTo = useCallback(
    (loc: Location) => {
      setIsOrbiting(false);
      setSelectedLocation(loc);

      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current);
      }
      setIsPulsing(false);

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
          setIsPulsing(true);
          pulseTimeoutRef.current = setTimeout(() => {
            setIsPulsing(false);
          }, 3000);
        }, MAP_CONFIG.ANIMATION_DURATION);
      }
    },
    [showSidebar, is3D, viewMode]
  );

  const handleRandomFlyTo = useCallback(() => {
    const availableLocations = locations.filter(
      (l) => l.id !== selectedLocation?.id
    );
    const randomLocation =
      availableLocations[Math.floor(Math.random() * availableLocations.length)];
    if (randomLocation) handleFlyTo(randomLocation);
  }, [selectedLocation, handleFlyTo, locations]);

  const handleReset = useCallback(() => {
    setSelectedLocation(null);
    mapRef.current?.flyTo({
      center: [MAP_CONFIG.DEFAULT_CENTER.lng, MAP_CONFIG.DEFAULT_CENTER.lat],
      zoom: MAP_CONFIG.DEFAULT_ZOOM,
      pitch: MAP_CONFIG.PITCH_2D,
      bearing: MAP_CONFIG.DEFAULT_BEARING,
      duration: MAP_CONFIG.RESET_DURATION,
    });
  }, []);

  const handle3DToggle = useCallback(() => {
    const newIs3D = !is3D;
    setIs3D(newIs3D);
    mapRef.current?.easeTo({
      pitch: newIs3D ? MAP_CONFIG.PITCH_3D : MAP_CONFIG.PITCH_2D,
      duration: MAP_CONFIG.EASE_DURATION,
    });
  }, [is3D]);

  const handleOrbitToggle = useCallback(() => {
    if (viewMode === "illustration") return;

    if (!isOrbiting) {
      setIs3D(true);
    }
    setIsOrbiting(!isOrbiting);
  }, [isOrbiting, viewMode]);

  const handleViewModeToggle = useCallback(
    (mode: ViewMode) => {
      if (mode === "illustration" && isOrbiting) {
        setIsOrbiting(false);
      }
      setViewMode(mode);

      if (mode === "illustration" && mapRef.current) {
        mapRef.current.easeTo({
          pitch: MAP_CONFIG.PITCH_2D,
          duration: MAP_CONFIG.EASE_DURATION,
        });
      }
    },
    [isOrbiting]
  );

  const handleMapLoad = useCallback(() => {
    setIsMapLoaded(true);
  }, []);

  const handleMapError = useCallback((event: mapboxgl.ErrorEvent) => {
    console.error("Map error:", event.error);
    setMapError(
      "Failed to load map. Please check your connection and try again."
    );
  }, []);

  // --- Sticker Markers & Clusters ---
  const markers = useMemo(
    () =>
      clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        const { cluster: isCluster } = cluster.properties;

        if (isCluster) {
          const pointCount = (cluster.properties as Record<string, unknown>)
            .point_count as number;
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

        const loc = locations.find(
          (l) =>
            l.id === (cluster.properties as Record<string, unknown>).locationId
        );
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
              handleFlyTo(loc);
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
              onClick={() => handleFlyTo(loc)}
              tabIndex={0}
              role="button"
              aria-label={`${loc.name}, ${loc.category}. ${loc.description}`}
              aria-pressed={isSelected}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleFlyTo(loc);
                }
              }}
              style={{ zIndex: isSelected ? 50 : 1 }}
            >
              {/* 1. The Sticker Body */}
              <div
                className={cn(
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
                className={cn(
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
      handleFlyTo,
      handleClusterClick,
      locations,
    ]
  );

  return (
    <div className="bg-background-secondary text-text-primary relative h-screen w-full overflow-hidden font-sans">
      {/* 1. HEADER */}
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-40 flex items-start justify-between p-4 md:p-6">
        <div className="pointer-events-auto flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-2 pr-6 shadow-xl backdrop-blur-md transition-transform hover:scale-[1.02]">
          <div className="from-ocean-blue to-ocean-blue/80 shadow-ocean-blue/20 flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-lg">
            <span className="font-serif text-xl font-bold">N</span>
          </div>
          <div>
            <h1 className="font-serif text-sm leading-tight font-bold text-white drop-shadow-sm">
              Nosilha
            </h1>
            <p className="font-sans text-[10px] font-bold tracking-widest text-white/90 uppercase">
              Brava Island
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="pointer-events-auto rounded-xl border border-white/20 bg-white/10 p-3 text-white shadow-xl backdrop-blur-md md:hidden"
        >
          {showSidebar ? <X size={20} /> : <List size={20} />}
        </button>
      </div>

      {/* 2. SIDEBAR */}
      <div
        className={cn(
          "border-border-primary absolute top-0 bottom-0 left-0 z-30 flex w-full flex-col border-r bg-white/95 font-sans shadow-2xl backdrop-blur-xl transition-transform duration-500 ease-in-out md:w-[420px]",
          !showSidebar && "-translate-x-full"
        )}
      >
        <div className="h-24 shrink-0 md:h-28" />
        <div className="shrink-0 px-6 pb-2">
          <div className="relative mb-6">
            <Search
              className="text-text-tertiary absolute top-1/2 left-4 -translate-y-1/2"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Explore Brava..."
              className="bg-background-secondary focus:border-ocean-blue/30 focus:ring-ocean-blue/20 placeholder:text-text-tertiary text-text-primary w-full rounded-2xl border border-transparent py-3.5 pr-10 pl-12 text-sm font-medium transition-all outline-none focus:ring-2"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-text-tertiary hover:text-text-primary absolute top-1/2 right-4 -translate-y-1/2 transition-colors"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="scrollbar-hide -mx-6 flex gap-2 overflow-x-auto px-6 pb-4">
            <CategoryPill
              label="All"
              icon={Layers}
              active={activeCategory === "All"}
              onClick={() => setActiveCategory("All")}
            />
            {CATEGORIES.map((cat) => (
              <CategoryPill
                key={cat.id}
                label={cat.label}
                icon={cat.icon}
                active={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
              />
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto px-6 pb-6">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-text-tertiary font-sans text-xs font-bold tracking-widest uppercase">
              Destinations
            </span>
            <span className="text-text-secondary bg-background-secondary rounded-full px-2 py-0.5 text-xs font-medium">
              {filteredLocations.length}
            </span>
          </div>
          {filteredLocations.map((loc) => (
            <LocationCard
              key={loc.id}
              location={loc}
              active={selectedLocation?.id === loc.id}
              onClick={() => handleFlyTo(loc)}
            />
          ))}
        </div>
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="border-border-primary text-text-tertiary hover:text-ocean-blue absolute top-1/2 -right-6 hidden h-24 w-6 items-center justify-center rounded-r-xl border border-l-0 bg-white/90 shadow-sm backdrop-blur transition-all hover:bg-white md:flex"
        >
          {showSidebar ? (
            <div className="bg-border-primary h-8 w-1 rounded-full" />
          ) : (
            <div className="bg-ocean-blue h-8 w-1 rounded-full" />
          )}
        </button>
      </div>

      {/* 3. MAPBOX ENGINE */}
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

      <AnimatePresence>
        {!isMapLoaded && !mapError && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-[#e6e4e0]"
          >
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="text-ocean-blue h-10 w-10 animate-spin" />
              <p className="text-ocean-blue animate-pulse font-serif text-lg font-bold">
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
            onClick={handleSkipIntro}
            className="absolute bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-black/30 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-black/50"
          >
            Skip Intro
            <span className="text-xs text-white/60">ESC</span>
          </motion.button>
        )}
      </AnimatePresence>

      <Map
        ref={mapRef}
        initialViewState={{
          longitude: MAP_CONFIG.DEFAULT_CENTER.lng,
          latitude: MAP_CONFIG.DEFAULT_CENTER.lat,
          zoom: MAP_CONFIG.DEFAULT_ZOOM,
          pitch: MAP_CONFIG.PITCH_2D,
          bearing: MAP_CONFIG.DEFAULT_BEARING,
        }}
        mapStyle={
          viewMode === "satellite"
            ? "mapbox://styles/mapbox/satellite-streets-v12"
            : "mapbox://styles/mapbox/light-v11"
        }
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!}
        terrain={
          viewMode === "satellite"
            ? {
                source: "mapbox-dem",
                exaggeration: MAP_CONFIG.TERRAIN_EXAGGERATION,
              }
            : undefined
        }
        fog={
          viewMode === "satellite"
            ? {
                range: [0.8, 8],
                color: "#e8e4e0",
                "horizon-blend": 0.15,
                "high-color": "#4a90a4",
                "space-color": "#1a1a2e",
                "star-intensity": 0.15,
              }
            : undefined
        }
        maxPitch={MAP_CONFIG.MAX_PITCH}
        reuseMaps
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          cursor,
        }}
        onClick={handleMapClick}
        onMove={onMove}
        onDragStart={handleStopOrbit}
        onZoomStart={handleStopOrbit}
        onLoad={handleMapLoad}
        onError={handleMapError}
        interactiveLayerIds={["zone-fills"]}
        onMouseEnter={onMouseEnterZone}
        onMouseLeave={onMouseLeaveZone}
        aria-label="Interactive map of Brava Island showing tourist destinations"
      >
        <Source
          id="mapbox-dem"
          type="raster-dem"
          url="mapbox://mapbox.mapbox-terrain-dem-v1"
          tileSize={MAP_CONFIG.DEM_TILE_SIZE}
          maxzoom={MAP_CONFIG.DEM_MAX_ZOOM}
        />

        {/* --- ILLUSTRATION MODE LAYER --- */}
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

        {/* --- ZONE LAYERS --- */}
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

        {/* --- TRAIL LAYERS --- */}
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
      </Map>

      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {selectedLocation &&
          `Selected ${selectedLocation.name}. ${selectedLocation.description}`}
      </div>

      {/* 4. CONTROLS */}
      <div className="pointer-events-auto absolute top-24 right-6 z-30 flex flex-col gap-3">
        {/* Random Fly To */}
        <button
          onClick={handleRandomFlyTo}
          className="hover:bg-ocean-blue group rounded-xl border border-white/50 bg-white/90 p-3 text-slate-600 shadow-lg backdrop-blur-md transition-all hover:text-white"
          title="Fly to Random Location"
        >
          <Shuffle
            size={20}
            className="transition-transform duration-500 group-hover:rotate-180"
          />
        </button>

        {/* View Mode Toggle */}
        <div className="border-border-primary flex flex-col gap-1 overflow-hidden rounded-2xl border bg-white/80 p-1 shadow-lg backdrop-blur-md">
          <button
            onClick={() => handleViewModeToggle("satellite")}
            className={cn(
              "rounded-xl p-2 transition-all",
              viewMode === "satellite"
                ? "bg-ocean-blue text-white shadow-sm"
                : "text-volcanic-gray hover:bg-background-secondary"
            )}
            title="Satellite View"
            aria-label="Switch to satellite view"
            aria-pressed={viewMode === "satellite"}
          >
            <Globe size={20} />
          </button>
          {ENABLE_ILLUSTRATION_MODE && (
            <button
              onClick={() => handleViewModeToggle("illustration")}
              className={cn(
                "rounded-xl p-2 transition-all",
                viewMode === "illustration"
                  ? "bg-ocean-blue text-white shadow-sm"
                  : "text-volcanic-gray hover:bg-background-secondary"
              )}
              title="Illustrated Map"
              aria-label="Switch to illustrated map view"
              aria-pressed={viewMode === "illustration"}
            >
              <ImageIcon size={20} />
            </button>
          )}
        </div>

        {/* Layer Visibility Toggle */}
        <div className="border-border-primary flex flex-col gap-1 overflow-hidden rounded-2xl border bg-white/80 p-1 shadow-lg backdrop-blur-md">
          <button
            onClick={() => setLayerVisibility("all")}
            className={cn(
              "rounded-xl p-2 transition-all",
              layerVisibility === "all"
                ? "bg-ocean-blue text-white shadow-sm"
                : "text-volcanic-gray hover:bg-background-secondary"
            )}
            title="Show All"
            aria-label="Show all layers"
            aria-pressed={layerVisibility === "all"}
          >
            <Layers size={20} />
          </button>
          <button
            onClick={() => setLayerVisibility("pois")}
            className={cn(
              "rounded-xl p-2 transition-all",
              layerVisibility === "pois"
                ? "bg-ocean-blue text-white shadow-sm"
                : "text-volcanic-gray hover:bg-background-secondary"
            )}
            title="POIs Only"
            aria-label="Show POIs only"
            aria-pressed={layerVisibility === "pois"}
          >
            <MapPin size={20} />
          </button>
          <button
            onClick={() => setLayerVisibility("zones")}
            className={cn(
              "rounded-xl p-2 transition-all",
              layerVisibility === "zones"
                ? "bg-ocean-blue text-white shadow-sm"
                : "text-volcanic-gray hover:bg-background-secondary"
            )}
            title="Zones Only"
            aria-label="Show zones only"
            aria-pressed={layerVisibility === "zones"}
          >
            <MapIcon size={20} />
          </button>
          <button
            onClick={() => setLayerVisibility("none")}
            className={cn(
              "rounded-xl p-2 transition-all",
              layerVisibility === "none"
                ? "bg-ocean-blue text-white shadow-sm"
                : "text-volcanic-gray hover:bg-background-secondary"
            )}
            title="Hide All"
            aria-label="Hide all layers"
            aria-pressed={layerVisibility === "none"}
          >
            <EyeOff size={20} />
          </button>
        </div>

        {/* Desktop-only Orbit Button */}
        {viewMode === "satellite" && (
          <button
            onClick={handleOrbitToggle}
            className={cn(
              "hidden items-center justify-center rounded-2xl border p-3 shadow-lg backdrop-blur-md transition-all duration-300 md:flex",
              isOrbiting
                ? "bg-ocean-blue border-ocean-blue animate-pulse text-white"
                : "text-volcanic-gray border-white/50 bg-white/90 hover:bg-white"
            )}
            aria-label={
              isOrbiting ? "Stop orbit animation" : "Start orbit animation"
            }
            aria-pressed={isOrbiting}
          >
            <RotateCcw size={20} className={isOrbiting ? "animate-spin" : ""} />
          </button>
        )}

        {/* 3D Toggle */}
        {viewMode === "satellite" && (
          <button
            onClick={handle3DToggle}
            className={cn(
              "min-w-[44px] rounded-2xl border p-3 text-xs font-bold shadow-lg backdrop-blur-md transition-all duration-300",
              is3D
                ? "bg-ocean-blue border-ocean-blue text-white"
                : "text-volcanic-gray border-white/50 bg-white/90 hover:bg-white"
            )}
            aria-label={is3D ? "Switch to 2D view" : "Switch to 3D view"}
            aria-pressed={is3D}
          >
            {is3D ? "3D" : "2D"}
          </button>
        )}

        <button
          onClick={handleReset}
          className="text-volcanic-gray rounded-2xl border border-white/50 bg-white/80 p-3 shadow-lg backdrop-blur-md transition-colors hover:bg-white"
          aria-label="Reset map to home view"
        >
          <Home size={20} />
        </button>
      </div>

      {/* 5. MOBILE BOTTOM SHEET */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 280,
              mass: 0.8,
            }}
            className="bg-background-primary absolute right-0 bottom-0 left-0 z-50 max-h-[60vh] overflow-y-auto overscroll-contain rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] md:hidden"
            style={{ touchAction: "pan-y" }}
          >
            <motion.div
              className="sticky top-0 z-20 flex w-full cursor-pointer justify-center bg-white/95 pt-4 pb-2 backdrop-blur-sm"
              onClick={() => setSelectedLocation(null)}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="bg-border-primary h-1 w-10 rounded-full"
                initial={{ width: 40 }}
                whileHover={{ width: 48, backgroundColor: "#005a85" }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>
            <div className="relative h-52 w-full overflow-hidden">
              <motion.img
                src={selectedLocation.image}
                alt={selectedLocation.name}
                className="h-full w-full object-cover"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <button
                onClick={() => setSelectedLocation(null)}
                className="absolute top-4 right-4 rounded-full bg-black/30 p-2.5 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-black/50"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 p-6 font-sans">
              <h2 className="text-text-primary font-serif text-2xl leading-tight font-bold">
                {selectedLocation.name}
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed">
                {selectedLocation.description}
              </p>
              <button className="bg-ocean-blue shadow-ocean-blue/30 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white shadow-lg transition-transform active:scale-[0.98]">
                <Navigation size={18} /> Navigate Here
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. DESKTOP DETAIL CARD */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="absolute bottom-10 left-[450px] z-30 hidden w-[350px] overflow-hidden rounded-3xl border border-white/20 bg-white/80 shadow-xl backdrop-blur-md md:block"
          >
            <div className="group relative h-48">
              <img
                src={selectedLocation.image}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="from-volcanic-gray-dark/80 absolute inset-0 bg-linear-to-t to-transparent" />
              <button
                onClick={() => setSelectedLocation(null)}
                className="absolute top-3 right-3 rounded-full bg-white/20 p-1.5 text-white backdrop-blur-md transition-colors hover:bg-white/40"
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-serif text-2xl font-bold">
                  {selectedLocation.name}
                </h3>
                <div className="flex items-center gap-1 font-sans text-xs font-medium opacity-90">
                  <Star
                    size={12}
                    className="text-sunny-yellow fill-sunny-yellow"
                  />
                  {selectedLocation.reviews} reviews
                </div>
              </div>
            </div>
            <div className="p-5 font-sans">
              <p className="text-text-secondary mb-6 text-sm leading-relaxed">
                {selectedLocation.description}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-ocean-blue hover:bg-ocean-blue/90 shadow-ocean-blue/20 col-span-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white shadow-lg transition-colors">
                  <Navigation size={14} /> Directions
                </button>
                <button className="border-border-primary text-text-secondary hover:bg-background-secondary col-span-1 flex items-center justify-center gap-2 rounded-xl border bg-white py-3 text-xs font-bold transition-colors">
                  <Info size={14} /> More Info
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
