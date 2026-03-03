"use client";

import React from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /**
   * Heading level to use. Use "h2" when page already has an H1 elsewhere.
   * @default "h1"
   */
  as?: "h1" | "h2";
  /**
   * Show the bougainvillea-pink accent bar below the subtitle.
   * @default true
   */
  showAccentBar?: boolean;
  /**
   * Center the header content.
   * @default true
   */
  centered?: boolean;
  /**
   * Size variant for the header.
   * - "default": 3xl/4xl text (for section headers)
   * - "large": 4xl/5xl text (for page titles)
   * @default "large"
   */
  size?: "default" | "large";
}

/**
 * A consistent header component for main pages, displaying a title and an optional subtitle.
 * Aligned with the landing page's SectionHeader pattern for visual consistency.
 * Now features entrance animations.
 *
 * @param {PageHeaderProps} props The component props.
 */
export function PageHeader({
  title,
  subtitle,
  as: Heading = "h1",
  showAccentBar = true,
  centered = true,
  size = "large",
}: PageHeaderProps) {
  const textSizeClasses =
    size === "large" ? "text-4xl sm:text-5xl" : "text-3xl md:text-4xl";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`mb-12 ${centered ? "text-center" : "text-left"}`}
    >
      <Heading
        className={`text-ocean-blue mb-4 font-serif font-bold ${textSizeClasses}`}
      >
        {title}
      </Heading>
      {subtitle && (
        <p
          className={`text-basalt-500 font-sans text-lg leading-relaxed ${
            centered ? "mx-auto max-w-2xl" : "max-w-2xl"
          }`}
        >
          {subtitle}
        </p>
      )}
      {showAccentBar && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={`bg-bougainvillea-pink mt-4 h-1 w-24 rounded-full ${
            centered ? "mx-auto" : ""
          }`}
        />
      )}
    </motion.div>
  );
}
