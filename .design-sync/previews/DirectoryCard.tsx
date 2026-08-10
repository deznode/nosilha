import { DirectoryCard } from "frontend";
import {
  ENTRY_WITH_PHOTO,
  ENTRY_NO_PHOTO,
  ENTRY_GRID,
} from "../fixtures/data";

/**
 * The card as it appears for the minority of entries that actually have a
 * photograph.
 */
export function WithPhotograph() {
  return (
    <div className="max-w-sm">
      <DirectoryCard entry={ENTRY_WITH_PHOTO} />
    </div>
  );
}

/**
 * The dominant case in the real archive: 6 of 8 directory entries have no
 * photograph (theme-palette-brief.md §4.4). This is the single most damaging
 * visual in the product — the empty image well must read as deliberate, not
 * as a broken load.
 */
export function NoPhotograph() {
  return (
    <div className="max-w-sm">
      <DirectoryCard entry={ENTRY_NO_PHOTO} />
    </div>
  );
}

/** Without the bookmark affordance — used on surfaces that aren't signed in. */
export function WithoutBookmark() {
  return (
    <div className="max-w-sm">
      <DirectoryCard entry={ENTRY_NO_PHOTO} showBookmark={false} />
    </div>
  );
}

/**
 * Brief §6 case 2 — placeholders sitting next to real photographs. The test is
 * whether the two read as one system or as a half-loaded page.
 */
export function MixedGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {ENTRY_GRID.map((entry) => (
        <DirectoryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
