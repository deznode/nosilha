"use client";

import Image from "next/image";
import { useMemo, type ReactNode } from "react";

import { MetadataBadges } from "@/components/gallery/metadata-badges";
import { PhotoTypeSelector } from "@/components/gallery/photo-type-selector";
import { CreditPreviewBadge } from "@/components/ui/credit-display";
import { detectCreditPlatform } from "@/lib/credit-utils";
import type { PhotoMetadata, PhotoType } from "@/types/media";

import type { ContributionForm } from "../lib/contribution-form";
import {
  FormColumns,
  HINT,
  PermissionBox,
  TextAreaField,
  TextField,
  WhatHappensNext,
} from "./form-parts";
import { TownField } from "./town-field";

const FILE_INPUT_ID = "contribute-photo-file";

export interface PhotoFormProps {
  form: ContributionForm;
  onChange: <K extends keyof ContributionForm>(
    key: K,
    value: ContributionForm[K]
  ) => void;
  file: File | null;
  previewUrl: string | null;
  metadata: PhotoMetadata | null;
  photoType: PhotoType;
  onPhotoType: (type: PhotoType) => void;
  onFile: (file: File) => void;
  /** Sending: the file and the photo type can't change. */
  busy: boolean;
  /** P5/P6 panels and the send button. */
  footer: ReactNode;
}

/** The photo form, P1–P6. Spec 039 FR-003. */
export function PhotoForm({
  form,
  onChange,
  file,
  previewUrl,
  metadata,
  photoType,
  onPhotoType,
  onFile,
  busy,
  footer,
}: PhotoFormProps) {
  const detectedCredit = useMemo(
    () => detectCreditPlatform(form.photographer),
    [form.photographer]
  );

  const pick = (picked: File | undefined) => {
    if (picked && !busy) onFile(picked);
  };

  return (
    <FormColumns
      left={
        <>
          <input
            id={FILE_INPUT_ID}
            type="file"
            accept="image/*,.heic,.heif"
            className="peer sr-only"
            disabled={busy}
            onChange={(e) => {
              pick(e.target.files?.[0]);
              // Choosing the same file again after "Change" still fires
              e.target.value = "";
            }}
          />
          {file && previewUrl ? (
            <div>
              <div className="bg-surface relative h-[190px] overflow-hidden rounded-[10px] md:h-[300px]">
                <Image
                  src={previewUrl}
                  alt="The photograph you are giving"
                  fill
                  unoptimized
                  sizes="(min-width: 768px) 560px, 100vw"
                  className="object-contain"
                />
              </div>
              <div className="mt-2 flex justify-between gap-3 text-[13px]">
                <span className="text-muted min-w-0 truncate font-mono">
                  {file.name}
                </span>
                <label
                  htmlFor={FILE_INPUT_ID}
                  className="text-ocean-blue cursor-pointer font-semibold hover:underline"
                >
                  Change
                </label>
              </div>
              {metadata && (
                <div className="mt-2.5 space-y-4">
                  <MetadataBadges
                    metadata={metadata}
                    showManualPrompt={false}
                  />
                  <PhotoTypeSelector
                    value={photoType}
                    onChange={onPhotoType}
                    disabled={busy}
                  />
                </div>
              )}
            </div>
          ) : (
            <label
              htmlFor={FILE_INPUT_ID}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pick(e.dataTransfer.files?.[0]);
              }}
              className="border-edge peer-focus-visible:ring-ocean-blue flex min-h-[190px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-[1.5px] border-dashed p-[22px] text-center peer-focus-visible:ring-2 md:min-h-[300px]"
            >
              <span className="bg-primary text-primary-foreground flex h-12 items-center rounded-lg px-[22px] text-[15px] font-medium">
                Choose a photograph
              </span>
              <span className="text-muted max-w-[30ch] text-[13.5px] leading-[1.55]">
                A phone photograph of a print is fine. Most pictures of Brava
                are not on Brava — they are in New Bedford, Pawtucket and
                Brockton.
              </span>
              <span className="text-muted hidden text-[13px] md:block">
                or drop the file here
              </span>
            </label>
          )}

          <TextField
            id="f-title"
            name="title"
            label="What is it called?"
            placeholder="A few words, e.g. “Wedding at Nossa Senhora do Monte”"
            value={form.title}
            onChange={(e) => onChange("title", e.target.value)}
          />
          <TextAreaField
            id="f-description"
            name="description"
            label="What does it show?"
            placeholder="Names, the occasion, anything you know"
            hint="Who is in it, the occasion, anything you know. Optional."
            minHeight={92}
            value={form.description}
            onChange={(e) => onChange("description", e.target.value)}
          />
        </>
      }
      right={
        <>
          <TownField
            kind="photo"
            label="Where was it taken?"
            value={form.place}
            onChange={(place) => onChange("place", place)}
          />
          <TextField
            id="f-photographer"
            name="photographer_credit"
            label="Who took this photograph?"
            placeholder="A name, or “not known”"
            value={form.photographer}
            onChange={(e) => onChange("photographer", e.target.value)}
            hint={
              detectedCredit && (
                <CreditPreviewBadge
                  detected={detectedCredit}
                  className="mt-2"
                />
              )
            }
          />
          <TextField
            id="f-source"
            name="archive_source"
            label="Who is giving it to us?"
            placeholder="Your name, as you want it shown"
            value={form.source}
            onChange={(e) => onChange("source", e.target.value)}
          />
          <TextField
            id="f-date"
            name="approximate_date"
            label="Roughly when?"
            placeholder="1984 — or “sometime in the sixties”"
            value={form.date}
            onChange={(e) => onChange("date", e.target.value)}
            hint={<p className={HINT}>A decade is enough.</p>}
          />
          <PermissionBox
            checked={form.permission}
            onChange={(checked) => onChange("permission", checked)}
          />
          <WhatHappensNext />
          {footer}
        </>
      }
    />
  );
}
