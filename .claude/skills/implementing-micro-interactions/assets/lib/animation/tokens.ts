// lib/animation/tokens.ts
// Shared motion tokens for durations, easing curves, and distances.

export const motionDuration = {
  instant: 0,
  micro: 0.12,
  fast: 0.18,
  normal: 0.24,
  slow: 0.32,
  page: 0.32,
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
