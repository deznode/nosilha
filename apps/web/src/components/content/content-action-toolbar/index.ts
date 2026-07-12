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
 * import { ContentActionToolbar, type Reaction } from '@/components/content/content-action-toolbar';
 */

// ============================================================================
// Component Exports
// ============================================================================

// Main toolbar container (lazy-loaded for performance)
export { ContentActionToolbar } from "./content-action-toolbar";

// Desktop variant (code-split for mobile-first optimization)
export { ContentActionDesktop } from "./content-action-desktop";

// Mobile FAB variant (code-split for desktop optimization)
export { ContentActionFAB } from "./content-action-fab";

// Shared action components (moved to ui/actions/)
export { ReactionButtons } from "@/components/content/actions/reaction-buttons";
export { ShareButton } from "@/components/content/actions/share-button";
export { SuggestImprovementForm } from "@/components/content/actions/suggest-improvement-form";
export { SuggestImprovementButton } from "@/components/content/actions/suggest-improvement-button";
export { CopyLinkButton } from "@/components/content/actions/copy-link-button";
export { PrintButton } from "@/components/content/actions/print-button";

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
} from "@/types/content-action-toolbar/component-props";

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
} from "@/types/content-action-toolbar/component-props";

// ============================================================================
// Type Guard Exports
// ============================================================================

export {
  isValidReactionType,
  isValidShareOptionId,
} from "@/types/content-action-toolbar/component-props";
