"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { statusVar } from "@/lib/status";
import { selectionCard } from "../data/map-copy";
import type { MapItem } from "../data/types";

/**
 * The close control for a selection: a 44px target around the glyph. Spec 039 (M2).
 */
export function DetailCloseButton({
  onClose,
  className,
}: {
  onClose: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      className={clsx(
        "focus-ring grid size-11 flex-none cursor-pointer place-items-center rounded-full text-[15px]",
        className
      )}
      style={{ color: "var(--foreground-secondary)" }}
    >
      <span aria-hidden>✕</span>
    </button>
  );
}

interface LocationDetailBodyProps {
  item: MapItem;
  /** Renders the close control in the top-right corner; omit when the host has its own. */
  onClose?: () => void;
}

/**
 * The selected pin's details: eyebrow, name, status, a three-line description and the
 * actions. Shared by the floating card (wide) and the sheet's detail view (narrow).
 * Spec 034 FR-011, Spec 039 (M1).
 */
export function LocationDetailBody({ item, onClose }: LocationDetailBodyProps) {
  const copy = selectionCard(item);
  const regionHref = item.regionSlug
    ? `/photographs?region=${encodeURIComponent(item.regionSlug)}`
    : null;
  const inset = onClose && "pr-11";

  return (
    <>
      {onClose && (
        <DetailCloseButton
          onClose={onClose}
          className="absolute top-1.5 right-1.5"
        />
      )}

      <div
        className={clsx(
          "mb-1.5 text-[10px] tracking-[.14em] break-all uppercase",
          inset
        )}
        style={{ color: "var(--foreground-secondary)" }}
      >
        {copy.eyebrow}
      </div>
      <h3
        className={clsx(
          "mb-2 font-serif text-2xl leading-[1.15] font-normal",
          inset
        )}
      >
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
      {/* The full text stays in the DOM for screen readers; the page holds it in full. */}
      <p
        className="mb-3.5 line-clamp-3 text-[13px] leading-[1.55] text-pretty"
        style={{ color: "var(--foreground-secondary)" }}
      >
        {copy.description}
      </p>

      <div className="flex flex-wrap gap-2">
        {item.href && (
          <Link
            href={item.href}
            className="bg-primary text-primary-foreground inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-[13px] font-medium transition-opacity hover:opacity-90"
          >
            {copy.primaryLabel}
          </Link>
        )}
        {regionHref && (
          <Link
            href={regionHref}
            className="inline-flex min-h-11 items-center rounded-full border px-4 text-[13px] transition-colors hover:border-[var(--brand-ocean-blue)]"
            style={{
              borderColor: "var(--border-strong)",
              color: "var(--foreground)",
            }}
          >
            Filter photographs to this area
          </Link>
        )}
      </div>
    </>
  );
}
