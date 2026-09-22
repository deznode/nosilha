"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { IdentifyQuestion } from "@/components/identify/identify-question";
import { ShareAction } from "@/components/ui/archive-actions";
import { useNarrow } from "@/hooks/use-narrow";
import { useIdentifyContext } from "@/stores/identifyStore";
import { resolvePublicImageUrl } from "@/lib/gallery-mappers";
import { photoFacts } from "@/lib/photo-facts";
import type { PhotoSequence, PublicGalleryMedia } from "@/types/gallery";

import {
  askRows,
  knownRows,
  positionLine,
  showOnMapLink,
} from "./photo-detail-rows";

/**
 * The top bar's height, which the sticky stage sits under.
 *
 * The token, not the 65 that used to be inlined here: the bar is 52px on a phone,
 * 64px on a tablet and 65px from 1024 up, so the constant was only ever right at
 * desktop width, and it restated a number `globals.css` and `archive-skeleton`
 * already share. Spec 037.
 */
const BAR_HEIGHT = "var(--chrome-top-bar-height)";

/**
 * One photograph, full bleed. Spec 034 FR-010, FR-012.
 *
 * The stage is sticky beside a scrolling metadata column on a desktop and stacks
 * above it when narrow. The breakpoint drives rendering rather than CSS because the
 * two layouts are different structures, not one reflowed.
 */
export function PhotoDetail({
  media,
  sequence,
}: {
  media: PublicGalleryMedia;
  sequence: PhotoSequence | null;
}) {
  const router = useRouter();
  const narrow = useNarrow();
  const identifyOpen = useIdentifyContext() !== null;

  const facts = photoFacts(media);
  const url = resolvePublicImageUrl(media);
  const known = knownRows(media);
  const asks = askRows(media);
  const mapLink = showOnMapLink(media);

  const previousId = sequence?.previousId ?? null;
  const nextId = sequence?.nextId ?? null;

  /**
   * Under `cacheComponents`, a hidden route keeps its DOM but has its effects torn
   * down, so this cleanup is what removes the listener when the reader navigates
   * away — and the setup is what puts it back when they come back.
   */
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      // The identify sheet opens from this screen and its answers are typed into
      // text inputs. Without these two guards an arrow key moves the caret *and*
      // navigates to the next photograph, discarding what was typed, and Escape both
      // closes the sheet and throws the reader off the record.
      if (identifyOpen) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest?.("input, textarea, select, [contenteditable]"))
        return;

      if (event.key === "Escape") {
        router.push("/photographs");
        return;
      }
      if (event.key === "ArrowLeft" && previousId) {
        router.push(`/photographs/${previousId}`);
        return;
      }
      if (event.key === "ArrowRight" && nextId) {
        router.push(`/photographs/${nextId}`);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router, previousId, nextId, identifyOpen]);

  const stageStyle: React.CSSProperties = narrow
    ? {
        flex: "1 1 100%",
        minWidth: 0,
        padding: "18px 18px 56px",
        position: "relative",
      }
    : {
        flex: "1 1 480px",
        minWidth: 0,
        padding: "30px",
        position: "sticky",
        top: BAR_HEIGHT,
        alignSelf: "flex-start",
        height: `calc(100vh - ${BAR_HEIGHT})`,
      };

  const metaStyle: React.CSSProperties = narrow
    ? {
        flex: "1 1 100%",
        minWidth: 0,
        borderTop: "1px solid var(--border-subtle)",
        padding: "24px 20px 40px",
      }
    : {
        // At its desktop `0 1 400px` the column keeps a 400px width with dead space
        // beside it once the stage stops being a column of its own.
        flex: "0 1 400px",
        minWidth: "300px",
        borderLeft: "1px solid var(--border-subtle)",
        padding: "30px 28px",
      };

  return (
    <div
      className="flex flex-wrap"
      style={{
        minHeight: `calc(100vh - ${BAR_HEIGHT})`,
        background: "var(--muted)",
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{ ...stageStyle, boxSizing: "border-box" }}
      >
        <div
          className="relative w-full"
          style={{ height: narrow ? "44vh" : "74vh" }}
        >
          {url && (
            <Image
              src={url}
              alt={media.altText?.trim() || facts.title.text}
              fill
              priority
              sizes="(max-width: 860px) 100vw, 60vw"
              className="object-contain"
              style={{ filter: "drop-shadow(0 30px 60px rgba(0,0,0,.6))" }}
            />
          )}
        </div>

        <div
          className="absolute flex items-center justify-between gap-3"
          style={{ left: "30px", right: "30px", bottom: "22px" }}
        >
          <StepButton
            href={previousId ? `/photographs/${previousId}` : null}
            label="Previous photograph"
          >
            ←
          </StepButton>
          <span
            className="text-center"
            style={{ color: "var(--foreground-secondary)", fontSize: "12px" }}
          >
            {positionLine(media, sequence)}
          </span>
          <StepButton
            href={nextId ? `/photographs/${nextId}` : null}
            label="Next photograph"
          >
            →
          </StepButton>
        </div>
      </div>

      <div
        className="flex flex-col gap-[22px]"
        style={{ ...metaStyle, background: "var(--background)" }}
      >
        <Link
          href="/photographs"
          className="self-start transition-colors hover:text-[var(--foreground)]"
          style={{ fontSize: "13px", color: "var(--foreground-secondary)" }}
        >
          ← Back to photographs
        </Link>

        <div>
          <div
            style={{
              fontSize: "10px",
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "var(--brand-ocean-blue)",
              marginBottom: "9px",
            }}
          >
            {media.category?.trim() || "no category"}
          </div>
          <h1
            className="font-serif"
            style={{
              fontWeight: 400,
              fontSize: "33px",
              lineHeight: 1.1,
              margin: "0 0 10px",
              color: facts.title.untitled
                ? "var(--foreground-secondary)"
                : "var(--foreground)",
              fontStyle: facts.title.untitled ? "italic" : "normal",
            }}
          >
            {facts.title.text}
          </h1>
          {facts.filename && (
            <div
              className="font-mono break-all"
              style={{ fontSize: "11px", color: "var(--foreground-secondary)" }}
            >
              {facts.filename}
            </div>
          )}
        </div>

        <section
          className="border-t"
          style={{ paddingTop: "18px", borderTopColor: "var(--border-subtle)" }}
        >
          <h2
            style={{
              fontSize: "10px",
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "var(--foreground-secondary)",
              marginBottom: "12px",
              fontWeight: 400,
            }}
          >
            What we know
          </h2>
          {known.map((row) => (
            <div
              key={row.key}
              className="flex gap-3 border-b"
              style={{
                padding: "8px 0",
                borderBottomColor:
                  "color-mix(in srgb, var(--border-subtle) 60%, transparent)",
              }}
            >
              <span
                style={{
                  flex: "0 0 96px",
                  color: "var(--foreground-secondary)",
                  fontSize: "13px",
                }}
              >
                {row.label}
              </span>
              <span
                className={row.mono ? "font-mono break-words" : "break-words"}
                style={{ flex: 1, minWidth: 0, fontSize: "13px" }}
              >
                {row.value}
                {row.note && (
                  <span style={{ color: "var(--foreground-secondary)" }}>
                    {" "}
                    {row.note}
                  </span>
                )}
              </span>
            </div>
          ))}
        </section>

        {asks.length > 0 && (
          <section
            className="rounded-xl border"
            style={{
              padding: "16px",
              borderColor:
                "color-mix(in srgb, var(--brand-sobrado-ochre) 40%, transparent)",
              background:
                "color-mix(in srgb, var(--brand-sobrado-ochre) 5%, transparent)",
            }}
          >
            <h2
              style={{
                fontSize: "10px",
                letterSpacing: ".18em",
                textTransform: "uppercase",
                color: "var(--brand-sobrado-ochre)",
                marginBottom: "12px",
                fontWeight: 400,
              }}
            >
              What is missing
            </h2>
            {asks.map((row) => (
              <div
                key={row.key}
                className="border-b"
                style={{
                  padding: "9px 0",
                  borderBottomColor:
                    "color-mix(in srgb, var(--brand-sobrado-ochre) 16%, transparent)",
                }}
              >
                <div
                  className="flex items-baseline gap-[10px]"
                  style={{ marginBottom: "4px" }}
                >
                  <span
                    style={{
                      flex: "0 0 86px",
                      color: "var(--foreground-secondary)",
                      fontSize: "13px",
                    }}
                  >
                    {row.label}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--brand-sobrado-ochre)",
                    }}
                  >
                    not recorded
                  </span>
                </div>
                <IdentifyQuestion
                  contentType="media"
                  contentId={media.id}
                  mediaId={media.id}
                  field={row.key}
                  pageTitle={facts.title.text}
                  variant="answer"
                  className="ml-[96px]"
                >
                  {row.question}
                </IdentifyQuestion>
              </div>
            ))}
          </section>
        )}

        <div className="mt-auto flex flex-wrap gap-2">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                padding: "11px 20px",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              View full size
            </a>
          )}
          {mapLink && (
            <Link
              href={mapLink}
              className="rounded-full border transition-colors hover:border-[var(--border-strong)]"
              style={{
                padding: "10px 18px",
                fontSize: "13px",
                background: "var(--background-secondary)",
                borderColor: "var(--border-subtle)",
                color: "var(--foreground)",
              }}
            >
              Show on map
            </Link>
          )}
          <ShareAction title={facts.title.text} variant="pill" />
        </div>
      </div>
    </div>
  );
}

/**
 * A step is a link, not a button: it has a destination, so it should be openable in a
 * new tab and reachable by a screen reader as navigation. With one located record
 * there is nowhere to step, and the control says so rather than looping in place.
 */
function StepButton({
  href,
  label,
  children,
}: {
  href: string | null;
  label: string;
  children: React.ReactNode;
}) {
  const style: React.CSSProperties = {
    width: "38px",
    height: "38px",
    fontSize: "15px",
    background: "color-mix(in srgb, var(--card) 90%, transparent)",
    borderColor: "var(--border-strong)",
    color: "var(--foreground)",
  };

  if (!href) {
    return (
      <span
        aria-hidden
        className="flex items-center justify-center rounded-full border opacity-40"
        style={style}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className="flex items-center justify-center rounded-full border"
      style={style}
    >
      {children}
    </Link>
  );
}
