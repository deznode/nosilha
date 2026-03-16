"use client";

import { useEffect, useRef, useState } from "react";
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Popover,
  PopoverButton,
  PopoverPanel,
  PopoverGroup,
} from "@headlessui/react";
import {
  Globe,
  UserCircle,
  Plus,
  Check,
  ChevronDown,
  BookOpen,
  Users,
  Shield,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

import { NosilhaLogo } from "./logo";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase-client";
import { ThemeToggle } from "./theme-toggle";

// --- Navigation Config ---

type DropdownItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

type NavItem =
  | { name: string; href: string; type?: "link" }
  | { name: string; type: "dropdown"; items: DropdownItem[] };

const navigation: NavItem[] = [
  { name: "Home", href: "/" },
  {
    name: "Culture",
    type: "dropdown",
    items: [
      {
        name: "History of Brava",
        href: "/history",
        icon: BookOpen,
        description: "The island's rich past",
      },
      {
        name: "Historical Figures",
        href: "/people",
        icon: Users,
        description: "People who shaped Brava",
      },
    ],
  },
  { name: "Directory", href: "/directory" },
  { name: "Stories", href: "/stories" },
  { name: "Media", href: "/gallery" },
  { name: "Map", href: "/map" },
];

const languages = [
  { code: "EN", label: "English", flag: "🇺🇸", disabled: false },
  { code: "PT", label: "Português", flag: "🇵🇹", disabled: true },
  { code: "CV", label: "Kriolu", flag: "🇨🇻", disabled: true },
];

/** Returns border + text classes for nav links based on active state and hero transparency. */
function navLinkClasses(isActive: boolean, isHeroTransparent: boolean): string {
  if (isHeroTransparent) {
    return isActive
      ? "border-white text-white"
      : "border-transparent text-white/70 hover:text-white";
  }
  return isActive
    ? "border-ocean-blue text-ocean-blue"
    : "text-text-secondary hover:border-border-primary hover:text-ocean-blue border-transparent";
}

export interface StickyNavProps {
  className?: string;
  /** When true, renders in-flow at bottom of hero (sticky top-0). When false, renders as fixed top nav (hidden on home page). */
  heroMode?: boolean;
}

export function StickyNav({ className, heroMode = false }: StickyNavProps) {
  const { session, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [currentLang, setCurrentLang] = useState(languages[0]);
  const isHome = pathname === "/";

  // --- Stuck detection ---
  // Hero mode: IntersectionObserver on sentinel (like prototype)
  // Layout mode: always stuck (non-home pages only)
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(!heroMode);

  useEffect(() => {
    if (!heroMode) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 1, rootMargin: "-1px 0px 0px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [heroMode]);

  // Layout mode: don't render on home page (hero section has its own nav)
  if (!heroMode && isHome) {
    return null;
  }

  const isHeroTransparent = heroMode && !isStuck;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // --- Shared nav bar content (used by both modes) ---
  const navBarContent = (
    <>
      {/* Left Section: Logo */}
      <div className="flex items-center">
        <div className="flex shrink-0 items-center">
          <Link
            href="/"
            className="group relative flex items-center transition-opacity hover:opacity-95"
          >
            <NosilhaLogo
              showSubtitle
              variant={isHeroTransparent ? "light" : "default"}
              size={isHeroTransparent ? "compact" : "default"}
              instanceId="sticky-nav-logo"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <PopoverGroup className="hidden md:ml-8 md:flex md:space-x-1">
          {navigation.map((item) => {
            if (item.type === "dropdown") {
              const isChildActive = item.items.some(
                (child) => pathname === child.href
              );
              return (
                <Popover key={item.name} className="relative">
                  {({ open, close }) => (
                    <>
                      <PopoverButton
                        className={clsx(
                          "inline-flex h-16 items-center gap-1 border-b-2 px-3 text-sm font-medium transition-colors outline-none",
                          navLinkClasses(
                            isChildActive || open,
                            isHeroTransparent
                          )
                        )}
                      >
                        {item.name}
                        <ChevronDown
                          className={clsx(
                            "h-4 w-4 transition-transform duration-200",
                            open && "rotate-180"
                          )}
                          aria-hidden="true"
                        />
                      </PopoverButton>

                      <PopoverPanel
                        anchor={{
                          to: isHeroTransparent ? "top" : "bottom",
                          gap: 12,
                        }}
                        transition
                        className={clsx(
                          "z-50 w-80 px-2 sm:px-0",
                          "transition duration-200 ease-out data-[closed]:opacity-0",
                          isHeroTransparent
                            ? "data-[closed]:translate-y-2"
                            : "data-[closed]:-translate-y-2"
                        )}
                      >
                        <div className="rounded-button shadow-elevated overflow-hidden ring-1 ring-black/5">
                          <div className="bg-background-primary relative grid gap-6 px-5 py-6 sm:gap-8 sm:p-8">
                            {item.items.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                onClick={() => close()}
                                className="hover:bg-background-secondary -m-3 flex items-start rounded-lg p-3 transition duration-150 ease-in-out"
                              >
                                <subItem.icon
                                  className="text-ocean-blue h-6 w-6 shrink-0"
                                  aria-hidden="true"
                                />
                                <div className="ml-4">
                                  <p className="text-text-primary text-sm font-medium">
                                    {subItem.name}
                                  </p>
                                  <p className="text-text-secondary mt-1 text-xs">
                                    {subItem.description}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </PopoverPanel>
                    </>
                  )}
                </Popover>
              );
            }

            const isCurrent = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "inline-flex h-16 items-center border-b-2 px-3 text-sm font-medium transition-colors",
                  navLinkClasses(isCurrent, isHeroTransparent)
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </PopoverGroup>

        {/* Admin Link - Only visible to admins */}
        {user?.role === "ADMIN" && (
          <Link
            href="/admin"
            className={clsx(
              "hidden h-16 items-center gap-1.5 border-b-2 px-3 text-sm font-medium transition-colors md:inline-flex",
              navLinkClasses(pathname.startsWith("/admin"), isHeroTransparent)
            )}
          >
            <Shield className="h-4 w-4" />
            Admin
          </Link>
        )}
      </div>

      {/* Right Section: Utilities */}
      <div className="flex items-center space-x-2 md:space-x-3">
        <div className="hidden items-center space-x-2 md:flex">
          {/* Language Selector */}
          <Menu as="div" className="relative">
            <MenuButton
              className={clsx(
                "focus-visible:ring-ocean-blue flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2",
                isHeroTransparent
                  ? "text-white/70 hover:text-white"
                  : "text-text-secondary hover:text-ocean-blue"
              )}
            >
              <div
                className={clsx(
                  "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                  isHeroTransparent
                    ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
                    : "border-border-primary bg-background-secondary text-ocean-blue hover:bg-background-tertiary"
                )}
              >
                <Globe className="h-4 w-4" />
              </div>
              <span className="hidden lg:inline">{currentLang.code}</span>
            </MenuButton>
            <MenuItems
              anchor={{
                to: isHeroTransparent ? "top end" : "bottom end",
                gap: 8,
              }}
              className="bg-canvas shadow-elevated z-10 w-48 rounded-md py-1 ring-1 ring-black/5 focus:outline-none"
            >
              {languages.map((lang) => (
                <MenuItem key={lang.code} disabled={lang.disabled}>
                  {({ active }) => (
                    <button
                      onClick={() => !lang.disabled && setCurrentLang(lang)}
                      disabled={lang.disabled}
                      title={lang.disabled ? "Coming soon" : undefined}
                      className={clsx(
                        lang.disabled
                          ? "text-text-tertiary cursor-not-allowed opacity-50"
                          : active
                            ? "bg-background-secondary text-ocean-blue"
                            : "text-text-primary",
                        "group flex w-full items-center justify-between px-4 py-2 text-sm"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        {lang.label}
                        {lang.disabled && (
                          <span className="text-text-tertiary ml-1 text-xs italic">
                            (Coming soon)
                          </span>
                        )}
                      </span>
                      {currentLang.code === lang.code && (
                        <Check className="text-ocean-blue h-4 w-4" />
                      )}
                    </button>
                  )}
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>

          <ThemeToggle variant={isHeroTransparent ? "light" : "default"} />

          {/* Auth / Profile Section */}
          {session ? (
            <Menu as="div" className="relative ml-2">
              <MenuButton
                className={clsx(
                  "focus-visible:ring-ocean-blue flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2",
                  isHeroTransparent && "text-white/70 hover:text-white"
                )}
              >
                <span className="sr-only">Open user menu</span>
                <div
                  className={clsx(
                    "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                    isHeroTransparent
                      ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
                      : "border-border-primary bg-background-secondary text-ocean-blue hover:bg-background-tertiary"
                  )}
                >
                  <UserCircle className="h-4 w-4" aria-hidden="true" />
                </div>
              </MenuButton>
              <MenuItems
                anchor={{
                  to: isHeroTransparent ? "top end" : "bottom end",
                  gap: 8,
                }}
                className="divide-hairline bg-canvas shadow-elevated z-10 w-56 divide-y rounded-md py-1 ring-1 ring-black/5 focus:outline-none"
              >
                <div className="px-4 py-3">
                  <p className="text-text-secondary text-xs">Signed in as</p>
                  <p className="text-text-primary mt-0.5 truncate text-sm font-bold">
                    {session.user.email}
                  </p>
                </div>
                <div className="py-1">
                  <MenuItem>
                    {({ active }) => (
                      <Link
                        href="/profile"
                        className={clsx(
                          active
                            ? "bg-background-secondary text-ocean-blue"
                            : "text-text-primary",
                          "block px-4 py-2 text-sm"
                        )}
                      >
                        Your Profile
                      </Link>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ active }) => (
                      <Link
                        href="/settings"
                        className={clsx(
                          active
                            ? "bg-background-secondary text-ocean-blue"
                            : "text-text-primary",
                          "block px-4 py-2 text-sm"
                        )}
                      >
                        Settings
                      </Link>
                    )}
                  </MenuItem>
                </div>
                {user?.role === "ADMIN" && (
                  <div className="py-1">
                    <MenuItem>
                      {({ active }) => (
                        <Link
                          href="/contribute/directory"
                          className={clsx(
                            active
                              ? "bg-background-secondary text-ocean-blue"
                              : "text-text-primary",
                            "flex items-center gap-2 px-4 py-2 text-sm"
                          )}
                        >
                          <Plus className="h-4 w-4" />
                          Add Entry
                        </Link>
                      )}
                    </MenuItem>
                  </div>
                )}
                <div className="py-1">
                  <MenuItem>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={clsx(
                          active
                            ? "bg-background-secondary text-accent-error"
                            : "text-text-secondary",
                          "block w-full px-4 py-2 text-left text-sm"
                        )}
                      >
                        Sign out
                      </button>
                    )}
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          ) : (
            <div className="flex items-center gap-1 pl-2">
              <Link
                href="/login"
                className={clsx(
                  "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors",
                  isHeroTransparent
                    ? "text-white/70 hover:text-white"
                    : "text-text-secondary hover:text-ocean-blue"
                )}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={clsx(
                  "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors",
                  isHeroTransparent
                    ? "text-white/70 hover:text-white"
                    : "text-text-secondary hover:text-ocean-blue"
                )}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // --- Hero mode: in-flow sticky nav at bottom of hero ---
  if (heroMode) {
    return (
      <>
        {/* Sentinel: when this scrolls out of view, nav becomes stuck */}
        <div ref={sentinelRef} className="pointer-events-none h-0 w-full" />

        {/* Sticky container */}
        <div
          className={clsx(
            "ease-calm sticky top-0 z-50 w-full transition-all duration-500",
            isStuck ? "px-0" : "px-4",
            className
          )}
        >
          <div
            className={clsx(
              "ease-calm backdrop-blur-xl transition-all duration-500",
              isHeroTransparent
                ? "bg-ocean-blue-deep/80 mx-auto h-16 max-w-6xl rounded-full border border-white/20 shadow-2xl shadow-black/40"
                : "border-edge bg-canvas shadow-subtle border-b"
            )}
          >
            <div
              className={clsx(
                "mx-auto flex h-16 items-center justify-between",
                isHeroTransparent ? "px-4" : "max-w-7xl px-4 sm:px-6 lg:px-8"
              )}
            >
              {navBarContent}
            </div>
          </div>
        </div>
      </>
    );
  }

  // --- Layout mode: fixed top nav for non-home pages ---
  return (
    <nav
      className={clsx(
        "border-edge bg-canvas shadow-subtle fixed top-0 right-0 left-0 z-50 border-b",
        className
      )}
    >
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6 md:h-16 lg:px-8">
        {navBarContent}
      </div>
    </nav>
  );
}
