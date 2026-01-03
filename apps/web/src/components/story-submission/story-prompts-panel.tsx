"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Lightbulb,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { generateStoryPrompts, isGeminiAvailable } from "@/lib/gemini";
import type { StoryTemplate } from "@/types/story";

interface StoryPromptsPanelProps {
  templateType: StoryTemplate;
  existingContent: string;
  onInsertPrompt: (promptText: string) => void;
}

export function StoryPromptsPanel({
  templateType,
  existingContent,
  onInsertPrompt,
}: StoryPromptsPanelProps) {
  const [prompts, setPrompts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = useCallback(async () => {
    if (!isGeminiAvailable()) {
      setError("AI prompts unavailable");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const newPrompts = await generateStoryPrompts(
        templateType,
        existingContent
      );
      setPrompts(newPrompts);
    } catch (err) {
      setError("Failed to generate prompts");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [templateType, existingContent]);

  // Fetch on mount and template change only (intentionally excluding fetchPrompts
  // to avoid refetching on every content keystroke)
  useEffect(() => {
    fetchPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateType]);

  if (!isGeminiAvailable()) {
    return null; // Don't show panel if Gemini not configured
  }

  return (
    <div className="mb-2 rounded-lg border border-slate-200 bg-blue-50/50 dark:border-slate-700 dark:bg-blue-900/10">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-3 py-2 text-sm"
      >
        <span className="flex items-center gap-2 font-medium text-[var(--color-ocean-blue)]">
          <Lightbulb className="h-4 w-4" />
          Writing Prompts
        </span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-slate-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-500" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-slate-200 px-3 py-2 dark:border-slate-700">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generating prompts...
            </div>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <ul className="space-y-2">
              {prompts.map((prompt, index) => (
                <li key={index} className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => onInsertPrompt(prompt)}
                    className="mt-0.5 rounded p-1 text-[var(--color-ocean-blue)] hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    title="Insert this prompt"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {prompt}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {!isLoading && !error && (
            <button
              type="button"
              onClick={fetchPrompts}
              className="mt-2 flex items-center gap-1 text-xs text-[var(--color-ocean-blue)] hover:underline"
            >
              <RefreshCw className="h-3 w-3" />
              Get new prompts
            </button>
          )}
        </div>
      )}
    </div>
  );
}
