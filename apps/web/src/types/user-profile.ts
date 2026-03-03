/**
 * User Profile Types
 *
 * Extended user profile types for the enhanced profile page.
 */

export enum Language {
  EN = "EN",
  PT = "PT",
  KEA = "KEA",
}

export interface UserProfileStats {
  storiesSubmitted: number;
  suggestionsMade: number;
  reactionsGiven: number;
  bookmarksCount?: number;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  location?: string;
  joinedDate: string;
  preferredLanguage: Language;
  stats: UserProfileStats;
  avatarUrl?: string;
  bio?: string;
}

export interface UserNotificationPreferences {
  storyPublished: boolean;
  suggestionApproved: boolean;
  weeklyDigest: boolean;
}

export interface UserProfileUpdateData {
  displayName?: string;
  location?: string;
  preferredLanguage?: Language;
  notifications?: Partial<UserNotificationPreferences>;
}

export interface UserActivityItem {
  id: string;
  type: "story" | "suggestion" | "reaction";
  title: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  timestamp: string;
  targetUrl?: string;
}

export interface SavedPlace {
  id: string;
  entryId: string;
  name: string;
  category: string;
  town: string;
  imageUrl?: string;
  savedAt: string;
}
