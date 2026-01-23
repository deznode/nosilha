/**
 * Story Submission Types
 *
 * Types for community story submissions and the story contribution workflow.
 */

export enum StoryType {
  QUICK = "Quick Memory",
  FULL = "Full Story",
  GUIDED = "Guided Template",
}

export enum SubmissionStatus {
  /** User is still editing (future use for draft submissions) */
  DRAFT = "DRAFT",
  /** Awaiting admin review (default for community submissions) */
  PENDING = "PENDING",
  /** Admin approved, ready to publish */
  APPROVED = "APPROVED",
  /** Rejected by admin with optional feedback */
  REJECTED = "REJECTED",
  /** Flagged for attention */
  FLAGGED = "FLAGGED",
  /** Live on site (default for seeded directory entries) */
  PUBLISHED = "PUBLISHED",
  /** Soft-deleted entry - hidden from public but recoverable */
  ARCHIVED = "ARCHIVED",
}

export interface StorySubmission {
  id: string;
  /** URL-friendly slug for the story (e.g., 'my-grandmothers-cachupa') */
  slug: string;
  title: string;
  content: string;
  author: string;
  authorId?: string;
  type: StoryType;
  status: SubmissionStatus;
  submittedAt: string;
  location?: string;
  imageUrl?: string;
  templateType?: StoryTemplate;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  archivedAt?: string;
  commitUrl?: string;
}

export type StoryTemplate =
  | "FAMILY"
  | "CHILDHOOD"
  | "DIASPORA"
  | "TRADITIONS"
  | "FOOD"
  | "NARRATIVE"
  | "RECIPE"
  | "MIGRATION";

export interface StoryFormData {
  title: string;
  content: string;
  type: StoryType;
  template?: StoryTemplate;
  location?: string;
  imageFile?: File;
  authorName?: string;
  consent: boolean;
}

export interface StoryDraft {
  id: string;
  formData: Partial<StoryFormData>;
  lastSaved: string;
}
