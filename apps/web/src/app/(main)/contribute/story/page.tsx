"use client";

import { useState } from "react";
import { ArrowLeft, Clock, Book, FileText } from "lucide-react";
import { InlineAuthPrompt } from "@/components/ui/inline-auth-prompt";
import {
  TypeSelector,
  TemplateSelector,
  GUIDED_TEMPLATES,
  StoryEditor,
  Confirmation,
} from "@/components/story-submission";
import { WORD_LIMITS } from "@/components/story-submission/story-editor";
import { StoryType } from "@/types/story";
import type { StoryTemplate } from "@/types/story";
import { submitStory } from "@/lib/api";
import type { StorySubmitRequest } from "@/lib/api-contracts";
import {
  useStoryDraftStore,
  useDraft,
  useLastSaved,
  useHasDraft,
} from "@/stores/storyDraftStore";
import { useAutoSaveDraft } from "@/hooks/useAutoSaveDraft";
import { useAuth } from "@/components/providers/auth-provider";

interface FormData {
  title: string;
  content: string;
  templateType?: StoryTemplate;
}

export default function StorySubmissionPage() {
  const { user, loading: authLoading } = useAuth();
  const [submissionType, setSubmissionType] = useState<StoryType | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<StoryTemplate | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Draft store
  const draft = useDraft();
  const lastSaved = useLastSaved();
  const hasDraft = useHasDraft();
  const { clearDraft } = useStoryDraftStore();

  // Auto-save draft as user types (debounced) - must be before conditional returns
  useAutoSaveDraft({
    title: formData.title,
    content: formData.content,
    storyType: submissionType ?? undefined,
    enabled: !!submissionType && !!user, // Only auto-save if authenticated
  });

  // Check if user needs to authenticate
  const requiresAuth = !authLoading && !user;

  // Default template for full stories
  const defaultTemplate = `## The Beginning
Where does this story start? (e.g., Nova Sintra, 1980...)

## The Event
Describe what happened in detail. Who was there? What did you see, hear, and smell?

## The Impact
Why is this memory important to you? How does it make you feel today?`;

  const handleTypeSelection = (type: StoryType) => {
    setSubmissionType(type);
    if (type === StoryType.FULL) {
      setFormData((prev) => ({ ...prev, content: defaultTemplate }));
    } else {
      setFormData((prev) => ({ ...prev, content: "" }));
    }
  };

  const handleTemplateSelection = (template: StoryTemplate) => {
    setSelectedTemplate(template);
    const templateConfig = GUIDED_TEMPLATES[template];
    if (templateConfig) {
      setFormData((prev) => ({
        ...prev,
        content: templateConfig.starterPrompt,
        templateType: template,
      }));
    }
  };

  const handleLoadDraft = () => {
    if (draft) {
      setFormData({ title: draft.title, content: draft.content });
      if (draft.storyType) {
        setSubmissionType(draft.storyType);
      }
      clearDraft();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionType) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Map StoryType enum to backend API format
      const storyTypeMap: Record<StoryType, StorySubmitRequest["storyType"]> = {
        [StoryType.QUICK]: "QUICK",
        [StoryType.FULL]: "FULL",
        [StoryType.GUIDED]: "GUIDED",
      };

      const response = await submitStory({
        title: formData.title,
        content: formData.content,
        storyType: storyTypeMap[submissionType],
        templateType: formData.templateType,
      });

      if (response.id || response.message) {
        clearDraft();
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Failed to submit story:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit story";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmissionType(null);
    setSelectedTemplate(null);
    setFormData({
      title: "",
      content: "",
    });
    setAgreedToTerms(false);
    setSubmitted(false);
    setSubmitError(null);
  };

  // Show confirmation screen
  if (submitted) {
    return (
      <div className="bg-canvas min-h-screen">
        <Confirmation onReset={handleReset} />
      </div>
    );
  }

  // Show type selector
  if (!submissionType) {
    return (
      <div className="bg-canvas min-h-screen">
        <TypeSelector onSelect={handleTypeSelection} />
      </div>
    );
  }

  // Show template selector for GUIDED story type
  if (submissionType === StoryType.GUIDED && !selectedTemplate) {
    return (
      <div className="bg-canvas min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <TemplateSelector
          onSelect={handleTemplateSelection}
          onBack={() => setSubmissionType(null)}
        />
      </div>
    );
  }

  // Determine header styles based on type
  let headerColorClass = "bg-ocean-blue";
  let HeaderIcon = Clock;

  if (submissionType === StoryType.FULL) {
    headerColorClass = "bg-bougainvillea-pink";
    HeaderIcon = Book;
  }

  // Word limit validation
  const wordCount = formData.content.split(/\s+/).filter(Boolean).length;
  const limit = submissionType ? WORD_LIMITS[submissionType] : Infinity;
  const isOverLimit = wordCount > limit;

  return (
    <div className="bg-canvas min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => {
            setSubmissionType(null);
            setSelectedTemplate(null);
          }}
          className="text-muted hover:text-body mb-6 flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Change Type
        </button>

        {/* Draft Resume Banner */}
        {hasDraft && !submitted && (
          <div className="mb-6">
            <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
              <div className="flex items-center gap-3">
                <FileText className="text-ocean-blue h-5 w-5" />
                <div>
                  <p className="text-body font-medium">
                    You have a saved draft
                  </p>
                  {lastSaved && (
                    <p className="text-muted text-sm">
                      Last saved {new Date(lastSaved).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearDraft}
                  className="text-muted hover:bg-surface rounded px-3 py-1.5 text-sm"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleLoadDraft}
                  className="bg-ocean-blue rounded px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800"
                >
                  Resume Draft
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="border-hairline bg-canvas shadow-elevated overflow-hidden rounded-lg border">
          <div className={`px-6 py-4 ${headerColorClass}`}>
            <h2 className="flex items-center text-xl font-bold text-white">
              <HeaderIcon className="mr-2 h-5 w-5" />
              {submissionType} Submission
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* Auth Prompt - shown when user is not authenticated */}
            {requiresAuth && (
              <InlineAuthPrompt
                title="Sign in to Share Your Story"
                description="To preserve your community's memories and ensure proper attribution, please sign in before submitting."
                returnUrl="/contribute/story"
              />
            )}

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="text-body block text-sm font-medium"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                required
                className="border-hairline bg-canvas text-body focus:border-ocean-blue focus:ring-ocean-blue mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none"
                placeholder="e.g., Sunday Afternoons in Nova Sintra"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* Story Editor */}
            <StoryEditor
              storyType={submissionType}
              content={formData.content}
              title={formData.title}
              onContentChange={(content) =>
                setFormData((prev) => ({ ...prev, content }))
              }
              templateType={selectedTemplate ?? undefined}
            />

            {/* Terms checkbox */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="border-hairline text-ocean-blue focus:ring-ocean-blue h-4 w-4 rounded"
              />
              <label htmlFor="terms" className="text-body ml-2 block text-sm">
                I agree to the community guidelines and allow Nos Ilha to
                publish this.
              </label>
            </div>

            {/* Submit button */}
            <div className="border-hairline border-t pt-4">
              {isOverLimit && (
                <p className="mb-3 text-sm text-red-600 dark:text-red-400">
                  Your story exceeds the word limit. Please shorten it to{" "}
                  {limit.toLocaleString()} words or less before submitting.
                </p>
              )}
              {submitError && (
                <p className="mb-3 text-sm text-red-600 dark:text-red-400">
                  {submitError}
                </p>
              )}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || isOverLimit || requiresAuth}
                  className="bg-ocean-blue focus:ring-ocean-blue flex items-center rounded-md px-6 py-2 font-medium text-white hover:bg-blue-800 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-70"
                >
                  {isSubmitting
                    ? "Submitting..."
                    : requiresAuth
                      ? "Sign in to Submit"
                      : isOverLimit
                        ? "Over Word Limit"
                        : "Submit"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
