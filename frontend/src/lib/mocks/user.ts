/**
 * User Mock Data
 *
 * Mock data for user profiles and saved places.
 */

import type {
  UserProfile,
  UserActivityItem,
  SavedPlace,
  UserNotificationPreferences,
} from "@/types/user-profile";
import { Language } from "@/types/user-profile";

export const MOCK_USER_PROFILE: UserProfile = {
  id: "u1",
  displayName: "Maria Silva",
  email: "maria.silva@example.com",
  location: "New Bedford, MA",
  joinedDate: "March 2025",
  preferredLanguage: Language.PT,
  stats: {
    storiesSubmitted: 2,
    suggestionsMade: 5,
    reactionsGiven: 24,
    bookmarksCount: 7,
  },
};

export const MOCK_USER_ACTIVITY: UserActivityItem[] = [
  {
    id: "a1",
    type: "story",
    title: "My grandmother's cachupa",
    status: "APPROVED",
    timestamp: "2 days ago",
    targetUrl: "/stories/my-grandmothers-cachupa",
  },
  {
    id: "a2",
    type: "story",
    title: "Childhood in Nova Sintra",
    status: "PENDING",
    timestamp: "1 week ago",
  },
  {
    id: "a3",
    type: "suggestion",
    title: "Update Café Morabeza hours",
    status: "APPROVED",
    timestamp: "2 weeks ago",
  },
  {
    id: "a4",
    type: "suggestion",
    title: "Add new photo to museum page",
    status: "PENDING",
    timestamp: "3 weeks ago",
  },
  {
    id: "a5",
    type: "suggestion",
    title: "Fix typo in history article",
    status: "APPROVED",
    timestamp: "1 month ago",
  },
];

export const MOCK_SAVED_PLACES: SavedPlace[] = [
  {
    id: "b1",
    entryId: "1",
    name: "Café Morabeza",
    category: "Restaurant",
    town: "Nova Sintra",
    imageUrl: "https://picsum.photos/id/431/400/300",
    savedAt: "2 days ago",
  },
  {
    id: "b2",
    entryId: "5",
    name: "Igreja Nossa Senhora do Monte",
    category: "Landmark",
    town: "Nossa Senhora do Monte",
    imageUrl: "https://picsum.photos/id/116/400/300",
    savedAt: "1 week ago",
  },
  {
    id: "b3",
    entryId: "2",
    name: "Fajã d'Água Natural Pools",
    category: "Nature",
    town: "Fajã d'Água",
    imageUrl: "https://picsum.photos/id/1015/400/300",
    savedAt: "2 weeks ago",
  },
  {
    id: "b4",
    entryId: "3",
    name: "Eugénio Tavares Museum",
    category: "Culture",
    town: "Nova Sintra",
    imageUrl: "https://picsum.photos/id/211/400/300",
    savedAt: "3 weeks ago",
  },
];

export const MOCK_NOTIFICATION_PREFERENCES: UserNotificationPreferences = {
  storyPublished: true,
  suggestionApproved: true,
  weeklyDigest: false,
};

// Mock API functions
export const mockUserApi = {
  getProfile: async (): Promise<UserProfile> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_USER_PROFILE;
  },

  updateProfile: async (
    updates: Partial<UserProfile>
  ): Promise<UserProfile> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { ...MOCK_USER_PROFILE, ...updates };
  },

  getActivity: async (): Promise<UserActivityItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_USER_ACTIVITY;
  },

  getSavedPlaces: async (): Promise<SavedPlace[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_SAVED_PLACES;
  },

  addBookmark: async (entryId: string): Promise<SavedPlace> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    // In real implementation, this would create a new bookmark
    return {
      id: `new-${Date.now()}`,
      entryId,
      name: "New Bookmark",
      category: "Landmark",
      town: "Nova Sintra",
      savedAt: "Just now",
    };
  },

  removeBookmark: async (bookmarkId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    // In real implementation, this would delete the bookmark
    console.log("Removed bookmark:", bookmarkId);
  },

  getNotificationPreferences:
    async (): Promise<UserNotificationPreferences> => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return MOCK_NOTIFICATION_PREFERENCES;
    },

  updateNotificationPreferences: async (
    prefs: Partial<UserNotificationPreferences>
  ): Promise<UserNotificationPreferences> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { ...MOCK_NOTIFICATION_PREFERENCES, ...prefs };
  },
};
