/**
 * Mock Data Barrel Export
 *
 * Central export for all mock data and mock API functions.
 * These mocks simulate backend responses for frontend development.
 */

// Admin
export {
  MOCK_ADMIN_STATS,
  MOCK_SUGGESTIONS,
  MOCK_TOP_CONTRIBUTORS,
  mockAdminApi,
} from "./admin";

// Stories
export { MOCK_STORIES, STORY_TEMPLATES, mockStoriesApi } from "./stories";

// Media
export { MOCK_MEDIA_ITEMS, MEDIA_CATEGORIES, mockMediaApi } from "./media";

// User Profile
export {
  MOCK_USER_PROFILE,
  MOCK_USER_ACTIVITY,
  MOCK_SAVED_PLACES,
  MOCK_NOTIFICATION_PREFERENCES,
  mockUserApi,
} from "./user";

// Directory (Extended)
export {
  MOCK_DIRECTORY_ENTRIES,
  DIRECTORY_TOWNS,
  DIRECTORY_CATEGORIES,
  mockDirectoryApi,
} from "./directory";

// Re-export types for convenience
export type { MockDirectoryEntry } from "./directory";
