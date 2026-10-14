"use client";

import { Search, Mail, Lock, User } from "lucide-react";
import { Input, InputGroup } from "@/components/catalyst-ui/input";
import { Field, Label, Description } from "@/components/catalyst-ui/fieldset";

/**
 * Input specimen for the design system gallery.
 * Showcases Catalyst Input component with various configurations.
 */
export function InputSpecimen() {
  return (
    <div className="space-y-10">
      {/* Basic Inputs */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Basic Inputs
        </h3>
        <div className="grid max-w-md gap-4">
          <Field>
            <Label>Text Input</Label>
            <Input placeholder="Enter your text..." />
          </Field>
          <Field>
            <Label>Email</Label>
            <Input type="email" placeholder="you@example.com" />
          </Field>
          <Field>
            <Label>Password</Label>
            <Input type="password" placeholder="Enter password" />
          </Field>
        </div>
      </div>

      {/* With Icons */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          With Icons
        </h3>
        <div className="grid max-w-md gap-4">
          <Field>
            <Label>Search</Label>
            <InputGroup>
              <Search data-slot="icon" />
              <Input placeholder="Search..." type="search" />
            </InputGroup>
          </Field>
          <Field>
            <Label>Email with Icon</Label>
            <InputGroup>
              <Mail data-slot="icon" />
              <Input type="email" placeholder="you@example.com" />
            </InputGroup>
          </Field>
          <Field>
            <Label>Username</Label>
            <InputGroup>
              <User data-slot="icon" />
              <Input placeholder="johndoe" />
            </InputGroup>
          </Field>
        </div>
      </div>

      {/* With Description */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          With Helper Text
        </h3>
        <div className="grid max-w-md gap-4">
          <Field>
            <Label>Password</Label>
            <Description>Must be at least 8 characters.</Description>
            <InputGroup>
              <Lock data-slot="icon" />
              <Input type="password" placeholder="Create a password" />
            </InputGroup>
          </Field>
        </div>
      </div>

      {/* States */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          States
        </h3>
        <div className="grid max-w-md gap-4">
          <Field>
            <Label>Default</Label>
            <Input placeholder="Default state" />
          </Field>
          <Field disabled>
            <Label>Disabled</Label>
            <Input placeholder="Disabled input" disabled />
          </Field>
          <Field>
            <Label>Invalid</Label>
            <Input placeholder="Invalid input" data-invalid />
          </Field>
        </div>
      </div>

      {/* Input Types */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Input Types
        </h3>
        <div className="grid max-w-md gap-4">
          <Field>
            <Label>Number</Label>
            <Input type="number" placeholder="0" />
          </Field>
          <Field>
            <Label>Date</Label>
            <Input type="date" />
          </Field>
          <Field>
            <Label>URL</Label>
            <Input type="url" placeholder="https://example.com" />
          </Field>
        </div>
      </div>

      {/* Code Example */}
      <div className="border-hairline bg-surface rounded-card border p-4">
        <h3 className="text-body mb-2 text-sm font-semibold">Import</h3>
        <code className="text-muted text-sm">
          {`import { Input, InputGroup } from "@/components/catalyst-ui/input"`}
        </code>
      </div>
    </div>
  );
}
