import { Card } from "frontend";

/** With a title. */
export function WithTitle() {
  return (
    <div className="max-w-md">
      <Card title="About this place">
        Casa Eugénio Tavares stands on the square that carries the poet's name.
        The building is in private hands and is not generally open to visitors.
      </Card>
    </div>
  );
}

/** Untitled — the plain surface, used to group content on entry pages. */
export function Untitled() {
  return (
    <div className="max-w-md">
      <Card>
        <p className="text-muted text-sm">
          No opening hours have been recorded for this entry yet.
        </p>
      </Card>
    </div>
  );
}

/**
 * Brief §6 case 3 — four empty sections in a row, which is what an entry
 * detail page actually looks like today.
 */
export function SparseEntryPage() {
  return (
    <div className="flex max-w-md flex-col gap-4">
      <Card title="Opening hours">
        <p className="text-muted text-sm">Not recorded yet.</p>
      </Card>
      <Card title="Contact">
        <p className="text-muted text-sm">Not recorded yet.</p>
      </Card>
      <Card title="Getting there">
        <p className="text-muted text-sm">Not recorded yet.</p>
      </Card>
      <Card title="Photographs">
        <p className="text-muted text-sm">No photographs contributed yet.</p>
      </Card>
    </div>
  );
}
