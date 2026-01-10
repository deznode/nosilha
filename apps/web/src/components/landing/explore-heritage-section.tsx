"use client";

import { MapPin, BookOpen, Users } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { CategoryCard } from "./category-card";
import type { CategoryCardProps } from "@/types/landing";

interface ExploreHeritageSectionProps {
  categories?: CategoryCardProps[];
}

/**
 * Consolidated 3 pillars:
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
    href: "/stories",
    actionText: "Read Stories",
  },
  {
    icon: MapPin,
    title: "Places",
    description:
      "Discover Brava's villages, trails, viewpoints, and local businesses through curated maps and guides.",
    colorClass: "bg-valley-green",
    href: "/directory",
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

// Simplified animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

/**
 * ExploreHeritageSection - Unified onboarding + navigation section
 *
 * Features:
 * - Onboarding header explaining NosIlha's mission
 * - 3 clickable CategoryCards (Stories, Places, Community)
 * - Kriolu cultural tagline
 * - Rounded top corners that overlap the hero section
 */
export function ExploreHeritageSection({
  categories = defaultCategories,
}: ExploreHeritageSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const activeCardVariants = shouldReduceMotion
    ? reducedMotionVariants
    : cardVariants;
  const activeHeaderVariants = shouldReduceMotion
    ? reducedMotionVariants
    : headerVariants;

  return (
    <section className="bg-background-secondary relative z-20 -mt-20 rounded-t-[3rem] py-20 shadow-[0_-30px_60px_-15px_rgba(0,0,0,0.5)]">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="mx-auto max-w-5xl"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Onboarding Header */}
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
            className="grid grid-cols-1 gap-8 md:grid-cols-3"
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
