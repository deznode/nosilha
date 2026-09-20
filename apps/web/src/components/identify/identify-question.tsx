"use client";

import { clsx } from "clsx";

import { useOpenIdentify } from "@/stores/identifyStore";
import type { IdentifyContext } from "@/stores/identifyStore";

/**
 * A question that opens the one identify sheet. Spec 034 FR-004.
 *
 * Every "not recorded" on every archive screen is this button. It exists so the
 * screens stay server components: only the question itself needs the client, not the
 * page around it.
 */

export type IdentifyQuestionVariant =
  "link" | "field" | "answer" | "primary" | "quiet";

export interface IdentifyQuestionProps extends IdentifyContext {
  children: React.ReactNode;
  variant?: IdentifyQuestionVariant;
  className?: string;
}

export function IdentifyQuestion({
  children,
  variant = "link",
  className,
  ...context
}: IdentifyQuestionProps) {
  const open = useOpenIdentify();

  return (
    <button
      type="button"
      onClick={() => open(context)}
      className={clsx("cursor-pointer text-left", className)}
      style={STYLES[variant]}
    >
      {children}
    </button>
  );
}

/**
 * The primary fill is hand-built on `--primary` rather than `AnimatedButton`, which
 * renders `bg-ocean-blue text-white` — 2.27:1 in dark mode. See the handoff SPECS §1.
 */
const STYLES: Record<IdentifyQuestionVariant, React.CSSProperties> = {
  link: {
    background: "none",
    border: 0,
    padding: 0,
    font: "inherit",
    fontSize: "13px",
    color: "var(--brand-sobrado-ochre)",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  },
  // The question under an empty cell in the place record's field grid.
  field: {
    background: "none",
    border: 0,
    padding: 0,
    marginTop: "2px",
    font: "inherit",
    fontSize: "12px",
    color: "var(--brand-sobrado-ochre)",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  },
  // Inside the photo detail's ochre block, where the panel is already ochre: the
  // question reads in body ink and only its underline carries the colour.
  answer: {
    background: "none",
    border: 0,
    padding: 0,
    font: "inherit",
    fontSize: "13px",
    color: "var(--foreground)",
    textDecoration: "underline",
    textDecorationColor:
      "color-mix(in srgb, var(--brand-sobrado-ochre) 60%, transparent)",
    textUnderlineOffset: "3px",
  },
  quiet: {
    background: "none",
    border: 0,
    padding: 0,
    font: "inherit",
    fontSize: "12px",
    color: "var(--foreground-secondary)",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  },
  primary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "var(--primary)",
    color: "var(--primary-foreground)",
    border: 0,
    borderRadius: "8px",
    padding: "11px 20px",
    font: "inherit",
    fontSize: "14px",
    fontWeight: 500,
  },
};
