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
  category: "Restaurant" | "Landmark" | "Nature" | "Culture";
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
