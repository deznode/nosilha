import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

import { IdentifyQuestion } from "@/components/identify/identify-question";
import { RecordText } from "@/components/ui/record-text";
import { statusVar } from "@/lib/status";
import type { DirectoryEntry } from "@/types/directory";

import { stayRating, stayStandfirst, type StayTranslator } from "./stay-copy";

/**
 * Everywhere a visitor can stay. Spec 034 FR-014.
 *
 * Every card carries the same two admissions: whether there is a photograph and
 * whether anyone has rated it. "Stayed here?" is the way in for the second.
 */
export async function StayContent({
  stays,
  townSlugs,
}: {
  stays: DirectoryEntry[];
  /** Settlement id to slug, so a card can link at its record without guessing. */
  townSlugs: Record<string, string>;
}) {
  const [t, locale] = await Promise.all([getTranslations("stay"), getLocale()]);

  return (
    <div
      style={{
        maxWidth: "1180px",
        margin: "0 auto",
        padding: "40px 22px 80px",
      }}
    >
      <h1
        className="font-serif"
        style={{
          fontWeight: 400,
          fontSize: "46px",
          margin: "0 0 12px",
          letterSpacing: "-0.02em",
        }}
      >
        {t("heading")}
      </h1>
      <p
        style={{
          margin: "0 0 30px",
          color: "var(--foreground-secondary)",
          fontSize: "15px",
          maxWidth: "620px",
          lineHeight: 1.55,
        }}
      >
        {stayStandfirst(t, locale, stays)}
      </p>

      <div
        className="grid gap-[14px]"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
      >
        {stays.map((entry) => (
          <StayCard
            key={entry.id}
            entry={entry}
            townSlug={entry.townId ? townSlugs[entry.townId] : undefined}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}

function StayCard({
  entry,
  townSlug,
  t,
}: {
  entry: DirectoryEntry;
  townSlug?: string;
  t: StayTranslator;
}) {
  const rating = stayRating(t, entry);
  // No link rather than a guessed one: a record whose settlement has not resolved has
  // no address under `/[town]/[entry]`, and inventing a slug would 404.
  const href = townSlug ? `/${townSlug}/${entry.slug}` : null;

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border"
      style={{
        background: "var(--card)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div
        className="relative flex items-center justify-center border-b"
        style={{
          height: "132px",
          background: "var(--muted)",
          borderBottomColor: "var(--border-subtle)",
        }}
      >
        {entry.imageUrl ? (
          <Image
            src={entry.imageUrl}
            alt={t("photoAlt", { name: entry.name, town: String(entry.town) })}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover"
          />
        ) : (
          <span
            style={{ fontSize: "12px", color: "var(--foreground-secondary)" }}
          >
            {t("noPhotographRecorded")}
          </span>
        )}
      </div>

      <div
        className="flex flex-1 flex-col gap-[9px]"
        style={{ padding: "16px" }}
      >
        <div>
          <div
            className="font-serif"
            style={{ fontWeight: 400, fontSize: "20px", lineHeight: 1.2 }}
          >
            {href ? <Link href={href}>{entry.name}</Link> : entry.name}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "var(--foreground-secondary)",
              marginTop: "4px",
            }}
          >
            {entry.town}
          </div>
        </div>

        {entry.description?.trim() && (
          <RecordText
            as="p"
            style={{
              margin: 0,
              fontSize: "13px",
              color: "var(--foreground-secondary)",
              lineHeight: 1.5,
            }}
          >
            {entry.description}
          </RecordText>
        )}

        <div
          className="mt-auto flex items-center justify-between gap-[10px] border-t"
          style={{
            paddingTop: "12px",
            borderTopColor:
              "color-mix(in srgb, var(--border-subtle) 70%, transparent)",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              color: rating.ochre ? statusVar("name") : "var(--foreground)",
            }}
          >
            {rating.text}
          </span>
          <IdentifyQuestion
            contentType="entry"
            contentId={entry.id}
            field="rating"
            pageTitle={entry.name}
            variant="quiet"
          >
            {t("stayedHere")}
          </IdentifyQuestion>
        </div>
      </div>
    </div>
  );
}
