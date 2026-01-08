"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Book, FileText, LogIn } from "lucide-react";
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

  // Show login prompt if not authenticated
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-ocean-blue)]/10">
            <LogIn className="h-8 w-8 text-[var(--color-ocean-blue)]" />
          </div>
          <h1 className="mb-3 font-serif text-2xl font-bold text-slate-900 dark:text-white">
            Sign in to Share Your Story
          </h1>
          <p className="mb-8 text-slate-600 dark:text-slate-400">
            To preserve your community&apos;s memories and ensure proper
            attribution, please sign in before submitting your story.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login?returnUrl=/contribute/story"
              className="inline-flex items-center justify-center rounded-md bg-[var(--color-ocean-blue)] px-6 py-3 font-medium text-white hover:bg-blue-800"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Link>
            <Link
              href="/signup?returnUrl=/contribute/story"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Create Account
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            Want to contribute without an account?{" "}
            <Link
              href="/contribute/directory"
              className="text-[var(--color-ocean-blue)] hover:underline"
            >
              Add a place to the directory
            </Link>{" "}
            instead.
          </p>
        </div>
      </div>
    );
  }

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Confirmation onReset={handleReset} />
      </div>
    );
  }

  // Show type selector
  if (!submissionType) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <TypeSelector onSelect={handleTypeSelection} />
      </div>
    );
  }

  // Show template selector for GUIDED story type
  if (submissionType === StoryType.GUIDED && !selectedTemplate) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-900">
        <TemplateSelector
          onSelect={handleTemplateSelection}
          onBack={() => setSubmissionType(null)}
        />
      </div>
    );
  }

  // Determine header styles based on type
  let headerColorClass = "bg-[var(--color-ocean-blue)]";
  let HeaderIcon = Clock;

  if (submissionType === StoryType.FULL) {
    headerColorClass = "bg-[var(--color-bougainvillea)]";
    HeaderIcon = Book;
  }

  // Word limit validation
  const wordCount = formData.content.split(/\s+/).filter(Boolean).length;
  const limit = submissionType ? WORD_LIMITS[submissionType] : Infinity;
  const isOverLimit = wordCount > limit;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-900">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => {
            setSubmissionType(null);
            setSelectedTemplate(null);
          }}
          className="mb-6 flex items-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Change Type
        </button>

        {/* Draft Resume Banner */}
        {hasDraft && !submitted && (
          <div className="mb-6">
            <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-[var(--color-ocean-blue)]" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    You have a saved draft
                  </p>
                  {lastSaved && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Last saved {new Date(lastSaved).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearDraft}
                  className="rounded px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleLoadDraft}
                  className="rounded bg-[var(--color-ocean-blue)] px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800"
                >
                  Resume Draft
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
          <div className={`px-6 py-4 ${headerColorClass}`}>
            <h2 className="flex items-center text-xl font-bold text-white">
              <HeaderIcon className="mr-2 h-5 w-5" />
              {submissionType} Submission
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate-900 dark:text-white"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                required
                className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[var(--color-ocean-blue)] focus:ring-[var(--color-ocean-blue)] focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
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
                className="h-4 w-4 rounded border-slate-300 text-[var(--color-ocean-blue)] focus:ring-[var(--color-ocean-blue)] dark:border-slate-600"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-slate-900 dark:text-white"
              >
                I agree to the community guidelines and allow Nos Ilha to
                publish this.
              </label>
            </div>

            {/* Submit button */}
            <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
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
                  disabled={isSubmitting || isOverLimit}
                  className="flex items-center rounded-md bg-[var(--color-ocean-blue)] px-6 py-2 font-medium text-white hover:bg-blue-800 focus:ring-2 focus:ring-[var(--color-ocean-blue)] focus:ring-offset-2 focus:outline-none disabled:opacity-70"
                >
                  {isSubmitting
                    ? "Submitting..."
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
