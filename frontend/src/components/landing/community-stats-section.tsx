"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { BookOpen, MapPin, Sparkles, Users } from "lucide-react";
import { SectionHeader } from "./section-header";
import clsx from "clsx";
import { springs, stagger } from "@/lib/animation/tokens";

const visionPillars = [
  {
    label: "Stories",
    icon: BookOpen,
    description: "Preserving oral histories",
    color: "text-bougainvillea-pink",
    bg: "bg-bougainvillea-pink/10",
    hoverBorder: "hover:border-bougainvillea-pink/20",
  },
  {
    label: "Places",
    icon: MapPin,
    description: "Mapping our heritage",
    color: "text-valley-green",
    bg: "bg-valley-green/10",
    hoverBorder: "hover:border-valley-green/20",
  },
  {
    label: "Memories",
    icon: Sparkles,
    description: "Honoring our ancestors",
    color: "text-sobrado-ochre",
    bg: "bg-sobrado-ochre/10",
    hoverBorder: "hover:border-sobrado-ochre/20",
  },
  {
    label: "Community",
    icon: Users,
    description: "Uniting the diaspora",
    color: "text-ocean-blue",
    bg: "bg-ocean-blue/10",
    hoverBorder: "hover:border-ocean-blue/20",
  },
];

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
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.snappy,
  },
};

// Simplified variants for users who prefer reduced motion
const reducedMotionCardVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

/**
 * CommunityStatsSection - Archive vision statement
 *
 * Displays the vision for the heritage archive during early stage,
 * replacing numerical stats with qualitative concepts using distinct visual pillars.
 *
 * Animation: Uses container stagger pattern with spring physics for smooth,
 * coordinated entrance animations. Respects prefers-reduced-motion.
 */
export function CommunityStatsSection() {
  const shouldReduceMotion = useReducedMotion();
  const activeCardVariants = shouldReduceMotion
    ? reducedMotionCardVariants
    : cardVariants;

  return (
    <section className="border-hairline bg-surface relative overflow-hidden border-y py-24">
      {/* Subtle background decoration */}
      <div className="from-ocean-blue/5 pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] via-transparent to-transparent opacity-50" />

      <div className="relative container mx-auto px-4 md:px-6">
        <SectionHeader
          title="Building Brava's Living Archive"
          subtitle="We're gathering the stories, places, and memories that make Brava unique. Join us as we build this archive together."
          centered
        />

        {/* Vision Pillars Grid - Container orchestrates stagger animation */}
        <motion.div
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {visionPillars.map((pillar) => (
            <motion.div
              key={pillar.label}
              variants={activeCardVariants}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : { y: -4, transition: springs.hover }
              }
              className={clsx(
                "group relative flex flex-col items-center rounded-2xl p-8 text-center",
                "bg-surface-alt/30 hover:bg-surface-alt border border-transparent hover:shadow-lg",
                pillar.hoverBorder
              )}
            >
              {/* Icon Circle with Hover Animation */}
              <motion.div
                className={clsx(
                  "mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full",
                  pillar.bg,
                  pillar.color
                )}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : { scale: 1.1, rotate: 3, transition: springs.bouncy }
                }
              >
                <pillar.icon className="h-8 w-8" strokeWidth={1.5} />
              </motion.div>

              {/* Text Content */}
              <h3 className="text-body mb-2 font-serif text-xl font-bold">
                {pillar.label}
              </h3>
              <p className="text-muted text-sm font-medium tracking-wide uppercase opacity-80">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
