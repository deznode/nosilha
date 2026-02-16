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
import type { StoryTemplate } from "@/types/story";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useAiAvailable,
  usePolishContent,
  useTranslateContent,
} from "@/hooks/queries/useTextAi";
import { StoryPromptsPanel } from "./story-prompts-panel";
import { useToast } from "@/hooks/use-toast";

// Single word limit for all story types
const WORD_LIMIT = 5000;
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
  content: string;
  title: string;
  author?: string;
  location?: string;
  onContentChange: (content: string) => void;
  templateType?: StoryTemplate;
}

export function StoryEditor({
  content,
  title,
  author = "",
  location = "",
  onContentChange,
  templateType,
}: StoryEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCharCount, setShowCharCount] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<"EN" | "PT">("EN");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [pendingTemplate, setPendingTemplate] = useState<
    keyof typeof TEMPLATES | null
  >(null);
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toast = useToast();

  const { data: aiAvailability } = useAiAvailable();
  const polishMutation = usePolishContent();
  const translateMutation = useTranslateContent();
  const geminiAvailable = aiAvailability?.available ?? false;

  const handlePolish = async () => {
    if (!content) return;
    try {
      const result = await polishMutation.mutateAsync({ content });
      onContentChange(result.content);
      toast.success("Content polished").show();
    } catch (error) {
      console.error("Failed to polish content:", error);
      toast.error("Failed to polish content. Please try again.").show();
    }
  };

  const handleTranslate = async () => {
    if (!content) return;

    // Store original on first translation
    if (!originalContent) {
      setOriginalContent(content);
    }

    // Determine target language (opposite of current)
    const targetLang = currentLanguage === "EN" ? "PT" : "EN";

    try {
      const result = await translateMutation.mutateAsync({
        content,
        targetLang,
      });
      onContentChange(result.content);
      setCurrentLanguage(targetLang);
      toast
        .success(
          `Translated to ${targetLang === "PT" ? "Portuguese" : "English"}`
        )
        .show();
    } catch (error) {
      console.error("Translation failed:", error);
      toast.error("Translation failed. Please try again.").show();
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
    if (content) {
      // Show confirmation if there's existing content
      setPendingTemplate(templateKey);
      setShowTemplateConfirm(true);
    } else {
      // Apply directly if no content
      onContentChange(TEMPLATES[templateKey]);
      setShowTemplates(false);
    }
  };

  const handleTemplateConfirm = () => {
    if (pendingTemplate) {
      onContentChange(TEMPLATES[pendingTemplate]);
      setShowTemplates(false);
    }
    setShowTemplateConfirm(false);
    setPendingTemplate(null);
  };

  const handleTemplateCancel = () => {
    setShowTemplateConfirm(false);
    setPendingTemplate(null);
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
  const warningLevel = getWarningLevel(wordCount, WORD_LIMIT);
  const readingTime = getReadingTime(wordCount);
  const isOverLimit = wordCount > WORD_LIMIT;

  return (
    <div>
      <div className="mb-2 flex items-end justify-between">
        <label className="text-body block text-sm font-medium">
          Your Story
        </label>

        {/* Tabs */}
        <div className="bg-surface-alt rounded-card flex space-x-1 p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={`rounded-button flex items-center px-3 py-1 text-xs font-medium transition-all ${
              activeTab === "write"
                ? "bg-surface text-body shadow-subtle"
                : "text-muted hover:text-body"
            }`}
          >
            <Edit2 className="mr-1 h-3 w-3" /> Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`rounded-button flex items-center px-3 py-1 text-xs font-medium transition-all ${
              activeTab === "preview"
                ? "bg-surface text-ocean-blue shadow-subtle"
                : "text-muted hover:text-body"
            }`}
          >
            <Eye className="mr-1 h-3 w-3" /> Preview
          </button>
        </div>
      </div>

      {activeTab === "write" ? (
        <div className="relative">
          {/* Toolbar */}
          <div className="border-hairline bg-surface mb-1 flex flex-wrap items-center gap-1 rounded-t-md border border-b-0 p-1">
            <button
              type="button"
              onClick={() => insertFormatting("bold")}
              className="text-muted hover:bg-surface-alt hover:text-body rounded p-1.5"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("italic")}
              className="text-muted hover:bg-surface-alt hover:text-body rounded p-1.5"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </button>
            <div className="bg-hairline mx-1 h-4 w-px" />
            <button
              type="button"
              onClick={() => insertFormatting("list")}
              className="text-muted hover:bg-surface-alt hover:text-body rounded p-1.5"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("quote")}
              className="text-muted hover:bg-surface-alt hover:text-body rounded p-1.5"
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </button>

            {/* Template Dropdown (Additional templates) */}
            <div className="relative ml-2">
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className="text-bougainvillea-pink bg-bougainvillea-pink/10 hover:bg-bougainvillea-pink/20 flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors"
              >
                <LayoutTemplate className="h-3 w-3" /> Templates{" "}
                <ChevronDown className="h-3 w-3" />
              </button>

              {showTemplates && (
                <div className="border-hairline bg-surface rounded-button shadow-elevated absolute top-full left-0 z-10 mt-1 w-48 border py-1">
                  <button
                    type="button"
                    onClick={() => applyTemplate("narrative")}
                    className="text-body hover:bg-surface-alt block w-full px-4 py-2 text-left text-xs"
                  >
                    General Narrative
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate("migration")}
                    className="text-body hover:bg-surface-alt block w-full px-4 py-2 text-left text-xs"
                  >
                    Migration Journey
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate("recipe")}
                    className="text-body hover:bg-surface-alt block w-full px-4 py-2 text-left text-xs"
                  >
                    Family Recipe
                  </button>
                </div>
              )}
            </div>

            <div className="flex-grow" />

            {geminiAvailable && (
              <>
                <button
                  type="button"
                  onClick={handlePolish}
                  disabled={polishMutation.isPending || !content}
                  className="text-bougainvillea-pink hover:text-bougainvillea-pink/80 flex items-center px-2 text-xs disabled:opacity-50"
                  title="Use AI to fix grammar and improve flow"
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  {polishMutation.isPending ? "Polishing..." : "AI Polish"}
                </button>

                <div className="border-hairline ml-2 flex items-center gap-1 border-l pl-2">
                  <button
                    type="button"
                    onClick={handleTranslate}
                    disabled={translateMutation.isPending || !content}
                    className="text-ocean-blue hover:bg-ocean-blue/10 flex items-center gap-1 rounded px-2 py-1 text-xs font-medium disabled:opacity-50"
                    title={`Translate to ${currentLanguage === "EN" ? "Portuguese" : "English"}`}
                  >
                    <Languages className="h-3 w-3" />
                    {translateMutation.isPending
                      ? "..."
                      : currentLanguage === "EN"
                        ? "→PT"
                        : "→EN"}
                  </button>

                  {originalContent && (
                    <button
                      type="button"
                      onClick={handleRevertTranslation}
                      className="text-muted hover:text-body rounded p-1"
                      title="Revert to original"
                    >
                      <Undo2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Writing prompts panel - only shown when a guided template is selected */}
          {templateType && (
            <StoryPromptsPanel
              templateType={templateType}
              existingContent={content}
              onInsertPrompt={handleInsertPrompt}
            />
          )}

          <Textarea
            ref={textareaRef}
            rows={16}
            required
            placeholder="Start writing your story here... Share a memory, a tradition, or a moment that matters to you."
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            resize="vertical"
            className="rounded-t-none font-mono text-sm"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-muted text-xs">
              Markdown supported: **bold**, *italic*, - list
            </span>
            <div className="flex items-center gap-3">
              <span className="text-muted text-xs">{readingTime}</span>

              <span
                className={`text-xs transition-colors ${
                  warningLevel === "error"
                    ? "text-accent-error font-medium"
                    : warningLevel === "warning"
                      ? "text-accent-warning"
                      : "text-muted"
                }`}
              >
                {showCharCount ? (
                  `${charCount.toLocaleString()} chars`
                ) : (
                  <>
                    {wordCount.toLocaleString()}/{WORD_LIMIT.toLocaleString()}{" "}
                    words
                    {isOverLimit && (
                      <span className="ml-1 font-semibold">(over limit!)</span>
                    )}
                  </>
                )}
              </span>

              <button
                type="button"
                onClick={() => setShowCharCount(!showCharCount)}
                className="text-muted hover:bg-surface-alt hover:text-body rounded px-1.5 py-0.5 text-xs"
                title={
                  showCharCount ? "Show word count" : "Show character count"
                }
              >
                {showCharCount ? "words" : "chars"}
              </button>
            </div>
          </div>

          {warningLevel === "warning" && (
            <p className="text-accent-warning mt-1 text-xs">
              Approaching word limit (
              {Math.round((wordCount / WORD_LIMIT) * 100)}% used)
            </p>
          )}
        </div>
      ) : (
        <div className="prose prose-sm dark:prose-invert prose-headings:font-serif prose-headings:text-ocean-blue prose-a:text-ocean-blue border-hairline bg-surface rounded-button min-h-[300px] max-w-none border p-6">
          {/* Simulated Article Header for Preview */}
          <div className="border-hairline mb-6 border-b pb-4">
            <h1 className="text-body mb-2 font-serif text-2xl font-bold">
              {title || "Untitled Story"}
            </h1>
            <div className="text-muted flex items-center text-sm">
              <span className="text-bougainvillea-pink mr-2 font-medium">
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
                    className="text-ocean-blue mt-6 mb-3 text-xl font-bold"
                    {...props}
                  >
                    {children}
                  </h2>
                ),
                h2: ({ children, ...props }) => (
                  <h3
                    className="text-body mt-5 mb-2 text-lg font-bold"
                    {...props}
                  >
                    {children}
                  </h3>
                ),
                p: ({ children, ...props }) => (
                  <p className="text-body mb-4 leading-relaxed" {...props}>
                    {children}
                  </p>
                ),
                ul: ({ children, ...props }) => (
                  <ul
                    className="text-body mb-4 list-disc space-y-1 pl-5"
                    {...props}
                  >
                    {children}
                  </ul>
                ),
                ol: ({ children, ...props }) => (
                  <ol
                    className="text-body mb-4 list-decimal space-y-1 pl-5"
                    {...props}
                  >
                    {children}
                  </ol>
                ),
                blockquote: ({ children, ...props }) => (
                  <blockquote
                    className="border-hairline bg-surface text-muted my-4 border-l-4 py-2 pr-2 pl-4 italic"
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
            <p className="text-muted mt-10 text-center italic">
              Nothing to preview yet. Switch to the Write tab to add content.
            </p>
          )}
        </div>
      )}

      {/* Template Replace Confirmation */}
      <ConfirmationDialog
        isOpen={showTemplateConfirm}
        onClose={handleTemplateCancel}
        onConfirm={handleTemplateConfirm}
        title="Replace your content?"
        description="This will replace your current content with the selected template. Any existing text will be lost."
        confirmLabel="Replace Content"
        variant="warning"
      />
    </div>
  );
}
