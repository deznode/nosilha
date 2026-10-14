"use client";

import { useState } from "react";
import {
  Checkbox,
  CheckboxField,
  CheckboxGroup,
} from "@/components/catalyst-ui/checkbox";
import { Label, Description } from "@/components/catalyst-ui/fieldset";

const colorOptions = [
  "blue",
  "green",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
  "zinc",
  "dark",
  "white",
  "dark/zinc",
  "dark/white",
] as const;

/**
 * Checkbox specimen for the design system gallery.
 * Showcases Catalyst Checkbox in all color variants and states.
 */
export function CheckboxSpecimen() {
  const [checkedColors, setCheckedColors] = useState<Set<string>>(
    new Set(["blue", "green", "red", "orange", "violet"])
  );

  const toggleColor = (color: string) => {
    setCheckedColors((prev) => {
      const next = new Set(prev);
      if (next.has(color)) {
        next.delete(color);
      } else {
        next.add(color);
      }
      return next;
    });
  };

  return (
    <div className="space-y-10">
      {/* Color Variants */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Color Variants
        </h3>
        <p className="text-muted mb-4 text-sm">
          Click checkboxes to toggle. All 22 color options are shown.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {colorOptions.map((color) => (
            <div key={color} className="flex items-center gap-3">
              <Checkbox
                color={color}
                checked={checkedColors.has(color)}
                onChange={() => toggleColor(color)}
              />
              <span className="text-body text-sm">{color}</span>
            </div>
          ))}
        </div>
      </div>

      {/* States */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          States
        </h3>
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-3">
            <Checkbox color="blue" checked={false} onChange={() => {}} />
            <span className="text-muted text-sm">Unchecked</span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox color="blue" checked={true} onChange={() => {}} />
            <span className="text-muted text-sm">Checked</span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox color="blue" indeterminate onChange={() => {}} />
            <span className="text-muted text-sm">Indeterminate</span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox color="blue" disabled onChange={() => {}} />
            <span className="text-muted text-sm">Disabled</span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox color="blue" checked disabled onChange={() => {}} />
            <span className="text-muted text-sm">Disabled Checked</span>
          </div>
        </div>
      </div>

      {/* With Labels */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          With Labels & Descriptions
        </h3>
        <CheckboxGroup>
          <CheckboxField>
            <Checkbox color="blue" />
            <Label>Email notifications</Label>
            <Description>
              Receive email updates about your account activity.
            </Description>
          </CheckboxField>
          <CheckboxField>
            <Checkbox color="green" defaultChecked />
            <Label>Marketing emails</Label>
            <Description>
              Get notified about new features and promotions.
            </Description>
          </CheckboxField>
          <CheckboxField>
            <Checkbox color="violet" />
            <Label>Security alerts</Label>
            <Description>
              Important notifications about your account security.
            </Description>
          </CheckboxField>
        </CheckboxGroup>
      </div>

      {/* Brand Colors Highlight */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Brand Color Mapping
        </h3>
        <p className="text-muted mb-4 text-sm">
          These colors map to Nos Ilha brand tokens.
        </p>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <Checkbox color="blue" checked onChange={() => {}} />
            <span className="text-body text-sm">Ocean Blue (blue)</span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox color="green" checked onChange={() => {}} />
            <span className="text-body text-sm">Valley Green (green)</span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox color="pink" checked onChange={() => {}} />
            <span className="text-body text-sm">Bougainvillea (pink)</span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox color="yellow" checked onChange={() => {}} />
            <span className="text-body text-sm">Sobrado Ochre (yellow)</span>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="border-hairline bg-surface rounded-card border p-4">
        <h3 className="text-body mb-2 text-sm font-semibold">Import</h3>
        <code className="text-muted text-sm">
          {`import { Checkbox, CheckboxField } from "@/components/catalyst-ui/checkbox"`}
        </code>
      </div>
    </div>
  );
}
