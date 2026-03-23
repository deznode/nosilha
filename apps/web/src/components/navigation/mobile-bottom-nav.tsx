"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Grid3X3,
  BookOpen,
  Map,
  Menu,
  X,
  Film,
  FileText,
  User,
  LogIn,
  Globe,
  Plus,
  UserPlus,
  Check,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/components/providers/auth-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface NavItem {
  label: string;
  icon: typeof Home;
  href?: string;
  action?: "menu";
  /** Routes that match this item (exact or starts-with) */
  activeMatch: string[] | "exact";
}

const navItems: NavItem[] = [
  {
    label: "Home",
    icon: Home,
    href: "/",
    activeMatch: "exact",
  },
  {
    label: "Directory",
    icon: Grid3X3,
    href: "/directory",
    activeMatch: ["/directory"],
  },
  {
    label: "Culture",
    icon: BookOpen,
    href: "/history",
    activeMatch: ["/history", "/people"],
  },
  {
    label: "Map",
    icon: Map,
    href: "/map",
    activeMatch: "exact",
  },
  {
    label: "More",
    icon: Menu,
    action: "menu",
    activeMatch: [],
  },
];

/** Additional items shown in the "More" menu */
const moreMenuItems = [
  { label: "Stories", href: "/stories", icon: FileText },
  { label: "Media", href: "/gallery", icon: Film },
];

const languages = [
  { code: "EN", label: "English", flag: "🇺🇸", disabled: false },
  { code: "PT", label: "Português", flag: "🇵🇹", disabled: true },
  { code: "CV", label: "Kriolu", flag: "🇨🇻", disabled: true },
];

/** Routes where bottom nav should be hidden (detail pages) */
const HIDDEN_ROUTES = [
  /^\/directory\/[^/]+\/[^/]+$/, // /directory/[category]/[slug]
  /^\/stories\/[^/]+$/, // /stories/[slug]
  /^\/people\/[^/]+$/, // /people/[slug]
];

/**
 * Mobile Bottom Navigation - Calm Premium thumb-zone accessibility
 *
 * Features:
 * - Persistent bottom bar (mobile only)
 * - Hidden on detail pages for immersive reading
 * - Safe area padding for iOS home indicator
 * - "More" button opens a popover with additional navigation
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const { session } = useAuth();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(languages[0]);

  // Hide on detail pages
  const shouldHide = HIDDEN_ROUTES.some((pattern) => pattern.test(pathname));
  if (shouldHide) return null;

  const isActive = (item: NavItem): boolean => {
    if (item.activeMatch === "exact") {
      return pathname === item.href;
    }
    return item.activeMatch.some((match) => pathname.startsWith(match));
  };

  return (
    <>
      {/* More menu overlay */}
      {moreMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMoreMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* More menu popover */}
      {moreMenuOpen && (
        <div className="bg-surface border-hairline rounded-card shadow-floating fixed right-4 bottom-20 z-50 w-56 border p-2 lg:hidden">
          <nav aria-label="More navigation options">
            {moreMenuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMoreMenuOpen(false)}
                className={clsx(
                  "text-body hover:bg-surface-alt rounded-button flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname.startsWith(item.href) && "text-ocean-blue"
                )}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </Link>
            ))}

            <div className="border-hairline my-2 border-t" />

            {/* Contribute */}
            <Link
              href="/contribute/story"
              onClick={() => setMoreMenuOpen(false)}
              className="text-ocean-blue hover:bg-surface-alt rounded-button flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
              Contribute a Story
            </Link>

            <div className="border-hairline my-2 border-t" />

            {/* Auth */}
            {session ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMoreMenuOpen(false)}
                  className="text-body hover:bg-surface-alt rounded-button flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors"
                >
                  <User className="h-5 w-5" aria-hidden="true" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMoreMenuOpen(false)}
                  className="text-body hover:bg-surface-alt rounded-button flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors"
                >
                  <Globe className="h-5 w-5" aria-hidden="true" />
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMoreMenuOpen(false)}
                  className="text-body hover:bg-surface-alt rounded-button flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors"
                >
                  <LogIn className="h-5 w-5" aria-hidden="true" />
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMoreMenuOpen(false)}
                  className="text-body hover:bg-surface-alt rounded-button flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors"
                >
                  <UserPlus className="h-5 w-5" aria-hidden="true" />
                  Sign up
                </Link>
              </>
            )}

            <div className="border-hairline my-2 border-t" />

            {/* Language */}
            <div className="px-3 py-2">
              <div className="text-muted mb-2 text-xs font-semibold tracking-wider uppercase">
                Language
              </div>
              <div className="flex gap-1.5">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => !lang.disabled && setCurrentLang(lang)}
                    disabled={lang.disabled}
                    title={lang.disabled ? "Coming soon" : undefined}
                    className={clsx(
                      "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      lang.disabled &&
                        "border-hairline text-muted cursor-not-allowed opacity-40",
                      !lang.disabled &&
                        currentLang.code === lang.code &&
                        "border-ocean-blue bg-ocean-blue text-white",
                      !lang.disabled &&
                        currentLang.code !== lang.code &&
                        "border-hairline text-body hover:border-ocean-blue"
                    )}
                  >
                    <span>{lang.flag}</span>
                    {lang.code}
                    {currentLang.code === lang.code && (
                      <Check className="h-3 w-3" aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-hairline my-2 border-t" />

            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-muted text-sm">Theme</span>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}

      {/* Bottom navigation bar */}
      <nav
        className="bg-surface border-hairline fixed right-0 bottom-0 left-0 z-50 border-t pb-[env(safe-area-inset-bottom)] lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="flex h-14 items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            if (item.action === "menu") {
              return (
                <button
                  key={item.label}
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className={clsx(
                    "touch-target flex flex-col items-center justify-center gap-0.5 px-3 py-2",
                    "transition-colors duration-150",
                    moreMenuOpen
                      ? "text-ocean-blue"
                      : "text-muted hover:text-ocean-blue focus-visible:text-ocean-blue",
                    "focus:outline-none"
                  )}
                  aria-label={moreMenuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={moreMenuOpen}
                >
                  {moreMenuOpen ? (
                    <X className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  )}
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href!}
                className={clsx(
                  "touch-target flex flex-col items-center justify-center gap-0.5 px-3 py-2",
                  "transition-colors duration-150",
                  active
                    ? "text-ocean-blue"
                    : "text-muted hover:text-ocean-blue focus-visible:text-ocean-blue",
                  "focus:outline-none"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={clsx("h-5 w-5", active && "fill-ocean-blue/20")}
                  aria-hidden="true"
                />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
