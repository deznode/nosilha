import { useEffect, useRef } from "react";
import { useStoryDraftStore } from "@/stores/storyDraftStore";
import type { StoryType, StoryTemplate } from "@/types/story";

/**
 * Hook for debounced auto-save to Zustand draft store.
 * Use in the story form to auto-save as user types.
 */

const AUTO_SAVE_DELAY = 1000; // 1 second debounce

interface AutoSaveOptions {
  title: string;
  content: string;
  storyType?: StoryType;
  templateType?: StoryTemplate;
  enabled?: boolean;
}

export function useAutoSaveDraft({
  title,
  content,
  storyType,
  templateType,
  enabled = true,
}: AutoSaveOptions) {
  const updateDraft = useStoryDraftStore((state) => state.updateDraft);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || (!title && !content)) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save
    saveTimeoutRef.current = setTimeout(() => {
      updateDraft({ title, content, storyType, templateType });
    }, AUTO_SAVE_DELAY);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [title, content, storyType, templateType, enabled, updateDraft]);
}
