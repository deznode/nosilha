"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { InlineAuthPrompt } from "@/components/ui/inline-auth-prompt";
import {
  TemplateChips,
  GUIDED_TEMPLATES,
  StoryEditor,
  Confirmation,
} from "@/components/story-submission";
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
import { useToast } from "@/hooks/use-toast";
import { Checkbox, CheckboxField } from "@/components/catalyst-ui/checkbox";
import { Label } from "@/components/catalyst-ui/fieldset";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface FormData {
  title: string;
  content: string;
}

// Word count threshold for Quick vs Full story type
const QUICK_STORY_THRESHOLD = 500;
const MAX_WORD_LIMIT = 5000;

/**
 * Determines the story type based on word count and template selection.
 * - GUIDED: When a template is selected
 * - QUICK: When no template and word count <= 500
 * - FULL: When no template and word count > 500
 */
function determineStoryType(
  wordCount: number,
  templateSelected: StoryTemplate | null
): StorySubmitRequest["storyType"] {
  if (templateSelected) return "GUIDED";
  if (wordCount <= QUICK_STORY_THRESHOLD) return "QUICK";
  return "FULL";
}

export default function StorySubmissionPage() {
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
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
  const [showTemplateChangeConfirm, setShowTemplateChangeConfirm] =
    useState(false);
  const [pendingTemplateChange, setPendingTemplateChange] =
    useState<StoryTemplate | null>(null);

  // Draft store
  const draft = useDraft();
  const lastSaved = useLastSaved();
  const hasDraft = useHasDraft();
  const { clearDraft } = useStoryDraftStore();

  // Auto-save draft as user types (debounced) - only for authenticated users
  useAutoSaveDraft({
    title: formData.title,
    content: formData.content,
    storyType: undefined, // No longer tracking story type in drafts
    enabled: !!user,
  });

  // Check if user needs to authenticate
  const requiresAuth = !authLoading && !user;

  const handleTemplateSelection = (template: StoryTemplate | null) => {
    // If deselecting, just clear
    if (template === null) {
      if (formData.content) {
        // Confirm before clearing content
        setPendingTemplateChange(null);
        setShowTemplateChangeConfirm(true);
      } else {
        setSelectedTemplate(null);
      }
      return;
    }

    // If selecting a new template
    if (formData.content) {
      // Confirm before replacing content
      setPendingTemplateChange(template);
      setShowTemplateChangeConfirm(true);
    } else {
      // Apply template directly
      applyTemplate(template);
    }
  };

  const applyTemplate = (template: StoryTemplate) => {
    const templateConfig = GUIDED_TEMPLATES[template];
    if (templateConfig) {
      setSelectedTemplate(template);
      setFormData((prev) => ({
        ...prev,
        content: templateConfig.starterPrompt,
      }));
    }
  };

  const handleTemplateChangeConfirm = () => {
    if (pendingTemplateChange) {
      applyTemplate(pendingTemplateChange);
    } else {
      // Deselecting template - clear content
      setSelectedTemplate(null);
      setFormData((prev) => ({ ...prev, content: "" }));
    }
    setShowTemplateChangeConfirm(false);
    setPendingTemplateChange(null);
  };

  const handleTemplateChangeCancel = () => {
    setShowTemplateChangeConfirm(false);
    setPendingTemplateChange(null);
  };

  const handleLoadDraft = () => {
    if (draft) {
      setFormData({ title: draft.title, content: draft.content });
      clearDraft();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const wordCount = formData.content.split(/\s+/).filter(Boolean).length;
      const storyType = determineStoryType(wordCount, selectedTemplate);

      const response = await submitStory({
        title: formData.title,
        content: formData.content,
        storyType,
        templateType: selectedTemplate ?? undefined,
      });

      if (response.id || response.message) {
        clearDraft();
        toast.success("Story submitted for review").show();
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Failed to submit story:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit story";
      setSubmitError(errorMessage);
      toast.error(errorMessage).show();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedTemplate(null);
    setFormData({
      title: "",
      content: "",
    });
    setAgreedToTerms(false);
    setSubmitted(false);
    setSubmitError(null);
  };

  // Word limit validation
  const wordCount = formData.content.split(/\s+/).filter(Boolean).length;
  const isOverLimit = wordCount > MAX_WORD_LIMIT;

  // Show confirmation screen
  if (submitted) {
    return (
      <div className="bg-canvas min-h-screen">
        <Confirmation onReset={handleReset} />
      </div>
    );
  }

  return (
    <div className="bg-canvas min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-body mb-2 font-serif text-3xl font-bold">
            Share Your Story
          </h1>
          <p className="text-muted text-lg">Every memory matters.</p>
        </div>

        {/* Draft Resume Banner */}
        {hasDraft && !submitted && (
          <div className="mb-6">
            <div className="rounded-card border-ocean-blue/20 bg-ocean-blue/5 flex items-center justify-between border p-4">
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
                  className="text-muted hover:bg-surface rounded-button px-3 py-1.5 text-sm"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleLoadDraft}
                  className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-button px-3 py-1.5 text-sm font-medium text-white"
                >
                  Resume Draft
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="border-hairline bg-canvas shadow-elevated rounded-card overflow-hidden border">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* Auth Prompt - shown when user is not authenticated */}
            {requiresAuth && (
              <InlineAuthPrompt
                title="Sign in to Share Your Story"
                description="To preserve your community's memories and ensure proper attribution, please sign in before submitting."
                returnUrl="/contribute/story"
              />
            )}

            {/* Template Chips */}
            <TemplateChips
              selectedTemplate={selectedTemplate}
              onSelect={handleTemplateSelection}
            />

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
                className="border-hairline bg-canvas text-body focus:border-ocean-blue focus:ring-ocean-blue rounded-button shadow-subtle mt-1 block w-full border px-3 py-2 text-sm focus:outline-none"
                placeholder="e.g., Sunday Afternoons in Nova Sintra"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* Story Editor */}
            <StoryEditor
              content={formData.content}
              title={formData.title}
              onContentChange={(content) =>
                setFormData((prev) => ({ ...prev, content }))
              }
              templateType={selectedTemplate ?? undefined}
            />

            {/* Terms checkbox */}
            <CheckboxField>
              <Checkbox
                name="terms"
                color="blue"
                checked={agreedToTerms}
                onChange={(checked) => setAgreedToTerms(checked)}
              />
              <Label className="text-body text-sm">
                I agree to the community guidelines and allow Nos Ilha to
                publish this.
              </Label>
            </CheckboxField>

            {/* Submit button */}
            <div className="border-hairline border-t pt-4">
              {isOverLimit && (
                <p className="text-status-error mb-3 text-sm">
                  Your story exceeds the word limit. Please shorten it to{" "}
                  {MAX_WORD_LIMIT.toLocaleString()} words or less before
                  submitting.
                </p>
              )}
              {submitError && (
                <p className="text-status-error mb-3 text-sm">{submitError}</p>
              )}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    isOverLimit ||
                    requiresAuth ||
                    !agreedToTerms
                  }
                  className="bg-ocean-blue hover:bg-ocean-blue/90 focus:ring-ocean-blue rounded-button flex items-center px-6 py-2 font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-70"
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

      {/* Template Change Confirmation */}
      <ConfirmationDialog
        isOpen={showTemplateChangeConfirm}
        onClose={handleTemplateChangeCancel}
        onConfirm={handleTemplateChangeConfirm}
        title={
          pendingTemplateChange
            ? "Replace your content?"
            : "Clear your content?"
        }
        description={
          pendingTemplateChange
            ? "This will replace your current content with the selected template. Any existing text will be lost."
            : "This will clear your current content. Any existing text will be lost."
        }
        confirmLabel={
          pendingTemplateChange ? "Replace Content" : "Clear Content"
        }
        variant="warning"
      />
    </div>
  );
}
