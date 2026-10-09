"use client";

import { useEffect } from "react";
import Link from "next/link";

import { trackEvent } from "@/lib/ga";
import { isShareArrival } from "@/lib/share";
import {
  useShareArrivalStore,
  type ShareArrivalLineData,
} from "@/stores/shareArrivalStore";

/**
 * One line for a visitor who arrived from a shared link: where they are and one way
 * onward. Spec 040 FR-006.
 *
 * It lives in the chrome so every layout gets it from one place, and renders only
 * after hydration: the pages under it are cached, and whether a visit came from a
 * share is known only in the browser.
 */
export function ShareArrivalStrip() {
  // One subscription: the chrome re-renders only when what it shows changes, not
  // each time a page puts its line up on a visit that did not come from a share.
  const line = useShareArrivalStore((state) =>
    state.arrived && !state.dismissed ? state.line : null
  );
  const markArrived = useShareArrivalStore((state) => state.markArrived);
  const dismiss = useShareArrivalStore((state) => state.dismiss);

  useEffect(() => {
    if (isShareArrival(window.location.search)) markArrived();
  }, [markArrived]);

  if (!line) return null;

  return (
    <div
      role="note"
      className="bg-background-secondary border-border-subtle text-body flex flex-none items-center gap-3 border-b px-4 py-2 text-[13px] print:hidden"
    >
      <Link
        href={line.href}
        onClick={() => {
          trackEvent({
            action: "share_arrival_next",
            content_type: line.moment,
          });
          dismiss();
        }}
        className="focus-ring hit-area min-w-0 flex-1 underline underline-offset-[3px]"
      >
        {line.text}&nbsp;→
      </Link>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismiss}
        className="focus-ring hit-area text-muted flex-none cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}

/**
 * What the page on screen says to a share arrival. Renders nothing.
 *
 * An effect, so it follows Activity: a route hidden by navigation takes its line
 * down, and puts it back when it is shown again. It takes down only its own line:
 * the page arriving may have put its line up before this one's cleanup runs.
 */
export function ShareArrivalLine({ moment, text, href }: ShareArrivalLineData) {
  const setLine = useShareArrivalStore((state) => state.setLine);

  useEffect(() => {
    const line = { moment, text, href };
    setLine(line);
    return () => {
      if (useShareArrivalStore.getState().line === line) setLine(null);
    };
  }, [setLine, moment, text, href]);

  return null;
}
