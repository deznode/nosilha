import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * The one identify sheet's open/closed state. Spec 034 FR-004.
 *
 * Any missing-field question on any archive screen opens the same sheet, carrying
 * what it is asking about. Deliberately not persisted: a half-typed guess about one
 * photograph must not reappear over a different one.
 */

/** What the answers are about, so the curators know what they are reading. */
export interface IdentifyContext {
  /** The entity kind, e.g. "media", "town", "entry". */
  contentType: string;
  /** The entity's id. */
  contentId: string;
  /** Present when the subject is a gallery record. */
  mediaId?: string;
  /** The field the question asked about, e.g. "photographerCredit". */
  field: string;
  /** The page the question was asked from, for the curators' queue. */
  pageTitle: string;
}

interface IdentifyState {
  context: IdentifyContext | null;
  open: (context: IdentifyContext) => void;
  close: () => void;
}

export const useIdentifyStore = create<IdentifyState>()(
  devtools(
    (set) => ({
      context: null,
      open: (context) => set({ context }),
      close: () => set({ context: null }),
    }),
    { name: "IdentifyStore" }
  )
);

/** The sheet is open exactly when it knows what it is asking about. */
export const useIdentifyContext = () =>
  useIdentifyStore((state) => state.context);
export const useOpenIdentify = () => useIdentifyStore((state) => state.open);
export const useCloseIdentify = () => useIdentifyStore((state) => state.close);
