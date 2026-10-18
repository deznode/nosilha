import { getLocale, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

import { IdentifyQuestion } from "@/components/identify/identify-question";
import { ShareArrivalLine } from "@/components/share/share-arrival";
import { CopyLinkAction, ShareAction } from "@/components/ui/archive-actions";
import { RecordText } from "@/components/ui/record-text";
import { MiniMap } from "@/features/map/components/mini-map";
import { categoryLabel, type CategoryTranslator } from "@/lib/category-label";
import { formatCoordinates } from "@/lib/coordinates";
import { townArrivalLine, townShareText } from "@/lib/share-copy";
import {
  getEntryStatus,
  getTownStatus,
  statusVar,
  type StatusTranslator,
} from "@/lib/status";
import type { DirectoryEntry } from "@/types/directory";
import type { Town, TownStatusSummary } from "@/types/town";

import {
  photographPanel,
  settlementQuestions,
  settlementSubLine,
  unconfirmedLink,
  type TownTranslator,
} from "./settlement-detail-copy";

/**
 * One settlement. Spec 034 FR-008.
 *
 * Two columns: what the archive holds here on the left, where it is and what it does
 * not know on the right. The ochre dashed panel leads because the absence of a
 * photograph is the most useful thing the page can tell a reader who might have one.
 */
export async function SettlementDetail({
  town,
  summary,
  entries,
}: {
  town: Town;
  summary: TownStatusSummary;
  entries: DirectoryEntry[];
}) {
  const [t, tStatus, tCategories, tShare, locale] = await Promise.all([
    getTranslations("town"),
    getTranslations("status"),
    getTranslations("categories"),
    getTranslations("share"),
    getLocale(),
  ]);
  const status = getTownStatus(summary, tStatus);
  const panel = photographPanel(t, locale, summary);
  const questions = settlementQuestions(t, town, summary);
  const coordinates = formatCoordinates(summary.latitude, summary.longitude);
  const identify = {
    contentType: "town",
    contentId: town.id,
    pageTitle: summary.name,
  };

  return (
    <div
      style={{
        maxWidth: "1180px",
        margin: "0 auto",
        padding: "40px 22px 80px",
      }}
    >
      <ShareArrivalLine moment="town" {...townArrivalLine(tShare)} />
      <Link
        href="/settlements"
        className="inline-block transition-colors hover:text-[var(--foreground)]"
        style={{
          fontSize: "13px",
          color: "var(--foreground-secondary)",
          marginBottom: "18px",
        }}
      >
        {t("backLink")}
      </Link>

      <div className="flex items-start gap-3" style={{ marginBottom: "14px" }}>
        <span
          aria-hidden
          className="flex-none rounded-full"
          style={{
            width: "11px",
            height: "11px",
            marginTop: "19px",
            background: statusVar(status.status),
          }}
        />
        <div>
          <h1
            className="font-serif"
            style={{
              fontWeight: 400,
              fontSize: "46px",
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            {summary.name}
          </h1>
          <div
            style={{
              fontSize: "14px",
              color: "var(--foreground-secondary)",
              marginTop: "8px",
            }}
          >
            {settlementSubLine(t, locale, summary)}
          </div>
          <div
            className="flex flex-wrap gap-[18px]"
            style={{ marginTop: "12px" }}
          >
            <ShareAction
              title={summary.name}
              text={townShareText(summary, tShare)}
              label={t("shareLabel")}
              moment="town"
              itemId={summary.slug}
              className="hit-area focus-ring"
            />
            <CopyLinkAction
              moment="town"
              itemId={summary.slug}
              className="hit-area focus-ring"
            />
          </div>
        </div>
      </div>

      {town.description?.trim() && (
        <RecordText
          as="p"
          style={{
            margin: "0 0 4px",
            maxWidth: "620px",
            fontSize: "15px",
            lineHeight: 1.6,
            color: "var(--foreground)",
          }}
        >
          {town.description}
        </RecordText>
      )}

      <div
        className="grid items-start gap-8"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          marginTop: "34px",
        }}
      >
        <div className="flex min-w-0 flex-col" style={{ gap: "30px" }}>
          <section
            className="rounded-2xl border border-dashed"
            style={{
              padding: "26px",
              borderColor:
                "color-mix(in srgb, var(--brand-sobrado-ochre) 45%, transparent)",
              background:
                "color-mix(in srgb, var(--brand-sobrado-ochre) 4%, transparent)",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                letterSpacing: ".18em",
                textTransform: "uppercase",
                color: "var(--brand-sobrado-ochre)",
                marginBottom: "10px",
              }}
            >
              {panel.eyebrow}
            </div>
            <h2
              className="font-serif"
              style={{
                fontWeight: 400,
                fontSize: "27px",
                margin: "0 0 8px",
                lineHeight: 1.15,
              }}
            >
              {panel.heading}
            </h2>
            <p
              className="text-pretty"
              style={{
                margin: "0 0 18px",
                color: "var(--foreground-secondary)",
                fontSize: "14px",
                lineHeight: 1.55,
                maxWidth: "520px",
              }}
            >
              {panel.body}
            </p>
            <div className="flex flex-wrap gap-2">
              <IdentifyQuestion
                {...identify}
                field="photograph"
                variant="primary"
              >
                {panel.giveLabel}
              </IdentifyQuestion>
              {panel.unconfirmedLabel && (
                <Link
                  href={unconfirmedLink(summary)}
                  className="rounded-full border transition-colors hover:border-[var(--brand-ocean-blue)]"
                  style={{
                    padding: "10px 18px",
                    fontSize: "13px",
                    borderColor: "var(--border-strong)",
                    color: "var(--foreground)",
                  }}
                >
                  {panel.unconfirmedLabel}
                </Link>
              )}
            </div>
          </section>

          {entries.length > 0 && (
            <section>
              <h2
                className="font-serif"
                style={{
                  fontWeight: 400,
                  fontSize: "27px",
                  margin: "0 0 14px",
                }}
              >
                {t("recordedHere")}
              </h2>
              <div className="flex flex-col gap-2">
                {entries.map((entry) => (
                  <RecordRow
                    key={entry.id}
                    entry={entry}
                    townSlug={summary.slug}
                    t={t}
                    tStatus={tStatus}
                    tCategories={tCategories}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-[14px]">
          <div
            className="overflow-hidden rounded-2xl border"
            style={{
              borderColor: "var(--border-subtle)",
              background: "var(--card)",
            }}
          >
            <MiniMap
              lat={summary.latitude}
              lng={summary.longitude}
              status={status.status}
              height={240}
            />
            <div style={{ padding: "15px 16px" }}>
              {coordinates && (
                <div
                  className="font-mono"
                  style={{
                    fontSize: "11px",
                    color: "var(--foreground-secondary)",
                    marginBottom: "12px",
                  }}
                >
                  {coordinates}
                </div>
              )}
              <Link
                href={`/map?mode=settlements&sel=${encodeURIComponent(`s:${summary.slug}`)}`}
                className="block rounded-full border text-center transition-colors hover:border-[var(--brand-ocean-blue)]"
                style={{
                  padding: "10px",
                  fontSize: "13px",
                  background: "var(--background-secondary)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--foreground)",
                }}
              >
                {t("openInMap")}
              </Link>
            </div>
          </div>

          {questions.length > 0 && (
            <div
              className="rounded-2xl border"
              style={{
                padding: "16px",
                borderColor: "var(--border-subtle)",
                background: "var(--card)",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  color: "var(--foreground-secondary)",
                  marginBottom: "12px",
                }}
              >
                {t("notRecorded")}
              </div>
              <div className="flex flex-col gap-[9px]">
                {questions.map((question) => (
                  <IdentifyQuestion
                    key={question.field}
                    {...identify}
                    field={question.field}
                  >
                    {question.question}
                  </IdentifyQuestion>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RecordRow({
  entry,
  townSlug,
  t,
  tStatus,
  tCategories,
}: {
  entry: DirectoryEntry;
  townSlug: string;
  t: TownTranslator;
  tStatus: StatusTranslator;
  tCategories: CategoryTranslator;
}) {
  const status = getEntryStatus(entry, tStatus);

  return (
    <Link
      href={`/${townSlug}/${entry.slug}`}
      className="flex items-center gap-[13px] rounded-xl border transition-colors hover:border-[var(--border-strong)]"
      style={{
        padding: "15px",
        background: "var(--card)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <span
        aria-hidden
        className="flex-none rounded-full"
        style={{
          width: "8px",
          height: "8px",
          background: statusVar(status.status),
        }}
      />
      <div className="min-w-0 flex-1">
        <div
          className="font-serif"
          style={{ fontWeight: 400, fontSize: "18px", lineHeight: 1.2 }}
        >
          {entry.name}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "var(--foreground-secondary)",
            marginTop: "3px",
            letterSpacing: ".1em",
            textTransform: "uppercase",
          }}
        >
          {categoryLabel(entry.category, tCategories)}
        </div>
      </div>
      {!entry.imageUrl?.trim() && (
        <span
          className="flex-none"
          style={{ fontSize: "12px", color: "var(--brand-sobrado-ochre)" }}
        >
          {t("noPhotograph")}
        </span>
      )}
    </Link>
  );
}
