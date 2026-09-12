/**
 * Shared presentation for SubmissionStatus.
 *
 * Status badges appear in the directory queue, the story queue and the story
 * detail modal. Keeping the classes here means a status colour change is one
 * edit rather than one per surface, and every consumer is checked against the
 * enum by `Record<SubmissionStatus, ...>`.
 */

import { SubmissionStatus } from "@/types/story";

/** Badge surface + ink classes, keyed by status. */
export const SUBMISSION_STATUS_BADGE: Record<SubmissionStatus, string> = {
  [SubmissionStatus.DRAFT]: "bg-surface-alt text-body",
  [SubmissionStatus.PENDING]:
    "bg-status-warning-surface text-status-warning-ink",
  [SubmissionStatus.APPROVED]:
    "bg-status-success-surface text-status-success-ink",
  [SubmissionStatus.REJECTED]: "bg-status-error-surface text-status-error-ink",
  [SubmissionStatus.FLAGGED]:
    "bg-status-flagged-surface text-status-flagged-ink",
  [SubmissionStatus.PUBLISHED]: "bg-status-info-surface text-status-info-ink",
  [SubmissionStatus.ARCHIVED]: "bg-surface-alt text-muted",
};

/** Human-readable status labels. */
export const SUBMISSION_STATUS_LABEL: Record<SubmissionStatus, string> = {
  [SubmissionStatus.DRAFT]: "Draft",
  [SubmissionStatus.PENDING]: "Pending Review",
  [SubmissionStatus.APPROVED]: "Approved",
  [SubmissionStatus.REJECTED]: "Rejected",
  [SubmissionStatus.FLAGGED]: "Flagged",
  [SubmissionStatus.PUBLISHED]: "Published",
  [SubmissionStatus.ARCHIVED]: "Archived",
};
