"use client";

import { useMemo, type ReactNode } from "react";
import { FilterChip } from "@/components/ui/filter-chip";
import { statusVar, type DocumentationStatus } from "@/lib/status";
import { useMapStore, useModeItems, useSelectedKey } from "@/stores/mapStore";
import { statusCounts } from "../data/locations-adapter";
import { listFooter } from "../data/map-copy";
import type { MapItem, MapMode, StatusFilter } from "../data/types";
import { useFilteredLocations } from "../hooks/useFilteredLocations";
import { LocationCard } from "./location-card";

const MODES: { mode: MapMode; label: string }[] = [
  { mode: "settlements", label: "Settlements" },
  { mode: "records", label: "Place records" },
  { mode: "photographs", label: "Photographs" },
];

const CHIPS: { status: StatusFilter; label: string }[] = [
  { status: "all", label: "All" },
  { status: "documented", label: "Documented" },
  { status: "partial", label: "No photograph" },
  { status: "name", label: "Name only" },
];

function ChipDot({ status }: { status: StatusFilter }) {
  return (
    <span
      aria-hidden
      className="inline-block size-[7px] rounded-full"
      style={{
        background:
          status === "all"
            ? "var(--foreground-secondary)"
            : statusVar(status as DocumentationStatus),
      }}
    />
  );
}

interface MapSidebarProps {
  onSelect: (item: MapItem) => void;
  /** Shown above the tabs — the bottom sheet's grabber on a narrow screen. */
  header?: ReactNode;
}

/**
 * Mode tabs, search, status chips and the list, with its footer. The same body sits in
 * the desktop column and in the narrow bottom sheet. Spec 034 FR-011.
 */
export function MapSidebar({ onSelect, header }: MapSidebarProps) {
  const mode = useMapStore((s) => s.mode);
  const status = useMapStore((s) => s.status);
  const query = useMapStore((s) => s.query);
  const fetchError = useMapStore((s) => s.fetchError);
  const isLoading = useMapStore((s) => s.isLoading);
  const modeCounts: Record<MapMode, number> = {
    settlements: useMapStore((s) => s.settlements.length),
    records: useMapStore((s) => s.records.length),
    photographs: useMapStore((s) => s.photos.length),
  };
  const setMode = useMapStore((s) => s.setMode);
  const setStatus = useMapStore((s) => s.setStatus);
  const setQuery = useMapStore((s) => s.setQuery);
  const selectedKey = useSelectedKey();
  const modeItems = useModeItems();
  const visible = useFilteredLocations();

  const counts = useMemo(() => statusCounts(modeItems), [modeItems]);
  const ready = !isLoading && !fetchError;

  return (
    <>
      {header}
      <div
        className="border-b px-[18px] pt-[18px] pb-3.5"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div
          role="group"
          aria-label="Map mode"
          className="mb-3.5 flex gap-1 rounded-[10px] border p-[3px]"
          style={{
            background: "var(--card)",
            borderColor: "var(--border-subtle)",
          }}
        >
          {MODES.map(({ mode: key, label }) => {
            const active = mode === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setMode(key)}
                className="flex flex-1 cursor-pointer flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-xs"
                style={{
                  background: active ? "var(--border-subtle)" : "transparent",
                  color: active
                    ? "var(--foreground)"
                    : "var(--foreground-secondary)",
                }}
              >
                <span>{label}</span>
                <span className="text-[10px] tabular-nums opacity-65">
                  {ready ? modeCounts[key] : "–"}
                </span>
              </button>
            );
          })}
        </div>

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Brava…"
          aria-label="Search Brava"
          className="w-full rounded-[10px] border px-3 py-2.5 text-[13px] outline-none focus:border-[var(--brand-ocean-blue)]"
          style={{
            background: "var(--card)",
            borderColor: "var(--border-subtle)",
            color: "var(--foreground)",
          }}
        />

        <div
          role="group"
          aria-label="Filter by status"
          className="mt-3 flex flex-wrap gap-1.5"
        >
          {CHIPS.map(({ status: key, label }) => (
            <FilterChip
              key={key}
              label={label}
              icon={<ChipDot status={key} />}
              count={
                ready
                  ? key === "all"
                    ? modeItems.length
                    : counts[key as DocumentationStatus]
                  : undefined
              }
              showZero
              active={status === key}
              aria-pressed={status === key}
              onClick={() => setStatus(key)}
            />
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
        {fetchError && (
          <p
            role="alert"
            className="px-[11px] py-3 text-[13px]"
            style={{ color: "var(--brand-sobrado-ochre)" }}
          >
            {fetchError}
          </p>
        )}
        {ready && visible.length === 0 && (
          <p
            className="px-[11px] py-3 text-[13px]"
            style={{ color: "var(--foreground-secondary)" }}
          >
            Nothing on the map matches that.
          </p>
        )}
        {visible.map((item) => (
          <LocationCard
            key={item.key}
            item={item}
            active={item.key === selectedKey}
            onSelect={onSelect}
          />
        ))}
        {ready && (
          <p
            className="px-[11px] pt-3 pb-5 text-[11px] leading-normal"
            style={{ color: "var(--foreground-secondary)" }}
          >
            {listFooter(mode, modeItems)}
          </p>
        )}
      </div>
    </>
  );
}
