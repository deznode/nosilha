"use client";

import { useEffect, useRef } from "react";

import {
  contributionDraftStore,
  type ContributionDraft,
} from "../lib/contribution-draft";

/** What a return from Google finds. Spec 039 FR-002. */
export type ResumeOutcome =
  /** S9: draft and session. */
  | { kind: "restored"; draft: ContributionDraft }
  /** S10: draft, no session. The form comes back and the sheet reopens. */
  | { kind: "cancelled"; draft: ContributionDraft }
  /** S10b: session, no draft. */
  | { kind: "noDraft" }
  | { kind: "none" };

export interface ResumeRequest {
  /** The callback sent `auth_error=1`: Google returned an error. */
  authError: boolean;
}

export function resolveResume(
  draft: ContributionDraft | null,
  signedIn: boolean,
  authError: boolean
): ResumeOutcome {
  if (draft)
    return signedIn
      ? { kind: "restored", draft }
      : { kind: "cancelled", draft };
  if (signedIn && !authError) return { kind: "noDraft" };
  return { kind: "none" };
}

/**
 * Reads the Google draft back once a `?resume=1` visit knows whether it has a
 * session. The page asks by setting `request`; `onResolved` fires once per
 * request. Leaving the page mid-read drops the result, and Activity's
 * re-run of the page's reset effect asks again if the URL still says so.
 */
export function useContributionDraft({
  request,
  authLoading,
  signedIn,
  onResolved,
}: {
  request: ResumeRequest | null;
  authLoading: boolean;
  signedIn: boolean;
  onResolved: (outcome: ResumeOutcome) => void;
}) {
  const onResolvedRef = useRef(onResolved);
  useEffect(() => {
    onResolvedRef.current = onResolved;
  });

  useEffect(() => {
    if (!request || authLoading) return;
    let cancelled = false;
    void contributionDraftStore.load().then((draft) => {
      if (!cancelled) {
        onResolvedRef.current(
          resolveResume(draft, signedIn, request.authError)
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [request, authLoading, signedIn]);

  return { clear: () => contributionDraftStore.clear() };
}
