// lib/animation/factories.ts
import { Variants } from "framer-motion";
import { motionDuration, motionEasing, motionDistance } from "./tokens";

// Fade + Up entrance
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
    exit: {
      opacity: 0,
      y: distance,
      transition: {
        duration: motionDuration.fast,
        ease: motionEasing.in,
      },
    },
  };
}

// Scale-in 0.96 → 1
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

// Slide in from any direction
export function makeSlideInFrom(
  direction: "left" | "right" | "top" | "bottom",
  distance: number = motionDistance.medium
): Variants {
  const map = {
    left: { x: -distance },
    right: { x: distance },
    top: { y: -distance },
    bottom: { y: distance },
  };

  return {
    hidden: { opacity: 0, ...map[direction] },
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
      ...map[direction],
      transition: {
        duration: motionDuration.fast,
        ease: motionEasing.in,
      },
    },
  };
}
