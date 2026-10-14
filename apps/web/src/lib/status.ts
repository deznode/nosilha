import type { Translator } from "@/i18n/types";
import type { DirectoryEntry } from "@/types/directory";
import type { SettlementStatus, TownStatusSummary } from "@/types/town";

/**
 * The words come from the `status` namespace (spec 041 FR-004). Every function here
 * that returns a label takes a translator for that namespace, from the hook or from
 * `getTranslations`. A caller that needs only the state reads `townStatus` or
 * `entryStatus`, which return no text.
 */
export type StatusTranslator = Translator<"status">;

/**
 * How well the archive documents something. Spec 034 FR-002, handoff SPECS §2.
 *
 * Three states, three separable hues. Sunny yellow is retired from status use: it sat
 * 23 RGB units from ochre in light and ~18 in dark, so at pin size the two read as one
 * brown. A fourth state needs a fourth hue or a shape, never yellow against ochre.
 */
export type DocumentationStatus = "documented" | "partial" | "name";

export interface DocumentationState {
  status: DocumentationStatus;
  label: string;
}

export interface StatusConfig {
  /** Brand token carrying the colour. Resolves per theme, so never read its value. */
  token: `--brand-${string}`;
}

/**
 * The one status table. It carries tokens, never resolved colours: a pin painted from
 * `statusVar` repaints itself when the theme changes. Pins, legend, status chips, the coincident ring, list rows,
 * settlement cards, the settlement-detail dot and both mini-map markers read from it.
 */
export const STATUS_CONFIG: Record<DocumentationStatus, StatusConfig> = {
  documented: { token: "--brand-valley-green" },
  partial: { token: "--brand-ocean-blue" },
  name: { token: "--brand-sobrado-ochre" },
};

/** Short label, as on chips and the legend, in the translator's language. */
export function statusLabel(
  status: DocumentationStatus,
  t: StatusTranslator
): string {
  return t(`${status}.label`);
}

/** Status line, as under a settlement or record name, in the translator's language. */
export function statusLine(
  status: DocumentationStatus,
  t: StatusTranslator
): string {
  return t(`${status}.line`);
}

/** The status colour as a CSS value that follows the active theme. */
export function statusVar(status: DocumentationStatus): string {
  return `var(${STATUS_CONFIG[status].token})`;
}

/** The status colour at `pct` percent over transparency, still following the theme. */
export function statusTint(status: DocumentationStatus, pct: number): string {
  return `color-mix(in srgb, ${statusVar(status)} ${pct}%, transparent)`;
}

const TOWN_STATES: Record<SettlementStatus, DocumentationStatus> = {
  DOCUMENTED: "documented",
  PARTIAL: "partial",
  NAME_ONLY: "name",
};

/**
 * Status of a settlement, as derived by the backend.
 *
 * Deliberately a lookup, not a recomputation: the backend's rule also counts gallery
 * media, which moderation state decides and the summary's own fields cannot express.
 *
 * Nothing validates the response at runtime, so a status added in Kotlin before the
 * union here is updated falls back to name-only rather than crashing the render.
 */
export function townStatus(
  town: Pick<TownStatusSummary, "status">
): DocumentationStatus {
  return TOWN_STATES[town.status] ?? "name";
}

/**
 * A settlement's status and its label. An unrecognised status reads as an unclaimed
 * name-only state, labelled "unknown" rather than claiming to be name only.
 */
export function getTownStatus(
  town: Pick<TownStatusSummary, "status">,
  t: StatusTranslator
): DocumentationState {
  const status = TOWN_STATES[town.status];
  if (!status) return { status: "name", label: t("unknown") };
  return { status, label: statusLabel(status, t) };
}

/**
 * Status of a place record: documented when it carries a photograph, otherwise
 * "records, no photograph".
 *
 * Place records use two of the three states, never `name`. `name` means "a name and a
 * coordinate, nothing else" (FR-002), and a record is by definition more than that —
 * it has a category, a description and a settlement. The prototype agrees: every
 * photograph-less record in its `RECORDS` fixture is `partial`, and its records-mode
 * legend counts zero name-only pins.
 *
 * Unlike `townStatus`, this reads only the record's own `imageUrl`: a photograph
 * that exists solely in the gallery does not count, because the entry DTO carries no
 * gallery signal.
 */
export function entryStatus(
  entry: Pick<DirectoryEntry, "imageUrl">
): "documented" | "partial" {
  return entry.imageUrl?.trim() ? "documented" : "partial";
}

/** A place record's status and its label ("has a photograph", "no photograph"). */
export function getEntryStatus(
  entry: Pick<DirectoryEntry, "imageUrl">,
  t: StatusTranslator
): DocumentationState {
  const status = entryStatus(entry);
  return { status, label: t(`entry.${status}`) };
}
