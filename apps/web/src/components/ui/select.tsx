"use client";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronDown, Check } from "lucide-react";
import clsx from "clsx";
import { useActivityRemountKey } from "@/lib/hooks/use-activity-remount-key";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  name?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  invalid = false,
  className,
  name,
}: SelectProps) {
  const selected = options.find((o) => o.value === value);
  const remountKey = useActivityRemountKey();

  return (
    <Listbox
      key={remountKey}
      value={value}
      onChange={onChange}
      disabled={disabled}
      name={name}
    >
      <span
        data-slot="control"
        data-invalid={invalid ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        className={clsx([
          className,
          // Basic layout
          "relative block w-full",
          // Background color + shadow applied to inset pseudo element, so shadow blends with border in light mode
          "before:shadow-subtle before:absolute before:inset-px before:rounded-[calc(var(--radius-lg)-1px)] before:bg-white",
          // Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
          "dark:before:hidden",
          // Focus ring
          "has-data-[open]:after:ring-ocean-blue after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset has-data-[open]:after:ring-2",
          // Disabled state
          "data-[disabled]:before:bg-basalt-900/5 data-[disabled]:opacity-50 data-[disabled]:before:shadow-none",
          // Invalid state
          "data-[invalid]:before:shadow-red-500/10",
        ])}
      >
        <ListboxButton
          className={clsx([
            // Basic layout
            "relative flex w-full items-center justify-between rounded-lg px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)]",
            // Typography
            "text-left text-base/6 sm:text-sm/6",
            selected
              ? "text-basalt-900 dark:text-text-primary"
              : "text-basalt-500",
            // Border
            "data-hover:border-basalt-900/20 border dark:data-hover:border-white/20",
            invalid
              ? "border-red-500 data-hover:border-red-500 dark:border-red-500 dark:data-hover:border-red-500"
              : "border-basalt-900/10 dark:border-white/10",
            // Background color
            "dark:bg-background-primary/5 bg-transparent",
            // Hide default focus styles
            "focus:outline-hidden",
            // Disabled state
            "data-disabled:border-basalt-900/20 dark:data-disabled:border-white/15 dark:data-disabled:bg-white/2.5",
            // Cursor
            disabled ? "cursor-not-allowed" : "cursor-pointer",
          ])}
        >
          <span className="block truncate">
            {selected?.label || placeholder}
          </span>
          <ChevronDown
            className={clsx(
              "ml-2 h-4 w-4 shrink-0 transition-transform duration-150",
              "text-basalt-500 dark:text-mist-200",
              "group-data-[open]:rotate-180"
            )}
            aria-hidden="true"
          />
        </ListboxButton>

        <ListboxOptions
          transition
          anchor="bottom start"
          className={clsx(
            "rounded-card z-50 mt-1 w-[var(--button-width)] origin-top p-1",
            "bg-surface border-hairline shadow-floating border",
            "transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0",
            "[--anchor-gap:4px]"
          )}
        >
          {options.map((option) => (
            <ListboxOption
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={clsx(
                "group rounded-button flex w-full cursor-pointer items-center justify-between px-3 py-2 text-sm",
                "transition-colors duration-75",
                "text-body data-focus:bg-surface-alt",
                "data-disabled:text-muted data-disabled:cursor-not-allowed"
              )}
            >
              <span className="block truncate">{option.label}</span>
              <Check
                className={clsx(
                  "text-ocean-blue h-4 w-4 shrink-0",
                  "opacity-0 group-data-selected:opacity-100"
                )}
                aria-hidden="true"
              />
            </ListboxOption>
          ))}
        </ListboxOptions>
      </span>
    </Listbox>
  );
}
