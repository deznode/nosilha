"use client";

import { useState } from "react";
import Image from "next/image";
import { submitMediaCorrection } from "@/lib/api";
import { ApiError } from "@/lib/api-error";
import { UNTITLED_FILM } from "@/lib/films";

import type { FilmLookupResult } from "../hooks/use-film-lookup";

import {
  FILM_PLATFORM_LABEL,
  filmThumbnailUrl,
  type ParsedFilmLink,
} from "../lib/parse-video-url";

interface DuplicateCardProps extends ParsedFilmLink {
  status: "public" | "pending";
  /**
   * The public film the link matches (F5 only): its archive URL, the id a
   * correction is posted against, and whatever title, place and date the
   * record holds.
   */
  media?: FilmLookupResult["media"];
  /** Called when posting a correction comes back 401 — the parent owns sign-in. */
  onNeedsSignIn?: () => void;
}

const MAX_CORRECTION_LENGTH = 2000;

/**
 * The 96px 16:9 thumbnail shared by both duplicate-card states. YouTube gets
 * its real thumbnail from `i.ytimg.com`; Vimeo never requests an image (it
 * has no thumbnail endpoint), so it gets a miniature of the ochre dashed
 * frame from the link preview instead. Spec 039 F5/F6.
 */
function DuplicateThumb(link: ParsedFilmLink) {
  const thumbnail = filmThumbnailUrl(link);
  return (
    <div className="bg-surface-alt relative aspect-video w-24 flex-none overflow-hidden rounded-md">
      {thumbnail ? (
        <Image
          src={thumbnail}
          alt=""
          fill
          sizes="96px"
          className="object-cover"
        />
      ) : (
        <div className="border-sobrado-ochre absolute inset-1 flex items-center justify-center rounded-[4px] border border-dashed">
          <span className="text-sobrado-ochre font-mono text-[8px] font-semibold tracking-[.1em] uppercase">
            Vimeo
          </span>
        </div>
      )}
    </div>
  );
}

/** The thumbnail plus title/meta pair, shared by both duplicate-card states. */
function DuplicateMediaRow({
  platform,
  externalId,
  title,
  meta,
}: ParsedFilmLink & { title: string; meta: string }) {
  return (
    <div className="flex items-center gap-3">
      <DuplicateThumb platform={platform} externalId={externalId} />
      <div className="min-w-0">
        <div className="truncate text-[15px] font-medium">{title}</div>
        <div className="text-muted mt-[3px] text-[13px]">{meta}</div>
      </div>
    </div>
  );
}

/**
 * The duplicate-check card shown once a film link's lookup resolves to an
 * existing media item (F5/F6). Both states share the same card shape and
 * media row — the thumbnail comes from the link the person pasted
 * (`platform`/`externalId`), not from anything the lookup reveals, so a
 * `pending` submission leaks nothing about the record beyond what's already
 * on the page.
 *
 * `public` (F5) additionally names the film (its title, then
 * `YouTube · Nova Sintra · 1987` from whatever the record holds), and shows
 * a link into the archive and a form to send a correction. `pending` (F6) is status only — the item isn't public
 * yet, so there's no archive link and no correction target. Spec 039.
 */
export function DuplicateCard({
  status,
  platform,
  externalId,
  media,
  onNeedsSignIn,
}: DuplicateCardProps) {
  if (status === "pending") {
    return (
      <div className="border-sobrado-ochre bg-card rounded-card flex flex-col gap-3.5 border-[1.5px] p-4">
        <div className="text-sobrado-ochre font-mono text-[10.5px] font-semibold tracking-[.13em] uppercase">
          Already sent · waiting for review
        </div>
        <DuplicateMediaRow
          platform={platform}
          externalId={externalId}
          title={FILM_PLATFORM_LABEL[platform]}
          meta={`${FILM_PLATFORM_LABEL[platform]} · not public yet`}
        />
        <p className="text-muted text-[14px] leading-[1.55]">
          Someone has already sent this link. A person will review it soon, so
          it isn&apos;t public yet.
        </p>
        <p className="text-muted text-[12.5px] leading-[1.5]">
          The reviewer will see it alongside the original.
        </p>
      </div>
    );
  }

  return (
    <div className="border-valley-green bg-card rounded-card flex flex-col gap-3.5 border-[1.5px] p-4">
      <div className="text-valley-green font-mono text-[10.5px] font-semibold tracking-[.13em] uppercase">
        Already in the archive
      </div>
      <DuplicateMediaRow
        platform={platform}
        externalId={externalId}
        title={media?.title ?? UNTITLED_FILM}
        meta={[
          FILM_PLATFORM_LABEL[platform],
          media?.place,
          media?.approximateDate,
        ]
          .filter(Boolean)
          .join(" · ")}
      />
      <p className="text-muted text-[14px] leading-[1.55]">
        This film is already in the archive, so there&apos;s no need to send it
        again.
      </p>
      {media && (
        <a
          href={media.url}
          target="_blank"
          rel="noreferrer"
          className="text-ocean-blue text-[14px] font-semibold"
        >
          See it in the archive →
        </a>
      )}
      {media && (
        <CorrectionForm mediaId={media.id} onNeedsSignIn={onNeedsSignIn} />
      )}
    </div>
  );
}

function CorrectionForm({
  mediaId,
  onNeedsSignIn,
}: {
  mediaId: string;
  onNeedsSignIn?: () => void;
}) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "sent" | "error" | "hidden"
  >("idle");

  if (status === "hidden") return null;

  if (status === "sent") {
    return (
      <div className="border-hairline flex flex-col gap-2 border-t pt-[14px]">
        <p className="text-[14px] font-medium">
          Thank you. A person will read it.
        </p>
      </div>
    );
  }

  const trimmed = text.trim();
  const tooLong = trimmed.length > MAX_CORRECTION_LENGTH;
  const canSend = trimmed.length > 0 && !tooLong && status !== "submitting";

  const handleSend = async () => {
    if (!canSend) return;
    setStatus("submitting");
    try {
      await submitMediaCorrection(mediaId, trimmed);
      setStatus("sent");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setStatus("idle");
          onNeedsSignIn?.();
          return;
        }
        if (err.status === 404 || err.status >= 500) {
          setStatus("hidden");
          return;
        }
      }
      setStatus("error");
    }
  };

  return (
    <div className="border-hairline flex flex-col gap-2.5 border-t pt-[14px]">
      <div className="text-[13px] font-semibold">
        Know something about it we don&apos;t?
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={status === "submitting"}
        placeholder="A better title, who is in it, where or when it was filmed"
        className="border-border-strong bg-card text-body placeholder:text-muted-foreground focus:border-ocean-blue rounded-badge min-h-20 border px-3 py-[11px] text-[15px] leading-[1.45] outline-none focus:border-[1.5px]"
      />
      {tooLong && (
        <p className="text-status-error text-[12.5px]">
          Keep it under {MAX_CORRECTION_LENGTH} characters.
        </p>
      )}
      {status === "error" && (
        <p className="text-status-error text-[12.5px]">
          That didn&apos;t send. Try again.
        </p>
      )}
      <button
        type="button"
        onClick={() => void handleSend()}
        disabled={!canSend}
        className="border-border-strong rounded-badge flex h-11 items-center justify-center border text-[14.5px] font-medium disabled:opacity-50"
      >
        {status === "submitting" ? "Sending…" : "Send what you know"}
      </button>
      <p className="text-muted text-[12.5px] leading-[1.5]">
        A person reads it before anything on the record changes.
      </p>
    </div>
  );
}
