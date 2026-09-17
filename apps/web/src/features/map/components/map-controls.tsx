"use client";

import { clsx } from "clsx";

export interface MapControl {
  label: string;
  title: string;
  onClick: () => void;
  /** A toggle's state; omit for an action. */
  pressed?: boolean;
}

/**
 * The control stack at the canvas's top right: satellite, 3D, reset view, my location.
 * Spec 034 FR-011. Glyph labels as prototyped, with the title as the accessible name.
 */
export function MapControls({ controls }: { controls: MapControl[] }) {
  return (
    <div className="absolute top-3.5 right-3.5 z-[5] flex flex-col gap-1.5">
      {controls.map((control) => {
        const on = control.pressed === true;
        return (
          <button
            key={control.title}
            type="button"
            title={control.title}
            aria-label={control.title}
            aria-pressed={control.pressed}
            onClick={control.onClick}
            className={clsx(
              "size-[38px] cursor-pointer rounded-[10px] border font-sans text-xs backdrop-blur-[6px] transition-colors",
              !on && "hover:border-[var(--border-strong)]"
            )}
            style={{
              background: on
                ? "var(--foreground)"
                : "color-mix(in srgb, var(--background) 86%, transparent)",
              color: on ? "var(--background)" : "var(--foreground)",
              borderColor: on ? "var(--foreground)" : "var(--border-subtle)",
            }}
          >
            <span aria-hidden>{control.label}</span>
          </button>
        );
      })}
    </div>
  );
}
