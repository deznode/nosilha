import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { ShareMoment } from "@/lib/share";

/**
 * Whether this visit began on a shared link, and what the page it is on has to say
 * to someone who did. Spec 040 FR-006.
 *
 * Not persisted: it describes one visit. `arrived` is latched because the photograph
 * viewer rewrites the URL without the share tags as the reader steps.
 */

export interface ShareArrivalLineData {
  moment: ShareMoment;
  text: string;
  href: string;
}

interface ShareArrivalState {
  arrived: boolean;
  dismissed: boolean;
  /** Set by the page on screen; null on a page with nothing to say. */
  line: ShareArrivalLineData | null;
  markArrived: () => void;
  dismiss: () => void;
  setLine: (line: ShareArrivalLineData | null) => void;
}

export const useShareArrivalStore = create<ShareArrivalState>()(
  devtools(
    (set) => ({
      arrived: false,
      dismissed: false,
      line: null,
      markArrived: () => set({ arrived: true }),
      dismiss: () => set({ dismissed: true }),
      setLine: (line) => set({ line }),
    }),
    { name: "ShareArrivalStore" }
  )
);
