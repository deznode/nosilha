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
  /** The path the sheet was opened on; it closes when the reader leaves it. */
  openedOn: string | null;
  /** Ids answered this visit, so a page stops asking what it was just told. */
  answered: string[];
  open: (context: IdentifyContext) => void;
  close: () => void;
  markAnswered: (contentId: string) => void;
}

export const useIdentifyStore = create<IdentifyState>()(
  devtools(
    (set) => ({
      context: null,
      openedOn: null,
      answered: [],
      // A copy, so each open is its own object: a send still in flight when the
      // sheet is closed and reopened can tell it is no longer the one on screen.
      open: (context) =>
        set({
          context: { ...context },
          openedOn: window.location.pathname,
        }),
      close: () => set({ context: null, openedOn: null }),
      markAnswered: (contentId) =>
        set((state) => ({ answered: [...state.answered, contentId] })),
    }),
    { name: "IdentifyStore" }
  )
);

/** The sheet is open exactly when it knows what it is asking about. */
export const useIdentifyContext = () =>
  useIdentifyStore((state) => state.context);
export const useIdentifyOpenedOn = () =>
  useIdentifyStore((state) => state.openedOn);
export const useOpenIdentify = () => useIdentifyStore((state) => state.open);
export const useCloseIdentify = () => useIdentifyStore((state) => state.close);
export const useWasAnswered = (contentId: string) =>
  useIdentifyStore((state) => state.answered.includes(contentId));
