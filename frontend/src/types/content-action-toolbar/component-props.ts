/**
 * Component Contracts: Content Action Toolbar UI/UX Refactoring
 *
 * TypeScript interfaces and types for all components in the refactored
 * Content Action Toolbar feature (005-action-toolbar-refactor).
 *
 * These contracts define the props, state, and data structures used across
 * the toolbar components, ensuring type safety and clear component APIs.
 *
 * @feature 005-action-toolbar-refactor
 * @date 2025-01-14
 */

import { LucideIcon } from 'lucide-react';

// ============================================================================
// Data Entities
// ============================================================================

/**
 * Represents a single reaction type with count and user selection state.
 *
 * Used by ReactionButtons to display emoji reactions with counts.
 * Authenticated users can toggle reactions; unauthenticated users see dimmed state.
 *
 * @example
 * const heartReaction: Reaction = {
 *   id: 'heart',
 *   emoji: '❤️',
 *   count: 1201,
 *   isSelected: true,
 *   ariaLabel: 'React with heart',
 * };
 */
export interface Reaction {
  /** Unique identifier for reaction type (e.g., "heart", "thumbs_up") */
  id: string;

  /** Emoji character (e.g., "❤️", "👍") */
  emoji: string;

  /** Total count of reactions of this type (non-negative integer) */
  count: number;

  /** Whether current user has selected this reaction (false if not authenticated) */
  isSelected: boolean;

  /** ARIA label for accessibility (e.g., "React with heart") */
  ariaLabel: string;
}

/**
 * Share option for fallback menu (desktop without native share support).
 *
 * @example
 * const copyLinkOption: ShareOption = {
 *   id: 'copy-link',
 *   label: 'Copy Link',
 *   icon: LinkIcon,
 *   action: () => navigator.clipboard.writeText(url),
 * };
 */
export interface ShareOption {
  /** Unique identifier for share option */
  id: 'copy-link' | 'facebook' | 'twitter';

  /** Display label for option */
  label: string;

  /** Lucide React icon component */
  icon: LucideIcon;

  /** Action to execute when option selected */
  action: () => void | Promise<void>;
}

/**
 * Suggestion submission data for improvement suggestions.
 *
 * @example
 * const submission: SuggestionSubmission = {
 *   suggestion: 'Consider adding historical context about the landmark...',
 *   sourceReference: 'https://example.com/historical-archive',
 *   timestamp: '2025-01-14T10:00:00Z',
 * };
 */
export interface SuggestionSubmission {
  /** Suggestion text (10-500 characters) */
  suggestion: string;

  /** Optional source/reference URL */
  sourceReference?: string;

  /** ISO 8601 timestamp of submission */
  timestamp: string;
}

// ============================================================================
// Component Props
// ============================================================================

/**
 * Props for ContentActionToolbar (main container).
 *
 * Root container that switches between desktop right-rail and mobile FAB
 * based on viewport width (768px breakpoint).
 *
 * @example
 * <ContentActionToolbar
 *   contentSlug="brava-faja-d-agua-beach"
 *   contentTitle="Fajã d'Água Beach"
 *   contentUrl="https://nosilha.com/directory/entry/brava-faja-d-agua-beach"
 *   reactions={reactions}
 *   isAuthenticated={true}
 * />
 */
export interface ContentActionToolbarProps {
  /** Content UUID for API endpoints (reactions, suggestions) */
  contentId: string;

  /** Content slug for debugging and display */
  contentSlug: string;

  /** Content title for share functionality */
  contentTitle: string;

  /** Full URL for sharing and copy link */
  contentUrl: string;

  /** Available reactions (emoji type, count, user selection state) */
  reactions: Reaction[];

  /** Current user authentication state */
  isAuthenticated: boolean;

  /** Optional: Custom class name for container */
  className?: string;
}

/**
 * Props for ReactionButtons component.
 *
 * Displays horizontal row of reaction emojis with counts, handles selection interactions.
 * Shows circular ocean blue background for selected reactions, bounce animation on toggle.
 *
 * @example
 * <ReactionButtons
 *   reactions={reactions}
 *   contentSlug="brava-faja-d-agua-beach"
 *   isAuthenticated={true}
 *   onReactionToggle={(id, count) => console.log(`Reaction ${id}: ${count}`)}
 *   variant="compact"
 * />
 */
export interface ReactionButtonsProps {
  /** Array of available reactions */
  reactions: Reaction[];

  /** Content UUID for API endpoints */
  contentId: string;

  /** Content slug for debugging */
  contentSlug: string;

  /** Current user authentication state */
  isAuthenticated: boolean;

  /** Callback when reaction toggled (optimistic update) */
  onReactionToggle?: (reactionId: string, newCount: number) => void;

  /** Optional: Orientation (horizontal for mobile, vertical for desktop) */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Props for ShareButton component.
 *
 * Triggers native share API or fallback menu, displays toast confirmation.
 * Shows ocean blue fill and scale animation when active.
 *
 * @example
 * <ShareButton
 *   title="Fajã d'Água Beach"
 *   url="https://nosilha.com/directory/entry/brava-faja-d-agua-beach"
 *   description="Discover Brava Island's hidden gem..."
 *   onShareSuccess={() => console.log('Shared successfully!')}
 * />
 */
export interface ShareButtonProps {
  /** Content title for share */
  title: string;

  /** Content URL for share */
  url: string;

  /** Optional: Share description text */
  description?: string;

  /** Optional: Display variant (icon-only or icon-with-label) */
  variant?: 'icon-only' | 'icon-with-label';

  /** Callback when share succeeds */
  onShareSuccess?: () => void;
}

/**
 * Props for SuggestImprovementModal component.
 *
 * Modal dialog for users to submit content improvement suggestions with
 * optional source/reference URL. Uses Catalyst UI Dialog component for accessibility.
 *
 * @example
 * <SuggestImprovementModal
 *   contentSlug="brava-faja-d-agua-beach"
 *   trigger={<button>Suggest Improvement</button>}
 *   onSuccess={(data) => console.log('Suggestion submitted:', data)}
 * />
 */
export interface SuggestImprovementModalProps {
  /** Content slug for API endpoint */
  contentSlug: string;

  /** Trigger element (button) */
  trigger: React.ReactNode;

  /** Callback when suggestion submitted successfully */
  onSuccess?: (data: SuggestionSubmission) => void;
}

/**
 * Props for ContentActionFAB (mobile floating action button).
 *
 * Circular button at bottom-right that expands upward to show actions menu.
 * Visible only on viewports <768px width.
 *
 * @example
 * <ContentActionFAB
 *   contentSlug="brava-faja-d-agua-beach"
 *   contentTitle="Fajã d'Água Beach"
 *   contentUrl="https://nosilha.com/directory/entry/brava-faja-d-agua-beach"
 *   reactions={reactions}
 *   isAuthenticated={true}
 * />
 */
export interface ContentActionFABProps {
  /** Content UUID for API endpoints */
  contentId: string;

  /** Content slug for debugging */
  contentSlug: string;

  /** Content title for share */
  contentTitle: string;

  /** Content URL for share */
  contentUrl: string;

  /** Available reactions */
  reactions: Reaction[];

  /** Current user authentication state */
  isAuthenticated: boolean;

  /** Callback when reaction toggled (optimistic update) */
  onReactionToggle?: (reactionId: string, newCount: number) => void;
}

/**
 * Props for ContentActionDesktop (desktop right-rail).
 *
 * Fixed right-rail container with background card styling, vertically centered in viewport.
 * Visible only on viewports ≥768px width.
 *
 * @example
 * <ContentActionDesktop
 *   contentSlug="brava-faja-d-agua-beach"
 *   contentTitle="Fajã d'Água Beach"
 *   contentUrl="https://nosilha.com/directory/entry/brava-faja-d-agua-beach"
 *   reactions={reactions}
 *   isAuthenticated={true}
 * />
 */
export interface ContentActionDesktopProps {
  /** Content UUID for API endpoints */
  contentId: string;

  /** Content slug for debugging */
  contentSlug: string;

  /** Content title for share */
  contentTitle: string;

  /** Content URL for share */
  contentUrl: string;

  /** Available reactions */
  reactions: Reaction[];

  /** Current user authentication state */
  isAuthenticated: boolean;

  /** Callback when reaction toggled (optimistic update) */
  onReactionToggle?: (reactionId: string, newCount: number) => void;
}

// ============================================================================
// Component State (Internal)
// ============================================================================

/**
 * Internal state for ReactionButtons component.
 *
 * Manages optimistic UI updates and animation state for reaction toggles.
 */
export interface ReactionButtonsState {
  /** Optimistic UI state for pending API calls (reaction ID being toggled) */
  pendingReaction: string | null;

  /** Animation state for bounce effect (reaction ID currently animating) */
  animatingReaction: string | null;
}

/**
 * Internal state for ShareButton component.
 *
 * Manages active state, fallback menu, and success toast visibility.
 */
export interface ShareButtonState {
  /** Active state during share action */
  isActive: boolean;

  /** Fallback menu open state (desktop without native share) */
  isFallbackMenuOpen: boolean;

  /** Toast visibility after successful share */
  showSuccessToast: boolean;
}

/**
 * Internal state for SuggestImprovementModal component.
 *
 * Manages modal visibility, form data, validation errors, and submission state.
 */
export interface SuggestImprovementModalState {
  /** Modal open/closed state */
  isOpen: boolean;

  /** Form field values */
  formData: {
    suggestion: string;
    sourceReference: string; // Optional field
  };

  /** Form validation errors */
  errors: {
    suggestion?: string;
    sourceReference?: string;
  };

  /** Submission state */
  isSubmitting: boolean;

  /** Success state after submission */
  submitSuccess: boolean;
}

/**
 * Internal state for ContentActionFAB component.
 *
 * Manages FAB expansion state and animation timing.
 */
export interface ContentActionFABState {
  /** Expansion state (collapsed or expanded) */
  isExpanded: boolean;

  /** Animation state (prevents multiple simultaneous animations) */
  isAnimating: boolean;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Request body for reaction toggle API endpoint.
 *
 * @endpoint POST /api/v1/directory/entry/{slug}/reactions
 */
export interface ReactionToggleRequest {
  /** Reaction type identifier */
  reactionType: 'heart' | 'thumbs_up' | 'thinking' | 'pray';

  /** Action to perform */
  action: 'add' | 'remove';
}

/**
 * Response body for reaction toggle API endpoint.
 *
 * Returns updated reactions array with new counts and selection states.
 *
 * @endpoint POST /api/v1/directory/entry/{slug}/reactions
 */
export interface ReactionToggleResponse {
  /** Updated reactions array */
  reactions: Reaction[];
}

/**
 * Request body for suggestion submission API endpoint.
 *
 * @endpoint POST /api/v1/directory/entry/{slug}/suggestions
 */
export interface SuggestionSubmitRequest {
  /** Suggestion text (10-500 characters) */
  suggestion: string;

  /** Optional source/reference URL (max 200 characters) */
  sourceReference?: string;
}

/**
 * Response body for suggestion submission API endpoint.
 *
 * @endpoint POST /api/v1/directory/entry/{slug}/suggestions
 */
export interface SuggestionSubmitResponse {
  /** Generated UUID for submission */
  id: string;

  /** Submission status */
  status: 'pending' | 'approved' | 'rejected';

  /** ISO 8601 timestamp of creation */
  createdAt: string;
}

// ============================================================================
// Validation Schemas (Zod-compatible types)
// ============================================================================

/**
 * Validation constraints for suggestion form.
 *
 * Use with Zod schema for runtime validation:
 * @example
 * import { z } from 'zod';
 *
 * const suggestionSchema = z.object({
 *   suggestion: z.string()
 *     .min(SuggestionValidation.MIN_LENGTH)
 *     .max(SuggestionValidation.MAX_LENGTH),
 *   sourceReference: z.string()
 *     .url()
 *     .max(SuggestionValidation.SOURCE_MAX_LENGTH)
 *     .optional(),
 * });
 */
export const SuggestionValidation = {
  MIN_LENGTH: 10,
  MAX_LENGTH: 500,
  SOURCE_MAX_LENGTH: 200,
} as const;

/**
 * Validation constraints for content identifiers.
 */
export const ContentValidation = {
  /** Slug pattern: lowercase alphanumeric with hyphens */
  SLUG_PATTERN: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,

  /** Maximum title length */
  TITLE_MAX_LENGTH: 100,
} as const;

// ============================================================================
// Performance & Accessibility Constants
// ============================================================================

/**
 * Performance targets for visual feedback (Success Criteria).
 */
export const PerformanceTargets = {
  /** Maximum latency for visual feedback (SC-004, SC-009) */
  MAX_FEEDBACK_LATENCY_MS: 100,

  /** Maximum Cumulative Layout Shift score (SC-008) */
  MAX_CLS_SCORE: 0.1,

  /** Minimum touch target size in pixels (SC-003) */
  MIN_TOUCH_TARGET_PX: 44,

  /** Target animation frame rate */
  TARGET_FPS: 60,
} as const;

/**
 * Responsive breakpoint for mobile/desktop layout switching.
 */
export const LayoutBreakpoints = {
  /** Mobile FAB shown below this width */
  MOBILE_MAX_WIDTH: 767,

  /** Desktop right-rail shown at this width and above */
  DESKTOP_MIN_WIDTH: 768,
} as const;

/**
 * Animation duration constants (milliseconds).
 */
export const AnimationDurations = {
  /** Reaction bounce animation */
  BOUNCE: 300,

  /** Share button scale animation */
  SCALE: 100,

  /** FAB expansion animation */
  FAB_EXPAND: 200,

  /** Stagger delay for FAB menu items */
  FAB_STAGGER: 50,
} as const;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if reaction type is valid.
 */
export function isValidReactionType(
  type: string
): type is 'heart' | 'thumbs_up' | 'thinking' | 'pray' {
  return ['heart', 'thumbs_up', 'thinking', 'pray'].includes(type);
}

/**
 * Type guard to check if share option ID is valid.
 */
export function isValidShareOptionId(
  id: string
): id is 'copy-link' | 'facebook' | 'twitter' {
  return ['copy-link', 'facebook', 'twitter'].includes(id);
}

/**
 * Props for CopyLinkButton component (NEW - Wireframe Update).
 *
 * Copies content URL to clipboard with toast confirmation.
 * Supports icon-only or icon-with-label display variants.
 *
 * @example
 * <CopyLinkButton
 *   url="https://nosilha.com/directory/entry/brava-faja-d-agua-beach"
 *   variant="icon-with-label"
 *   onCopySuccess={() => console.log('Link copied!')}
 * />
 */
export interface CopyLinkButtonProps {
  /** Content URL to copy */
  url: string;

  /** Optional: Display variant */
  variant?: 'icon-only' | 'icon-with-label';

  /** Callback when copy succeeds */
  onCopySuccess?: () => void;
}

/**
 * Props for PrintButton component (NEW - Wireframe Update).
 *
 * Triggers browser print dialog.
 * Supports icon-only or icon-with-label display variants.
 *
 * @example
 * <PrintButton
 *   variant="icon-with-label"
 *   onPrintTriggered={() => console.log('Print dialog opened')}
 * />
 */
export interface PrintButtonProps {
  /** Optional: Display variant */
  variant?: 'icon-only' | 'icon-with-label';

  /** Callback when print triggered */
  onPrintTriggered?: () => void;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Utility type for action variant (affects styling, spacing).
 */
export type ActionVariant = 'compact' | 'spacious';

/**
 * Utility type for layout mode.
 */
export type LayoutMode = 'mobile' | 'desktop';

/**
 * Utility type for submission status.
 */
export type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error';

// ============================================================================
// Exports
// ============================================================================

/**
 * All types are already exported individually above.
 * Import them using: import type { Reaction, ReactionButtonsProps } from '@/types/content-action-toolbar/component-props';
 */
