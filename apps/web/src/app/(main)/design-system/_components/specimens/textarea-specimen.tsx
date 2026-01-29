"use client";

import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  Label,
  Description,
  ErrorMessage,
} from "@/components/catalyst-ui/fieldset";

/**
 * Textarea specimen for the design system gallery.
 * Showcases the Textarea component with various configurations.
 */
export function TextareaSpecimen() {
  return (
    <div className="space-y-10">
      {/* Basic Textareas */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold uppercase tracking-wide">
          Basic Textareas
        </h3>
        <div className="grid max-w-md gap-4">
          <Field>
            <Label>Description</Label>
            <Textarea placeholder="Enter your description..." />
          </Field>
          <Field>
            <Label>Bio</Label>
            <Description>Tell us about yourself.</Description>
            <Textarea placeholder="Write a short bio..." rows={3} />
          </Field>
        </div>
      </div>

      {/* Row Variants */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold uppercase tracking-wide">
          Row Variants
        </h3>
        <div className="grid max-w-md gap-4">
          <Field>
            <Label>2 Rows (Compact)</Label>
            <Textarea placeholder="Short input..." rows={2} />
          </Field>
          <Field>
            <Label>4 Rows (Default)</Label>
            <Textarea placeholder="Standard input..." rows={4} />
          </Field>
          <Field>
            <Label>6 Rows (Large)</Label>
            <Textarea placeholder="Detailed input..." rows={6} />
          </Field>
        </div>
      </div>

      {/* Resize Variants */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold uppercase tracking-wide">
          Resize Behavior
        </h3>
        <div className="grid max-w-md gap-4">
          <Field>
            <Label>Vertical Resize (Default)</Label>
            <Textarea placeholder="Can resize vertically..." resize="vertical" />
          </Field>
          <Field>
            <Label>No Resize</Label>
            <Textarea placeholder="Fixed size..." resize="none" />
          </Field>
          <Field>
            <Label>Both Directions</Label>
            <Textarea placeholder="Resize any direction..." resize="both" />
          </Field>
        </div>
      </div>

      {/* States */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold uppercase tracking-wide">
          States
        </h3>
        <div className="grid max-w-md gap-4">
          <Field>
            <Label>Default</Label>
            <Textarea placeholder="Default state" />
          </Field>
          <Field disabled>
            <Label>Disabled</Label>
            <Textarea placeholder="Disabled textarea" disabled />
          </Field>
          <Field>
            <Label>Invalid</Label>
            <Textarea placeholder="Invalid textarea" data-invalid />
            <ErrorMessage>This field has an error.</ErrorMessage>
          </Field>
        </div>
      </div>

      {/* With Field Integration */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold uppercase tracking-wide">
          With Field Integration
        </h3>
        <div className="grid max-w-md gap-4">
          <Field>
            <Label>Story Content</Label>
            <Description>
              Share your story about Brava Island. Minimum 50 characters.
            </Description>
            <Textarea
              placeholder="Write your story here..."
              rows={6}
              resize="vertical"
            />
          </Field>
        </div>
      </div>

      {/* Code Example */}
      <div className="border-hairline bg-surface rounded-card border p-4">
        <h3 className="text-body mb-2 text-sm font-semibold">Import</h3>
        <code className="text-muted text-sm">
          {`import { Textarea } from "@/components/ui/textarea"`}
        </code>
      </div>
    </div>
  );
}
