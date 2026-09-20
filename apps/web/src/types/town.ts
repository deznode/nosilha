/**
 * Interface representing a town or village on Brava Island.
 *
 * Towns are geographic containers that hold directory entries (businesses, landmarks, etc.).
 * This interface matches the TownDto from the backend API.
 */
export interface Town {
  id: string;
  slug: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  population: string | null;
  elevation: string | null;
  founded: string | null;
  highlights: string[];
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * How much the archive holds about a settlement, derived on read by the backend.
 *
 * Matches `SettlementStatus` in `TownDto.kt`. Spec 033 FR-005.
 */
export type SettlementStatus = "DOCUMENTED" | "PARTIAL" | "NAME_ONLY";

/**
 * A settlement with its derived documentation status and live counts.
 *
 * Matches `TownStatusDto` from `GET /api/v1/towns/status-summary`. Carries coordinates
 * and a description so the map can pin every settlement from this one response.
 */
export interface TownStatusSummary {
  id: string | null;
  slug: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  entryCount: number;
  hasPhotograph: boolean;
  status: SettlementStatus;
  /** As recorded on the settlement, e.g. "271 (2010 census)"; null when not recorded. */
  population: string | null;
  /** As recorded on the settlement, e.g. "642m"; null when not recorded. */
  elevation: string | null;
  /**
   * Active archive photographs linked to this settlement's records. A record's hero
   * is not counted. Spec 034 FR-017.
   */
  photographCount: number;
  /**
   * Located archive photographs linked to no record, inside this settlement's
   * proximity box — the records `/photographs?region=<slug>` lists. Spec 034 FR-020.
   */
  unconfirmedPhotographCount: number;
}
