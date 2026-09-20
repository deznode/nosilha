"use client";

import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Marker,
  NavigationControl,
  Source,
  type MapRef,
} from "react-map-gl/maplibre";
import type maplibregl from "maplibre-gl";
import { useResolvedTheme } from "@/hooks/use-resolved-theme";
import { useMapStore, useSelectedKey } from "@/stores/mapStore";
import { BaseMap } from "../shared";
import { groupCoincident } from "../shared/use-map-clustering";
import {
  EXPLORER_VIEW,
  MAP_CONFIG,
  MAP_STYLES,
  SATELLITE_STYLE,
  TERRAIN_DEM,
} from "../data/constants";
import type { MapItem } from "../data/types";
import {
  useLabelDeclutter,
  type LabelPriority,
} from "../hooks/use-label-declutter";
import { useFilteredLocations } from "../hooks/useFilteredLocations";
import { CoincidentRing, fanOffsets } from "./coincident-fan";
import { MapHoverPopup } from "./map-hover-popup";
import { MapPin, pinSize } from "./map-pin";

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

/**
 * Which pins carry a label, and how hard each holds on to it (SPECS §3a): none below
 * the zoom floor except the selected pin; above it, documented pins and settlements
 * holding records.
 */
export function labelPriority(
  item: MapItem,
  selected: boolean,
  aboveFloor: boolean
): LabelPriority | null {
  if (selected) return 3;
  if (!aboveFloor) return null;
  if (item.status === "documented") return 2;
  if (item.hasRecords) return 1;
  return null;
}

function Overlay({ children }: { children: ReactNode }) {
  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center p-8 text-center"
      style={{ background: "var(--muted)" }}
    >
      {children}
    </div>
  );
}

const loadingOverlay = (
  <Overlay>
    <p
      className="animate-pulse font-serif text-lg"
      style={{ color: "var(--foreground-secondary)" }}
    >
      Loading Brava…
    </p>
  </Overlay>
);

interface MapCanvasProps {
  mapRef: RefObject<MapRef | null>;
  onSelect: (item: MapItem) => void;
  onLoad: () => void;
  userLocation: { lat: number; lng: number } | null;
}

export function MapCanvas({
  mapRef,
  onSelect,
  onLoad,
  userLocation,
}: MapCanvasProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [aboveFloor, setAboveFloor] = useState(
    EXPLORER_VIEW.ZOOM > EXPLORER_VIEW.LABEL_ZOOM
  );

  const resolvedTheme = useResolvedTheme();
  const satellite = useMapStore((s) => s.satellite);
  const is3D = useMapStore((s) => s.is3D);
  const expandedGroupKey = useMapStore((s) => s.expandedGroupKey);
  const setExpandedGroup = useMapStore((s) => s.setExpandedGroup);
  const clearSelection = useMapStore((s) => s.clearSelection);
  const selectedKey = useSelectedKey();
  const visible = useFilteredLocations();

  const { registerLabel, scheduleDeclutter } = useLabelDeclutter();

  // --- Reset stale state on Activity restore ---
  // Activity preserves useState across hide/show; the map instance does not survive.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setIsMapLoaded(false);
    setMapError(null);
    setHoveredKey(null);
    setAboveFloor(EXPLORER_VIEW.ZOOM > EXPLORER_VIEW.LABEL_ZOOM);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const basemap = satellite
    ? SATELLITE_STYLE
    : resolvedTheme === "dark"
      ? MAP_STYLES.darkMatter
      : MAP_STYLES.positron;

  const handleMapClick = useCallback(
    (event: maplibregl.MapLayerMouseEvent) => {
      // A click on a marker bubbles to the map too, and a pin cannot stop it: MapLibre
      // listens on its own container. Marker clicks are ignored here instead.
      const target = event.originalEvent?.target;
      if (target instanceof Element && target.closest(".maplibregl-marker")) {
        return;
      }
      clearSelection();
    },
    [clearSelection]
  );

  const handleLoad = useCallback(() => {
    setIsMapLoaded(true);
    const map = mapRef.current?.getMap();
    if (map) setAboveFloor(map.getZoom() > EXPLORER_VIEW.LABEL_ZOOM);
    onLoad();
  }, [mapRef, onLoad]);

  const handleZoomEnd = useCallback(
    (event: { target: maplibregl.Map }) => {
      setAboveFloor(event.target.getZoom() > EXPLORER_VIEW.LABEL_ZOOM);
      scheduleDeclutter();
    },
    [scheduleDeclutter]
  );

  const handleMapError = useCallback(
    (event: maplibregl.ErrorEvent) => {
      console.error("Map error:", event.error);
      // Only a failure before the first load is fatal; later errors (a missing tile,
      // source cleanup on unmount) are not.
      if (!isMapLoaded) {
        setMapError(
          "The map could not load. Check your connection and try again."
        );
      }
    },
    [isMapLoaded]
  );

  // Records at one exact point, which no zoom can separate.
  const grouped = useMemo(
    () =>
      groupCoincident(
        visible.map((item) => ({
          type: "Feature" as const,
          properties: { key: item.key },
          geometry: {
            type: "Point" as const,
            coordinates: [item.coordinates.lng, item.coordinates.lat],
          },
        })),
        () => []
      ),
    [visible]
  );

  const byKey = useMemo(
    () => new Map(visible.map((item) => [item.key, item])),
    [visible]
  );

  const hovered = hoveredKey ? byKey.get(hoveredKey) : undefined;
  const handleHover = useCallback(
    (item: MapItem | null) => setHoveredKey(item?.key ?? null),
    []
  );

  const renderPin = useCallback(
    (item: MapItem, offset: [number, number] = [0, 0]) => {
      const selected = item.key === selectedKey;
      const priority = labelPriority(item, selected, aboveFloor);
      const size = pinSize(item);

      return (
        <Marker
          key={item.key}
          longitude={item.coordinates.lng}
          latitude={item.coordinates.lat}
          // Anchored at the dot, not the dot-and-label column, so a label appearing
          // under a pin never moves the pin.
          anchor="top"
          offset={[offset[0], offset[1] - size / 2]}
          style={{ zIndex: selected ? 3 : hoveredKey === item.key ? 2 : 1 }}
        >
          <MapPin
            item={item}
            selected={selected}
            showLabel={priority !== null}
            labelRef={
              priority !== null ? registerLabel(item.key, priority) : undefined
            }
            onSelect={onSelect}
            onHover={handleHover}
          />
        </Marker>
      );
    },
    [selectedKey, aboveFloor, hoveredKey, registerLabel, onSelect, handleHover]
  );

  const markers = useMemo(() => {
    const pins = grouped.points.flatMap((point) => {
      const item = byKey.get(point.properties.key);
      return item ? [renderPin(item)] : [];
    });

    const groups = grouped.groups.flatMap((group) => {
      const members = group.leaves.flatMap((leaf) => {
        const item = byKey.get(leaf.properties.key);
        return item ? [item] : [];
      });
      if (members.length === 0) return [];

      // A selected member keeps the fan open, or the selection would be hidden.
      const expanded =
        expandedGroupKey === group.key ||
        members.some((member) => member.key === selectedKey);

      if (!expanded) {
        return [
          <Marker
            key={`group-${group.key}`}
            longitude={group.longitude}
            latitude={group.latitude}
          >
            <CoincidentRing
              count={members.length}
              onExpand={() => setExpandedGroup(group.key)}
            />
          </Marker>,
        ];
      }

      const offsets = fanOffsets(members.length);
      return members.map((member, index) => renderPin(member, offsets[index]));
    });

    return [...pins, ...groups];
  }, [
    grouped,
    byKey,
    expandedGroupKey,
    selectedKey,
    renderPin,
    setExpandedGroup,
  ]);

  // Labels have been added, removed or re-prioritised: place them again.
  useEffect(() => {
    if (isMapLoaded) scheduleDeclutter();
  }, [isMapLoaded, markers, scheduleDeclutter]);

  return (
    <>
      {mapError && (
        <Overlay>
          <div className="max-w-md">
            <p
              className="mb-4 text-sm"
              style={{ color: "var(--brand-sobrado-ochre)" }}
            >
              {mapError}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-primary text-primary-foreground rounded-lg px-4 py-[9px] text-[13px] font-medium"
            >
              Reload the map
            </button>
          </div>
        </Overlay>
      )}

      {!isMapLoaded && !mapError && loadingOverlay}

      <MapRecoveryBoundary fallback={loadingOverlay}>
        <BaseMap
          ref={mapRef}
          center={EXPLORER_VIEW.CENTER}
          zoom={EXPLORER_VIEW.ZOOM}
          style={basemap}
          onClick={handleMapClick}
          onLoad={handleLoad}
          onError={handleMapError}
          mapProps={{
            terrain:
              isMapLoaded && is3D
                ? {
                    source: TERRAIN_DEM.SOURCE_ID,
                    exaggeration: MAP_CONFIG.TERRAIN_EXAGGERATION,
                  }
                : undefined,
            maxPitch: MAP_CONFIG.MAX_PITCH,
            attributionControl: { compact: true },
            onZoomEnd: handleZoomEnd,
            onMoveEnd: scheduleDeclutter,
            "aria-label":
              "Map of Brava showing its settlements, place records and located photographs",
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
              {markers}
              {userLocation && (
                <Marker
                  longitude={userLocation.lng}
                  latitude={userLocation.lat}
                >
                  <span
                    aria-label="Your location"
                    role="img"
                    className="block size-3.5 rounded-full"
                    style={{
                      background: "var(--foreground)",
                      border: "3px solid var(--background)",
                      boxShadow:
                        "0 0 0 5px color-mix(in srgb, var(--foreground) 20%, transparent)",
                    }}
                  />
                </Marker>
              )}
              {hovered && <MapHoverPopup item={hovered} />}
              <NavigationControl position="bottom-right" showCompass={false} />
            </>
          )}
        </BaseMap>
      </MapRecoveryBoundary>
    </>
  );
}
