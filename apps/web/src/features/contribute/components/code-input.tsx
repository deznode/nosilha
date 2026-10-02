"use client";

import clsx from "clsx";
import { useId, useState, type ClipboardEvent } from "react";

const CODE_LENGTH = 6;

interface CodeInputProps {
  value: string;
  onChange: (digits: string) => void;
  /** Called when the sixth digit arrives, by typing or by paste. */
  onComplete: (code: string) => void;
  /** Draws all six boxes in the error colour (S4, S5). */
  invalid?: boolean;
  /** Id of the error text, linked through `aria-describedby`. */
  errorId?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
}

function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, CODE_LENGTH);
}

/**
 * The 6-digit email code (S3–S5). One real input, so autofill, paste and screen
 * readers see a single field; the six boxes behind it are drawing only.
 */
export function CodeInput({
  value,
  onChange,
  onComplete,
  invalid = false,
  errorId,
  readOnly = false,
  autoFocus = false,
}: CodeInputProps) {
  const inputId = useId();
  const [focused, setFocused] = useState(false);
  const activeIndex = Math.min(value.length, CODE_LENGTH - 1);

  const commit = (next: string) => {
    if (next === value) return;
    onChange(next);
    if (next.length === CODE_LENGTH && value.length < CODE_LENGTH) {
      onComplete(next);
    }
  };

  // A pasted "482 913" or "482-913" would be cut short by maxLength before the
  // change handler could strip it, so a paste with a full code replaces the
  // value outright.
  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const pasted = digitsOnly(event.clipboardData.getData("text"));
    if (pasted.length === CODE_LENGTH) {
      event.preventDefault();
      if (pasted === value) return;
      onChange(pasted);
      onComplete(pasted);
    }
  };

  return (
    <div className="relative">
      <label htmlFor={inputId} className="sr-only">
        6-digit code
      </label>
      <div className="grid grid-cols-6 gap-[7px]" aria-hidden="true">
        {Array.from({ length: CODE_LENGTH }, (_, i) => {
          const isActive = focused && !readOnly && i === activeIndex;
          return (
            <div
              key={i}
              data-testid="code-box"
              className={clsx(
                "bg-card flex h-[54px] items-center justify-center rounded-lg font-mono text-[22px] font-medium",
                invalid
                  ? "border-status-error border-[1.5px]"
                  : isActive
                    ? "border-ocean-blue border-[1.5px]"
                    : "border-edge border"
              )}
            >
              {value[i] ?? ""}
            </div>
          );
        })}
      </div>
      <input
        id={inputId}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={CODE_LENGTH}
        value={value}
        readOnly={readOnly}
        autoFocus={autoFocus}
        aria-invalid={invalid || undefined}
        aria-describedby={errorId}
        onChange={(event) => commit(digitsOnly(event.target.value))}
        onPaste={handlePaste}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="absolute inset-0 h-full w-full bg-transparent text-[16px] text-transparent caret-transparent outline-none selection:bg-transparent"
      />
    </div>
  );
}
