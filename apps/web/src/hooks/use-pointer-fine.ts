"use client";

import { useMediaQuery } from "@/lib/hooks/use-media-query";

/** A mouse or trackpad: hover previews and keyboard hints apply. */
export const POINTER_FINE_QUERY = "(hover: hover) and (pointer: fine)";

/**
 * Whether the reader has a fine, hovering pointer. False on the server, so a hint
 * that needs one appears after hydration rather than flashing on a phone.
 * Spec 038 FR-002, FR-021.
 */
export function usePointerFine(): boolean {
  return useMediaQuery(POINTER_FINE_QUERY);
}
