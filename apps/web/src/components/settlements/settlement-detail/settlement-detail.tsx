import Link from "next/link";

import { IdentifyQuestion } from "@/components/identify/identify-question";
import { MiniMap } from "@/features/map/components/mini-map";
import { categoryLabel } from "@/lib/category-label";
import { formatCoordinates } from "@/lib/coordinates";
import { getEntryStatus, getTownStatus, statusVar } from "@/lib/status";
import type { DirectoryEntry } from "@/types/directory";
import type { Town, TownStatusSummary } from "@/types/town";

import {
  photographPanel,
  settlementQuestions,
  settlementSubLine,
  unconfirmedLink,
} from "./settlement-detail-copy";

/**
 * One settlement. Spec 034 FR-008.
 *
 * Two columns: what the archive holds here on the left, where it is and what it does
 * not know on the right. The ochre dashed panel leads because the absence of a
 * photograph is the most useful thing the page can tell a reader who might have one.
 */
export function SettlementDetail({
  town,
  summary,
  entries,
}: {
  town: Town;
  summary: TownStatusSummary;
  entries: DirectoryEntry[];
}) {
  const status = getTownStatus(summary);
  const panel = photographPanel(summary);
  const questions = settlementQuestions(town, summary);
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
      <Link
        href="/settlements"
        className="inline-block transition-colors hover:text-[var(--foreground)]"
        style={{
          fontSize: "13px",
          color: "var(--foreground-secondary)",
          marginBottom: "18px",
        }}
      >
        ← All settlements
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
            {settlementSubLine(summary)}
          </div>
        </div>
      </div>

      {town.description?.trim() && (
        <p
          style={{
            margin: "0 0 4px",
            maxWidth: "620px",
            fontSize: "15px",
            lineHeight: 1.6,
            color: "var(--foreground)",
          }}
        >
          {town.description}
        </p>
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
                Recorded here
              </h2>
              <div className="flex flex-col gap-2">
                {entries.map((entry) => (
                  <RecordRow
                    key={entry.id}
                    entry={entry}
                    townSlug={summary.slug}
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
                Open in the map explorer
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
                Not recorded
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
}: {
  entry: DirectoryEntry;
  townSlug: string;
}) {
  const status = getEntryStatus(entry);

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
          {categoryLabel(entry.category)}
        </div>
      </div>
      {!entry.imageUrl?.trim() && (
        <span
          className="flex-none"
          style={{ fontSize: "12px", color: "var(--brand-sobrado-ochre)" }}
        >
          no photograph
        </span>
      )}
    </Link>
  );
}
