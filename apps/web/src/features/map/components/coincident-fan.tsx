"use client";

import type { KeyboardEvent } from "react";
import { clsx } from "clsx";
import type { Location } from "../data/types";

/** Distance from the shared point to each fanned pin's centre, in pixels. */
const FAN_RADIUS = 46;

interface CoincidentFanProps {
  locations: Location[];
  expanded: boolean;
  selectedId: string | null;
  onToggle: () => void;
  onSelect: (location: Location) => void;
  onCollapse: () => void;
}

/**
 * Records at one exact point, fanned out in pixel space so each stays clickable.
 *
 * Rendered inside a map `Marker`, which MapLibre repositions natively as the map moves,
 * so the fan's fixed pixel offsets need no reprojection. Spec 033 FR-012.
 */
export function CoincidentFan({
  locations,
  expanded,
  selectedId,
  onToggle,
  onSelect,
  onCollapse,
}: CoincidentFanProps) {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && expanded) {
      event.stopPropagation();
      onCollapse();
    }
  };

  return (
    <div className="relative size-11" onKeyDown={handleKeyDown}>
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={`${locations.length} records at one point`}
        onClick={onToggle}
        className="focus-ring bg-basalt-800/85 shadow-floating flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-white text-sm font-bold text-white"
      >
        {locations.length}
      </button>

      {expanded &&
        locations.map((location, index) => {
          // Start at nine o'clock so a pair sits either side of the point.
          const angle = Math.PI + (2 * Math.PI * index) / locations.length;
          const x = Math.round(Math.cos(angle) * FAN_RADIUS);
          const y = Math.round(Math.sin(angle) * FAN_RADIUS);
          const Icon = location.icon;
          const isSelected = location.id === selectedId;

          return (
            <button
              key={location.id}
              type="button"
              aria-label={`${location.name}, ${location.status.label}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(location)}
              className={clsx(
                "focus-ring absolute top-1/2 left-1/2 flex size-10 cursor-pointer items-center justify-center rounded-full border-[3px] border-white shadow-[0_8px_16px_rgba(0,0,0,0.3)]",
                isSelected && "ring-basalt-800 ring-2 ring-offset-2"
              )}
              style={{
                backgroundColor: location.color,
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
            >
              <Icon
                className="text-white drop-shadow-md"
                size={18}
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </button>
          );
        })}
    </div>
  );
}
