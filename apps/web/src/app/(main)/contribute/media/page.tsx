"use client";

import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import { submitExternalMedia } from "@/lib/api";
import { ApiError } from "@/lib/api-error";
import {
  Confirmation,
  type SentRecord,
} from "@/features/contribute/components/confirmation";
import { FilmForm } from "@/features/contribute/components/film-form";
import {
  ErrorPanel,
  FormIntro,
  KindSwitch,
  PageNotice,
  SubmitArea,
  waitPhrase,
} from "@/features/contribute/components/form-parts";
import { PhotoForm } from "@/features/contribute/components/photo-form";
import {
  RestoredRecord,
  type RecordRow,
} from "@/features/contribute/components/restored-record";
import { SignInSheet } from "@/features/contribute/components/sign-in-sheet";
import {
  useContributionDraft,
  type ResumeOutcome,
  type ResumeRequest,
} from "@/features/contribute/hooks/use-contribution-draft";
import { useFilmLookup } from "@/features/contribute/hooks/use-film-lookup";
import type { SignedInInfo } from "@/features/contribute/hooks/use-sign-in-flow";
import type { ContributionKind } from "@/features/contribute/lib/contribution-draft";
import {
  EMPTY_FORM,
  STEP_LABELS,
  firstName,
  linkedTown,
  nextStep,
  placeFields,
  placeText,
  restoreForm,
  type ContributionForm,
} from "@/features/contribute/lib/contribution-form";
import { isNewUser } from "@/features/contribute/lib/new-user";
import {
  filmThumbnailUrl,
  parseVideoUrl,
} from "@/features/contribute/lib/parse-video-url";

/** F7 when a 429 carries no `Retry-After`. */
const DEFAULT_WAIT_SECONDS = 600;

const PLATFORM_LABEL = { YOUTUBE: "YouTube", VIMEO: "Vimeo" } as const;

/**
 * `/contribute/media`: give a photograph (P1–P6) or a film link (F1–F7).
 * The form comes first; sign-in happens at "Send to the archive", in a sheet
 * over the form, and a Google round trip comes back through `?resume=1`
 * (S9, S10, S10b). Spec 039.
 *
 * `useSearchParams` sits under its own Suspense boundary so `?kind=film`
 * renders the film form from the first paint.
 */
export default function MediaContributionPage() {
  return (
    <Suspense fallback={<div className="bg-canvas min-h-[70vh]" />}>
      <MediaContribution />
    </Suspense>
  );
}

function MediaContribution() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, session, loading: authLoading } = useAuth();

  const [kind, setKind] = useState<ContributionKind>(() =>
    searchParams.get("kind") === "film" ? "film" : "photo"
  );
  const [form, setForm] = useState<ContributionForm>(EMPTY_FORM);
  const [view, setView] = useState<"form" | "restored">("form");
  const [sent, setSent] = useState<SentRecord | null>(null);
  const [noDraftNotice, setNoDraftNotice] = useState(false);
  const [signIn, setSignIn] = useState<{
    open: boolean;
    initialView: "start" | "cancelled";
  }>({ open: false, initialView: "start" });
  const [filmSubmitting, setFilmSubmitting] = useState(false);
  const [filmError, setFilmError] = useState<string | null>(null);
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [resumeRequest, setResumeRequest] = useState<ResumeRequest | null>(
    null
  );
  // Refs, not state: Activity preserves useState across navigation, so a
  // pending submission held in state could fire on an unrelated later visit.
  const pendingSubmitRef = useRef(false);
  // Signed in with a submission waiting; it goes once the photo is read
  const signedInPendingRef = useRef(false);
  const [signedInTick, setSignedInTick] = useState(0);
  // The upload error already turned into a lock. Activity re-runs the
  // lastError effect on show with the old error, which must not lock again.
  const handledErrorRef = useRef<Error | null>(null);
  // The email of an account this flow's sign-in created (A2).
  const newAccountRef = useRef<string | null>(null);

  const {
    state: uploadState,
    progress,
    file,
    previewUrl,
    metadata,
    photoType,
    lastError,
    setPhotoType,
    selectFile,
    upload,
    reset: resetUpload,
  } = usePhotoUpload();

  const isFilm = kind === "film";
  const link = isFilm ? parseVideoUrl(form.filmUrl) : null;
  const lookup = useFilmLookup(link);
  const duplicate =
    isFilm && (lookup.status === "public" || lookup.status === "pending");

  function resetForm(nextKind: ContributionKind) {
    setKind(nextKind);
    setForm(EMPTY_FORM);
    setView("form");
    setSent(null);
    setNoDraftNotice(false);
    setSignIn({ open: false, initialView: "start" });
    setFilmError(null);
    setRateLimitedUntil(null);
    setResumeRequest(null);
    pendingSubmitRef.current = false;
    signedInPendingRef.current = false;
    newAccountRef.current = null;
    resetUpload();
  }

  // Activity (cacheComponents) keeps state across navigation but destroys and
  // re-creates effects, so this runs on the first mount AND every return
  // visit. The URL is read here, not from `searchParams`, because a hidden
  // route's params can lag behind. A `?resume=1` visit also starts from an
  // empty form: the draft is read back into it once the session is known.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    resetForm(params.get("kind") === "film" ? "film" : "photo");
    if (params.get("resume") === "1") {
      setResumeRequest({ authError: params.get("auth_error") === "1" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResume = (outcome: ResumeOutcome) => {
    setResumeRequest(null);
    let resumedKind = kind;
    if (outcome.kind === "restored" || outcome.kind === "cancelled") {
      const { draft } = outcome;
      resumedKind = draft.kind;
      setKind(draft.kind);
      setForm(restoreForm(draft.form));
      if (draft.kind === "photo" && draft.file) void selectFile(draft.file);
    }
    if (outcome.kind === "restored") {
      if (isNewUser(session?.user) && user?.email) {
        newAccountRef.current = user.email;
      }
      setView("restored");
    } else if (outcome.kind === "cancelled") {
      pendingSubmitRef.current = true;
      setSignIn({ open: true, initialView: "cancelled" });
    } else if (outcome.kind === "noDraft") {
      setNoDraftNotice(true);
    }
    // Drop `resume` so a reload or a later visit starts clean
    router.replace(
      resumedKind === "film"
        ? "/contribute/media?kind=film"
        : "/contribute/media",
      { scroll: false }
    );
  };

  const draftStore = useContributionDraft({
    request: resumeRequest,
    authLoading,
    signedIn: !!user,
    onResolved: handleResume,
  });

  // A 429 from the upload (F7): hold the button for `Retry-After`.
  useEffect(() => {
    if (!(lastError instanceof ApiError) || lastError.status !== 429) return;
    if (handledErrorRef.current === lastError) return;
    handledErrorRef.current = lastError;
    lockFor(lastError.retryAfterSeconds);
  }, [lastError]);

  useEffect(() => {
    if (rateLimitedUntil === null) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= rateLimitedUntil) setRateLimitedUntil(null);
    }, 1000);
    return () => clearInterval(id);
  }, [rateLimitedUntil]);

  function lockFor(seconds: number | undefined) {
    const t = Date.now();
    setNow(t);
    setRateLimitedUntil(t + (seconds ?? DEFAULT_WAIT_SECONDS) * 1000);
  }

  const rateLimited = rateLimitedUntil !== null;
  const secondsLeft = rateLimited
    ? Math.max(0, (rateLimitedUntil - now) / 1000)
    : 0;

  const uploading =
    uploadState === "requesting-url" ||
    uploadState === "uploading" ||
    uploadState === "confirming";
  const sending = uploading || filmSubmitting;
  const extracting = uploadState === "extracting";
  const uploadFailed =
    !isFilm &&
    uploadState === "error" &&
    !(lastError instanceof ApiError && lastError.status === 429);

  const step = nextStep(kind, form, !!file);
  const ready = step === "ready";
  const locked = authLoading || extracting || rateLimited;

  const updateField = <K extends keyof ContributionForm>(
    key: K,
    value: ContributionForm[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  function finish() {
    const town = linkedTown(form.place);
    const where = town ?? (form.place.detail.trim() || null);
    const who = form.photographer.trim();
    const meta = isFilm
      ? [link && PLATFORM_LABEL[link.platform], where, who && `made by ${who}`]
      : [where, form.date.trim(), who && `taken by ${who}`];
    setSent({
      kind,
      title: form.title.trim() || (isFilm ? "Film link" : "Your photograph"),
      meta: meta.filter(Boolean).join(" · "),
      town,
      giverFirstName: firstName(form.source),
      imageSrc: isFilm ? filmThumbnailUrl(link) : previewUrl,
      vimeo: link?.platform === "VIMEO",
      newAccountEmail: newAccountRef.current,
    });
    newAccountRef.current = null;
    void draftStore.clear();
    window.scrollTo?.({ top: 0 });
  }

  async function submitContribution() {
    setFilmError(null);

    if (!isFilm) {
      const result = await upload({
        title: form.title.trim() || undefined,
        description: form.description.trim() || undefined,
        photographerCredit: form.photographer.trim(),
        archiveSource: form.source.trim(),
        approximateDate: form.date.trim() || undefined,
        ...placeFields(form.place),
      });
      // A failure is read from the hook's state: P6, or F7 for a 429
      if (result) finish();
      else setView("form");
      return;
    }

    const parsed = parseVideoUrl(form.filmUrl);
    if (!parsed) return;
    setFilmSubmitting(true);
    try {
      await submitExternalMedia({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        mediaType: "VIDEO",
        platform: parsed.platform,
        url: form.filmUrl.trim(),
        externalId: parsed.externalId,
        author: form.photographer.trim(),
        approximateDate: form.date.trim() || undefined,
        ...placeFields(form.place),
      });
      finish();
    } catch (err) {
      setView("form");
      if (err instanceof ApiError && err.status === 429) {
        lockFor(err.retryAfterSeconds);
      } else {
        setFilmError(
          err instanceof Error && err.message
            ? err.message
            : "Something went wrong on our side."
        );
      }
    } finally {
      setFilmSubmitting(false);
    }
  }

  function askToSignIn() {
    pendingSubmitRef.current = true;
    setSignIn({ open: true, initialView: "start" });
  }

  function send() {
    if (!ready) {
      setView("form");
      return;
    }
    if (sending || locked || duplicate) return;
    if (!user) {
      askToSignIn();
      return;
    }
    void submitContribution();
  }

  function handleSignedIn(info: SignedInInfo) {
    setSignIn((prev) => ({ ...prev, open: false }));
    if (info.isNewUser && info.email) newAccountRef.current = info.email;
    if (!pendingSubmitRef.current) return;
    pendingSubmitRef.current = false;
    signedInPendingRef.current = true;
    setSignedInTick((n) => n + 1);
  }

  // Sends what was held at sign-in, once a restored photo has been read (S10
  // can finish signing in before that) and under the same checks as send().
  // Refs rather than state, so an Activity re-show never fires a stale send.
  useEffect(() => {
    if (!signedInPendingRef.current || extracting) return;
    signedInPendingRef.current = false;
    if (ready && !sending && !rateLimited && !duplicate) {
      void submitContribution();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs on sign-in and when extraction ends
  }, [signedInTick, extracting]);

  function handleSignInClose() {
    pendingSubmitRef.current = false;
    // Dismissing S10 discards the Google draft; the form still holds it, and
    // trying Google again saves a fresh one
    if (signIn.initialView === "cancelled") void draftStore.clear();
    setSignIn((prev) => ({ ...prev, open: false }));
  }

  if (sent) {
    return (
      <PageShell>
        <Confirmation record={sent} onAgain={() => resetForm(sent.kind)} />
      </PageShell>
    );
  }

  const sheet = (
    <SignInSheet
      open={signIn.open}
      onClose={handleSignInClose}
      onSignedIn={handleSignedIn}
      initialView={signIn.initialView}
      held={{
        kind,
        title: form.title,
        town: linkedTown(form.place) ?? undefined,
        thumbnailUrl: isFilm ? filmThumbnailUrl(link) : previewUrl,
      }}
      getDraft={() => ({ kind, form, file: isFilm ? null : file })}
    />
  );

  if (view === "restored") {
    const who = form.photographer.trim();
    const rows: RecordRow[] = [
      { label: "Title", value: form.title.trim() },
      { label: "Place", value: placeText(form.place) },
      { label: isFilm ? "Made by" : "Taken by", value: who },
      ...(isFilm ? [] : [{ label: "Given by", value: form.source.trim() }]),
      { label: "When", value: form.date.trim() },
    ].filter((row) => row.value);
    return (
      <PageShell>
        <RestoredRecord
          kind={kind}
          email={user?.email ?? null}
          rows={rows}
          imageSrc={isFilm ? filmThumbnailUrl(link) : previewUrl}
          vimeo={link?.platform === "VIMEO"}
          sendLabel={
            sending
              ? isFilm
                ? "Sending…"
                : `Sending · ${progress}%`
              : "Send to the archive"
          }
          sendDisabled={sending || locked}
          onSend={send}
          onChange={() => setView("form")}
        />
        {sheet}
      </PageShell>
    );
  }

  let note: string | null;
  if (rateLimited) {
    note = `You can send again in ${waitPhrase(secondsLeft)}.`;
  } else if (authLoading) {
    note = "Checking sign-in…";
  } else if (user) {
    note = user.email ? `Signed in as ${user.email}.` : null;
  } else {
    note = "Next you confirm your email. Nothing is sent until then.";
  }

  const footer = (
    <>
      {rateLimited && (
        <ErrorPanel title="You've sent a lot in a short time">
          Please wait {waitPhrase(secondsLeft)}, then send it again. Everything
          you&apos;ve typed is still here.
        </ErrorPanel>
      )}
      {uploadFailed && (
        <ErrorPanel title="The photograph didn't upload">
          The connection dropped part way. Everything is still here, so you can
          try again.
        </ErrorPanel>
      )}
      {filmError && (
        <ErrorPanel title="The film link didn't send">
          {filmError} Everything you&apos;ve typed is still here.
        </ErrorPanel>
      )}
      <SubmitArea
        label={
          ready
            ? uploadFailed
              ? "Try again"
              : "Send to the archive"
            : STEP_LABELS[step]
        }
        ready={ready}
        locked={locked}
        note={note}
        sending={sending}
        progress={isFilm ? null : progress}
      />
    </>
  );

  return (
    <PageShell>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        noValidate
        className="flex flex-col gap-5 md:gap-[26px]"
      >
        {isFilm ? (
          <FormIntro title="Give a film to the archive">
            A link is enough. The film stays where it is; we record where it is
            and who made it.
          </FormIntro>
        ) : (
          <FormIntro title="Give a photograph to the archive">
            <span className="md:hidden">
              You keep the copyright. We record who took it.
            </span>
            <span className="hidden md:inline">
              You keep the copyright. We record who took it and who gave it, and
              we will not publish it without that credit attached.
            </span>
          </FormIntro>
        )}

        <KindSwitch
          kind={kind}
          disabled={sending}
          onChange={(next) => {
            setKind(next);
            setFilmError(null);
          }}
        />

        {noDraftNotice && (
          <PageNotice
            title={
              isFilm
                ? "We couldn't find your film link in this browser"
                : "We couldn't find your photograph in this browser"
            }
          >
            It may have been opened in a different browser, or more than a day
            has passed. You&apos;re signed in now, so{" "}
            {isFilm ? "paste it again" : "choose it again"} and it will send
            straight away.
          </PageNotice>
        )}

        {isFilm ? (
          <FilmForm
            form={form}
            onChange={updateField}
            link={link}
            lookup={lookup}
            onNeedsSignIn={() =>
              setSignIn({ open: true, initialView: "start" })
            }
            footer={footer}
          />
        ) : (
          <PhotoForm
            form={form}
            onChange={updateField}
            file={file}
            previewUrl={previewUrl}
            metadata={metadata}
            photoType={photoType}
            onPhotoType={setPhotoType}
            onFile={(picked) => void selectFile(picked)}
            busy={sending}
            footer={footer}
          />
        )}
      </form>
      {sheet}
    </PageShell>
  );
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-canvas px-[18px] pt-[22px] pb-8 md:px-14 md:pt-11 md:pb-16">
      <div className="mx-auto max-w-[1040px]">{children}</div>
    </div>
  );
}
