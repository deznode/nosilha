"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Lightbulb,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import {
  generatePromptsAction,
  checkGeminiAvailableAction,
} from "@/app/actions/gemini-actions";
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
  const [geminiAvailable, setGeminiAvailable] = useState<boolean | null>(null);

  // Check Gemini availability on mount
  useEffect(() => {
    checkGeminiAvailableAction().then(setGeminiAvailable);
  }, []);

  const fetchPrompts = useCallback(async () => {
    if (!geminiAvailable) {
      setError("AI prompts unavailable");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const newPrompts = await generatePromptsAction(
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
  }, [templateType, existingContent, geminiAvailable]);

  // Fetch on mount and template change only (intentionally excluding fetchPrompts
  // to avoid refetching on every content keystroke)
  useEffect(() => {
    if (geminiAvailable) {
      fetchPrompts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateType, geminiAvailable]);

  // Don't show panel if Gemini not configured (or still loading)
  if (geminiAvailable !== true) {
    return null;
  }

  return (
    <div className="border-hairline rounded-card bg-ocean-blue/5 mb-2 border">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-3 py-2 text-sm"
      >
        <span className="text-ocean-blue flex items-center gap-2 font-medium">
          <Lightbulb className="h-4 w-4" />
          Writing Prompts
        </span>
        {isExpanded ? (
          <ChevronUp className="text-muted h-4 w-4" />
        ) : (
          <ChevronDown className="text-muted h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="border-hairline border-t px-3 py-2">
          {isLoading ? (
            <div className="text-muted flex items-center gap-2 text-sm">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generating prompts...
            </div>
          ) : error ? (
            <p className="text-accent-error text-sm">{error}</p>
          ) : (
            <ul className="space-y-2">
              {prompts.map((prompt, index) => (
                <li key={index} className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => onInsertPrompt(prompt)}
                    className="text-ocean-blue hover:bg-ocean-blue/10 mt-0.5 rounded p-1"
                    title="Insert this prompt"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <span className="text-body text-sm">{prompt}</span>
                </li>
              ))}
            </ul>
          )}

          {!isLoading && !error && (
            <button
              type="button"
              onClick={fetchPrompts}
              className="text-ocean-blue mt-2 flex items-center gap-1 text-xs hover:underline"
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
