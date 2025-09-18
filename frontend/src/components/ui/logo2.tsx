"use client";

import { motion } from "framer-motion";

// The word to be animated
const logoText = "Nosilha";

// Framer Motion variants for the parent container.
// This uses staggerChildren to delay the start of each letter's animation.
const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1, // 0.1s delay between each letter
    },
  },
};

// Framer Motion variants for each individual letter.
const letterVariants = {
  // The 'animate' variant defines the looping up-and-down motion.
  animate: {
    y: [0, -8, 0], // Move up 8px and then back to 0
    transition: {
      duration: 2.5, // The total time for one full wave cycle
      repeat: Infinity, // Loop the animation forever
      ease: "easeInOut" as const, // Ensures the motion is smooth at the peaks
    },
  },
};

export function Logo() {
  // Split the string into an array of individual letters
  const letters = Array.from(logoText);

  return (
    <div className="flex cursor-default flex-col items-center">
      <motion.div
        variants={containerVariants}
        initial="initial" // Although initial is not defined, it's good practice
        animate="animate"
        className="flex"
        aria-label={logoText}
      >
        {letters.map((letter, index) => (
          <motion.span
            key={`${letter}-${index}`}
            variants={letterVariants}
            className="text-ocean-blue text-4xl font-bold"
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>
      <p className="text-text-secondary mt-1 text-sm tracking-widest">
        BRAVA, CAPE VERDE
      </p>
    </div>
  );
}
