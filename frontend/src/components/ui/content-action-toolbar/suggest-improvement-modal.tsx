'use client';

import { useState } from 'react';
import { SuggestImprovementModalProps, SuggestionValidation } from '@/types/content-action-toolbar/component-props';
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/components/catalyst-ui/dialog';
import { Field, Label } from '@/components/catalyst-ui/fieldset';
import { Textarea } from '@/components/catalyst-ui/textarea';
import { Input } from '@/components/catalyst-ui/input';
import { Button } from '@/components/catalyst-ui/button';

/**
 * Suggest Improvement Modal Component
 *
 * Modal dialog for users to submit content improvement suggestions with optional source/reference URL.
 * Uses Catalyst UI Dialog component for accessibility and consistent styling.
 *
 * Form Fields:
 * - Suggestion (required): 10-500 characters
 * - Source/Reference (optional): Valid URL, max 200 characters
 *
 * Validation:
 * - Client-side validation with custom rules
 * - Error messages displayed inline
 *
 * Accessibility:
 * - ARIA labels and descriptions
 * - Keyboard navigation support (Escape to close)
 * - Focus management
 *
 * Feature: 005-action-toolbar-refactor
 * Phase: 7 - User Story 5 (Suggestion Source Field)
 * Reference: data-model.md § SuggestImprovementModal
 *
 * @param props - Component props including content slug, trigger element, and callbacks
 * @returns Suggestion modal component with form validation
 */
export function SuggestImprovementModal({
  contentSlug, // Will be used for API call in future implementation
  trigger,
  onSuccess,
}: SuggestImprovementModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [sourceReference, setSourceReference] = useState('');
  const [errors, setErrors] = useState<{ suggestion?: string; sourceReference?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  /**
   * Validate suggestion field
   */
  const validateSuggestion = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Suggestion is required';
    }
    if (value.trim().length < SuggestionValidation.MIN_LENGTH) {
      return `Suggestion must be at least ${SuggestionValidation.MIN_LENGTH} characters`;
    }
    if (value.length > SuggestionValidation.MAX_LENGTH) {
      return `Suggestion must not exceed ${SuggestionValidation.MAX_LENGTH} characters`;
    }
    return undefined;
  };

  /**
   * Validate source reference field
   */
  const validateSourceReference = (value: string): string | undefined => {
    if (!value.trim()) {
      return undefined; // Optional field
    }

    // Basic URL validation
    try {
      new URL(value);
    } catch {
      return 'Please enter a valid URL';
    }

    if (value.length > SuggestionValidation.SOURCE_MAX_LENGTH) {
      return `Source reference must not exceed ${SuggestionValidation.SOURCE_MAX_LENGTH} characters`;
    }

    return undefined;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const suggestionError = validateSuggestion(suggestion);
    const sourceError = validateSourceReference(sourceReference);

    if (suggestionError || sourceError) {
      setErrors({
        suggestion: suggestionError,
        sourceReference: sourceError,
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // TODO: Replace with actual API call
      // const response = await submitSuggestion(contentSlug, {
      //   suggestion: suggestion.trim(),
      //   sourceReference: sourceReference.trim() || undefined,
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success state
      setSubmitSuccess(true);

      // Call success callback
      onSuccess?.({
        suggestion: suggestion.trim(),
        sourceReference: sourceReference.trim() || undefined,
        timestamp: new Date().toISOString(),
      });

      // Reset form and close modal after 1.5 seconds
      setTimeout(() => {
        setSuggestion('');
        setSourceReference('');
        setSubmitSuccess(false);
        setIsOpen(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to submit suggestion:', error);
      setErrors({ suggestion: 'Failed to submit suggestion. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
      setSuggestion('');
      setSourceReference('');
      setErrors({});
      setSubmitSuccess(false);
    }
  };

  /**
   * Handle trigger click
   */
  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(true);
  };

  return (
    <>
      {/* Trigger Element */}
      <div onClick={handleTriggerClick}>
        {trigger}
      </div>

      {/* Modal Dialog */}
      <Dialog open={isOpen} onClose={handleClose} size="lg">
        <DialogTitle>Suggest an Improvement</DialogTitle>
        <DialogDescription>
          Help us improve this content by sharing your suggestions. Include a source or reference if available.
        </DialogDescription>

        {submitSuccess ? (
          <DialogBody>
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-valley-green)]">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-center text-lg font-medium text-[var(--color-text-primary)]">
                Thank you for your suggestion!
              </p>
              <p className="text-center text-sm text-[var(--color-text-secondary)]">
                We'll review your feedback and update the content accordingly.
              </p>
            </div>
          </DialogBody>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogBody>
              <div className="space-y-6">
                {/* Suggestion Field */}
                <Field>
                  <Label>Suggestion *</Label>
                  <Textarea
                    name="suggestion"
                    value={suggestion}
                    onChange={(e) => {
                      setSuggestion(e.target.value);
                      if (errors.suggestion) {
                        setErrors({ ...errors, suggestion: undefined });
                      }
                    }}
                    rows={4}
                    placeholder="Share your suggestion to help improve this content..."
                    aria-invalid={!!errors.suggestion}
                    aria-describedby={errors.suggestion ? 'suggestion-error' : undefined}
                  />
                  {errors.suggestion && (
                    <p id="suggestion-error" className="mt-2 text-sm text-red-600">
                      {errors.suggestion}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-[var(--color-text-tertiary)]">
                    {suggestion.length}/{SuggestionValidation.MAX_LENGTH} characters
                  </p>
                </Field>

                {/* Source Reference Field */}
                <Field>
                  <Label>Source / Reference (optional)</Label>
                  <Input
                    type="url"
                    name="sourceReference"
                    value={sourceReference}
                    onChange={(e) => {
                      setSourceReference(e.target.value);
                      if (errors.sourceReference) {
                        setErrors({ ...errors, sourceReference: undefined });
                      }
                    }}
                    placeholder="https://example.com/source"
                    aria-invalid={!!errors.sourceReference}
                    aria-describedby={errors.sourceReference ? 'source-error' : undefined}
                  />
                  {errors.sourceReference && (
                    <p id="source-error" className="mt-2 text-sm text-red-600">
                      {errors.sourceReference}
                    </p>
                  )}
                </Field>
              </div>
            </DialogBody>

            <DialogActions>
              <Button type="button" plain onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[var(--color-ocean-blue)] hover:bg-[var(--color-ocean-blue)]/90"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>
    </>
  );
}
