"use client";

import { AnimatePresence } from "framer-motion";

import {
  EventHero,
  EventFilters,
  EventGrid,
  FeaturedEvent,
  SubmitEventCTA,
  useEventFilters,
  EVENTS_DATA,
} from "@/features/events";

/**
 * EventsPage - Main events listing page
 *
 * Displays event calendar with search, filtering, and featured events.
 * Uses the events feature module for all components and logic.
 */
export default function EventsPage() {
  const {
    filterType,
    searchQuery,
    filteredEvents,
    featuredEvent,
    setFilterType,
    setSearchQuery,
    showFeatured,
  } = useEventFilters({ events: EVENTS_DATA });

  return (
    <div className="bg-off-white min-h-screen font-sans">
      {/* 1. HERO HEADER */}
      <EventHero />

      {/* 2. SEARCH & FILTERS */}
      <EventFilters
        filterType={filterType}
        searchQuery={searchQuery}
        onFilterChange={setFilterType}
        onSearchChange={setSearchQuery}
      />

      <div className="container mx-auto px-4 py-12">
        {/* 3. FEATURED EVENT (Only show if no search/filter active) */}
        <AnimatePresence>
          {showFeatured && featuredEvent && (
            <FeaturedEvent event={featuredEvent} />
          )}
        </AnimatePresence>

        {/* 4. EVENT LIST GRID */}
        <EventGrid events={filteredEvents} filterType={filterType} />

        {/* 5. CTA: SUBMIT EVENT */}
        <SubmitEventCTA />
      </div>
    </div>
  );
}
