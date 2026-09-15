"use client";

import { clsx } from "clsx";
import { STATUS_CONFIG, type DocumentationStatus } from "@/lib/status";
import { STATUS_PIN_COLOR } from "../data/locations-adapter";
import type { Location, MapMode } from "../data/types";

// Settlements word their keys from the status table. Place records word them as
// `getEntryStatus` does, and have no partial state.
const KEYS: Record<MapMode, { status: DocumentationStatus; label: string }[]> =
  {
    settlements: (["documented", "partial", "name"] as const).map((status) => ({
      status,
      label: STATUS_CONFIG[status].label,
    })),
    places: [
      { status: "documented", label: "has a photograph" },
      { status: "name", label: "no photograph" },
    ],
  };

const NOUN: Record<MapMode, [singular: string, plural: string]> = {
  settlements: ["settlement", "settlements"],
  places: ["record", "records"],
};

interface MapLegendProps {
  mode: MapMode;
  /** Every location in the current mode, unfiltered, so the counts are the archive's. */
  locations: Location[];
  className?: string;
}

/**
 * The pin colour key, in its own strip below the map above a hairline rule, so it
 * never covers a pin. Counts are live. Spec 033 FR-012.
 */
export function MapLegend({ mode, locations, className }: MapLegendProps) {
  const [singular, plural] = NOUN[mode];

  return (
    <div
      className={clsx(
        "border-hairline bg-surface shrink-0 border-t px-4 py-3",
        className
      )}
    >
      <ul
        aria-label="Pin colour key"
        className="flex flex-wrap items-center gap-x-5 gap-y-1.5"
      >
        {KEYS[mode].map(({ status, label }) => {
          const count = locations.filter(
            (location) => location.status.status === status
          ).length;

          return (
            <li
              key={status}
              className="text-body flex items-center gap-2 text-xs"
            >
              <span
                data-legend-dot
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: STATUS_PIN_COLOR[status] }}
              />
              <span>{label}</span>
              <span className="text-muted">{`${count} ${count === 1 ? singular : plural}`}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
