"use client";

import { IdentifyQuestion } from "@/components/identify/identify-question";
import {
  photoHeading,
  type ArchivePhoto,
  type MissingField,
} from "@/lib/archive-photographs";
import { ASK_TITLE } from "@/lib/share-copy";

import { IDENTIFY_FIELD } from "./details-panel";

/**
 * The question a visitor was sent here to answer. Spec 040 FR-007.
 *
 * A bar, not the sheet: the sheet would cover the photograph they came to look at.
 * From 768 up it sits at the foot of the details column, clear of the stage's
 * caption and step controls.
 */
export function AskBar({
  photo,
  field,
}: {
  photo: ArchivePhoto;
  field: MissingField;
}) {
  return (
    <div
      role="region"
      aria-label="A question about this photograph"
      className="bg-background border-border-strong fixed inset-x-3 bottom-3 z-30 mx-auto mb-[env(safe-area-inset-bottom)] flex max-w-[520px] items-center justify-between gap-3 rounded-2xl border py-2.5 pr-2.5 pl-4 shadow-[0_12px_40px_rgba(0,0,0,.35)] md:left-auto md:mx-0 md:w-[356px]"
    >
      <span className="text-body min-w-0 text-[14px] leading-snug">
        {ASK_TITLE}
      </span>
      <IdentifyQuestion
        contentType="media"
        contentId={photo.id}
        mediaId={photo.id}
        field={IDENTIFY_FIELD[field]}
        pageTitle={photoHeading(photo)}
        variant="primary"
        className="focus-ring flex-none"
      >
        Tell us
      </IdentifyQuestion>
    </div>
  );
}
