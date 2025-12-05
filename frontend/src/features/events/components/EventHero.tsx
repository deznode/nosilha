"use client";

import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

/**
 * EventHero - Hero section for the events page
 *
 * Displays the main heading and description for the events calendar.
 */
export function EventHero() {
  return (
    <section className="bg-ocean-blue relative overflow-hidden py-20 text-white">
      {/* Abstract Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sobrado-ochre mb-4 inline-flex items-center space-x-2 font-bold tracking-widest uppercase"
        >
          <Calendar className="h-5 w-5" />
          <span>Island & Diaspora Calendar</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 font-serif text-4xl font-bold md:text-6xl"
        >
          Celebrate Life in Brava
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto max-w-2xl text-xl leading-relaxed text-white/80"
        >
          From the rhythmic drums of São João to diaspora gatherings in the US
          and Europe, discover the events that connect our global community.
        </motion.p>
      </div>
    </section>
  );
}
