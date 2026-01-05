/**
 * Admin Dashboard Types
 *
 * Types for admin moderation, statistics, and queue management.
 */

import { SubmissionStatus } from "./story";

export interface AdminStats {
  newSuggestions: number;
  storySubmissions: number;
  contactInquiries: number;
  directorySubmissions: number;
  mediaPending: number;
  activeUsers: number;
  locationsCovered: number;
  weeklyActivity: WeeklyActivityData[];
  coverageByTown: TownCoverageData[];
}

export interface WeeklyActivityData {
  day: string;
  suggestions: number;
  stories: number;
}

export interface TownCoverageData {
  name: string;
  value: number;
  fill: string;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

export interface Suggestion {
  id: string;
  target: string;
  targetId?: string;
  targetType?: "directory" | "article" | "story";
  description: string;
  status: SubmissionStatus;
  submittedBy: string;
  submittedByEmail?: string;
  timestamp: string;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface Contributor {
  id: string;
  name: string;
  role: "Contributor" | "Moderator" | "Admin";
  points: number;
  avatar?: string;
}

/**
 * Contact message status aligned with backend ContactStatus enum.
 * State transitions: UNREAD → READ → ARCHIVED, or UNREAD → ARCHIVED
 */
export type ContactMessageStatus = "UNREAD" | "READ" | "ARCHIVED";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  /** ISO datetime string from backend (createdAt field) */
  createdAt: string;
}

export type DirectorySubmissionStatus = SubmissionStatus;

export interface DirectorySubmission {
  id: string;
  name: string;
  category: "Restaurant" | "Hotel" | "Beach" | "Heritage" | "Nature";
  town: string;
  customTown?: string;
  description: string;
  tags: string[];
  imageUrl?: string;
  priceLevel?: "$" | "$$" | "$$$";
  latitude?: number;
  longitude?: number;
  status: DirectorySubmissionStatus;
  submittedBy: string;
  submittedByEmail?: string;
  submittedAt: string;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface AdminQueueFilters {
  status?: SubmissionStatus | "ALL";
  searchQuery?: string;
  sortBy?: "newest" | "oldest";
  page?: number;
  pageSize?: number;
}

export interface AdminQueueResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Media Archive Queue Types
 */
export type MediaStatus =
  | "PENDING"
  | "PROCESSING"
  | "PENDING_REVIEW"
  | "FLAGGED"
  | "AVAILABLE"
  | "DELETED";
export type MediaSource = "LOCAL" | "GOOGLE_PHOTOS" | "ADOBE_LIGHTROOM";
export type MediaModerationAction = "APPROVE" | "FLAG" | "REJECT";

export interface AdminMediaListItem {
  id: string;
  title: string;
  contentType: string;
  thumbnailUrl?: string;
  status: MediaStatus;
  severity: number;
  uploadedBy?: string;
  createdAt: string;
}

export interface AdminMediaDetail extends AdminMediaListItem {
  fileName: string;
  publicUrl?: string;
  category?: string;
  description?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface UpdateMediaStatusRequest {
  action: MediaModerationAction;
  reason?: string; // Required for FLAG
  adminNotes?: string;
}

/**
 * MDX Archival Engine Types
 */
export interface MdxContent {
  storyId: string;
  slug: string;
  mdxSource: string;
  frontmatter: MdxFrontmatter;
  schemaValid: boolean;
  validationErrors?: string[];
  generatedAt: string;
}

export interface MdxFrontmatter {
  title: string;
  slug: string;
  author: string;
  date: string;
  language: string;
  location?: string;
  storyType: string;
  tags?: string[];
  excerpt?: string;
}

export interface MdxCommitResult {
  storyId: string;
  slug: string;
  mdxPath: string;
  committedAt: string;
  committedBy: string;
}

export interface GenerateMdxOptions {
  includeTranslations?: boolean;
  targetLanguage?: string;
}
