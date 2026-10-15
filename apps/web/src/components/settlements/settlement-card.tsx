import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { RecordText } from "@/components/ui/record-text";

import { getTownStatus, statusVar } from "@/lib/status";
import type { TownStatusSummary } from "@/types/town";

import {
  settlementCardLink,
  settlementMetaRow,
  settlementStatusLine,
} from "./settlements-copy";

/**
 * One settlement on the index. Spec 034 FR-007.
 *
 * The border does the work the dot cannot: a settlement holding records reads as a
 * solid object with a strong edge, one that is only a name stays faint. Metrics are
 * the prototype's.
 */
export function SettlementCard({ town }: { town: TownStatusSummary }) {
  const t = useTranslations("settlements");
  const locale = useLocale();
  const tStatus = useTranslations("status");
  const status = getTownStatus(town, tStatus);
  const line = settlementStatusLine(t, locale, town);
  const [population, elevation] = settlementMetaRow(t, town);
  const hasRecords = town.entryCount > 0;

  return (
    <Link
      href={settlementCardLink(town)}
      className="flex flex-col gap-[10px] rounded-xl border transition-colors hover:border-[var(--border-strong)]"
      style={{
        padding: "17px",
        background: "var(--card)",
        borderColor: hasRecords
          ? "var(--border-strong)"
          : "var(--border-subtle)",
      }}
    >
      <div className="flex items-start gap-[9px]">
        <span
          aria-hidden
          className="mt-[6px] flex-none rounded-full"
          style={{
            width: "9px",
            height: "9px",
            background: statusVar(status.status),
          }}
        />
        <div className="min-w-0">
          <div
            className="font-serif"
            style={{ fontWeight: 400, fontSize: "20px", lineHeight: 1.2 }}
          >
            {town.name}
          </div>
          <div
            style={{
              fontSize: "12px",
              marginTop: "3px",
              color: line.ochre
                ? statusVar("name")
                : "var(--foreground-secondary)",
            }}
          >
            {line.text}
          </div>
        </div>
      </div>

      <div
        className="flex flex-wrap gap-x-3 gap-y-1 border-t"
        style={{
          fontSize: "11px",
          color: "var(--foreground-secondary)",
          borderTopColor:
            "color-mix(in srgb, var(--border-subtle) 70%, transparent)",
          paddingTop: "9px",
        }}
      >
        {/* The record's own values are English; "not recorded" lines are not. */}
        <RecordText when={!!town.population?.trim()}>{population}</RecordText>
        <RecordText when={!!town.elevation?.trim()}>{elevation}</RecordText>
      </div>
    </Link>
  );
}
