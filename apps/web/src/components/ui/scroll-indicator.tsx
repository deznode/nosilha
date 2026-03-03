"use client";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

interface ScrollIndicatorProps {
  /** Whether to fade out the indicator as the user scrolls. Default: true */
  fadeOnScroll?: boolean;
  /** Custom click handler for scroll behavior */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * A subtle scroll indicator that appears at the bottom of hero sections.
 * Provides visual affordance that more content exists below the fold.
 *
 * Features:
 * - Fade-on-scroll behavior (configurable)
 * - Animated chevron with subtle bounce
 * - Respects prefers-reduced-motion
 * - Accessible button with aria-label
 */
export function ScrollIndicator({
  fadeOnScroll = true,
  onClick,
  className,
}: ScrollIndicatorProps) {
  const shouldReduceMotion = useReducedMotion();

  // Scroll-linked opacity - fades out as user scrolls
  const { scrollYProgress } = useScroll();
  const scrollOpacity = useTransform(
    scrollYProgress,
    [0, 0.05, 0.1], // 0% to 10% scroll progress
    [1, 1, 0] // Fully visible, then fade out
  );

  // Animated chevron variants
  const chevronVariants = {
    animate: {
      y: [0, 8, 0],
      opacity: [0.4, 1, 0.4],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };

  return (
    <motion.button
      style={fadeOnScroll ? { opacity: scrollOpacity } : undefined}
      onClick={onClick}
      className={clsx(
        "group absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 transform cursor-pointer flex-col items-center gap-2 transition-colors hover:text-white",
        className
      )}
      aria-label="Scroll down to content"
    >
      <span className="text-[10px] tracking-[0.2em] text-white/90 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-colors group-hover:text-white">
        Scroll
      </span>
      <motion.div
        variants={shouldReduceMotion ? undefined : chevronVariants}
        animate={shouldReduceMotion ? undefined : "animate"}
      >
        <ChevronDown
          size={20}
          className="text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-colors group-hover:text-white"
        />
      </motion.div>
    </motion.button>
  );
}
