import type { Translator } from "@/i18n/types";
import type { DirectoryEntry } from "@/types/directory";
import type { SettlementStatus, TownStatusSummary } from "@/types/town";

/**
 * The words come from the `status` namespace (spec 041 FR-004). Pass a translator
 * for that namespace, from the hook or from `getTranslations`, to every function
 * here that returns a label.
 *
 * Without one, the English fallback below answers. It is kept only so callers not
 * yet converted keep rendering, and goes once they all pass a translator; a test
 * holds it equal to `messages/en.json` meanwhile.
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
  /**
   * Short label, as on chips and the legend. English only.
   * @deprecated Use `statusLabel(status, t)`.
   */
  label: string;
  /**
   * Status line, as under a settlement or record name. English only.
   * @deprecated Use `statusLine(status, t)`.
   */
  line: string;
}

/**
 * The one status table. It carries tokens, never resolved colours: a pin painted from
 * `statusVar` repaints itself when the theme changes. Pins, legend, status chips, the coincident ring, list rows,
 * settlement cards, the settlement-detail dot and both mini-map markers read from it.
 */
export const STATUS_CONFIG: Record<DocumentationStatus, StatusConfig> = {
  documented: {
    token: "--brand-valley-green",
    label: "documented",
    line: "records and a photograph",
  },
  partial: {
    token: "--brand-ocean-blue",
    label: "records, no photograph",
    line: "records, no photograph",
  },
  name: {
    token: "--brand-sobrado-ochre",
    label: "name only",
    line: "a name and a coordinate, nothing else",
  },
};

/** Short label, as on chips and the legend, in the translator's language. */
export function statusLabel(
  status: DocumentationStatus,
  t?: StatusTranslator
): string {
  return t ? t(`${status}.label`) : STATUS_CONFIG[status].label;
}

/** Status line, as under a settlement or record name, in the translator's language. */
export function statusLine(
  status: DocumentationStatus,
  t?: StatusTranslator
): string {
  return t ? t(`${status}.line`) : STATUS_CONFIG[status].line;
}

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
  town: Pick<TownStatusSummary, "status">,
  t?: StatusTranslator
): DocumentationState {
  const state = TOWN_STATES[town.status];
  if (!state) return { status: "name", label: t ? t("unknown") : "unknown" };
  return t
    ? { status: state.status, label: statusLabel(state.status, t) }
    : state;
}

/** English only; see `StatusTranslator`. */
const ENTRY_LABELS = {
  documented: "has a photograph",
  partial: "no photograph",
} as const;

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
 * Unlike `getTownStatus`, this reads only the record's own `imageUrl`: a photograph
 * that exists solely in the gallery does not count, because the entry DTO carries no
 * gallery signal.
 */
export function getEntryStatus(
  entry: Pick<DirectoryEntry, "imageUrl">,
  t?: StatusTranslator
): DocumentationState {
  const status = entry.imageUrl?.trim() ? "documented" : "partial";
  return { status, label: t ? t(`entry.${status}`) : ENTRY_LABELS[status] };
}
