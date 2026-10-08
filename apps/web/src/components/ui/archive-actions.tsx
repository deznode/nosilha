"use client";

import { clsx } from "clsx";

import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/ga";
import { buildShareLink, type ShareMoment } from "@/lib/share";

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

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export interface ArchiveActionProps {
  /** The page's title, for the native share sheet. */
  title: string;
  /** The message the share sheet opens with; the sender can edit it. */
  text?: string;
  /** What is being shared; names the campaign a visit is counted under. */
  moment?: ShareMoment;
  /** The record id or town slug, for the `share` event. */
  itemId?: string;
  /** The button's words. */
  label?: string;
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

/** GA4's recommended `share` event; `method` says how the link left the page. */
function trackShare(
  moment: ShareMoment,
  itemId: string | undefined,
  method: "native" | "copy"
) {
  trackEvent({
    action: "share",
    content_type: moment,
    item_id: itemId,
    method,
  });
}

export function ShareAction({
  title,
  text,
  moment = "entry",
  itemId,
  label = "Share",
  className,
  variant = "text",
}: ArchiveActionProps) {
  const toast = useToast();

  async function share() {
    const target = buildShareLink(currentUrl(), moment);

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: target });
        trackShare(moment, itemId, "native");
        return;
      } catch (error) {
        // A dismissed sheet is the reader changing their mind, not a failure: it
        // leaves nothing behind. Any other rejection is an unsupported payload, and
        // falling through to the clipboard still leaves the reader with the link.
        if ((error as { name?: string } | null)?.name === "AbortError") return;
      }
    }

    const copied = await copyToClipboard(text ? `${text}\n${target}` : target);
    if (copied) {
      toast.success(text ? "Message and link copied" : "Link copied").show();
      trackShare(moment, itemId, "copy");
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
      {label}
    </button>
  );
}

export function CopyLinkAction({
  moment = "entry",
  itemId,
  className,
  variant = "text",
}: Omit<ArchiveActionProps, "title" | "text" | "label">) {
  const toast = useToast();

  async function copy() {
    const target = buildShareLink(currentUrl(), moment);
    if (await copyToClipboard(target)) {
      toast.success("Link copied").show();
      trackShare(moment, itemId, "copy");
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
