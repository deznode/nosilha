"use client";

import { motion } from "framer-motion";
import { useState, useId } from "react";
import clsx from "clsx";

// --- Blooming Hibiscus Icon ---

const centerVariants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 15,
      delay: 0.4,
    },
  },
};

const petalLayerVariants = {
  hidden: { scale: 0, opacity: 0, rotate: -45 },
  visible: (custom: number) => ({
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
      delay: custom * 0.1,
      duration: 0.8,
    },
  }),
  hover: {
    rotate: 5,
    scale: 1.05,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 10,
    },
  },
};

function BloomingHibiscus({
  className,
  instanceId,
}: {
  className?: string;
  instanceId?: string;
}) {
  // IMPROVEMENT 1: Generate unique IDs for gradients/filters
  // This prevents conflicts when the logo appears multiple times (Header + Footer)
  // Using instanceId prop for stable SSR hydration, falling back to useId for dynamic usage
  const reactId = useId();
  const uniqueId = instanceId || reactId;
  const gradientId = `petalGradient-${uniqueId}`;
  const glowId = `glow-${uniqueId}`;

  return (
    <motion.svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E91E63" /> {/* Bougainvillea Pink */}
          <stop offset="100%" stopColor="#9C27B0" /> {/* Deep Purple */}
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Petals */}
      <motion.g custom={1} variants={petalLayerVariants}>
        {[0, 72, 144, 216, 288].map((rotation, i) => (
          <path
            key={i}
            d="M50 20 C60 5, 80 20, 80 40 C80 60, 60 70, 50 50"
            fill={`url(#${gradientId})`}
            className="opacity-90"
            transform={`rotate(${rotation} 50 50)`}
          />
        ))}
      </motion.g>

      {/* Inner Petals (Lighter/Smaller) */}
      <motion.g custom={2} variants={petalLayerVariants}>
        {[36, 108, 180, 252, 324].map((rotation, i) => (
          <path
            key={i}
            d="M50 35 C55 25, 70 35, 70 45 C70 55, 60 60, 50 50"
            fill="#FF80AB" // Lighter pink
            transform={`rotate(${rotation} 50 50)`}
          />
        ))}
      </motion.g>

      {/* Center Pistil */}
      <motion.circle
        cx="50"
        cy="50"
        r="6"
        fill="#FFD740" // Sunny Yellow
        variants={centerVariants}
      />
      {/* Pistil Stamen */}
      <motion.path
        d="M50 50 L65 35"
        stroke="#FFD740"
        strokeWidth="2"
        strokeLinecap="round"
        variants={centerVariants}
      />
      <motion.circle
        cx="65"
        cy="35"
        r="2"
        fill="#FFD740"
        variants={centerVariants}
      />
    </motion.svg>
  );
}

// --- Main Logo Component ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const textVariants = {
  hidden: { x: -10, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

export interface NosilhaLogoProps {
  showSubtitle?: boolean;
  className?: string;
  variant?: "default" | "light"; // IMPROVEMENT 2: Native Light/Dark Mode support
  /** Stable ID for SSR hydration - use unique values when multiple logos on same page */
  instanceId?: string;
}

export function NosilhaLogo({
  showSubtitle = false,
  className = "",
  variant = "default",
  instanceId,
}: NosilhaLogoProps) {
  const [_isHovered, setIsHovered] = useState(false);

  // Determine text colors based on variant
  // "light" variant is for dark backgrounds (like the Hero image)
  const textColor = variant === "light" ? "text-white" : "text-text-primary";
  // On dark backgrounds, standard Ocean Blue is too dark. We use Sky-400 (Brighter Blue) for contrast.
  const brandColor =
    variant === "light" ? "text-sky-400 drop-shadow-sm" : "text-ocean-blue";

  // IMPROVEMENT 3: Enhanced Subtitle Contrast
  // Light mode: Uses warm Amber-50 with shadow for readability on dark mountain images.
  // Default mode: Uses branded Ocean Blue Light instead of generic gray.
  const subtitleColor =
    variant === "light"
      ? "text-amber-50 drop-shadow-md font-medium"
      : "text-ocean-blue-light font-medium";

  return (
    <motion.div
      className={`flex items-center gap-3 ${className}`}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      variants={containerVariants}
    >
      {/* Larger, more prominent icon */}
      <div className="relative h-14 w-14 shrink-0 md:h-16 md:w-16">
        <div className="bg-bougainvillea-pink/10 pointer-events-none absolute inset-0 scale-75 animate-pulse rounded-full blur-xl" />
        <BloomingHibiscus
          className="relative z-10 h-full w-full drop-shadow-lg"
          instanceId={instanceId}
        />
      </div>

      {/* Text Container */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline leading-none">
          <motion.span
            variants={textVariants}
            className={clsx(
              "font-serif text-3xl font-black tracking-tight transition-colors md:text-4xl",
              textColor
            )}
          >
            Nos
          </motion.span>
          <motion.span
            variants={textVariants}
            className={clsx(
              "font-serif text-3xl font-black tracking-tight transition-colors md:text-4xl",
              brandColor
            )}
          >
            Ilha
          </motion.span>
        </div>

        {/* Subtitle with reveal animation */}
        {showSubtitle && (
          <motion.div
            className="mt-1 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <p
              className={clsx(
                "text-[0.65rem] tracking-[0.25em] uppercase transition-colors md:text-[0.75rem]",
                subtitleColor
              )}
            >
              Brava, Cabo Verde
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
