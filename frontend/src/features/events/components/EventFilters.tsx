"use client";

import { Search } from "lucide-react";
import { motion } from "framer-motion";

import type { EventFilterType } from "../types";

interface EventFiltersProps {
  filterType: EventFilterType;
  searchQuery: string;
  onFilterChange: (type: EventFilterType) => void;
  onSearchChange: (query: string) => void;
}

/**
 * EventFilters - Search and filter controls for events
 *
 * Provides search input and filter tabs for event types.
 */
export function EventFilters({
  filterType,
  searchQuery,
  onFilterChange,
  onSearchChange,
}: EventFiltersProps) {
  // Only show main filter options (exclude Sports for cleaner UI)
  const displayOptions: EventFilterType[] = [
    "All",
    "Festival",
    "Music",
    "Religious",
    "Community",
    "Diaspora",
  ];

  return (
    <section className="border-border-secondary sticky top-0 z-30 border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="group relative w-full md:w-96"
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="group-focus-within:text-ocean-blue text-basalt-500 h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search events or locations..."
              className="border-border-primary bg-background-secondary focus:ring-ocean-blue focus:border-ocean-blue placeholder-basalt-500 block w-full rounded-lg border py-2 pr-3 pl-10 leading-5 transition-all focus:bg-white focus:ring-1 focus:outline-none sm:text-sm"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="no-scrollbar flex w-full gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0"
          >
            {displayOptions.map((type) => (
              <button
                key={type}
                onClick={() => onFilterChange(type)}
                className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  filterType === type
                    ? "bg-ocean-blue text-white shadow-md"
                    : "text-text-secondary border-border-secondary hover:bg-mist-50 dark:hover:bg-basalt-800/50 dark:bg-basalt-800 border bg-white"
                }`}
              >
                {type}
              </button>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
