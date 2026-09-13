import type { DirectoryEntry } from "@/types/directory";
import type { SettlementStatus, TownStatusSummary } from "@/types/town";

/**
 * How well the archive documents something, keyed by colour role rather than wording.
 *
 * The keys follow the handoff's role map: `documented` is calm green, `partial` muted
 * yellow, and `gap` the warm ochre that marks what is missing. Settlements and place
 * records share the colours but word their labels differently, so the label travels
 * with the status instead of being derived from the key. Spec 033 FR-005, FR-012.
 */
export type DocumentationStatus = "documented" | "partial" | "gap";

export interface DocumentationState {
  status: DocumentationStatus;
  label: string;
}

const TOWN_STATES: Record<SettlementStatus, DocumentationState> = {
  DOCUMENTED: { status: "documented", label: "documented" },
  PARTIAL: { status: "partial", label: "records, no photograph" },
  NAME_ONLY: { status: "gap", label: "name only" },
};

/**
 * Status of a settlement, as derived by the backend.
 *
 * Deliberately a lookup, not a recomputation: the backend's rule also counts gallery
 * media, which moderation state decides and the summary's own fields cannot express.
 *
 * Nothing validates the response at runtime, so a status added in Kotlin before the
 * union here is updated falls back to an unclaimed gap rather than crashing the render.
 */
export function getTownStatus(
  town: Pick<TownStatusSummary, "status">
): DocumentationState {
  return TOWN_STATES[town.status] ?? { status: "gap", label: "unknown" };
}

/**
 * Status of a place record: documented when it carries a photograph, a gap when not.
 *
 * Place records have two states, not three — the prototype's Place records map mode
 * reads "has a photograph" or "no photograph". There is no partial record.
 *
 * Unlike `getTownStatus`, this reads only the record's own `imageUrl`: a photograph
 * that exists solely in the gallery does not count, because the entry DTO carries no
 * gallery signal.
 */
export function getEntryStatus(
  entry: Pick<DirectoryEntry, "imageUrl">
): DocumentationState {
  return entry.imageUrl?.trim()
    ? { status: "documented", label: "has a photograph" }
    : { status: "gap", label: "no photograph" };
}
