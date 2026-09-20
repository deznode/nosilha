"use client";

import Link from "next/link";
import { statusVar } from "@/lib/status";
import { selectionCard } from "../data/map-copy";
import type { MapItem } from "../data/types";

interface LocationDetailCardProps {
  item: MapItem;
  /** Distance from the canvas bottom, in pixels. */
  bottom: number;
  onClose: () => void;
}

/**
 * The selected pin's card, centred over the canvas. Hand-built to the handoff panel
 * (SPECS §4). Spec 034 FR-011.
 */
export function LocationDetailCard({
  item,
  bottom,
  onClose,
}: LocationDetailCardProps) {
  const copy = selectionCard(item);
  const regionHref = item.regionSlug
    ? `/photographs?region=${encodeURIComponent(item.regionSlug)}`
    : null;

  return (
    <section
      aria-label={`Selected: ${copy.name}`}
      className="absolute left-1/2 z-[6] w-[min(420px,calc(100%-28px))] -translate-x-1/2 rounded-[14px] border p-[18px] backdrop-blur-[10px] transition-[bottom] duration-[260ms] ease-[cubic-bezier(.4,.14,.3,1)]"
      style={{
        bottom,
        background: "color-mix(in srgb, var(--background) 95%, transparent)",
        borderColor: "var(--border-strong)",
        boxShadow: "0 20px 50px rgba(0,0,0,.5)",
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-3 right-3 cursor-pointer text-[15px]"
        style={{ color: "var(--foreground-secondary)" }}
      >
        <span aria-hidden>✕</span>
      </button>

      <div
        className="mb-1.5 pr-6 text-[10px] tracking-[.14em] break-all uppercase"
        style={{ color: "var(--foreground-secondary)" }}
      >
        {copy.eyebrow}
      </div>
      <h3 className="mb-2 pr-6 font-serif text-2xl leading-[1.15] font-normal">
        {copy.name}
      </h3>
      <div className="mb-2.5 flex items-center gap-2">
        <span
          aria-hidden
          className="size-2 flex-none rounded-full"
          style={{ background: statusVar(item.status) }}
        />
        <span
          className="text-[13px]"
          style={{ color: "var(--foreground-secondary)" }}
        >
          {copy.status}
        </span>
      </div>
      <p
        className="mb-3.5 text-[13px] leading-[1.55] text-pretty"
        style={{ color: "var(--foreground-secondary)" }}
      >
        {copy.description}
      </p>

      <div className="flex flex-wrap gap-2">
        {item.href && (
          <Link
            href={item.href}
            className="bg-primary text-primary-foreground inline-flex items-center justify-center rounded-lg px-4 py-[9px] text-[13px] font-medium transition-opacity hover:opacity-90"
          >
            {copy.primaryLabel}
          </Link>
        )}
        {regionHref && (
          <Link
            href={regionHref}
            className="rounded-full border px-4 py-[9px] text-[13px] transition-colors hover:border-[var(--brand-ocean-blue)]"
            style={{
              borderColor: "var(--border-strong)",
              color: "var(--foreground)",
            }}
          >
            Filter photographs to this area
          </Link>
        )}
      </div>
    </section>
  );
}
