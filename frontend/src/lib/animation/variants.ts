// lib/animation/variants.ts
import { Variants } from "framer-motion";
import { motionDuration, motionEasing, motionDistance } from "./tokens";

// ---- BUTTON MICRO INTERACTION ----
export const buttonMicro: Variants = {
  initial: { scale: 1, opacity: 1 },
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
  disabled: {
    scale: 1,
    opacity: 0.5,
    transition: { duration: motionDuration.fast },
  },
};

// ---- LIST STAGGER ----
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

// ---- LIST ITEM ----
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

// ---- MODAL BACKDROP ----
export const backdrop: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: motionDuration.normal,
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
