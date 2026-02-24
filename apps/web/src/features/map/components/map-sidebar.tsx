"use client";

import { Search, X, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useMapSearchQuery,
  useActiveCategory,
  useSelectedLocation,
  useShowSidebar,
  useMapStore,
} from "@/stores/mapStore";
import { useFilteredLocations } from "../hooks/useFilteredLocations";
import { CATEGORIES } from "../data/categories";
import type { Location } from "../data/types";
import { CategoryPill } from "./category-pill";
import { LocationCard } from "./location-card";

interface MapSidebarProps {
  onFlyTo: (location: Location) => void;
}

export function MapSidebar({ onFlyTo }: MapSidebarProps) {
  const searchQuery = useMapSearchQuery();
  const activeCategory = useActiveCategory();
  const selectedLocation = useSelectedLocation();
  const showSidebar = useShowSidebar();
  const setSearchQuery = useMapStore((s) => s.setSearchQuery);
  const setActiveCategory = useMapStore((s) => s.setActiveCategory);
  const toggleSidebar = useMapStore((s) => s.toggleSidebar);
  const filteredLocations = useFilteredLocations();

  return (
    <div
      className={cn(
        "border-border-primary absolute top-0 bottom-0 left-0 z-30 flex w-full flex-col border-r bg-white/95 font-sans shadow-2xl backdrop-blur-xl transition-transform duration-500 ease-in-out dark:border-white/10 dark:bg-black/40 md:w-[420px]",
        !showSidebar && "-translate-x-full"
      )}
    >
      <div className="h-24 shrink-0 md:h-28" />
      <div className="shrink-0 px-6 pb-2">
        <div className="relative mb-6" role="search">
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
            onClick={() => onFlyTo(loc)}
          />
        ))}
      </div>
      <button
        onClick={toggleSidebar}
        className="border-border-primary text-text-tertiary hover:text-ocean-blue absolute top-1/2 -right-6 hidden h-24 w-6 items-center justify-center rounded-r-xl border border-l-0 bg-white/90 shadow-sm backdrop-blur transition-all hover:bg-white dark:border-white/10 dark:bg-black/40 dark:hover:bg-black/60 md:flex"
      >
        {showSidebar ? (
          <div className="bg-border-primary h-8 w-1 rounded-full" />
        ) : (
          <div className="bg-ocean-blue h-8 w-1 rounded-full" />
        )}
      </button>
    </div>
  );
}
