"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const featuredContent = {
  title: "The Story of Brava Island",
  description:
    "Born from volcanic refuge, connected to New England by whaling ships, and shaped by sodade — Brava's story is one of survival, separation, and an unbreakable bond to home.",
  image: "/images/history/brava-culture.webp",
  primaryAction: { label: "Read Our Story", href: "/history" },
  secondaryAction: { label: "Explore Places", href: "/directory/heritage" },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

/**
 * FeaturedHeritageSection - Spotlight card for featured heritage content
 *
 * A single hero-style card with image (1/3) + content (2/3),
 * inspired by the nosilha-ideate prototype's "Featured Heritage" pattern.
 */
export function FeaturedHeritageSection() {
  const shouldReduceMotion = useReducedMotion();
  const activeVariants = shouldReduceMotion
    ? reducedMotionVariants
    : itemVariants;

  return (
    <section className="bg-background-secondary relative z-20 py-20">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="mx-auto max-w-6xl"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Header */}
          <motion.div
            variants={activeVariants}
            className="mb-8 flex items-center justify-between"
          >
            <h2 className="text-body font-serif text-3xl font-bold md:text-4xl">
              Featured Heritage
            </h2>
            <span className="bg-brand/10 text-brand rounded-full px-3 py-1 text-sm font-medium">
              New Content
            </span>
          </motion.div>

          {/* Spotlight Card */}
          <motion.div
            variants={activeVariants}
            className="bg-surface shadow-medium rounded-container flex flex-col overflow-hidden md:flex-row"
          >
            {/* Image */}
            <div className="relative h-64 md:h-auto md:min-h-[320px] md:w-1/3">
              <Image
                src={featuredContent.image}
                alt="Brava Island cultural heritage"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center p-8 md:w-2/3">
              <h3 className="text-body mb-2 font-serif text-2xl font-bold">
                {featuredContent.title}
              </h3>
              <p className="text-muted mb-6 leading-relaxed">
                {featuredContent.description}
              </p>
              <div className="flex gap-4">
                <Link
                  href={featuredContent.primaryAction.href}
                  className="bg-brand hover:bg-brand/90 focus-ring touch-target rounded-button px-6 py-2.5 text-sm font-medium text-white transition-colors"
                >
                  {featuredContent.primaryAction.label}
                </Link>
                <Link
                  href={featuredContent.secondaryAction.href}
                  className="border-edge text-body hover:bg-surface-alt focus-ring touch-target rounded-button border px-6 py-2.5 text-sm font-medium transition-colors"
                >
                  {featuredContent.secondaryAction.label}
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
