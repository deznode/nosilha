"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Lightbulb,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { useAiAvailable, useGeneratePrompts } from "@/hooks/queries/useTextAi";
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
  const [isExpanded, setIsExpanded] = useState(true);

  const { data: aiAvailability } = useAiAvailable();
  const generatePromptsMutation = useGeneratePrompts();
  const geminiAvailable = aiAvailability?.available ?? false;

  const fetchPrompts = useCallback(async () => {
    if (!geminiAvailable) return;
    try {
      const result = await generatePromptsMutation.mutateAsync({
        templateType,
        existingContent,
      });
      setPrompts(result.prompts);
    } catch (err) {
      console.error("Failed to generate prompts", err);
    }
  }, [templateType, existingContent, geminiAvailable, generatePromptsMutation]);

  // Fetch on mount and template change only (intentionally excluding fetchPrompts
  // to avoid refetching on every content keystroke)
  useEffect(() => {
    if (geminiAvailable) {
      fetchPrompts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateType, geminiAvailable]);

  // Don't show panel if AI not configured (or still loading)
  if (!geminiAvailable) {
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
          {generatePromptsMutation.isPending ? (
            <div className="text-muted flex items-center gap-2 text-sm">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generating prompts...
            </div>
          ) : generatePromptsMutation.error ? (
            <p className="text-accent-error text-sm">
              Failed to generate prompts
            </p>
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

          {!generatePromptsMutation.isPending &&
            !generatePromptsMutation.error && (
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
