import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { StoryType, StoryTemplate } from "@/types/story";

/**
 * Zustand store for story draft persistence.
 * Persists draft to localStorage for resume capability.
 * Follows project pattern from uiStore.ts.
 */

interface StoryDraftData {
  title: string;
  content: string;
  storyType?: StoryType;
  templateType?: StoryTemplate;
}

interface StoryDraftState {
  // State
  draft: StoryDraftData | null;
  lastSaved: string | null;

  // Actions
  setDraft: (data: Partial<StoryDraftData>) => void;
  updateDraft: (data: Partial<StoryDraftData>) => void;
  clearDraft: () => void;
  hasDraft: () => boolean;
}

export const useStoryDraftStore = create<StoryDraftState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        draft: null,
        lastSaved: null,

        // Actions
        setDraft: (data) =>
          set({
            draft: { title: "", content: "", ...data },
            lastSaved: new Date().toISOString(),
          }),

        updateDraft: (data) =>
          set((state) => ({
            draft: state.draft
              ? { ...state.draft, ...data }
              : { title: "", content: "", ...data },
            lastSaved: new Date().toISOString(),
          })),

        clearDraft: () => set({ draft: null, lastSaved: null }),

        hasDraft: () => {
          const { draft } = get();
          return !!(draft?.title || draft?.content);
        },
      }),
      {
        name: "story-draft-storage",
        // Only persist draft data, not computed values
        partialize: (state) => ({
          draft: state.draft,
          lastSaved: state.lastSaved,
        }),
      }
    ),
    {
      name: "StoryDraftStore",
    }
  )
);

// Selectors for optimized re-renders
export const useDraft = () => useStoryDraftStore((state) => state.draft);
export const useLastSaved = () =>
  useStoryDraftStore((state) => state.lastSaved);
export const useHasDraft = () =>
  useStoryDraftStore((state) => state.hasDraft());
