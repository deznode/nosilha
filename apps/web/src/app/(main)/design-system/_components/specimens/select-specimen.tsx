"use client";

import { useState } from "react";
import { Select, type SelectOption } from "@/components/ui/select";
import {
  Field,
  Label,
  Description,
  ErrorMessage,
} from "@/components/catalyst-ui/fieldset";

const categoryOptions: SelectOption[] = [
  { value: "restaurant", label: "Restaurant" },
  { value: "hotel", label: "Hotel" },
  { value: "beach", label: "Beach" },
  { value: "heritage", label: "Heritage Site" },
  { value: "nature", label: "Nature" },
];

const subjectOptions: SelectOption[] = [
  { value: "general", label: "General Inquiry" },
  { value: "content", label: "Content Suggestion" },
  { value: "technical", label: "Technical Issue" },
  { value: "partnership", label: "Partnership" },
];

const disabledOptions: SelectOption[] = [
  { value: "available", label: "Available Option" },
  { value: "unavailable", label: "Unavailable Option", disabled: true },
  { value: "another", label: "Another Available" },
];

/**
 * Select specimen for the design system gallery.
 * Showcases the Select component with various configurations.
 */
export function SelectSpecimen() {
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("general");
  const [withDisabled, setWithDisabled] = useState("");
  const [invalidValue, setInvalidValue] = useState("");
  const [disabledSelect, setDisabledSelect] = useState("restaurant");

  return (
    <div className="space-y-10">
      {/* Basic Select */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold uppercase tracking-wide">
          Basic Select
        </h3>
        <div className="grid max-w-md gap-4">
          <Field>
            <Label>Category</Label>
            <Select
              options={categoryOptions}
              value={category}
              onChange={setCategory}
              placeholder="Select a category"
            />
          </Field>
          <Field>
            <Label>Subject (Pre-selected)</Label>
            <Select
              options={subjectOptions}
              value={subject}
              onChange={setSubject}
            />
          </Field>
        </div>
      </div>

      {/* With Descriptions */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold uppercase tracking-wide">
          With Field Integration
        </h3>
        <div className="grid max-w-md gap-4">
          <Field>
            <Label>Directory Category</Label>
            <Description>
              Choose the type of place you want to add.
            </Description>
            <Select
              options={categoryOptions}
              value={category}
              onChange={setCategory}
              placeholder="Select category..."
            />
          </Field>
        </div>
      </div>

      {/* Disabled Options */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold uppercase tracking-wide">
          With Disabled Options
        </h3>
        <div className="grid max-w-md gap-4">
          <Field>
            <Label>Availability</Label>
            <Description>Some options may be unavailable.</Description>
            <Select
              options={disabledOptions}
              value={withDisabled}
              onChange={setWithDisabled}
              placeholder="Select an option"
            />
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
            <Select
              options={categoryOptions}
              value={category}
              onChange={setCategory}
              placeholder="Default state"
            />
          </Field>
          <Field>
            <Label>Disabled</Label>
            <Select
              options={categoryOptions}
              value={disabledSelect}
              onChange={setDisabledSelect}
              disabled
            />
          </Field>
          <Field>
            <Label>Invalid</Label>
            <Select
              options={categoryOptions}
              value={invalidValue}
              onChange={setInvalidValue}
              placeholder="Select required"
              invalid
            />
            <ErrorMessage>Please select a category.</ErrorMessage>
          </Field>
        </div>
      </div>

      {/* React Hook Form Note */}
      <div className="border-hairline bg-surface rounded-card border p-4">
        <h3 className="text-body mb-2 text-sm font-semibold">
          React Hook Form Integration
        </h3>
        <p className="text-muted mb-3 text-sm">
          Select uses HeadlessUI Listbox, which requires the Controller pattern:
        </p>
        <pre className="text-muted overflow-x-auto text-xs">
          {`<Controller
  name="category"
  control={control}
  render={({ field }) => (
    <Select
      options={options}
      value={field.value}
      onChange={field.onChange}
      invalid={!!errors.category}
    />
  )}
/>`}
        </pre>
      </div>

      {/* Code Example */}
      <div className="border-hairline bg-surface rounded-card border p-4">
        <h3 className="text-body mb-2 text-sm font-semibold">Import</h3>
        <code className="text-muted text-sm">
          {`import { Select, type SelectOption } from "@/components/ui/select"`}
        </code>
      </div>
    </div>
  );
}
