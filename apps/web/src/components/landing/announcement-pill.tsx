"use client";

import { useState, useSyncExternalStore, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, X, Trophy, Megaphone, Sparkles, Bell } from "lucide-react";

/** Available icons for the announcement badge */
export type AnnouncementIconName = "trophy" | "megaphone" | "sparkles" | "bell";

const iconMap = {
  trophy: Trophy,
  megaphone: Megaphone,
  sparkles: Sparkles,
  bell: Bell,
} as const;

export interface AnnouncementPillProps {
  /** Unique ID for localStorage persistence */
  id: string;
  /** Link destination */
  href: string;
  /** Main announcement text */
  text: string;
  /** Badge label (e.g., "News", "Update") */
  badge?: string;
  /** Optional icon name for the badge */
  icon?: AnnouncementIconName;
  /** Whether the announcement can be dismissed */
  dismissible?: boolean;
}

/**
 * AnnouncementPill - Dismissible announcement banner for the hero section
 *
 * A glassmorphic pill-shaped announcement that can be dismissed by the user.
 * Dismissal state is persisted to localStorage so users don't see the same
 * announcement repeatedly.
 */
export function AnnouncementPill({
  id,
  href,
  text,
  badge = "News",
  icon,
  dismissible = true,
}: AnnouncementPillProps) {
  const BadgeIcon = icon ? iconMap[icon] : null;
  const storageKey = `announcement-dismissed-${id}`;

  // Use useSyncExternalStore for hydration-safe localStorage access
  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener("storage", onStoreChange);
    return () => window.removeEventListener("storage", onStoreChange);
  }, []);

  const isDismissedFromStorage = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(storageKey) === "true",
    () => dismissible // Server: assume dismissed only if dismissible (prevents flash)
  );

  const [localDismissed, setLocalDismissed] = useState(false);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.setItem(storageKey, "true");
    setLocalDismissed(true);
  };

  // Only check dismissal state if the announcement is dismissible
  if (dismissible && (isDismissedFromStorage || localDismissed)) {
    return null;
  }

  const linkContent = (
    <>
      <span className="bg-bougainvillea-pink shadow-subtle flex items-center justify-center rounded-full px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
        {BadgeIcon && <BadgeIcon size={12} className="mr-1" />}
        {badge}
      </span>
      <span className="text-xs font-medium opacity-90 group-hover:opacity-100 md:text-sm">
        {text}
      </span>
      <ArrowRight
        size={14}
        className="opacity-70 transition-transform group-hover:translate-x-1"
      />
    </>
  );

  // When not dismissible, render Link directly without wrapper (matches test page)
  if (!dismissible) {
    return (
      <Link
        href={href}
        className="group mb-8 inline-flex cursor-pointer items-center gap-3 rounded-full border border-white/20 bg-white/10 px-1 py-1 pr-4 text-white backdrop-blur-md transition-all hover:bg-white/20"
      >
        {linkContent}
      </Link>
    );
  }

  // When dismissible, wrap in div to include dismiss button
  return (
    <div className="group relative mb-8 inline-flex items-center">
      <Link
        href={href}
        className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-white/20 bg-white/10 px-1 py-1 pr-4 text-white backdrop-blur-md transition-all hover:bg-white/20"
      >
        {linkContent}
      </Link>
      <button
        onClick={handleDismiss}
        className="ml-2 rounded-full p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
}
