import { ViewToggle } from "frontend";

const noop = () => {};

/** Grid selected — the directory's default view. */
export function GridSelected() {
  return <ViewToggle viewMode="grid" onViewModeChange={noop} />;
}

/** List selected. Both cells together show the active/inactive treatment. */
export function ListSelected() {
  return <ViewToggle viewMode="list" onViewModeChange={noop} />;
}
