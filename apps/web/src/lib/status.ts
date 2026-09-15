import type { DirectoryEntry } from "@/types/directory";
import type { SettlementStatus, TownStatusSummary } from "@/types/town";

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
  /** Short label, as on chips and the legend. */
  label: string;
  /** Status line, as under a settlement or record name. */
  line: string;
  /**
   * The token's light-theme value, for the map sites that still build tints by
   * appending an alpha to a hex string. Removed with them in spec 034 T-32.
   */
  lightHex: string;
}

/**
 * The one status table. Pins, legend, status chips, the coincident ring, list rows,
 * settlement cards, the settlement-detail dot and both mini-map markers read from it.
 */
export const STATUS_CONFIG: Record<DocumentationStatus, StatusConfig> = {
  documented: {
    token: "--brand-valley-green",
    label: "documented",
    line: "records and a photograph",
    lightHex: "#4F6E63",
  },
  partial: {
    token: "--brand-ocean-blue",
    label: "records, no photograph",
    line: "records, no photograph",
    lightHex: "#3D5A73",
  },
  name: {
    token: "--brand-sobrado-ochre",
    label: "name only",
    line: "a name and a coordinate, nothing else",
    lightHex: "#7A5730",
  },
};

/** The status colour as a CSS value that follows the active theme. */
export function statusVar(status: DocumentationStatus): string {
  return `var(${STATUS_CONFIG[status].token})`;
}

/** The status colour at `pct` percent over transparency, still following the theme. */
export function statusTint(status: DocumentationStatus, pct: number): string {
  return `color-mix(in srgb, ${statusVar(status)} ${pct}%, transparent)`;
}

const TOWN_STATES: Record<SettlementStatus, DocumentationState> = {
  DOCUMENTED: { status: "documented", label: STATUS_CONFIG.documented.label },
  PARTIAL: { status: "partial", label: STATUS_CONFIG.partial.label },
  NAME_ONLY: { status: "name", label: STATUS_CONFIG.name.label },
};

/**
 * Status of a settlement, as derived by the backend.
 *
 * Deliberately a lookup, not a recomputation: the backend's rule also counts gallery
 * media, which moderation state decides and the summary's own fields cannot express.
 *
 * Nothing validates the response at runtime, so a status added in Kotlin before the
 * union here is updated falls back to an unclaimed name-only state rather than
 * crashing the render.
 */
export function getTownStatus(
  town: Pick<TownStatusSummary, "status">
): DocumentationState {
  return TOWN_STATES[town.status] ?? { status: "name", label: "unknown" };
}

/**
 * Status of a place record: documented when it carries a photograph, name only when not.
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
    : { status: "name", label: "no photograph" };
}
