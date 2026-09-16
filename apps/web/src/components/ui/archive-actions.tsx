"use client";

import { clsx } from "clsx";

import { useToast } from "@/hooks/use-toast";

/**
 * Share and copy-link in the archive's own voice. Spec 034 FR-010, FR-013.
 *
 * The design system's `ShareButton` and `CopyLinkButton` carry their own icons,
 * labels and menus; the prototype's actions are plain words in a row. These reuse the
 * behaviour — the Web Share API with a clipboard fallback — without importing a
 * second visual language onto these screens.
 */

/**
 * The URL at the moment of the click, not of the render.
 *
 * Prev/next on the photo detail keeps this component mounted across navigations, so a
 * value captured during render lags the route by one step — and `location` does not
 * exist at all while a cached page is being prerendered.
 */
function currentUrl(): string {
  return typeof window === "undefined" ? "" : window.location.href;
}

async function copyToClipboard(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

export interface ArchiveActionProps {
  /** The page's title, for the native share sheet. */
  title: string;
  className?: string;
  /** Pill styling for the photo detail's action row; plain text elsewhere. */
  variant?: "text" | "pill";
}

const PILL: React.CSSProperties = {
  background: "var(--background-secondary)",
  border: "1px solid var(--border-subtle)",
  color: "var(--foreground)",
  borderRadius: "999px",
  padding: "10px 18px",
  font: "inherit",
  fontSize: "13px",
};

const TEXT: React.CSSProperties = {
  background: "none",
  border: 0,
  padding: 0,
  font: "inherit",
  fontSize: "13px",
  color: "var(--foreground-secondary)",
};

export function ShareAction({
  title,
  className,
  variant = "text",
}: ArchiveActionProps) {
  const toast = useToast();

  async function share() {
    const target = currentUrl();

    if (navigator.share) {
      try {
        await navigator.share({ title, url: target });
        return;
      } catch {
        // A dismissed share sheet rejects, and so does an unsupported payload. Either
        // way, falling through to the clipboard leaves the reader with the link.
      }
    }

    const copied = await copyToClipboard(target);
    if (copied) {
      toast.success("Link copied").show();
    } else {
      toast.error("Could not copy the link").show();
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className={clsx("cursor-pointer", className)}
      style={variant === "pill" ? PILL : TEXT}
    >
      Share
    </button>
  );
}

export function CopyLinkAction({
  className,
  variant = "text",
}: Omit<ArchiveActionProps, "title">) {
  const toast = useToast();

  async function copy() {
    const target = currentUrl();
    if (await copyToClipboard(target)) {
      toast.success("Link copied").show();
    } else {
      toast.error("Could not copy the link").show();
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={clsx("cursor-pointer", className)}
      style={variant === "pill" ? PILL : TEXT}
    >
      Copy link
    </button>
  );
}
