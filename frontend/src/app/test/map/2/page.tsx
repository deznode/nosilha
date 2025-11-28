"use client";

import { useState, useEffect, useMemo } from "react";
// In your real project, uncomment these:
// import Map, { Marker, Popup, NavigationControl, GeolocateControl, ScaleControl } from "react-map-gl";
// import "mapbox-gl/dist/mapbox-gl.css";
// import { getEntriesForMap } from "@/lib/api";
// import { useSelectedCategories } from "@/stores/filterStore";

// --- MOCK DATA FOR PREVIEW (Replace with API call in production) ---
const MOCK_ENTRIES = [
  {
    id: "1",
    name: "Kaza d'Pico",
    category: "Restaurant",
    latitude: 14.868,
    longitude: -24.698,
    slug: "kaza-dpico",
    description: "Traditional Cape Verdean cuisine with a view.",
  },
  {
    id: "2",
    name: "Hotel Cruz Grande",
    category: "Hotel",
    latitude: 14.871,
    longitude: -24.695,
    slug: "hotel-cruz-grande",
    description: "Comfortable stay in the heart of Nova Sintra.",
  },
  {
    id: "3",
    name: "Fajã d'Água Beach",
    category: "Beach",
    latitude: 14.889,
    longitude: -24.743,
    slug: "faja-dagua",
    description: "Beautiful natural pools and scenic bay.",
  },
  {
    id: "4",
    name: "Fontainhas",
    category: "Landmark",
    latitude: 14.855,
    longitude: -24.71,
    slug: "fontainhas",
    description: "Historic mountain village with stunning views.",
  },
  {
    id: "5",
    name: "O Castelo",
    category: "Restaurant",
    latitude: 14.87,
    longitude: -24.701,
    slug: "o-castelo",
    description: "Fine dining with local ingredients.",
  },
];

const ALL_CATEGORIES = ["Restaurant", "Hotel", "Beach", "Landmark"];

// --- INLINE COMPONENTS (Move these to separate files in production) ---

function CategoryMarkerIcon({ category }: { category: string }) {
  const colors: Record<string, string> = {
    Restaurant: "bg-orange-500",
    Hotel: "bg-blue-600",
    Beach: "bg-yellow-400",
    Landmark: "bg-purple-600",
  };

  const icons: Record<string, React.ReactNode> = {
    Restaurant: (
      <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.83 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
    ),
    Hotel: (
      <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" />
    ),
    Beach: (
      <path d="M21 19v-2h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.66 0-3 1.34-3 3 0 .35.07.69.18 1H11c.33-1 .5-2.05.5-3.13 0-4.04-2.88-7.46-6.73-8.23C5.39 3.09 6.16 2 7 2h7c2.76 0 5 2.24 5 5v3h2v9h-2z" />
    ),
    Landmark: (
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    ),
  };

  return (
    <div
      className={`${colors[category] || "bg-gray-500"} transform rounded-full p-2 text-white shadow-lg transition-transform hover:scale-110`}
    >
      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
        {icons[category]}
      </svg>
    </div>
  );
}

function MapFilterControl({
  categories,
  selected,
  onToggle,
}: {
  categories: string[];
  selected: string[];
  onToggle: (c: string) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white/90 p-3 shadow-lg backdrop-blur-sm">
      <h4 className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
        Filters
      </h4>
      <div className="space-y-2">
        {categories.map((cat) => (
          <label
            key={cat}
            className="group flex cursor-pointer items-center space-x-2"
          >
            <div
              className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${selected.includes(cat) ? "bg-ocean-blue border-ocean-blue" : "border-gray-300"}`}
            >
              {selected.includes(cat) && (
                <svg
                  className="h-3 w-3 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              className="hidden"
              checked={selected.includes(cat)}
              onChange={() => onToggle(cat)}
            />
            <span
              className={`text-sm ${selected.includes(cat) ? "font-medium text-gray-900" : "text-gray-500"}`}
            >
              {cat}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function MapStyleSwitcher({
  currentStyle,
  onStyleChange,
}: {
  currentStyle: string;
  onStyleChange: (s: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const styles = [
    { id: "streets", label: "Streets" },
    { id: "satellite", label: "Satellite" },
    { id: "outdoors", label: "Outdoors" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-white/90 px-3 py-2 text-sm font-medium shadow-lg backdrop-blur-sm transition-colors hover:bg-gray-50"
      >
        <svg
          className="text-ocean-blue h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.806-.984A1 1 0 0121 6.382V7.618a1 1 0 01-1.447-.894L15 7m0 13V7"
          />
        </svg>
        <span>{styles.find((s) => s.id === currentStyle)?.label}</span>
        <svg
          className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
        <div className="absolute top-full left-0 z-20 mt-2 w-32 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-xl">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => {
                onStyleChange(style.id);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${currentStyle === style.id ? "text-ocean-blue bg-blue-50 font-semibold" : "text-gray-700"}`}
            >
              {style.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- MAIN COMPONENT ---

export function InteractiveMap() {
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(ALL_CATEGORIES);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [mapStyle, setMapStyle] = useState("streets");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredEntries = useMemo(() => {
    return MOCK_ENTRIES.filter((entry) =>
      selectedCategories.includes(entry.category)
    );
  }, [selectedCategories]);

  const handleToggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // --- SIMULATED MAP RENDERER (For Preview Only) ---
  // In production, this entire div is replaced by the <Map> component

  // Helper to map lat/long to x/y percentage for a static "Brava" representation
  // Bounding box approx: Lat 14.85 to 14.90, Long -24.75 to -24.68
  const getPosition = (lat: number, lon: number) => {
    const minLat = 14.84,
      maxLat = 14.91;
    const minLon = -24.76,
      maxLon = -24.67;

    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    const x = ((lon - minLon) / (maxLon - minLon)) * 100;
    return { x, y };
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-gray-100 font-sans shadow-inner">
      {/* 1. Map Layer (Simulated) */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          mapStyle === "satellite"
            ? "bg-slate-900"
            : mapStyle === "outdoors"
              ? "bg-[#e4eadf]"
              : "bg-[#f0f0f0]"
        }`}
      >
        {/* Placeholder Terrain/Grid Lines */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>

        {/* Stylized Island Shape (CSS Only representation of Brava) */}
        <div className="bg-ocean-blue absolute top-1/2 left-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 transform rounded-[40%_60%_70%_30%/40%_50%_60%_50%] opacity-30 blur-3xl"></div>
        <div className="absolute right-4 bottom-4 font-mono text-xs text-gray-400">
          Interactive Map Preview Mode
        </div>
      </div>

      {/* 2. Controls Layer */}
      <div className="absolute top-4 left-4 z-10">
        <MapStyleSwitcher currentStyle={mapStyle} onStyleChange={setMapStyle} />
      </div>

      <div className="absolute top-4 right-4 z-10">
        <MapFilterControl
          categories={ALL_CATEGORIES}
          selected={selectedCategories}
          onToggle={handleToggleCategory}
        />
      </div>

      <div className="absolute right-4 bottom-4 z-10 flex flex-col space-y-2">
        <button
          className="rounded bg-white p-2 text-gray-700 shadow hover:bg-gray-50"
          title="Find Me"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
        <div className="flex flex-col rounded bg-white shadow">
          <button className="border-b p-2 text-gray-700 hover:bg-gray-50">
            +
          </button>
          <button className="p-2 text-gray-700 hover:bg-gray-50">-</button>
        </div>
      </div>

      {/* 3. Markers Layer */}
      <div className="pointer-events-none absolute inset-0">
        {filteredEntries.map((entry) => {
          const { x, y } = getPosition(entry.latitude, entry.longitude);
          const isSelected = selectedEntry?.id === entry.id;

          return (
            <div
              key={entry.id}
              className="pointer-events-auto absolute -translate-x-1/2 -translate-y-full transform transition-all duration-300"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                zIndex: isSelected ? 50 : 10,
              }}
            >
              <button
                onClick={() => setSelectedEntry(entry)}
                className="group relative focus:outline-none"
              >
                <CategoryMarkerIcon category={entry.category} />
                {/* Tooltip on hover */}
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-black/75 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {entry.name}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* 4. Popup Layer */}
      {selectedEntry && (
        <div className="animate-fade-in absolute top-1/2 left-1/2 z-50 w-64 -translate-x-1/2 -translate-y-1/2 transform rounded-lg border border-gray-100 bg-white p-4 shadow-2xl">
          <div className="mb-2 flex items-start justify-between">
            <span className="bg-ocean-blue/10 text-ocean-blue rounded-full px-2 py-0.5 text-xs font-bold uppercase">
              {selectedEntry.category}
            </span>
            <button
              onClick={() => setSelectedEntry(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <h3 className="mb-1 text-lg font-bold text-gray-900">
            {selectedEntry.name}
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            {selectedEntry.description}
          </p>
          <button className="bg-ocean-blue w-full rounded py-2 text-sm font-medium text-white transition-colors hover:bg-[#004a6e]">
            View Details
          </button>
        </div>
      )}

      {/* 5. Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="border-t-ocean-blue mb-3 h-10 w-10 animate-spin rounded-full border-4 border-gray-200"></div>
          <p className="text-ocean-blue animate-pulse text-sm font-semibold">
            Loading Brava Map...
          </p>
        </div>
      )}
    </div>
  );
}

export default function TestMap2Page() {
  return (
    <div className="h-screen w-full">
      <InteractiveMap />
    </div>
  );
}
