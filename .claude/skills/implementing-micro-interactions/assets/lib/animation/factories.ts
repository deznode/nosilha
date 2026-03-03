// lib/animation/factories.ts
import type { Variants } from "framer-motion";
import { motionDuration, motionEasing, motionDistance } from "./tokens";

/**
 * @microinteraction
 * @purpose feedback
 * @intensity subtle
 */
export function makeFadeInUp(distance: number = motionDistance.small): Variants {
  return {
    hidden: { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: motionDuration.normal,
        ease: motionEasing.out,
      },
    },
  };
}

export function makeScaleIn(): Variants {
  return {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: motionDuration.fast,
        ease: motionEasing.out,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      transition: {
        duration: motionDuration.fast,
        ease: motionEasing.in,
      },
    },
  };
}

export function makeSlideInFrom(
  direction: "left" | "right" | "top" | "bottom",
  distance: number = motionDistance.medium
): Variants {
  const x = direction === "left" ? -distance : direction === "right" ? distance : 0;
  const y = direction === "top" ? -distance : direction === "bottom" ? distance : 0;

  return {
    hidden: { opacity: 0, x, y },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: motionDuration.normal,
        ease: motionEasing.out,
      },
    },
    exit: {
      opacity: 0,
      x,
      y,
      transition: {
        duration: motionDuration.fast,
        ease: motionEasing.in,
      },
    },
  };
}
