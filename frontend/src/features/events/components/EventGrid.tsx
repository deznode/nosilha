"use client";

import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

import type { Event, EventFilterType } from "../types";
import { AnimatedEventGridCard } from "./EventGridCard";

interface EventGridProps {
  events: Event[];
  filterType: EventFilterType;
}

/**
 * EventGrid - Grid layout for displaying events
 *
 * Displays events in a responsive grid with stagger animations.
 * Shows empty state when no events match filters.
 */
export function EventGrid({ events, filterType }: EventGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const title =
    filterType === "All" ? "Upcoming Events" : `${filterType} Events`;

  if (events.length === 0) {
    return (
      <div>
        <h2 className="text-text-primary mb-6 font-serif text-2xl font-bold">
          {title}
        </h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-border-primary rounded-xl border border-dashed bg-white py-20 text-center"
        >
          <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h3 className="text-text-primary text-lg font-medium">
            No events found
          </h3>
          <p className="text-text-secondary">
            Try adjusting your search or filter.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-text-primary mb-6 font-serif text-2xl font-bold">
        {title}
      </h2>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {events.map((event) => (
          <AnimatedEventGridCard key={event.id} event={event} />
        ))}
      </motion.div>
    </div>
  );
}
