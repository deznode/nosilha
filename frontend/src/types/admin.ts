/**
 * Admin Dashboard Types
 *
 * Types for admin moderation, statistics, and queue management.
 */

import { SubmissionStatus } from "./story";

export interface AdminStats {
  newSuggestions: number;
  storySubmissions: number;
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
