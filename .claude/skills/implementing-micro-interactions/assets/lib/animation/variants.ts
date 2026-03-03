// lib/animation/variants.ts
import type { Variants } from "framer-motion";
import { motionDuration, motionEasing, motionDistance } from "./tokens";

export const buttonMicro: Variants = {
  initial: { scale: 1, opacity: 0.98 },
  hover: {
    scale: 1.03,
    opacity: 1,
    transition: {
      duration: motionDuration.fast,
      ease: motionEasing.out,
    },
  },
  tap: {
    scale: 0.97,
    transition: {
      duration: motionDuration.micro,
      ease: motionEasing.inOut,
    },
  },
  disabled: { opacity: 0.5, scale: 1 },
};

export const listStagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: motionDistance.xSmall },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionDuration.fast,
      ease: motionEasing.out,
    },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: motionDistance.small },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionDuration.normal,
      ease: motionEasing.out,
    },
  },
};

export const scaleIn: Variants = {
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
