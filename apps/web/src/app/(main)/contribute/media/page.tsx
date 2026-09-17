"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { Check, X, AlertCircle } from "lucide-react";
import type { ExternalPlatform } from "@/types/gallery";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import { submitExternalMedia } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/page-header";
import { AnimatedButton } from "@/components/ui/animated-button";
import { CreditPreviewBadge } from "@/components/ui/credit-display";
import { Input } from "@/components/catalyst-ui/input";
import { Checkbox } from "@/components/catalyst-ui/checkbox";
import { SignInDialog } from "@/components/auth/sign-in-dialog";
import { PhotoTypeSelector } from "@/components/gallery/photo-type-selector";
import { MetadataBadges } from "@/components/gallery/metadata-badges";
import { detectCreditPlatform, type DetectedCredit } from "@/lib/credit-utils";

type ContributionKind = "photo" | "film";

interface FormData {
  photographer: string;
  source: string;
  place: string;
  date: string;
  permission: boolean;
  filmTitle: string;
  filmUrl: string;
}

const EMPTY_FORM: FormData = {
  photographer: "",
  source: "",
  place: "",
  date: "",
  permission: false,
  filmTitle: "",
  filmUrl: "",
};

/** The next thing the form needs, in the order that makes the argument. */
type Step =
  | "photographer"
  | "contributor"
  | "permission"
  | "file"
  | "filmTitle"
  | "filmUrl"
  | "ready";

const STEP_LABELS: Record<Exclude<Step, "ready">, string> = {
  photographer: "Name the photographer to continue",
  contributor: "Add your name to continue",
  permission: "Confirm permission to continue",
  file: "Add the photograph to continue",
  filmTitle: "Add the film's title to continue",
  filmUrl: "Paste a YouTube or Vimeo link to continue",
};

const labelClass = "text-foreground mb-[7px] block text-[11.5px] font-semibold";
const columnClass = "text-muted-foreground mt-[7px] font-mono text-[11px]";
const eyebrowClass =
  "text-muted-foreground font-mono text-[10.5px] font-semibold tracking-[.13em] uppercase";

/**
 * Parses a video URL to extract platform and video ID.
 * Supports YouTube (various formats) and Vimeo.
 */
function parseVideoUrl(
  url: string
): { platform: ExternalPlatform; externalId: string } | null {
  // YouTube patterns: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      return { platform: "YOUTUBE", externalId: match[1] };
    }
  }

  // Vimeo patterns: vimeo.com/ID
  const vimeoPattern = /vimeo\.com\/(\d+)/;
  const vimeoMatch = url.match(vimeoPattern);
  if (vimeoMatch) {
    return { platform: "VIMEO", externalId: vimeoMatch[1] };
  }

  return null;
}

/**
 * Contribute a photograph or film link. Credit and permission come first; sign-in is
 * asked for at submit, in place, never as a gate in front of the form. Spec 033 FR-010.
 */
export default function MediaContributionPage() {
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [kind, setKind] = useState<ContributionKind>("photo");
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [filmSubmitting, setFilmSubmitting] = useState(false);
  const [filmError, setFilmError] = useState<string | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);
  // A ref, not state: Activity preserves useState across navigation, so a pending
  // submission held in state could fire on an unrelated later visit.
  const pendingSubmitRef = useRef(false);

  // Use the photo upload hook with EXIF extraction
  const {
    state: uploadState,
    progress,
    error: uploadError,
    file: selectedFile,
    previewUrl,
    metadata,
    photoType,
    setPhotoType,
    selectFile,
    upload,
    reset: resetUpload,
  } = usePhotoUpload();

  // Reset form state when Activity restores this route (cacheComponents).
  // Activity destroys effects on hide and re-creates them on show,
  // so this runs on initial mount (harmless) AND every return visit.
  useEffect(() => {
    setSubmitted(false);
    setKind("photo");
    setFormData(EMPTY_FORM);
    setFilmError(null);
    setSignInOpen(false);
    pendingSubmitRef.current = false;
    resetUpload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect social platform from credit input for instant preview
  const detectedCredit: DetectedCredit | null = useMemo(
    () => detectCreditPlatform(formData.photographer),
    [formData.photographer]
  );

  const isSubmitting =
    uploadState === "requesting-url" ||
    uploadState === "uploading" ||
    uploadState === "confirming" ||
    filmSubmitting;

  const isFilm = kind === "film";
  const noun = isFilm ? "film" : "photograph";

  function nextStep(): Step {
    if (!formData.photographer.trim()) return "photographer";
    // A film submission has nowhere to store the contributor, so it is not asked for
    if (!isFilm && !formData.source.trim()) return "contributor";
    if (!formData.permission) return "permission";
    if (!isFilm && !selectedFile) return "file";
    if (isFilm && !formData.filmTitle.trim()) return "filmTitle";
    if (isFilm && !parseVideoUrl(formData.filmUrl)) return "filmUrl";
    return "ready";
  }

  const step = nextStep();

  function getSubmitButtonLabel(): string {
    if (uploadState === "extracting") return "Reading photo metadata…";
    if (uploadState === "requesting-url") return "Preparing upload…";
    if (uploadState === "uploading") return `Uploading ${progress}%…`;
    if (uploadState === "confirming") return "Finalizing…";
    if (filmSubmitting) return "Submitting film…";
    if (step !== "ready") return STEP_LABELS[step];
    if (authLoading) return "Checking sign-in…";
    return user ? "Submit" : "Submit — you sign in at the end";
  }

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  // The preview is the hook's own object URL for the file it holds, so what is shown is
  // always what uploads — a second, page-level preview could lag behind a quick re-pick.
  const handleFile = (file: File | undefined) => {
    if (file) void selectFile(file);
  };

  const clearFile = () => resetUpload();

  const submitContribution = async () => {
    if (!isFilm) {
      // Upload image to R2 storage with EXIF metadata and credit
      const result = await upload({
        photographerCredit: formData.photographer.trim(),
        archiveSource: formData.source.trim(),
        locationName: formData.place.trim() || undefined,
        approximateDate: formData.date.trim() || undefined,
      });

      if (result) {
        toast.success("Media uploaded successfully").show();
        setSubmitted(true);
      } else {
        // The readable reason is shown inline from the hook's error state
        toast.error("Upload failed. Please try again.").show();
      }
      return;
    }

    const parsed = parseVideoUrl(formData.filmUrl);
    if (!parsed) return;

    setFilmSubmitting(true);
    setFilmError(null);

    try {
      await submitExternalMedia({
        title: formData.filmTitle.trim(),
        mediaType: "VIDEO",
        platform: parsed.platform,
        url: formData.filmUrl.trim(),
        externalId: parsed.externalId,
        author: formData.photographer.trim(),
      });
      toast.success("Video submitted successfully").show();
      setSubmitted(true);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to submit video";
      setFilmError(errorMsg);
      toast.error(errorMsg).show();
    } finally {
      setFilmSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== "ready" || isSubmitting || uploadState === "extracting") {
      return;
    }
    // The session is still being read; the button label says so until it is
    if (authLoading) return;

    if (!user) {
      pendingSubmitRef.current = true;
      setSignInOpen(true);
      return;
    }
    void submitContribution();
  };

  const handleSignedIn = () => {
    setSignInOpen(false);
    if (!pendingSubmitRef.current) return;
    pendingSubmitRef.current = false;
    void submitContribution();
  };

  const handleSignInClose = () => {
    pendingSubmitRef.current = false;
    setSignInOpen(false);
  };

  // Success confirmation screen
  if (submitted) {
    return (
      <div className="bg-canvas flex min-h-[70vh] items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <div className="bg-valley-green/10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <Check className="text-valley-green h-10 w-10" aria-hidden="true" />
          </div>
          <h2 className="text-foreground mb-3 font-serif text-3xl font-bold">
            Archive Updated
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Thank you for contributing to our visual history. Your item is
            pending verification by our team.
          </p>
          <Link
            href="/photographs"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-button block w-full py-4 font-bold transition-colors"
          >
            Return to Photographs
          </Link>
        </div>
      </div>
    );
  }

  const title = "Give a photograph to the archive";

  return (
    <div className="bg-canvas min-h-screen">
      <div className="px-5 pt-[22px] min-[560px]:px-[30px] min-[560px]:pt-8 min-[860px]:px-11 min-[860px]:pt-11">
        <PageHeader
          title={title}
          subtitle="You keep the copyright. We record who took it and who gave it, and we will not publish it without that credit attached."
          centered={false}
          className="hidden min-[560px]:block"
        />
        <PageHeader
          title={title}
          subtitle="You keep the copyright. We record who took it."
          centered={false}
          size="compact"
          showAccentBar={false}
          className="min-[560px]:hidden [&_h1]:text-[23px]"
        />
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-wrap gap-10 px-5 pt-[30px] pb-14 min-[560px]:px-[30px] min-[860px]:px-11"
      >
        {/* Credit and permission */}
        <div className="flex min-w-[290px] flex-[1_1_350px] flex-col gap-5">
          <div>
            <label htmlFor="f-photographer" className={labelClass}>
              {isFilm ? "Who made this film?" : "Who took this photograph?"}
            </label>
            <Input
              id="f-photographer"
              name="photographer_credit"
              type="text"
              placeholder={"A name, or “not known”"}
              value={formData.photographer}
              onChange={(e) => updateField("photographer", e.target.value)}
            />
            <div className={columnClass}>photographer_credit</div>
            {detectedCredit && (
              <CreditPreviewBadge detected={detectedCredit} className="mt-2" />
            )}
          </div>

          {/* SubmitExternalMediaRequest cannot carry these three, so films never show them */}
          {!isFilm && (
            <>
              <div>
                <label htmlFor="f-source" className={labelClass}>
                  Who is giving it to us?
                </label>
                <Input
                  id="f-source"
                  name="archive_source"
                  type="text"
                  placeholder="Your name, as you want it shown"
                  value={formData.source}
                  onChange={(e) => updateField("source", e.target.value)}
                />
                <div className={columnClass}>archive_source</div>
              </div>

              <div>
                <label htmlFor="f-place" className={labelClass}>
                  Where was it taken?
                </label>
                <Input
                  id="f-place"
                  name="location_name"
                  type="text"
                  placeholder="Faja d'Agua, by the harbour"
                  value={formData.place}
                  onChange={(e) => updateField("place", e.target.value)}
                />
                <div className={columnClass}>
                  location_name · linked to a settlement where possible
                </div>
              </div>

              <div>
                <label htmlFor="f-date" className={labelClass}>
                  Roughly when?
                </label>
                <Input
                  id="f-date"
                  name="approximate_date"
                  type="text"
                  placeholder={"1984 — or “sometime in the sixties”"}
                  value={formData.date}
                  onChange={(e) => updateField("date", e.target.value)}
                />
                <div className={columnClass}>
                  approximate_date · a decade is enough
                </div>
              </div>
            </>
          )}

          <div className="bg-background-secondary flex items-start gap-[13px] rounded-[10px] px-[17px] py-[15px]">
            <Checkbox
              checked={formData.permission}
              onChange={(checked) => updateField("permission", checked)}
              aria-label={`Confirm you have the right to share this ${noun}`}
              className="mt-0.5"
            />
            <div className="text-muted-foreground text-[12.5px] leading-[1.6]">
              I have the right to share this, and I am happy for it to appear in
              the public archive under CC BY-SA 4.0 with the credit above.
            </div>
          </div>
        </div>

        {/* The file, what happens next, and submit */}
        <div className="min-w-[250px] flex-[1_1_290px]">
          {isFilm ? (
            <div className="flex flex-col gap-5">
              <div>
                <label htmlFor="f-film-title" className={labelClass}>
                  Title of the film
                </label>
                <Input
                  id="f-film-title"
                  name="title"
                  type="text"
                  value={formData.filmTitle}
                  onChange={(e) => updateField("filmTitle", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="f-film-url" className={labelClass}>
                  Link to the film
                </label>
                <Input
                  id="f-film-url"
                  name="url"
                  type="url"
                  placeholder="YouTube or Vimeo link"
                  value={formData.filmUrl}
                  onChange={(e) => updateField("filmUrl", e.target.value)}
                />
              </div>
            </div>
          ) : selectedFile && previewUrl ? (
            <div className="border-border-strong flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-xl border-[1.5px] border-dashed p-6">
              <div className="relative">
                <Image
                  src={previewUrl}
                  width={160}
                  height={160}
                  className="max-h-40 rounded-lg object-contain"
                  alt="The photograph you are giving"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={clearFile}
                  className="bg-status-error shadow-elevated absolute -top-3 -right-3 rounded-full p-1.5 text-white"
                  aria-label="Remove image"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </div>
              {selectedFile && metadata && (
                <div className="w-full space-y-4">
                  <MetadataBadges
                    metadata={metadata}
                    showManualPrompt={false}
                  />
                  {/* Photo type selector for GPS privacy */}
                  <PhotoTypeSelector
                    value={photoType}
                    onChange={setPhotoType}
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>
          ) : (
            <label
              htmlFor="media-upload"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void handleFile(e.dataTransfer.files?.[0]);
              }}
              className="border-border-strong focus-within:ring-ocean-blue hover:bg-background-secondary flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-[9px] rounded-xl border-[1.5px] border-dashed p-6 text-center transition-colors focus-within:ring-2"
            >
              <span className="text-foreground text-[14.5px] font-semibold">
                Drop the file here
              </span>
              <span className="text-muted-foreground max-w-[28ch] text-[12.5px] leading-[1.55]">
                A phone photograph of a print is fine. Most pictures of Brava
                are not on Brava — they are in New Bedford, Pawtucket and
                Brockton.
              </span>
              <span className="text-ocean-blue text-xs font-semibold underline underline-offset-2">
                or choose a file
              </span>
              <input
                id="media-upload"
                type="file"
                accept="image/*,.heic,.heif"
                className="sr-only"
                onChange={(e) => void handleFile(e.target.files?.[0])}
              />
            </label>
          )}

          {!isFilm && (
            <div className={columnClass}>
              original_name · the file&apos;s name is published with the
              photograph
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setKind(isFilm ? "photo" : "film");
              setFilmError(null);
            }}
            className="text-ocean-blue mt-3 text-xs font-semibold hover:underline"
          >
            {isFilm
              ? "Give a photograph instead"
              : "Or give a film link instead"}
          </button>

          <div className="border-border-subtle mt-[18px] rounded-[10px] border px-[19px] py-[17px]">
            <div className={clsx(eyebrowClass, "mb-2.5")}>
              What happens next
            </div>
            <div className="text-muted-foreground text-[12.5px] leading-[1.75]">
              A person reviews it · it is credited to the name you gave · you
              can ask for it to be taken down at any time
            </div>
          </div>

          {(uploadError || filmError) && (
            <div
              role="alert"
              className="border-status-error/20 bg-status-error/10 text-status-error rounded-card mt-[18px] flex items-center gap-3 border p-4 text-sm"
            >
              <AlertCircle
                size={18}
                className="flex-shrink-0"
                aria-hidden="true"
              />
              <span>{isFilm ? filmError : uploadError}</span>
            </div>
          )}

          {uploadState === "uploading" && (
            <div className="bg-background-secondary mt-[18px] h-2 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="mt-[18px]">
            <AnimatedButton
              type="submit"
              variant={step === "ready" ? "primary" : "outline"}
              size="md"
              isLoading={isSubmitting}
              aria-disabled={step !== "ready" || authLoading}
              className="w-full"
            >
              {getSubmitButtonLabel()}
            </AnimatedButton>
          </div>
          {!user && (
            <p className="text-muted-foreground mt-2.5 text-center text-[11.5px] leading-[1.55]">
              Sign-in happens at the end, not before the form.
            </p>
          )}
        </div>
      </form>

      <SignInDialog
        open={signInOpen}
        onClose={handleSignInClose}
        onSignedIn={handleSignedIn}
        held={{
          noun: isFilm ? "film link" : "photograph",
          photographer: formData.photographer,
          source: isFilm ? undefined : formData.source,
          place: isFilm ? undefined : formData.place,
        }}
      />
    </div>
  );
}
