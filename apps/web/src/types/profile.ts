/**
 * Profile API Type Definitions
 *
 * DTOs for profile-related backend API communication.
 * These types match the ProfileController DTOs from the Spring Boot backend.
 */

// ================================
// LANGUAGE PREFERENCE TYPES
// ================================

/**
 * Supported language options for user preferences
 * Matches backend PreferredLanguage enum
 */
export type PreferredLanguage = "EN" | "PT" | "KEA";

// ================================
// NOTIFICATION PREFERENCES
// ================================

/**
 * User notification preference settings
 * Controls which notifications the user wants to receive
 */
export interface NotificationPreferences {
  storyPublished: boolean;
  suggestionApproved: boolean;
  weeklyDigest: boolean;
}

// ================================
// PROFILE DTO TYPES
// ================================

/**
 * User profile as returned by GET /users/me
 * Matches ProfileDto from Spring Boot backend
 */
export interface ProfileDto {
  id: string;
  userId: string;
  displayName: string | null;
  location: string | null;
  preferredLanguage: PreferredLanguage;
  notificationPreferences: NotificationPreferences;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Request payload for updating user profile via PUT /users/me
 * All fields are optional to support partial updates
 */
export interface ProfileUpdateRequest {
  displayName?: string | null;
  location?: string | null;
  preferredLanguage?: PreferredLanguage;
  notificationPreferences?: Partial<NotificationPreferences>;
}

// ================================
// CONTRIBUTION SUMMARY TYPES
// ================================

/**
 * Summary of a user's content suggestion
 * Used in contributions list
 */
export interface SuggestionSummaryDto {
  id: string;
  contentId: string;
  suggestionType: string;
  status: string;
  createdAt: string; // ISO 8601 timestamp
}

/**
 * Summary of a user's submitted story
 * Used in contributions list
 */
export interface StorySummaryDto {
  id: string;
  title: string;
  storyType: string;
  status: string;
  createdAt: string; // ISO 8601 timestamp
}

/**
 * User contributions response from GET /users/me/contributions
 * Aggregates all user-generated content and interactions
 */
export interface ContributionsDto {
  reactionCounts: Record<string, number>;
  suggestions: SuggestionSummaryDto[];
  stories: StorySummaryDto[];
  totalReactions: number;
  totalSuggestions: number;
  totalStories: number;
}

// ================================
// TYPE GUARDS
// ================================

/**
 * Type guard to check if a value is a valid PreferredLanguage
 */
export function isPreferredLanguage(
  value: unknown
): value is PreferredLanguage {
  return (
    typeof value === "string" && ["EN", "PT", "KEA"].includes(value as string)
  );
}

/**
 * Type guard to check if an object is a valid NotificationPreferences
 */
export function isNotificationPreferences(
  obj: unknown
): obj is NotificationPreferences {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "storyPublished" in obj &&
    typeof obj.storyPublished === "boolean" &&
    "suggestionApproved" in obj &&
    typeof obj.suggestionApproved === "boolean" &&
    "weeklyDigest" in obj &&
    typeof obj.weeklyDigest === "boolean"
  );
}

/**
 * Type guard to check if an object is a valid ProfileDto
 */
export function isProfileDto(obj: unknown): obj is ProfileDto {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    typeof obj.id === "string" &&
    "userId" in obj &&
    typeof obj.userId === "string" &&
    "preferredLanguage" in obj &&
    isPreferredLanguage((obj as ProfileDto).preferredLanguage) &&
    "notificationPreferences" in obj &&
    isNotificationPreferences((obj as ProfileDto).notificationPreferences) &&
    "createdAt" in obj &&
    typeof obj.createdAt === "string" &&
    "updatedAt" in obj &&
    typeof obj.updatedAt === "string"
  );
}

/**
 * Type guard to check if an object is a valid ContributionsDto
 */
export function isContributionsDto(obj: unknown): obj is ContributionsDto {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "reactionCounts" in obj &&
    typeof obj.reactionCounts === "object" &&
    "suggestions" in obj &&
    Array.isArray(obj.suggestions) &&
    "stories" in obj &&
    Array.isArray(obj.stories) &&
    "totalReactions" in obj &&
    typeof obj.totalReactions === "number" &&
    "totalSuggestions" in obj &&
    typeof obj.totalSuggestions === "number" &&
    "totalStories" in obj &&
    typeof obj.totalStories === "number"
  );
}

// ================================
// DEFAULT VALUES
// ================================

/**
 * Default notification preferences matching backend defaults
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  storyPublished: true,
  suggestionApproved: true,
  weeklyDigest: false,
};

/**
 * Default language preference
 */
export const DEFAULT_LANGUAGE: PreferredLanguage = "EN";
