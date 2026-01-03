"use client";

import { useRef, useState } from "react";
import {
  Bold,
  Italic,
  List,
  Quote,
  Eye,
  Edit2,
  LayoutTemplate,
  ChevronDown,
  Sparkles,
  Languages,
  Undo2,
} from "lucide-react";
import Markdown from "react-markdown";
import { StoryType } from "@/types/story";
import type { StoryTemplate } from "@/types/story";
import {
  polishStoryContent,
  translateContent,
  isGeminiAvailable,
} from "@/lib/gemini";
import { StoryPromptsPanel } from "./story-prompts-panel";

export const WORD_LIMITS: Record<StoryType, number> = {
  [StoryType.QUICK]: 500,
  [StoryType.FULL]: 5000,
  [StoryType.GUIDED]: 5000,
  [StoryType.PHOTO]: 200,
};

const WORDS_PER_MINUTE = 200;

function getReadingTime(wordCount: number): string {
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);
  if (minutes < 1) return "< 1 min read";
  return `${minutes} min read`;
}

function getWarningLevel(
  wordCount: number,
  limit: number
): "none" | "warning" | "error" {
  const percentage = (wordCount / limit) * 100;
  if (percentage >= 100) return "error";
  if (percentage >= 80) return "warning";
  return "none";
}

const TEMPLATES = {
  narrative: `## The Beginning
Where does this story start? (e.g., Nova Sintra, 1980...)

## The Event
Describe what happened in detail. Who was there? What did you see, hear, and smell?

## The Impact
Why is this memory important to you? How does it make you feel today?`,

  recipe: `## The Dish
What is the name of this dish? When is it usually eaten?

## Ingredients
- Item 1
- Item 2

## The Secret
Is there a special technique or ingredient that makes this specific to your family?

## The Story
Who taught you to cook this? What memories does this smell bring back?`,

  migration: `## Leaving Brava
When did you leave? What do you remember about the departure (the boat, the plane, the goodbyes)?

## The Journey
How was the trip? What were your first impressions of the new country?

## Adaptation
What was the hardest thing to get used to? What did you miss the most?

## Looking Back
How do you stay connected to Brava today?`,
};

interface StoryEditorProps {
  storyType: StoryType;
  content: string;
  title: string;
  author?: string;
  location?: string;
  onContentChange: (content: string) => void;
  templateType?: StoryTemplate;
}

export function StoryEditor({
  storyType,
  content,
  title,
  author = "",
  location = "",
  onContentChange,
  templateType,
}: StoryEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isPolishing, setIsPolishing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCharCount, setShowCharCount] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<"EN" | "PT">("EN");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [isTranslating, setIsTranslating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePolish = async () => {
    if (!content) return;
    setIsPolishing(true);
    try {
      const polished = await polishStoryContent(content);
      onContentChange(polished);
    } catch (error) {
      console.error("Failed to polish content:", error);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleTranslate = async () => {
    if (!content) return;

    // Store original on first translation
    if (!originalContent) {
      setOriginalContent(content);
    }

    setIsTranslating(true);
    // Determine target language (opposite of current)
    const targetLang = currentLanguage === "EN" ? "PT" : "EN";

    try {
      // NOTE: translateContent takes 2 params: (content, targetLang)
      const translated = await translateContent(content, targetLang);
      onContentChange(translated);
      setCurrentLanguage(targetLang);
    } catch (error) {
      console.error("Translation failed:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleRevertTranslation = () => {
    if (originalContent) {
      onContentChange(originalContent);
      setOriginalContent("");
      setCurrentLanguage("EN");
    }
  };

  const handleInsertPrompt = (promptText: string) => {
    const newContent = content + "\n\n> " + promptText + "\n\n";
    onContentChange(newContent);
  };

  const applyTemplate = (templateKey: keyof typeof TEMPLATES) => {
    const confirmChange =
      !content ||
      window.confirm("This will replace your current content. Are you sure?");
    if (confirmChange) {
      onContentChange(TEMPLATES[templateKey]);
      setShowTemplates(false);
    }
  };

  const insertFormatting = (format: "bold" | "italic" | "list" | "quote") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    let newText = "";
    let newCursorPos = 0;

    switch (format) {
      case "bold":
        newText = `${before}**${selection || "text"}**${after}`;
        newCursorPos = selection ? end + 4 : start + 2;
        break;
      case "italic":
        newText = `${before}_${selection || "text"}_${after}`;
        newCursorPos = selection ? end + 2 : start + 1;
        break;
      case "list":
        newText = `${before}\n- ${selection}${after}`;
        newCursorPos = end + 3;
        break;
      case "quote":
        newText = `${before}\n> ${selection}${after}`;
        newCursorPos = end + 3;
        break;
    }

    onContentChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const limit = WORD_LIMITS[storyType];
  const warningLevel = getWarningLevel(wordCount, limit);
  const readingTime = getReadingTime(wordCount);
  const isOverLimit = wordCount > limit;

  return (
    <div>
      <div className="mb-2 flex items-end justify-between">
        <label className="block text-sm font-medium text-slate-900 dark:text-white">
          Your Story {storyType === StoryType.QUICK ? "(Max 500 words)" : ""}
        </label>

        {/* Tabs */}
        <div className="flex space-x-1 rounded-lg bg-slate-100 p-0.5 dark:bg-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={`flex items-center rounded-md px-3 py-1 text-xs font-medium transition-all ${
              activeTab === "write"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Edit2 className="mr-1 h-3 w-3" /> Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center rounded-md px-3 py-1 text-xs font-medium transition-all ${
              activeTab === "preview"
                ? "bg-white text-[var(--color-ocean-blue)] shadow-sm dark:bg-slate-600"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Eye className="mr-1 h-3 w-3" /> Preview
          </button>
        </div>
      </div>

      {activeTab === "write" ? (
        <div className="relative">
          {/* Toolbar */}
          <div className="mb-1 flex flex-wrap items-center gap-1 rounded-t-md border border-b-0 border-slate-200 bg-slate-50 p-1 dark:border-slate-600 dark:bg-slate-700">
            <button
              type="button"
              onClick={() => insertFormatting("bold")}
              className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-white"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("italic")}
              className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-white"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </button>
            <div className="mx-1 h-4 w-px bg-slate-200 dark:bg-slate-600" />
            <button
              type="button"
              onClick={() => insertFormatting("list")}
              className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-white"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("quote")}
              className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-white"
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </button>

            {/* Template Dropdown (Only for Full Stories) */}
            {storyType === StoryType.FULL && (
              <div className="relative ml-2">
                <button
                  type="button"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="flex items-center gap-1 rounded bg-pink-50 px-2 py-1 text-xs font-medium text-[var(--color-bougainvillea)] transition-colors hover:bg-pink-100 dark:bg-pink-900/30 dark:hover:bg-pink-900/50"
                >
                  <LayoutTemplate className="h-3 w-3" /> Templates{" "}
                  <ChevronDown className="h-3 w-3" />
                </button>

                {showTemplates && (
                  <div className="absolute top-full left-0 z-10 mt-1 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                    <button
                      type="button"
                      onClick={() => applyTemplate("narrative")}
                      className="block w-full px-4 py-2 text-left text-xs text-slate-900 hover:bg-slate-50 dark:text-white dark:hover:bg-slate-700"
                    >
                      General Narrative
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate("migration")}
                      className="block w-full px-4 py-2 text-left text-xs text-slate-900 hover:bg-slate-50 dark:text-white dark:hover:bg-slate-700"
                    >
                      Migration Journey
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate("recipe")}
                      className="block w-full px-4 py-2 text-left text-xs text-slate-900 hover:bg-slate-50 dark:text-white dark:hover:bg-slate-700"
                    >
                      Family Recipe
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex-grow" />

            <button
              type="button"
              onClick={handlePolish}
              disabled={isPolishing || !content}
              className="flex items-center px-2 text-xs text-[var(--color-bougainvillea)] hover:text-pink-700 disabled:opacity-50"
              title="Use Gemini AI to fix grammar and improve flow"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              {isPolishing ? "Polishing..." : "AI Polish"}
            </button>

            {isGeminiAvailable() && (
              <div className="ml-2 flex items-center gap-1 border-l border-slate-200 pl-2 dark:border-slate-600">
                <button
                  type="button"
                  onClick={handleTranslate}
                  disabled={isTranslating || !content}
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-[var(--color-ocean-blue)] hover:bg-blue-50 disabled:opacity-50 dark:hover:bg-blue-900/30"
                  title={`Translate to ${currentLanguage === "EN" ? "Portuguese" : "English"}`}
                >
                  <Languages className="h-3 w-3" />
                  {isTranslating
                    ? "..."
                    : currentLanguage === "EN"
                      ? "→PT"
                      : "→EN"}
                </button>

                {originalContent && (
                  <button
                    type="button"
                    onClick={handleRevertTranslation}
                    className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    title="Revert to original"
                  >
                    <Undo2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {storyType === StoryType.GUIDED && templateType && (
            <StoryPromptsPanel
              templateType={templateType}
              existingContent={content}
              onInsertPrompt={handleInsertPrompt}
            />
          )}

          <textarea
            ref={textareaRef}
            rows={storyType === StoryType.QUICK ? 8 : 16}
            required
            className="block w-full rounded-b-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 shadow-sm focus:border-[var(--color-ocean-blue)] focus:ring-[var(--color-ocean-blue)] focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            placeholder={
              storyType === StoryType.QUICK
                ? "Share a quick memory... (e.g., 'I remember the sound of the ocean at night...')"
                : "Start typing your story here... Markdown headers (##) are helpful for structure."
            }
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Markdown supported: **bold**, *italic*, - list
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {readingTime}
              </span>

              <span
                className={`text-xs transition-colors ${
                  warningLevel === "error"
                    ? "font-medium text-red-600 dark:text-red-400"
                    : warningLevel === "warning"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {showCharCount ? (
                  `${charCount.toLocaleString()} chars`
                ) : (
                  <>
                    {wordCount.toLocaleString()}/{limit.toLocaleString()} words
                    {isOverLimit && (
                      <span className="ml-1 font-semibold">(over limit!)</span>
                    )}
                  </>
                )}
              </span>

              <button
                type="button"
                onClick={() => setShowCharCount(!showCharCount)}
                className="rounded px-1.5 py-0.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                title={
                  showCharCount ? "Show word count" : "Show character count"
                }
              >
                {showCharCount ? "words" : "chars"}
              </button>
            </div>
          </div>

          {warningLevel === "warning" && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              Approaching word limit ({Math.round((wordCount / limit) * 100)}%
              used)
            </p>
          )}
        </div>
      ) : (
        <div className="prose prose-sm dark:prose-invert prose-headings:font-serif prose-headings:text-[var(--color-ocean-blue)] prose-a:text-[var(--color-ocean-blue)] min-h-[300px] max-w-none rounded-md border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          {/* Simulated Article Header for Preview */}
          <div className="mb-6 border-b border-slate-100 pb-4 dark:border-slate-700">
            <h1 className="mb-2 font-serif text-2xl font-bold text-slate-900 dark:text-white">
              {title || "Untitled Story"}
            </h1>
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
              <span className="mr-2 font-medium text-[var(--color-bougainvillea)]">
                {author || "Anonymous"}
              </span>
              {location && <span className="mr-2">• {location}</span>}
              <span>• {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {content ? (
            <Markdown
              components={{
                h1: ({ children, ...props }) => (
                  <h2
                    className="mt-6 mb-3 text-xl font-bold text-[var(--color-ocean-blue)]"
                    {...props}
                  >
                    {children}
                  </h2>
                ),
                h2: ({ children, ...props }) => (
                  <h3
                    className="mt-5 mb-2 text-lg font-bold text-slate-900 dark:text-white"
                    {...props}
                  >
                    {children}
                  </h3>
                ),
                p: ({ children, ...props }) => (
                  <p
                    className="mb-4 leading-relaxed text-slate-900 dark:text-slate-200"
                    {...props}
                  >
                    {children}
                  </p>
                ),
                ul: ({ children, ...props }) => (
                  <ul
                    className="mb-4 list-disc space-y-1 pl-5 text-slate-900 dark:text-slate-200"
                    {...props}
                  >
                    {children}
                  </ul>
                ),
                ol: ({ children, ...props }) => (
                  <ol
                    className="mb-4 list-decimal space-y-1 pl-5 text-slate-900 dark:text-slate-200"
                    {...props}
                  >
                    {children}
                  </ol>
                ),
                blockquote: ({ children, ...props }) => (
                  <blockquote
                    className="my-4 border-l-4 border-slate-200 bg-slate-50 py-2 pr-2 pl-4 text-slate-500 italic dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400"
                    {...props}
                  >
                    {children}
                  </blockquote>
                ),
              }}
            >
              {content}
            </Markdown>
          ) : (
            <p className="mt-10 text-center text-slate-500 italic dark:text-slate-400">
              Nothing to preview yet. Switch to the Write tab to add content.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
