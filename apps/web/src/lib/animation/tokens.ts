// lib/animation/tokens.ts
// Canonical motion tokens defined in MICRO_INTERACTION.md

export const motionDuration = {
  instant: 0,
  micro: 0.12,
  fast: 0.18,
  normal: 0.24,
  slow: 0.32,
  slower: 0.38,
} as const;

export const motionEasing = {
  out: [0.16, 1, 0.3, 1] as const,
  in: [0.7, 0, 0.84, 0] as const,
  inOut: [0.45, 0, 0.55, 1] as const,
} as const;

export const motionDistance = {
  xSmall: 4,
  small: 8,
  medium: 16,
  large: 24,
} as const;

/**
 * Spring physics presets for Framer Motion animations.
 * Use these for consistent, natural-feeling motion across the app.
 */
export const springs = {
  /** Soft, ambient feel - for hero backgrounds, mist effects */
  ambient: { type: "spring" as const, stiffness: 50, damping: 20 },
  /** Snappy, responsive - for content section entrances */
  snappy: { type: "spring" as const, stiffness: 200, damping: 20 },
  /** Bouncy, playful - for icon micro-interactions */
  bouncy: { type: "spring" as const, stiffness: 400, damping: 15 },
  /** Quick response - for hover lift effects */
  hover: { type: "spring" as const, stiffness: 300, damping: 25 },
} as const;

/**
 * Stagger timing presets for container animations.
 */
export const stagger = {
  /** Standard stagger for grid items */
  default: 0.12,
  /** Fast stagger for quick sequences */
  fast: 0.08,
  /** Slow stagger for dramatic reveals */
  slow: 0.15,
} as const;
