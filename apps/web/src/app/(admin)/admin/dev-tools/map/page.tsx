"use client";

import { useState } from "react";

type MapStyle = "streets" | "satellite" | "outdoors";

interface MapStyleSwitcherProps {
  currentStyle: string;
  onStyleChange: (style: string) => void;
}

const STYLES: { id: MapStyle; label: string; url: string }[] = [
  {
    id: "streets",
    label: "Streets",
    url: "mapbox://styles/mapbox/streets-v12",
  },
  {
    id: "outdoors",
    label: "Outdoors",
    url: "mapbox://styles/mapbox/outdoors-v12",
  },
  {
    id: "satellite",
    label: "Satellite",
    url: "mapbox://styles/mapbox/satellite-streets-v12",
  },
];

export function MapStyleSwitcher({
  currentStyle,
  onStyleChange,
}: MapStyleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Find the label of the current style
  const activeLabel =
    STYLES.find((s) => s.url === currentStyle)?.label || "Map Style";

  return (
    <div className="bg-background-primary/90 absolute top-4 left-4 z-10 flex flex-col rounded-md shadow-md backdrop-blur-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-text-primary hover:bg-background-tertiary border-border-secondary flex items-center justify-between space-x-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="text-ocean-blue h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M4.649 3.084A1 1 0 015.163 2h9.673a1 1 0 01.514 1.084l-2.224 4.448a1 1 0 01-.894.553H7.768a1 1 0 01-.894-.553L4.65 3.084zM4.15 14a1 1 0 100 2h.025a1 1 0 100-2H4.15zm11.675 0a1 1 0 100 2h.025a1 1 0 100-2h-.025zM2 13a2 2 0 114 0 2 2 0 01-4 0zm14 0a2 2 0 114 0 2 2 0 01-4 0z"
              clipRule="evenodd"
            />
            <path d="M5.5 8.5a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5h-1zm9 0a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5h-1z" />
          </svg>
          {activeLabel}
        </span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="border-border-secondary bg-background-primary absolute top-full mt-1 w-full overflow-hidden rounded-md border shadow-lg">
          {STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => {
                onStyleChange(style.url);
                setIsOpen(false);
              }}
              className={`text-text-primary hover:bg-background-tertiary block w-full px-4 py-2 text-left text-sm ${
                currentStyle === style.url
                  ? "bg-ocean-blue/10 text-ocean-blue font-semibold"
                  : ""
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TestMapPage() {
  return (
    <div className="h-screen w-full p-8">
      <h1 className="mb-4 text-2xl font-bold">Map Style Switcher Test</h1>
      <div className="bg-mist-100 relative h-96 w-full rounded-lg border">
        <MapStyleSwitcher
          currentStyle="mapbox://styles/mapbox/streets-v12"
          onStyleChange={(style) => console.log("Style changed:", style)}
        />
      </div>
    </div>
  );
}
