import type { DocumentationStatus } from "@/lib/status";

/**
 * What the map pins: settlements, the place records inside them, or located archive
 * photographs. Spec 034 FR-011.
 */
export type MapMode = "settlements" | "records" | "photographs";

/** The status chip filter: every pin, or one documentation state. */
export type StatusFilter = "all" | DocumentationStatus;

export type MapItemKind = "settlement" | "record" | "photo";

/**
 * One pin and one list row. Built once per fetch by the adapter, so the list, the
 * pins, the popup and the selection card all read the same facts.
 */
export interface MapItem {
  /**
   * `s:<town-slug>`, `r:<entry-slug>` or `p:<media-id>` — the key the URL's `sel`
   * carries, and the one every archive screen links with (SPECS §4).
   */
  key: string;
  kind: MapItemKind;
  name: string;
  /** "Settlement", the record's category as the archive names it, or "Photograph". */
  eyebrow: string;
  description: string;
  coordinates: { lat: number; lng: number };
  status: DocumentationStatus;
  /**
   * A settlement holding at least one place record. With `documented`, this decides
   * which pins are labelled above the zoom floor (SPECS §3a).
   */
  hasRecords: boolean;
  /** Where "Open settlement / record / photograph" goes; null when it has no page. */
  href: string | null;
  /** The settlement "Filter photographs to this area" narrows to. */
  regionSlug: string | null;

  // Settlements
  recordCount?: number;
  hasPhotograph?: boolean;
  photographCount?: number;

  // Records
  townName?: string;

  // Photographs
  /** Thumbnail for the pin and the popup. Absent for anyone not cleared to be shown. */
  image?: string;
  filename?: string | null;
  placeName?: string | null;
  credit?: string | null;
}
