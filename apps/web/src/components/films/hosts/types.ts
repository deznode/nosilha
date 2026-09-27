/**
 * The contract between a film frame and the host that plays it. Spec 035 FR-008,
 * extended for spec 038 so the frame can draw its own controls.
 */

/** Whose controls are on screen: the frame's bar, or the host's own (fallback). */
export type ControlsMode = "custom" | "host";

/** How the host is asked to start. */
export interface MountOptions {
  /** Start with the sound off (the films hero's muted preview). */
  muted: boolean;
  /** Start again from the beginning at the end instead of reporting `onEnded`. */
  loop: boolean;
}

/** What a host player reports back to the film frame. */
export interface HostCallbacks {
  /** The film is playing. */
  onPlaying: () => void;
  /** The film is paused, by the viewer or because the browser refused to start it. */
  onPaused?: () => void;
  /** The film reached its end (never called while looping). */
  onEnded?: () => void;
  /** How far through the film playback is, from 0 to 1. */
  onProgress?: (fraction: number) => void;
  /**
   * Whose controls are on screen. `custom` (the default) means the host's own are
   * hidden and the frame draws its bar; `host` means the host could not be driven
   * (the plain-iframe fallback) and shows its own.
   */
  onControls?: (mode: ControlsMode) => void;
  /** The host refuses to play the film here — embed-restricted or region-locked. */
  onBlocked: () => void;
  /** The film is no longer available from its host. */
  onRemoved: () => void;
}

/** A mounted host player. */
export interface HostHandle {
  play(): void;
  pause(): void;
  setMuted(muted: boolean): void;
  /** Jumps to a point in the film, from 0 to 1. */
  seek(fraction: number): void;
  /** Stops the player and empties its container. */
  destroy(): void;
}

/** How often a host that has no progress event is asked where it is. */
export const PROGRESS_POLL_MS = 250;

export const DEFAULT_MOUNT: MountOptions = { muted: false, loop: false };
