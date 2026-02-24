"use client";

import {
  Shuffle,
  Globe,
  Image as ImageIcon,
  Layers,
  MapPin,
  Map as MapIcon,
  EyeOff,
  RotateCcw,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useViewMode,
  useLayerVisibility,
  useIsOrbiting,
  useIs3D,
  useMapStore,
} from "@/stores/mapStore";
import { ENABLE_ILLUSTRATION_MODE } from "../data/constants";
import type { ViewMode, LayerVisibility } from "../data/types";

interface MapControlsProps {
  onRandomFlyTo: () => void;
  onReset: () => void;
  on3DToggle: () => void;
  onViewModeToggle: (mode: ViewMode) => void;
}

export function MapControls({
  onRandomFlyTo,
  onReset,
  on3DToggle,
  onViewModeToggle,
}: MapControlsProps) {
  const viewMode = useViewMode();
  const layerVisibility = useLayerVisibility();
  const isOrbiting = useIsOrbiting();
  const is3D = useIs3D();
  const setLayerVisibility = useMapStore((s) => s.setLayerVisibility);
  const toggleOrbit = useMapStore((s) => s.toggleOrbit);

  return (
    <div className="pointer-events-auto absolute top-24 right-6 z-30 flex flex-col gap-3">
      {/* Random Fly To */}
      <button
        onClick={onRandomFlyTo}
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
          onClick={() => onViewModeToggle("satellite")}
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
            onClick={() => onViewModeToggle("illustration")}
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
        <LayerButton
          active={layerVisibility === "all"}
          onClick={() => setLayerVisibility("all")}
          icon={Layers}
          title="Show All"
          ariaLabel="Show all layers"
        />
        <LayerButton
          active={layerVisibility === "pois"}
          onClick={() => setLayerVisibility("pois")}
          icon={MapPin}
          title="POIs Only"
          ariaLabel="Show POIs only"
        />
        <LayerButton
          active={layerVisibility === "zones"}
          onClick={() => setLayerVisibility("zones")}
          icon={MapIcon}
          title="Zones Only"
          ariaLabel="Show zones only"
        />
        <LayerButton
          active={layerVisibility === "none"}
          onClick={() => setLayerVisibility("none")}
          icon={EyeOff}
          title="Hide All"
          ariaLabel="Hide all layers"
        />
      </div>

      {/* Desktop-only Orbit Button */}
      {viewMode === "satellite" && (
        <button
          onClick={toggleOrbit}
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
          onClick={on3DToggle}
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

      {/* Reset / Home */}
      <button
        onClick={onReset}
        className="text-volcanic-gray rounded-2xl border border-white/50 bg-white/80 p-3 shadow-lg backdrop-blur-md transition-colors hover:bg-white"
        aria-label="Reset map to home view"
      >
        <Home size={20} />
      </button>
    </div>
  );
}

// --- Internal sub-component to reduce repetition in layer buttons ---

function LayerButton({
  active,
  onClick,
  icon: Icon,
  title,
  ariaLabel,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Layers;
  title: string;
  ariaLabel: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl p-2 transition-all",
        active
          ? "bg-ocean-blue text-white shadow-sm"
          : "text-volcanic-gray hover:bg-background-secondary"
      )}
      title={title}
      aria-label={ariaLabel}
      aria-pressed={active}
    >
      <Icon size={20} />
    </button>
  );
}
