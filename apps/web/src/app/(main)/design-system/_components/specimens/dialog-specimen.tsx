"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogActions,
} from "@/components/catalyst-ui/dialog";
import { Button } from "@/components/catalyst-ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";

type DialogSize = "sm" | "md" | "lg" | "xl" | "2xl";

/**
 * Dialog specimen for the design system gallery.
 * Showcases Dialog from Catalyst UI with various sizes and compositions.
 */
export function DialogSpecimen() {
  const [basicOpen, setBasicOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [currentSize, setCurrentSize] = useState<DialogSize>("lg");

  function openSizeDialog(size: DialogSize): void {
    setCurrentSize(size);
    setSizeOpen(true);
  }

  return (
    <div className="space-y-10">
      {/* Basic Dialog */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Basic Dialog
        </h3>
        <p className="text-muted mb-4 text-sm">
          Dialog with title, description, and action buttons. Uses HeadlessUI
          for accessibility (focus trap, Esc to close).
        </p>
        <AnimatedButton variant="primary" onClick={() => setBasicOpen(true)}>
          Open Basic Dialog
        </AnimatedButton>

        <Dialog open={basicOpen} onClose={() => setBasicOpen(false)}>
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogDescription>
            Are you sure you want to proceed? This action can be undone later
            from the settings page.
          </DialogDescription>
          <DialogActions>
            <Button plain onClick={() => setBasicOpen(false)}>
              Cancel
            </Button>
            <Button color="blue" onClick={() => setBasicOpen(false)}>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      {/* Dialog with Body Content */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Dialog with Form Content
        </h3>
        <p className="text-muted mb-4 text-sm">
          DialogBody provides spacing for rich content like forms, lists, or
          custom layouts.
        </p>
        <AnimatedButton variant="secondary" onClick={() => setFormOpen(true)}>
          Open Form Dialog
        </AnimatedButton>

        <Dialog open={formOpen} onClose={() => setFormOpen(false)}>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information below.
          </DialogDescription>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <label className="text-body mb-1 block text-sm font-medium">
                  Display Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="border-hairline bg-surface focus:border-ocean-blue focus:ring-ocean-blue w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                  defaultValue="Maria Silva"
                />
              </div>
              <div>
                <label className="text-body mb-1 block text-sm font-medium">
                  Bio
                </label>
                <textarea
                  placeholder="Tell us about yourself"
                  rows={3}
                  className="border-hairline bg-surface focus:border-ocean-blue focus:ring-ocean-blue w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                  defaultValue="Cultural heritage enthusiast from Brava Island."
                />
              </div>
            </div>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button color="blue" onClick={() => setFormOpen(false)}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      {/* Size Variants */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Size Variants
        </h3>
        <p className="text-muted mb-4 text-sm">
          Dialog supports 9 size variants: xs, sm, md, lg (default), xl, 2xl,
          3xl, 4xl, 5xl.
        </p>
        <div className="flex flex-wrap gap-3">
          {(["sm", "md", "lg", "xl", "2xl"] as DialogSize[]).map((size) => (
            <AnimatedButton
              key={size}
              variant="outline"
              onClick={() => openSizeDialog(size)}
            >
              {size.toUpperCase()}
            </AnimatedButton>
          ))}
        </div>

        <Dialog
          open={sizeOpen}
          onClose={() => setSizeOpen(false)}
          size={currentSize}
        >
          <DialogTitle>Size: {currentSize.toUpperCase()}</DialogTitle>
          <DialogDescription>
            This dialog uses the &quot;{currentSize}&quot; size variant. The
            width adapts to the content while respecting the maximum width
            constraint.
          </DialogDescription>
          <DialogBody>
            <div className="bg-surface-alt rounded-card p-4">
              <p className="text-muted text-sm">
                Dialog sizes control the maximum width on larger screens. On
                mobile, all dialogs appear as bottom sheets that slide up from
                the bottom of the screen.
              </p>
            </div>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={() => setSizeOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      {/* Code Example */}
      <div className="border-hairline bg-surface rounded-card border p-4">
        <h3 className="text-body mb-2 text-sm font-semibold">Usage</h3>
        <div className="space-y-2">
          <code className="text-muted block text-sm">
            {`import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from "@/components/catalyst-ui/dialog";`}
          </code>
          <code className="text-muted block text-sm">
            {`import { Button } from "@/components/catalyst-ui/button";`}
          </code>
          <div className="border-hairline my-2 border-t" />
          <code className="text-muted block text-sm">
            {`<Dialog open={isOpen} onClose={close} size="lg">`}
          </code>
          <code className="text-muted block pl-4 text-sm">
            {`<DialogTitle>Title</DialogTitle>`}
          </code>
          <code className="text-muted block pl-4 text-sm">
            {`<DialogDescription>Description text</DialogDescription>`}
          </code>
          <code className="text-muted block pl-4 text-sm">
            {`<DialogBody>Content here</DialogBody>`}
          </code>
          <code className="text-muted block pl-4 text-sm">
            {`<DialogActions>`}
          </code>
          <code className="text-muted block pl-8 text-sm">
            {`<Button plain onClick={close}>Cancel</Button>`}
          </code>
          <code className="text-muted block pl-8 text-sm">
            {`<Button color="blue" onClick={submit}>Save</Button>`}
          </code>
          <code className="text-muted block pl-4 text-sm">
            {`</DialogActions>`}
          </code>
          <code className="text-muted block text-sm">{`</Dialog>`}</code>
        </div>
      </div>
    </div>
  );
}
