"use client";

import Image from "next/image";
import { Calendar, Clock, MapPin, Star, Share2 } from "lucide-react";
import { motion } from "framer-motion";

import type { Event } from "../types";
import { EventTypeBadge } from "./EventTypeBadge";

interface FeaturedEventProps {
  event: Event;
}

/**
 * FeaturedEvent - Large featured event card
 *
 * Displays a prominently styled event with large image and full details.
 */
export function FeaturedEvent({ event }: FeaturedEventProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-16"
    >
      <h2 className="text-text-primary mb-6 flex items-center font-serif text-2xl font-bold">
        <Star className="text-sobrado-ochre fill-sobrado-ochre mr-2" /> Featured
        Event
      </h2>
      <div className="border-border-secondary flex flex-col overflow-hidden rounded-2xl border bg-white shadow-lg md:flex-row">
        <div className="relative h-64 md:h-auto md:w-2/3">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute top-4 left-4">
            <span className="bg-sobrado-ochre text-ocean-blue rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase shadow-md">
              Don't Miss
            </span>
          </div>
        </div>
        <div className="to-mist-50 flex flex-col justify-center bg-gradient-to-br from-white p-8 md:w-1/3">
          <EventTypeBadge type={event.type} />
          <h3 className="text-text-primary mt-4 mb-2 font-serif text-3xl font-bold">
            {event.title}
          </h3>
          <div className="text-text-secondary mb-6 space-y-3">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />{" "}
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" /> {event.time}
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" /> {event.location}
            </div>
          </div>
          <p className="text-basalt-500 mb-6 line-clamp-3">
            {event.description}
          </p>
          <div className="flex gap-3">
            <button className="bg-ocean-blue hover:bg-ocean-blue/90 flex-1 rounded-lg px-4 py-3 font-bold text-white transition-colors">
              Event Details
            </button>
            <button className="border-border-primary text-text-secondary hover:bg-mist-50 rounded-lg border p-3">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
