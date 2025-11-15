/**
 * Content Action Toolbar - Barrel Exports
 *
 * This file exports all components and types for the refactored Content Action Toolbar.
 * Components are lazy-loaded where appropriate for optimal bundle size.
 *
 * Feature: 005-action-toolbar-refactor
 * Branch: 005-action-toolbar-refactor
 *
 * @example
 * import { ContentActionToolbar, type Reaction } from '@/components/ui/content-action-toolbar';
 */

// ============================================================================
// Component Exports
// ============================================================================

// Main toolbar container (lazy-loaded for performance)
export { ContentActionToolbar } from './content-action-toolbar';

// Desktop variant (code-split for mobile-first optimization)
export { ContentActionDesktop } from './content-action-desktop';

// Mobile FAB variant (code-split for desktop optimization)
export { ContentActionFAB } from './content-action-fab';

// Shared components
export { ReactionButtons } from './reaction-buttons';
export { ShareButton } from './share-button';
export { SuggestImprovementModal } from './suggest-improvement-modal';
export { CopyLinkButton } from './copy-link-button';
export { PrintButton } from './print-button';

// ============================================================================
// Type Exports
// ============================================================================

// Re-export all types from contracts for convenient importing
export type {
  // Component Props
  ContentActionToolbarProps,
  ContentActionDesktopProps,
  ContentActionFABProps,
  ReactionButtonsProps,
  ShareButtonProps,
  SuggestImprovementModalProps,
  CopyLinkButtonProps,
  PrintButtonProps,

  // Data Entities
  Reaction,
  ShareOption,
  SuggestionSubmission,

  // Utility Types
  ActionVariant,
  LayoutMode,
  SubmissionStatus,
} from '@/types/content-action-toolbar/component-props';

// ============================================================================
// Constant Exports
// ============================================================================

// Re-export validation and performance constants
export {
  SuggestionValidation,
  ContentValidation,
  PerformanceTargets,
  LayoutBreakpoints,
  AnimationDurations,
} from '@/types/content-action-toolbar/component-props';

// ============================================================================
// Type Guard Exports
// ============================================================================

export {
  isValidReactionType,
  isValidShareOptionId,
} from '@/types/content-action-toolbar/component-props';
