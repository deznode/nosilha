"use client";

import { motion } from "framer-motion";
import { BookOpen, MapPin, Sparkles, Users } from "lucide-react";
import { SectionHeader } from "./section-header";
import clsx from "clsx";

const visionPillars = [
  {
    label: "Stories",
    icon: BookOpen,
    description: "Preserving oral histories",
    color: "text-bougainvillea-pink",
    bg: "bg-bougainvillea-pink/10",
    border: "group-hover:border-bougainvillea-pink/20",
  },
  {
    label: "Places",
    icon: MapPin,
    description: "Mapping our heritage",
    color: "text-valley-green",
    bg: "bg-valley-green/10",
    border: "group-hover:border-valley-green/20",
  },
  {
    label: "Memories",
    icon: Sparkles,
    description: "Honoring our ancestors",
    color: "text-sobrado-ochre",
    bg: "bg-sobrado-ochre/10",
    border: "group-hover:border-sobrado-ochre/20",
  },
  {
    label: "Community",
    icon: Users,
    description: "Uniting the diaspora",
    color: "text-ocean-blue",
    bg: "bg-ocean-blue/10",
    border: "group-hover:border-ocean-blue/20",
  },
];

/**
 * CommunityStatsSection - Archive vision statement
 *
 * Displays the vision for the heritage archive during early stage,
 * replacing numerical stats with qualitative concepts using distinct visual pillars.
 */
export function CommunityStatsSection() {
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

        {/* Vision Pillars Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {visionPillars.map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                delay: index * 0.1,
                duration: 0.5,
                ease: "easeOut",
              }}
              className={clsx(
                "group relative flex flex-col items-center rounded-2xl p-8 text-center transition-all duration-300",
                "bg-surface-alt/30 hover:bg-surface-alt border border-transparent hover:shadow-lg",
                pillar.border
              )}
            >
              {/* Icon Circle with Hover Pulse */}
              <div
                className={clsx(
                  "mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                  pillar.bg,
                  pillar.color
                )}
              >
                <pillar.icon className="h-8 w-8" strokeWidth={1.5} />
              </div>

              {/* Text Content */}
              <h3 className="text-body mb-2 font-serif text-xl font-bold">
                {pillar.label}
              </h3>
              <p className="text-muted text-sm font-medium tracking-wide uppercase opacity-80">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
