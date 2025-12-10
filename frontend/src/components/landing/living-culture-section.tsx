"use client";

import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { KrioluProverbCard } from "./kriolu-proverb-card";
import { WeatherWidget } from "./weather-widget";
import { EventCard, type EventItem } from "@/features/events";
import type { KrioluProverb, WeatherData } from "@/types/landing";
import { springs, stagger } from "@/lib/animation/tokens";

interface LivingCultureSectionProps {
  events?: EventItem[];
  proverb?: KrioluProverb;
  weather?: WeatherData;
}

const defaultEvents: EventItem[] = [
  {
    id: "e1",
    day: "24",
    month: "JUN",
    title: "Festa de São João",
    location: "Vila Nova Sintra",
    type: "Festival",
  },
  {
    id: "e2",
    day: "15",
    month: "JUL",
    title: "Morna Night",
    location: "Furna Port",
    type: "Music",
  },
  {
    id: "e3",
    day: "02",
    month: "AUG",
    title: "Diaspora Meetup",
    location: "Eugénio Tavares Sq.",
    type: "Community",
  },
];

const defaultProverb: KrioluProverb = {
  proverb: "Quem ca ta concheu, ca ta respeitau.",
  translation: "Those who do not know you, cannot respect you.",
  href: "/language",
};

const defaultWeather: WeatherData = {
  temperature: "24°C",
  location: "Nova Sintra, Brava",
  condition: "partly-cloudy",
};

// Animation variants with spring physics for smooth, natural motion
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.default,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: springs.snappy,
  },
};

// Right column uses x-axis entrance (intentional design choice)
const slideInVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: springs.snappy,
  },
};

// Simplified variants for users who prefer reduced motion
const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

/**
 * LivingCultureSection - Events + Language + Weather
 *
 * Two-column layout with upcoming events on the left,
 * and Kriolu proverb + weather widget on the right.
 * Now features micro-interactions and scroll reveals.
 */
export function LivingCultureSection({
  events = defaultEvents,
  proverb = defaultProverb,
  weather = defaultWeather,
}: LivingCultureSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const activeCardVariants = shouldReduceMotion
    ? reducedMotionVariants
    : cardVariants;
  const activeSlideVariants = shouldReduceMotion
    ? reducedMotionVariants
    : slideInVariants;

  return (
    <section className="bg-background-primary border-border-secondary border-y py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-12 lg:flex-row">
          {/* Left: Upcoming Events */}
          <div className="lg:w-2/3">
            <div className="mb-8 flex items-center justify-between">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={activeSlideVariants}
              >
                <div className="text-ocean-blue mb-2 flex items-center space-x-2 text-sm font-bold tracking-widest uppercase">
                  <Calendar className="h-4 w-4" />
                  <span>Island Rhythm</span>
                </div>
                <h3 className="text-text-primary font-serif text-3xl font-bold">
                  Upcoming Events
                </h3>
              </motion.div>
              <Link
                href="/events"
                className="text-ocean-blue hidden text-sm font-bold hover:underline sm:block"
              >
                View Full Calendar
              </Link>
            </div>

            {/* Events Grid with container stagger animation */}
            <motion.div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  variants={activeCardVariants}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : { y: -4, transition: springs.hover }
                  }
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
              <motion.div
                variants={activeCardVariants}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : { scale: 1.02, transition: springs.hover }
                }
              >
                <Link
                  href="/events"
                  className="border-border-secondary text-text-secondary hover:text-ocean-blue hover:border-ocean-blue group flex h-full items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors"
                >
                  <span className="flex items-center font-medium">
                    View All Events{" "}
                    <ArrowRight
                      size={16}
                      className="ml-2 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Right: Kriolu Corner + Weather Widget */}
          <motion.div
            className="flex flex-col gap-6 lg:w-1/3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div
              variants={activeSlideVariants}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : { scale: 1.02, transition: springs.hover }
              }
            >
              <KrioluProverbCard {...proverb} />
            </motion.div>
            <motion.div
              variants={activeSlideVariants}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : { scale: 1.02, transition: springs.hover }
              }
            >
              <WeatherWidget {...weather} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
