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

// ---- ICON BUTTON TAP (tap-only, no hover) ----
export const iconButtonTap = {
  scale: 0.95,
  transition: {
    duration: motionDuration.micro,
    ease: motionEasing.inOut,
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

// ---- REACTION BOUNCE ----
export const reactionBounce: Variants = {
  initial: { scale: 1 },
  bounce: {
    scale: [1, 1.2, 1],
    transition: {
      duration: motionDuration.normal,
      ease: motionEasing.inOut,
    },
  },
};

// ---- ICON FLIP (3D rotation) ----
export const iconFlip: Variants = {
  initial: {
    rotateY: -90,
    opacity: 0,
    scale: 0.8,
  },
  enter: {
    rotateY: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: motionDuration.fast,
      ease: motionEasing.inOut,
    },
  },
  exit: {
    rotateY: 90,
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: motionDuration.fast,
      ease: motionEasing.inOut,
    },
  },
};

// ---- SPINNER ROTATE ----
export const spinnerRotate = {
  animate: { rotate: 360 },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: "linear" as const,
  },
};

// ---- MENU FADE IN (dropdown/FAB menus) ----
export const menuFadeIn: Variants = {
  hidden: { opacity: 0, y: motionDistance.small },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionDuration.fast,
      ease: motionEasing.out,
    },
  },
  exit: {
    opacity: 0,
    y: motionDistance.small,
    transition: {
      duration: motionDuration.micro,
      ease: motionEasing.in,
    },
  },
};

// ---- FORM STAGGER (login/signup forms) ----
export const formStagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// ---- FORM FIELD (individual field entrance) ----
export const formField: Variants = {
  hidden: { opacity: 0, x: -motionDistance.medium },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: motionDuration.normal,
      ease: motionEasing.out,
    },
  },
};
