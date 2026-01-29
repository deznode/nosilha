"use client";

import { useToast } from "@/hooks/use-toast";
import { AnimatedButton } from "@/components/ui/animated-button";

/**
 * Toast specimen for the design system gallery.
 * Showcases the fluent ToastBuilder API with 4 semantic variants,
 * action buttons, and custom durations.
 */
export function ToastSpecimen() {
  const toast = useToast();

  return (
    <div className="space-y-10">
      {/* Variant Showcase */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Toast Variants
        </h3>
        <p className="text-muted mb-4 text-sm">
          Click each button to trigger a toast notification. Toasts auto-dismiss
          based on severity (errors persist longer).
        </p>
        <div className="flex flex-wrap gap-4">
          <AnimatedButton
            variant="primary"
            onClick={() => toast.success("Changes saved successfully").show()}
          >
            Success Toast
          </AnimatedButton>
          <AnimatedButton
            variant="outline"
            onClick={() =>
              toast.error("Failed to save changes. Please try again.").show()
            }
          >
            Error Toast
          </AnimatedButton>
          <AnimatedButton
            variant="outline"
            onClick={() =>
              toast.info("New features are available in settings").show()
            }
          >
            Info Toast
          </AnimatedButton>
          <AnimatedButton
            variant="outline"
            onClick={() =>
              toast.warning("Your session will expire in 5 minutes").show()
            }
          >
            Warning Toast
          </AnimatedButton>
        </div>
      </div>

      {/* Action Button Showcase */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          With Action Button
        </h3>
        <p className="text-muted mb-4 text-sm">
          Toasts can include an action button for quick responses (undo, retry,
          view details).
        </p>
        <div className="flex flex-wrap gap-4">
          <AnimatedButton
            variant="secondary"
            onClick={() =>
              toast
                .success("Item added to favorites")
                .action("Undo", () => toast.info("Undo clicked").show())
                .show()
            }
          >
            With Undo Action
          </AnimatedButton>
          <AnimatedButton
            variant="secondary"
            onClick={() =>
              toast
                .error("Connection failed")
                .action("Retry", () => toast.info("Retrying...").show())
                .show()
            }
          >
            With Retry Action
          </AnimatedButton>
        </div>
      </div>

      {/* Advanced Features */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Advanced Features
        </h3>
        <div className="flex flex-wrap gap-4">
          <AnimatedButton
            variant="ghost"
            onClick={() =>
              toast.info("Custom 8 second duration").duration(8000).show()
            }
          >
            Custom Duration (8s)
          </AnimatedButton>
          <AnimatedButton
            variant="ghost"
            onClick={() =>
              toast.warning("Deduplicated toast").id("demo-dedup").show()
            }
          >
            Deduplicated (click multiple times)
          </AnimatedButton>
          <AnimatedButton variant="ghost" onClick={() => toast.clearAll()}>
            Clear All Toasts
          </AnimatedButton>
        </div>
      </div>

      {/* Code Example */}
      <div className="border-hairline bg-surface rounded-card border p-4">
        <h3 className="text-body mb-2 text-sm font-semibold">Usage</h3>
        <div className="space-y-2">
          <code className="text-muted block text-sm">
            {`import { useToast } from "@/hooks/use-toast";`}
          </code>
          <code className="text-muted block text-sm">
            {`const toast = useToast();`}
          </code>
          <div className="border-hairline my-2 border-t" />
          <code className="text-muted block text-sm">{`// Simple toast`}</code>
          <code className="text-muted block text-sm">
            {`toast.success("Profile updated").show();`}
          </code>
          <code className="text-muted block text-sm">
            {`toast.error("Failed to save").show();`}
          </code>
          <div className="border-hairline my-2 border-t" />
          <code className="text-muted block text-sm">
            {`// With action button`}
          </code>
          <code className="text-muted block text-sm">
            {`toast.success("Added").action("Undo", handleUndo).show();`}
          </code>
          <div className="border-hairline my-2 border-t" />
          <code className="text-muted block text-sm">
            {`// With deduplication`}
          </code>
          <code className="text-muted block text-sm">
            {`toast.warning("Session expiring").id("session-warn").show();`}
          </code>
        </div>
      </div>
    </div>
  );
}
