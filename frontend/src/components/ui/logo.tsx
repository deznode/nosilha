"use client";

import { motion } from "framer-motion";

// The word to be animated
const logoText = "Nosilha";

// Framer Motion variants for the container to orchestrate the animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Delay between each letter's animation
    },
  },
};

// Framer Motion variants for each individual letter
const letterVariants = {
  hidden: {
    opacity: 0,
    y: 20, // Start 20px below final position
  },
  visible: {
    opacity: 1,
    y: 0, // Animate to final position
    transition: {
      type: "spring" as const,
      damping: 12,
      stiffness: 200,
    },
  },
};

export function NosilhaLogo({
  showSubtitle = false,
}: {
  showSubtitle?: boolean;
}) {
  const letters = Array.from(logoText);

  return (
    <div className="flex flex-col items-center">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex overflow-hidden" // overflow-hidden to contain the slide-up animation
        aria-label={logoText}
      >
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            variants={letterVariants}
            className="text-4xl font-bold text-ocean-blue"
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>
      {showSubtitle && (
        <p className="mt-1 text-sm text-text-secondary tracking-widest">
          BRAVA, CAPE VERDE
        </p>
      )}
    </div>
  );
}
