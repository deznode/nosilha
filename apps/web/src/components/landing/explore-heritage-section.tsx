"use client";

import { MapPin, BookOpen, Users } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { CategoryCard } from "./category-card";
import type { CategoryCardProps } from "@/types/landing";
import { springs, stagger } from "@/lib/animation/tokens";

interface ExploreHeritageSectionProps {
  categories?: CategoryCardProps[];
}

/**
 * Consolidated 3 pillars (merged from original 4 categories):
 * - Stories: History + Culture merged
 * - Places: Towns + Tourism merged
 * - Community: New pillar for contribution
 */
const defaultCategories: CategoryCardProps[] = [
  {
    icon: BookOpen,
    title: "Stories",
    description:
      "Explore oral histories, articles, photos, and personal memories shared by the community.",
    colorClass: "bg-bougainvillea-pink",
    href: "/history",
    actionText: "Read Stories",
  },
  {
    icon: MapPin,
    title: "Places",
    description:
      "Discover Brava's villages, trails, viewpoints, and local businesses through curated maps and guides.",
    colorClass: "bg-valley-green",
    href: "/directory/all",
    actionText: "Discover Places",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "See how the diaspora and locals are preserving our shared identity through projects, events, and contributions.",
    colorClass: "bg-ocean-blue",
    href: "/contribute",
    actionText: "Join Community",
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

// Header text animation variants
const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springs.snappy,
  },
};

/**
 * ExploreHeritageSection - Unified onboarding + navigation section
 *
 * Combines the "What is NosIlha?" explanation with actionable navigation cards.
 * This unified approach reduces cognitive load by eliminating duplicate pillar displays.
 *
 * Features:
 * - Onboarding header explaining NosIlha's mission
 * - 3 clickable CategoryCards (Stories, Places, Community)
 * - Kriolu cultural tagline
 * - Rounded top corners that overlap the hero section
 *
 * Animation: Uses container stagger pattern with spring physics for smooth,
 * coordinated entrance animations. Respects prefers-reduced-motion.
 */
export function ExploreHeritageSection({
  categories = defaultCategories,
}: ExploreHeritageSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const activeCardVariants = shouldReduceMotion
    ? reducedMotionCardVariants
    : cardVariants;
  const activeHeaderVariants = shouldReduceMotion
    ? reducedMotionCardVariants
    : headerVariants;

  return (
    <section className="bg-background-secondary relative z-20 -mt-20 rounded-t-[3rem] py-20 shadow-[0_-30px_60px_-15px_rgba(0,0,0,0.5)]">
      <div className="container mx-auto px-4 md:px-6">
        {/* Unified onboarding + navigation content */}
        <motion.div
          className="mx-auto max-w-4xl"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Onboarding Header - "What is NosIlha?" */}
          <motion.div
            variants={activeHeaderVariants}
            className="mb-12 text-center"
          >
            <h2 className="text-body mb-4 font-serif text-3xl font-bold md:text-5xl">
              What is NosIlha?
            </h2>
            <p className="text-muted mx-auto max-w-xl text-lg leading-relaxed">
              A living digital archive of Brava Island&apos;s cultural heritage,
              built by the community, for the community.
            </p>
            <p className="text-muted mx-auto mt-4 max-w-xl text-base leading-relaxed">
              NosIlha is where memories, places, and stories about Brava come
              together. From historic villages to everyday life, we&apos;re
              documenting the island&apos;s past and present so future
              generations can see where we come from and who we are.
            </p>
          </motion.div>

          {/* 3-column navigation grid */}
          <motion.div
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
            variants={containerVariants}
          >
            {categories.map((category) => (
              <motion.div key={category.href} variants={activeCardVariants}>
                <CategoryCard {...category} className="h-full" />
              </motion.div>
            ))}
          </motion.div>

          {/* Kriolu cultural tagline */}
          <motion.p
            variants={activeHeaderVariants}
            className="text-muted mt-12 text-center font-serif text-base italic"
          >
            &ldquo;Nos terra, nos gente, nos memoria.&rdquo;
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
