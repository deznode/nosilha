"use client";

import { useLocale, useTranslations } from "next-intl";
import { statusVar } from "@/lib/status";
import { itemEyebrow, listStatusLine } from "../data/map-copy";
import type { MapItem } from "../data/types";

interface LocationCardProps {
  item: MapItem;
  active: boolean;
  onSelect: (item: MapItem) => void;
}

/** One row of the sidebar list. Spec 034 FR-011. */
export function LocationCard({ item, active, onSelect }: LocationCardProps) {
  const t = useTranslations("map");
  const locale = useLocale();
  const tStatus = useTranslations("status");
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onSelect(item)}
      className="mb-1.5 flex w-full cursor-pointer items-start gap-[11px] rounded-[10px] border p-[11px] text-left transition-colors hover:border-[var(--border-strong)]"
      style={{
        background: active ? "var(--background-secondary)" : "transparent",
        borderColor: active ? "var(--border-strong)" : "transparent",
      }}
    >
      <span
        aria-hidden
        className="mt-[5px] size-[9px] flex-none rounded-full"
        style={{ background: statusVar(item.status) }}
      />
      <span className="block min-w-0 flex-1">
        <span className="block font-serif text-[15px] leading-[1.2] font-normal">
          {item.name}
        </span>
        <span
          className="mt-[3px] mb-[5px] block text-[10px] tracking-[.12em] uppercase"
          style={{ color: "var(--foreground-secondary)" }}
        >
          {itemEyebrow(t, item)}
        </span>
        <span
          className="block text-xs leading-[1.45]"
          style={{ color: "var(--foreground-secondary)" }}
        >
          {listStatusLine(t, locale, item, tStatus)}
        </span>
      </span>
    </button>
  );
}
