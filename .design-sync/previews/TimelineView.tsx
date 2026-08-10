import { TimelineView } from "frontend";
import { TIMELINE_SPARSE, TIMELINE_EMPTY } from "../fixtures/data";

const noop = () => {};

/**
 * Brief §6 case 5 — the real shape of the archive: three of four eras hold
 * nothing, everything sits in the most recent bucket. Whatever the palette
 * does with a zero-count era, it does three times here.
 */
export function SparseArchive() {
  return <TimelineView timeline={TIMELINE_SPARSE} onDecadeSelect={noop} />;
}

/** Every era empty — the state before any intake. */
export function AllErasEmpty() {
  return <TimelineView timeline={TIMELINE_EMPTY} onDecadeSelect={noop} />;
}
