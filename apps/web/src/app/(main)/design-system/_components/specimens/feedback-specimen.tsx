"use client";

import { useState } from "react";
import Banner from "@/components/ui/banner";
import {
  LoadingSpinner,
  LoadingDots,
  LoadingPulse,
} from "@/components/ui/loading-spinner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { AnimatedButton } from "@/components/ui/animated-button";

type DialogVariant = "default" | "warning" | "danger";

interface DialogConfig {
  title: string;
  description: string;
  confirmLabel: string;
}

/** Dialog content configuration by variant */
const DIALOG_CONFIG: Record<DialogVariant, DialogConfig> = {
  danger: {
    title: "Delete Item?",
    description:
      "This action cannot be undone. The item will be permanently removed.",
    confirmLabel: "Delete",
  },
  warning: {
    title: "Archive Entry?",
    description: "This entry will be moved to the archive.",
    confirmLabel: "Archive",
  },
  default: {
    title: "Confirm Action",
    description: "Are you sure you want to proceed with this action?",
    confirmLabel: "Confirm",
  },
};

/**
 * Feedback specimen for the design system gallery.
 * Showcases Banner, LoadingSpinner, LoadingDots, and ConfirmationDialog.
 */
export function FeedbackSpecimen() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogVariant, setDialogVariant] = useState<DialogVariant>("default");

  function openDialog(variant: DialogVariant): void {
    setDialogVariant(variant);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-10">
      {/* Banners */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Banner
        </h3>
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg">
            <Banner
              title="Nos Ilha"
              message="Welcome to the cultural heritage hub."
              showDismissButton={false}
              tone="default"
            />
          </div>
          <div className="overflow-hidden rounded-lg">
            <Banner
              title="Announcement"
              message="New features coming soon!"
              linkUrl="https://example.com"
              showDismissButton={false}
              tone="high-contrast"
            />
          </div>
        </div>
      </div>

      {/* Loading Spinners */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Loading Spinner Sizes
        </h3>
        <div className="flex flex-wrap items-end gap-8">
          <div className="flex flex-col items-center gap-2">
            <LoadingSpinner size="sm" />
            <span className="text-muted text-xs">Small</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LoadingSpinner size="md" />
            <span className="text-muted text-xs">Medium</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LoadingSpinner size="lg" />
            <span className="text-muted text-xs">Large</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LoadingSpinner size="md" text="Loading..." />
            <span className="text-muted text-xs">With Text</span>
          </div>
        </div>
      </div>

      {/* Loading Dots */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Loading Dots
        </h3>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <LoadingDots />
            <span className="text-muted text-xs">Default</span>
          </div>
          <div className="bg-surface-alt flex items-center gap-2 rounded-lg px-4 py-2">
            <span className="text-body text-sm">Processing</span>
            <LoadingDots />
          </div>
        </div>
      </div>

      {/* Loading Pulse */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Loading Pulse
        </h3>
        <LoadingPulse className="bg-surface-alt rounded-card inline-block px-6 py-3">
          <span className="text-muted text-sm">Content loading...</span>
        </LoadingPulse>
      </div>

      {/* Confirmation Dialogs */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Confirmation Dialog Variants
        </h3>
        <div className="flex flex-wrap gap-4">
          <AnimatedButton
            variant="primary"
            onClick={() => openDialog("default")}
          >
            Default Dialog
          </AnimatedButton>
          <AnimatedButton
            variant="outline"
            onClick={() => openDialog("warning")}
          >
            Warning Dialog
          </AnimatedButton>
          <AnimatedButton
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            onClick={() => openDialog("danger")}
          >
            Danger Dialog
          </AnimatedButton>
        </div>
      </div>

      {/* Dialog Component */}
      <ConfirmationDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={() => setDialogOpen(false)}
        title={DIALOG_CONFIG[dialogVariant].title}
        description={DIALOG_CONFIG[dialogVariant].description}
        confirmLabel={DIALOG_CONFIG[dialogVariant].confirmLabel}
        variant={dialogVariant}
      />

      {/* Code Example */}
      <div className="border-hairline bg-surface rounded-card border p-4">
        <h3 className="text-body mb-2 text-sm font-semibold">Imports</h3>
        <div className="space-y-1">
          <code className="text-muted block text-sm">
            {`import Banner from "@/components/ui/banner"`}
          </code>
          <code className="text-muted block text-sm">
            {`import { LoadingSpinner, LoadingDots } from "@/components/ui/loading-spinner"`}
          </code>
          <code className="text-muted block text-sm">
            {`import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"`}
          </code>
        </div>
      </div>
    </div>
  );
}
