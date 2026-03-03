"use client";

import { useMemo } from "react";
import type { Variants } from "framer-motion";
import { useMotionConfig } from "@/lib/animation/config";
import {
  motionDuration,
  motionEasing,
  motionDistance,
} from "@/lib/animation/tokens";

/**
 * Animation configuration for toast components.
 */
export interface ToastAnimationConfig {
  /** Animation variants for framer-motion */
  variants: Variants;
  /** Whether reduced motion is enabled */
  reducedMotion: boolean;
}

/**
 * Hook for toast animation configuration with reduced motion support.
 *
 * Returns animation variants that respect the user's prefers-reduced-motion setting:
 * - Normal: slide-from-bottom animation
 * - Reduced motion: simple fade animation
 *
 * @example
 * const { variants, reducedMotion } = useToastAnimation();
 *
 * <motion.div
 *   variants={variants}
 *   initial="hidden"
 *   animate="visible"
 *   exit="exit"
 * />
 */
export function useToastAnimation(): ToastAnimationConfig {
  const { reducedMotion } = useMotionConfig();

  const variants = useMemo<Variants>(() => {
    if (reducedMotion) {
      // Simple fade for reduced motion preference
      return {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration: motionDuration.fast,
            ease: motionEasing.out,
          },
        },
        exit: {
          opacity: 0,
          transition: {
            duration: motionDuration.fast,
            ease: motionEasing.in,
          },
        },
      };
    }

    // Slide-from-bottom animation for normal motion
    return {
      hidden: {
        opacity: 0,
        y: motionDistance.large,
      },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: motionDuration.normal,
          ease: motionEasing.out,
        },
      },
      exit: {
        opacity: 0,
        y: motionDistance.medium,
        transition: {
          duration: motionDuration.fast,
          ease: motionEasing.in,
        },
      },
    };
  }, [reducedMotion]);

  return { variants, reducedMotion };
}
