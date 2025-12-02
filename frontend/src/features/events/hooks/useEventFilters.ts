"use client";

import { useState, useMemo } from "react";
import type { Event, EventFilterType } from "../types";

interface UseEventFiltersOptions {
  events: Event[];
}

interface UseEventFiltersReturn {
  filterType: EventFilterType;
  searchQuery: string;
  filteredEvents: Event[];
  featuredEvent: Event | undefined;
  setFilterType: (type: EventFilterType) => void;
  setSearchQuery: (query: string) => void;
  showFeatured: boolean;
}

/**
 * useEventFilters - Hook for managing event filtering state
 *
 * Provides filter state, search state, and computed filtered events.
 */
export function useEventFilters({
  events,
}: UseEventFiltersOptions): UseEventFiltersReturn {
  const [filterType, setFilterType] = useState<EventFilterType>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesType = filterType === "All" || event.type === filterType;
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [events, filterType, searchQuery]);

  const featuredEvent = useMemo(() => {
    return events.find((e) => e.isFeatured);
  }, [events]);

  const showFeatured = !!featuredEvent && filterType === "All" && !searchQuery;

  return {
    filterType,
    searchQuery,
    filteredEvents,
    featuredEvent,
    setFilterType,
    setSearchQuery,
    showFeatured,
  };
}
