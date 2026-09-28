import type { PlaceValue } from "../components/town-field";
import type { ContributionKind } from "./contribution-draft";
import { parseVideoUrl } from "./parse-video-url";

/**
 * Everything typed into the photo or film form. Plain data, so it can be
 * saved as the draft's `form` before the Google redirect and read back after.
 * The film form uses `title` for the film's title and `photographer` for who
 * made it. A type alias, not an interface, so it satisfies the draft's
 * `Record<string, unknown>`.
 */
export type ContributionForm = {
  title: string;
  description: string;
  photographer: string;
  source: string;
  date: string;
  place: PlaceValue;
  permission: boolean;
  filmUrl: string;
};

export const EMPTY_PLACE: PlaceValue = {
  townId: null,
  townName: null,
  detail: "",
  mode: "town",
};

export const EMPTY_FORM: ContributionForm = {
  title: "",
  description: "",
  photographer: "",
  source: "",
  date: "",
  place: EMPTY_PLACE,
  permission: false,
  filmUrl: "",
};

/** The next thing the form needs, in the order the form asks for it. */
export type Step =
  | "photographer"
  | "contributor"
  | "permission"
  | "file"
  | "filmTitle"
  | "filmUrl"
  | "ready";

export const STEP_LABELS: Record<Exclude<Step, "ready">, string> = {
  photographer: "Name the photographer to continue",
  contributor: "Add your name to continue",
  permission: "Confirm permission to continue",
  file: "Add the photograph to continue",
  filmTitle: "Add the film's title to continue",
  filmUrl: "Paste a YouTube or Vimeo link to continue",
};

/**
 * The photograph (or the link) comes first because it sits first on the
 * form; then the credit, then permission.
 */
export function nextStep(
  kind: ContributionKind,
  form: ContributionForm,
  hasFile: boolean
): Step {
  if (kind === "photo") {
    if (!hasFile) return "file";
    if (!form.photographer.trim()) return "photographer";
    if (!form.source.trim()) return "contributor";
  } else {
    if (!parseVideoUrl(form.filmUrl)) return "filmUrl";
    if (!form.title.trim()) return "filmTitle";
    if (!form.photographer.trim()) return "photographer";
  }
  if (!form.permission) return "permission";
  return "ready";
}

/** The town the record will be linked to, if one was picked. */
export function linkedTown(place: PlaceValue): string | null {
  return place.mode === "town" && place.townId ? place.townName : null;
}

/** "Nova Sintra, by the church", or the free text on its own. */
export function placeText(place: PlaceValue): string {
  return [linkedTown(place), place.detail.trim()].filter(Boolean).join(", ");
}

/** `townId` and `location_name` as the API takes them. */
export function placeFields(place: PlaceValue): {
  townId?: string;
  locationName?: string;
} {
  return {
    townId: linkedTown(place) ? (place.townId ?? undefined) : undefined,
    locationName: place.detail.trim() || undefined,
  };
}

/** "Maria" from "Maria Tavares"; null when "Who is giving it" is empty. */
export function firstName(source: string): string | null {
  return source.trim().split(/\s+/)[0] || null;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function restorePlace(value: unknown): PlaceValue {
  if (!value || typeof value !== "object") return EMPTY_PLACE;
  const raw = value as Record<string, unknown>;
  const townId = typeof raw.townId === "string" ? raw.townId : null;
  return {
    townId,
    townName: townId && typeof raw.townName === "string" ? raw.townName : null,
    detail: str(raw.detail),
    mode: raw.mode === "free" ? "free" : "town",
  };
}

/**
 * Reads a saved draft's `form` back, field by field. A draft is at most a day
 * old but may come from an earlier build, so nothing is trusted to be there.
 */
export function restoreForm(raw: Record<string, unknown>): ContributionForm {
  return {
    title: str(raw.title),
    description: str(raw.description),
    photographer: str(raw.photographer),
    source: str(raw.source),
    date: str(raw.date),
    place: restorePlace(raw.place),
    permission: raw.permission === true,
    filmUrl: str(raw.filmUrl),
  };
}
