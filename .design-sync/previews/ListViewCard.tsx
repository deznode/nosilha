import { ListViewCard } from "frontend";
import {
  ENTRY_WITH_PHOTO,
  ENTRY_NO_PHOTO,
  ENTRY_GRID,
} from "../fixtures/data";

/** The list row for an entry that has a photograph. */
export function WithPhotograph() {
  return <ListViewCard entry={ENTRY_WITH_PHOTO} />;
}

/**
 * The common case — no photograph. In list view the empty thumbnail is small
 * and repeated down the page, so it reads differently from the grid card's
 * large well (theme-palette-brief.md §4.4).
 */
export function NoPhotograph() {
  return <ListViewCard entry={ENTRY_NO_PHOTO} />;
}

/**
 * A run of rows mixing both. The repetition is the point: whatever the
 * placeholder surface is, it appears many times in a column.
 */
export function ListRun() {
  return (
    <div className="flex flex-col gap-4">
      {ENTRY_GRID.map((entry) => (
        <ListViewCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}

export function WithoutBookmark() {
  return <ListViewCard entry={ENTRY_NO_PHOTO} showBookmark={false} />;
}
