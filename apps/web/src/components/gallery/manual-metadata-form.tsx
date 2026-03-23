"use client";

/**
 * Manual Metadata Form
 *
 * Form fields for manual metadata entry for historical/scanned photos
 * that don't have EXIF data. All fields are optional.
 */

import { useState } from "react";
import {
  Calendar,
  MapPin,
  Archive,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { ManualMetadata } from "@/types/media";

interface ManualMetadataFormProps {
  value: ManualMetadata;
  onChange: (metadata: Partial<ManualMetadata>) => void;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

/**
 * Brava Island location suggestions for autocomplete
 */
const BRAVA_LOCATIONS = [
  "Vila Nova Sintra",
  "Fajã de Água",
  "Nossa Senhora do Monte",
  "Furna",
  "Cova Joana",
  "Santa Bárbara",
  "Cachaco",
  "Mato Grande",
  "Campo Baixo",
  "Ferreiros",
  "Lomba",
  "Vinagre",
  "Sorno",
  "Tantum",
];

export function ManualMetadataForm({
  value,
  onChange,
  expanded: controlledExpanded,
  onExpandedChange,
}: ManualMetadataFormProps) {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);

  const expanded = controlledExpanded ?? internalExpanded;
  const setExpanded = onExpandedChange ?? setInternalExpanded;

  const handleLocationChange = (locationValue: string) => {
    onChange({ locationName: locationValue });

    // Filter suggestions
    if (locationValue.length > 0) {
      const filtered = BRAVA_LOCATIONS.filter((loc) =>
        loc.toLowerCase().includes(locationValue.toLowerCase())
      );
      setFilteredLocations(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectLocation = (location: string) => {
    onChange({ locationName: location });
    setShowSuggestions(false);
  };

  return (
    <div className="rounded-card border-hairline bg-surface/50 border">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <Archive size={16} className="text-ocean-blue" />
          <span className="text-body text-sm font-semibold">
            Historical Photo Details
          </span>
          <span className="text-muted text-xs">(Optional)</span>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-muted" />
        ) : (
          <ChevronDown size={16} className="text-muted" />
        )}
      </button>

      {/* Form fields */}
      {expanded && (
        <div className="border-hairline space-y-4 border-t px-4 pt-3 pb-4">
          {/* Approximate Date */}
          <div>
            <label className="text-muted mb-1.5 flex items-center gap-1.5 text-xs font-medium">
              <Calendar size={12} />
              Approximate Date
            </label>
            <input
              type="text"
              placeholder="e.g., circa 1960s, Summer 1985"
              value={value.approximateDate || ""}
              onChange={(e) => onChange({ approximateDate: e.target.value })}
              className="border-hairline bg-canvas text-body rounded-card focus:ring-ocean-blue/50 w-full border px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>

          {/* Location Name */}
          <div className="relative">
            <label className="text-muted mb-1.5 flex items-center gap-1.5 text-xs font-medium">
              <MapPin size={12} />
              Location Name
            </label>
            <input
              type="text"
              placeholder="Village or landmark name"
              value={value.locationName || ""}
              onChange={(e) => handleLocationChange(e.target.value)}
              onFocus={() => {
                const name = value.locationName;
                if (name && name.length > 0) {
                  const filtered = BRAVA_LOCATIONS.filter((loc) =>
                    loc.toLowerCase().includes(name.toLowerCase())
                  );
                  setFilteredLocations(filtered);
                  setShowSuggestions(filtered.length > 0);
                } else {
                  setFilteredLocations(BRAVA_LOCATIONS);
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                // Delay to allow click on suggestion
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              className="border-hairline bg-canvas text-body rounded-card focus:ring-ocean-blue/50 w-full border px-3 py-2 text-sm outline-none focus:ring-2"
            />
            {/* Location suggestions dropdown */}
            {showSuggestions && filteredLocations.length > 0 && (
              <div className="border-hairline bg-canvas rounded-card shadow-elevated absolute z-10 mt-1 max-h-40 w-full overflow-y-auto border">
                {filteredLocations.map((location) => (
                  <button
                    key={location}
                    type="button"
                    onClick={() => selectLocation(location)}
                    className="text-body hover:bg-surface w-full px-3 py-2 text-left text-sm"
                  >
                    {location}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Archive Source */}
          <div>
            <label className="text-muted mb-1.5 flex items-center gap-1.5 text-xs font-medium">
              <Archive size={12} />
              Source / Archive
            </label>
            <input
              type="text"
              placeholder="e.g., Family collection, Municipal archive"
              value={value.archiveSource || ""}
              onChange={(e) => onChange({ archiveSource: e.target.value })}
              className="border-hairline bg-canvas text-body rounded-card focus:ring-ocean-blue/50 w-full border px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>
        </div>
      )}
    </div>
  );
}
