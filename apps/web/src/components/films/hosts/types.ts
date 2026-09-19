/** What a host player reports back to the film frame. */
export interface HostCallbacks {
  /** The player is up and the film is (or can be) playing. */
  onPlaying: () => void;
  /** The host refuses to play the film here — embed-restricted or region-locked. */
  onBlocked: () => void;
  /** The film is no longer available from its host. */
  onRemoved: () => void;
}

/** A mounted host player. */
export interface HostHandle {
  pause(): void;
  /** Stops the player and empties its container. */
  destroy(): void;
}
