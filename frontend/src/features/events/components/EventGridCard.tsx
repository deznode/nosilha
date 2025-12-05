"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

import type { Event } from "../types";
import { EventTypeBadge } from "./EventTypeBadge";

interface EventGridCardProps {
  event: Event;
}

/**
 * EventGridCard - Full event card for grid layouts
 *
 * Displays event image, type badge, date, time, location, and description.
 */
export function EventGridCard({ event }: EventGridCardProps) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group border-border-secondary flex h-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Card Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
        <div className="absolute top-3 left-3">
          <EventTypeBadge type={event.type} />
        </div>
      </div>

      {/* Date Badge (Left Side Layout) */}
      <div className="flex flex-grow">
        <div className="bg-off-white border-border-secondary flex w-16 flex-col items-center justify-start border-r pt-6 text-center">
          <span className="text-ocean-blue text-xs font-bold tracking-wider uppercase">
            {new Date(event.date).toLocaleDateString("en-US", {
              month: "short",
            })}
          </span>
          <span className="text-text-primary font-serif text-2xl font-bold">
            {new Date(event.date).getDate()}
          </span>
        </div>

        {/* Content */}
        <div className="flex-grow p-5">
          <h3 className="text-text-primary group-hover:text-ocean-blue mb-2 line-clamp-2 text-lg font-bold transition-colors">
            {event.title}
          </h3>
          <div className="text-text-secondary mb-4 space-y-2 text-sm">
            <div className="flex items-center">
              <Clock className="mr-2 h-3.5 w-3.5 opacity-70" /> {event.time}
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 h-3.5 w-3.5 opacity-70" />{" "}
              {event.location}
            </div>
          </div>
          <p className="text-basalt-500 line-clamp-2 text-sm">
            {event.description}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="bg-off-white border-border-secondary text-ocean-blue flex items-center justify-between border-t px-5 py-3 text-xs font-semibold">
        <span>View Details</span>
        <ChevronRight
          size={14}
          className="transition-transform group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}

/**
 * Animated wrapper for EventGridCard with stagger animation support
 */
export function AnimatedEventGridCard({ event }: EventGridCardProps) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={itemVariants}>
      <EventGridCard event={event} />
    </motion.div>
  );
}
