import Image from "next/image";
import Link from "next/link";

import { IdentifyQuestion } from "@/components/identify/identify-question";
import { MiniMap } from "@/features/map/components/mini-map";
import { MissingPills } from "@/components/ui/missing-pills";
import { CopyLinkAction, ShareAction } from "@/components/ui/archive-actions";
import { formatCoordinates } from "@/lib/coordinates";
import {
  completenessSentence,
  countedFields,
  placeFields,
} from "@/lib/field-questions";
import { resolvePublicImageUrl } from "@/lib/gallery-mappers";
import { photoFacts } from "@/lib/photo-facts";
import { getEntryStatus, statusTint, statusVar } from "@/lib/status";
import type { DirectoryEntry } from "@/types/directory";
import type { PublicGalleryMedia } from "@/types/gallery";

import {
  alsoRecorded,
  heroCredit,
  heroEyebrow,
  photographsNote,
  ratingNote,
} from "./place-record-copy";

/**
 * One place record. Spec 034 FR-013.
 *
 * The "This record" card is the screen's argument: a sentence counting what is
 * recorded, a bar with one segment per field, and a grid where every empty row asks
 * its own question rather than showing a dash.
 */
export function PlaceRecord({
  entry,
  townSlug,
  photographs,
  siblings,
}: {
  entry: DirectoryEntry;
  townSlug: string;
  photographs: PublicGalleryMedia[];
  siblings: DirectoryEntry[];
}) {
  const fields = placeFields(entry);
  // One segment per counted row, so the bar and the sentence above it agree with the
  // API's denominator even where the grid shows more than the denominator counts.
  const segments = countedFields(entry);
  const status = getEntryStatus(entry);
  const credit = heroCredit(entry);
  // Same guard the field grid applies: 0,0 is an unplaced submission's default, and
  // printing it under the locator map would assert a position the record lacks.
  const placed = !(entry.latitude === 0 && entry.longitude === 0);
  const coordinates = placed
    ? formatCoordinates(entry.latitude, entry.longitude)
    : null;
  const photographs_ = photographsNote(entry, photographs.length);
  const siblingSection = alsoRecorded(entry, siblings.length);
  const rating = ratingNote(entry);
  const identify = {
    contentType: "entry",
    contentId: entry.id,
    pageTitle: entry.name,
  };

  return (
    <div>
      <div className="relative" style={{ background: "var(--muted)" }}>
        <div
          className="relative w-full"
          style={{ height: "42vh", minHeight: "260px" }}
        >
          {entry.imageUrl ? (
            <Image
              src={entry.imageUrl}
              alt={`${entry.name}, ${entry.town}`}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: "center 38%" }}
            />
          ) : (
            // A record with no hero would otherwise head its page with a blank band
            // that reads as a failed image. The absence is the archive's central
            // fact about this record, so it is stated.
            <div className="flex h-full w-full items-center justify-center">
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--foreground-secondary)",
                }}
              >
                no photograph recorded
              </span>
            </div>
          )}
        </div>

        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            padding: "70px 22px 20px",
            background:
              "linear-gradient(to top, rgba(8,11,15,.92), transparent)",
          }}
        >
          <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
            <div
              style={{
                fontSize: "12px",
                // Ink over a photograph is fixed in both themes.
                color: "var(--neutral-mist-100)",
                marginBottom: "8px",
              }}
            >
              {heroEyebrow(entry)}
            </div>
            <h1
              className="font-serif"
              style={{
                fontWeight: 400,
                fontSize: "42px",
                lineHeight: 1.05,
                margin: 0,
                letterSpacing: "-0.02em",
                color: "var(--neutral-mist-50)",
              }}
            >
              {entry.name}
            </h1>
          </div>
        </div>

        {credit && (
          <div
            className="absolute rounded-lg border backdrop-blur-[6px]"
            style={{
              top: "14px",
              right: "14px",
              padding: "6px 10px",
              fontSize: "11px",
              background:
                "color-mix(in srgb, var(--background) 85%, transparent)",
              borderColor: "var(--border-subtle)",
              color: "var(--foreground-secondary)",
            }}
          >
            {credit}
          </div>
        )}
      </div>

      <div
        className="grid items-start gap-[34px]"
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "34px 22px 80px",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        }}
      >
        <div className="flex min-w-0 flex-col" style={{ gap: "30px" }}>
          {entry.description?.trim() && (
            <p
              className="text-pretty"
              style={{
                margin: 0,
                fontSize: "16px",
                lineHeight: 1.65,
                color: "var(--foreground)",
              }}
            >
              {entry.description}
            </p>
          )}

          <section
            className="rounded-2xl border"
            style={{
              padding: "20px",
              borderColor: "var(--border-subtle)",
              background: "var(--card)",
            }}
          >
            <div
              className="flex flex-wrap items-baseline justify-between gap-[14px]"
              style={{ marginBottom: "14px" }}
            >
              <h2
                style={{
                  fontSize: "10px",
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  color: "var(--foreground-secondary)",
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                This record
              </h2>
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--foreground-secondary)",
                }}
              >
                {completenessSentence(entry)}
              </div>
            </div>

            <div
              aria-hidden
              className="flex gap-[3px]"
              style={{ marginBottom: "18px" }}
            >
              {segments.map((field) => (
                <span
                  key={field.key}
                  className="flex-1 rounded-full"
                  style={{
                    height: "5px",
                    background:
                      field.value !== null
                        ? statusVar("documented")
                        : statusTint("name", 35),
                  }}
                />
              ))}
            </div>

            <dl
              className="grid gap-x-[22px] gap-y-[10px]"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              }}
            >
              {fields.map((field) => (
                <div
                  key={field.key}
                  className="flex flex-col gap-[3px] border-b"
                  style={{
                    padding: "7px 0",
                    borderBottomColor:
                      "color-mix(in srgb, var(--border-subtle) 70%, transparent)",
                  }}
                >
                  <dt
                    style={{
                      fontSize: "11px",
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      color: "var(--foreground-secondary)",
                    }}
                  >
                    {field.label}
                  </dt>
                  <dd
                    className={field.mono ? "font-mono" : undefined}
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color:
                        field.value !== null
                          ? "var(--foreground)"
                          : "var(--brand-sobrado-ochre)",
                    }}
                  >
                    {field.value ?? "not recorded"}
                  </dd>
                  {field.value === null && (
                    <IdentifyQuestion
                      {...identify}
                      field={field.key}
                      variant="field"
                      className="self-start"
                    >
                      {field.question}
                    </IdentifyQuestion>
                  )}
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h2
              className="font-serif"
              style={{ fontWeight: 400, fontSize: "25px", margin: "0 0 6px" }}
            >
              Photographs of this place
            </h2>
            {photographs_.note && (
              <p
                style={{
                  margin: "0 0 14px",
                  color: "var(--foreground-secondary)",
                  fontSize: "14px",
                }}
              >
                {photographs_.note}
              </p>
            )}

            {photographs_.showEmptyState ? (
              <div
                className="rounded-2xl border border-dashed text-center"
                style={{
                  padding: "34px 22px",
                  borderColor: "var(--border-strong)",
                }}
              >
                <p
                  style={{
                    margin: "0 0 14px",
                    color: "var(--foreground-secondary)",
                    fontSize: "14px",
                    lineHeight: 1.55,
                  }}
                >
                  {photographs_.prompt}
                </p>
                <IdentifyQuestion
                  {...identify}
                  field="photograph"
                  variant="primary"
                >
                  Give a photograph to the archive
                </IdentifyQuestion>
              </div>
            ) : (
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                }}
              >
                {photographs.map((media) => (
                  <PlacePhotographTile key={media.id} media={media} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2
              className="font-serif"
              style={{ fontWeight: 400, fontSize: "25px", margin: "0 0 6px" }}
            >
              {siblingSection.heading}
            </h2>
            {siblingSection.emptyNote ? (
              <p
                style={{
                  margin: 0,
                  color: "var(--foreground-secondary)",
                  fontSize: "14px",
                }}
              >
                {siblingSection.emptyNote}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {siblings.map((sibling) => (
                  <Link
                    key={sibling.id}
                    href={`/${townSlug}/${sibling.slug}`}
                    className="flex items-center gap-[13px] rounded-xl border transition-colors hover:border-[var(--border-strong)]"
                    style={{
                      padding: "13px 15px",
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
                        background: statusVar(getEntryStatus(sibling).status),
                      }}
                    />
                    <span
                      className="font-serif"
                      style={{ fontWeight: 400, fontSize: "17px" }}
                    >
                      {sibling.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <div
            className="flex flex-wrap gap-[18px] border-t"
            style={{
              paddingTop: "18px",
              borderTopColor: "var(--border-subtle)",
            }}
          >
            <ShareAction title={entry.name} />
            <CopyLinkAction />
            <IdentifyQuestion
              {...identify}
              field="correction"
              variant="quiet"
              className="!text-[13px]"
            >
              Suggest a correction
            </IdentifyQuestion>
          </div>
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
              lat={entry.latitude}
              lng={entry.longitude}
              status={status.status}
              height={220}
            />
            <div style={{ padding: "14px 16px" }}>
              <div
                className="flex items-center gap-2"
                style={{ marginBottom: "10px" }}
              >
                <span
                  aria-hidden
                  className="rounded-full"
                  style={{
                    width: "8px",
                    height: "8px",
                    background: statusVar(status.status),
                  }}
                />
                <span
                  style={{
                    fontSize: "13px",
                    color: "var(--foreground-secondary)",
                  }}
                >
                  {status.label}
                </span>
              </div>
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
                href={`/map?mode=records&sel=${encodeURIComponent(`r:${entry.slug}`)}`}
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

          {rating && (
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
                  marginBottom: "10px",
                }}
              >
                Nothing here yet
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "var(--foreground-secondary)",
                  lineHeight: 1.55,
                }}
              >
                {rating}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlacePhotographTile({ media }: { media: PublicGalleryMedia }) {
  const facts = photoFacts(media);
  const url = resolvePublicImageUrl(media);

  return (
    <Link
      href={`/photographs/${media.id}`}
      className="block overflow-hidden rounded-xl border transition-colors hover:border-[var(--border-strong)]"
      style={{ background: "var(--card)", borderColor: "var(--border-subtle)" }}
    >
      <div
        className="relative w-full"
        style={{ height: "120px", background: "var(--muted)" }}
      >
        {url && (
          <Image
            src={url}
            alt={media.altText?.trim() || facts.title.text}
            fill
            sizes="200px"
            className="object-cover"
          />
        )}
      </div>
      <div style={{ padding: "10px 11px 11px" }}>
        <div
          className="font-serif"
          style={{
            fontWeight: 400,
            fontSize: "15px",
            marginBottom: "7px",
            color: facts.title.untitled
              ? "var(--foreground-secondary)"
              : "var(--foreground)",
            fontStyle: facts.title.untitled ? "italic" : "normal",
          }}
        >
          {facts.title.text}
        </div>
        <MissingPills missing={facts.missing} />
      </div>
    </Link>
  );
}
