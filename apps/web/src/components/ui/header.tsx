"use client";

import { useState } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Popover,
  PopoverButton,
  PopoverPanel,
  CloseButton,
} from "@headlessui/react";
import {
  Menu as MenuIcon,
  X,
  Globe,
  UserCircle,
  Plus,
  Check,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

import { NosilhaLogo } from "./logo";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase-client";
import { ThemeToggle } from "./theme-toggle";

// --- Navigation Config ---
type NavItem =
  | { name: string; href: string; type?: "link" }
  | { name: string; type: "dropdown"; items: { name: string; href: string }[] };

const navigation: NavItem[] = [
  { name: "Home", href: "/" },
  {
    name: "Culture",
    type: "dropdown",
    items: [
      { name: "History", href: "/history" },
      { name: "People", href: "/people" },
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

export interface HeaderProps {
  className?: string;
  defaultMobileMenuOpen?: boolean;
}

export function Header({
  className,
  defaultMobileMenuOpen = false,
}: HeaderProps = {}) {
  const { session, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [currentLang, setCurrentLang] = useState(languages[0]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <Disclosure
      as="nav"
      className={clsx(
        "border-border-primary bg-background-primary sticky top-0 z-50 border-b shadow-sm",
        className
      )}
      defaultOpen={defaultMobileMenuOpen}
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Left Section: Logo & Mobile Menu Trigger */}
              <div className="flex items-center">
                <div className="mr-2 flex md:hidden">
                  <DisclosureButton className="group text-text-secondary hover:bg-background-secondary hover:text-ocean-blue focus-visible:ring-ocean-blue relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <X className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </DisclosureButton>
                </div>
                <div className="flex shrink-0 items-center">
                  <Link
                    href="/"
                    className="group relative flex items-center transition-opacity hover:opacity-95"
                  >
                    <NosilhaLogo
                      showSubtitle={true}
                      variant="default"
                      instanceId="header-logo"
                    />
                  </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:ml-8 md:flex md:space-x-1">
                  {navigation.map((item) => {
                    if (item.type === "dropdown") {
                      const isChildActive = item.items.some(
                        (child) => pathname === child.href
                      );
                      return (
                        <Popover key={item.name} className="relative">
                          {({ open }) => (
                            <>
                              <PopoverButton
                                className={clsx(
                                  "inline-flex h-16 items-center gap-1 border-b-2 px-3 text-sm font-medium transition-colors focus:outline-none",
                                  isChildActive || open
                                    ? "border-ocean-blue text-ocean-blue"
                                    : "text-text-secondary hover:border-border-primary hover:text-ocean-blue border-transparent"
                                )}
                              >
                                {item.name}
                                <ChevronDown
                                  className={clsx(
                                    "h-4 w-4 transition-transform",
                                    open && "rotate-180"
                                  )}
                                  aria-hidden="true"
                                />
                              </PopoverButton>
                              <PopoverPanel className="bg-background-primary absolute left-0 z-10 mt-0 w-48 origin-top-left rounded-md py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                                {item.items.map((child) => (
                                  <CloseButton
                                    key={child.name}
                                    as={Link}
                                    href={child.href}
                                    className={clsx(
                                      "hover:bg-background-secondary hover:text-ocean-blue block px-4 py-2 text-sm transition-colors",
                                      pathname === child.href
                                        ? "bg-background-secondary text-ocean-blue"
                                        : "text-text-primary"
                                    )}
                                  >
                                    {child.name}
                                  </CloseButton>
                                ))}
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
                          isCurrent
                            ? "border-ocean-blue text-ocean-blue"
                            : "text-text-secondary hover:border-border-primary hover:text-ocean-blue border-transparent"
                        )}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Right Section: Utilities */}
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="hidden items-center space-x-2 md:flex">
                  {/* Language Selector */}
                  <Menu as="div" className="relative">
                    <MenuButton className="text-text-secondary hover:text-ocean-blue focus-visible:ring-ocean-blue flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2">
                      <div className="border-border-primary bg-background-secondary text-ocean-blue hover:bg-background-tertiary flex h-8 w-8 items-center justify-center rounded-full border transition-colors">
                        <Globe className="h-4 w-4" />
                      </div>
                      <span className="hidden lg:inline">
                        {currentLang.code}
                      </span>
                    </MenuButton>
                    <MenuItems className="bg-background-primary absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                      {languages.map((lang) => (
                        <MenuItem key={lang.code} disabled={lang.disabled}>
                          {({ active }) => (
                            <button
                              onClick={() =>
                                !lang.disabled && setCurrentLang(lang)
                              }
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

                  <ThemeToggle />

                  {/* Auth / Profile Section */}
                  {session ? (
                    <Menu as="div" className="relative ml-2">
                      <MenuButton className="focus-visible:ring-ocean-blue flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2">
                        <span className="sr-only">Open user menu</span>
                        <div className="border-border-primary bg-background-secondary text-ocean-blue hover:bg-background-tertiary flex h-8 w-8 items-center justify-center rounded-full border transition-colors">
                          <UserCircle className="h-4 w-4" aria-hidden="true" />
                        </div>
                      </MenuButton>
                      <MenuItems className="divide-border-secondary bg-background-primary absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y rounded-md py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                        <div className="px-4 py-3">
                          <p className="text-text-secondary text-xs">
                            Signed in as
                          </p>
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
                        className="text-text-secondary hover:text-ocean-blue inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors"
                      >
                        Log in
                      </Link>
                      <Link
                        href="/signup"
                        className="text-text-secondary hover:text-ocean-blue inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors"
                      >
                        Sign up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Panel */}
          <DisclosurePanel className="border-border-primary bg-background-primary max-h-[85vh] overflow-y-auto border-t md:hidden">
            <div className="space-y-1 pt-2 pb-3">
              {navigation.map((item) => {
                if (item.type === "dropdown") {
                  return (
                    <div key={item.name}>
                      <div className="text-text-tertiary border-l-4 border-transparent py-2 pr-4 pl-3 text-xs font-semibold tracking-wider uppercase">
                        {item.name}
                      </div>
                      {item.items.map((child) => (
                        <DisclosureButton
                          key={child.name}
                          as={Link}
                          href={child.href}
                          className={clsx(
                            "block border-l-4 py-2 pr-4 pl-6 text-base font-medium",
                            pathname === child.href
                              ? "border-ocean-blue bg-ocean-blue/5 text-ocean-blue"
                              : "text-text-secondary hover:border-border-primary hover:bg-background-secondary hover:text-text-primary border-transparent"
                          )}
                        >
                          {child.name}
                        </DisclosureButton>
                      ))}
                    </div>
                  );
                }

                return (
                  <DisclosureButton
                    key={item.name}
                    as={Link}
                    href={item.href}
                    className={clsx(
                      "block border-l-4 py-2 pr-4 pl-3 text-base font-medium",
                      pathname === item.href
                        ? "border-ocean-blue bg-ocean-blue/5 text-ocean-blue"
                        : "text-text-secondary hover:border-border-primary hover:bg-background-secondary hover:text-text-primary border-transparent"
                    )}
                  >
                    {item.name}
                  </DisclosureButton>
                );
              })}
            </div>

            {/* Mobile Actions / Language / Auth */}
            <div className="border-border-primary border-t pt-4 pb-3">
              {/* Language Selection Mobile */}
              <div className="mb-4 px-4">
                <div className="text-text-tertiary mb-2 text-xs font-semibold tracking-wider uppercase">
                  Language
                </div>
                <div className="flex space-x-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => !lang.disabled && setCurrentLang(lang)}
                      disabled={lang.disabled}
                      title={lang.disabled ? "Coming soon" : undefined}
                      className={clsx(
                        "flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                        lang.disabled
                          ? "border-border-primary text-text-tertiary cursor-not-allowed bg-transparent opacity-40"
                          : currentLang.code === lang.code
                            ? "border-ocean-blue bg-ocean-blue text-white"
                            : "border-border-primary text-text-secondary hover:border-ocean-blue bg-transparent"
                      )}
                    >
                      <span>{lang.flag}</span>
                      {lang.code}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3 px-4">
                <div className="flex-grow">
                  {session ? (
                    <div className="text-text-primary text-base font-medium">
                      {session.user.email}
                    </div>
                  ) : (
                    <div className="text-text-secondary text-base font-medium">
                      Guest User
                    </div>
                  )}
                </div>
                <ThemeToggle />
              </div>

              <div className="mt-3 space-y-1 px-2">
                <Link
                  href="/contribute/story"
                  className="text-ocean-blue hover:bg-ocean-blue/10 block rounded-md px-3 py-2 text-base font-medium"
                >
                  + Contribute a Story
                </Link>
                {session ? (
                  <DisclosureButton
                    as="button"
                    onClick={handleLogout}
                    className="text-text-secondary hover:bg-background-secondary block w-full rounded-md px-3 py-2 text-left text-base font-medium"
                  >
                    Sign out
                  </DisclosureButton>
                ) : (
                  <>
                    <DisclosureButton
                      as={Link}
                      href="/login"
                      className="text-text-secondary hover:bg-background-secondary block rounded-md px-3 py-2 text-base font-medium"
                    >
                      Log in
                    </DisclosureButton>
                    <DisclosureButton
                      as={Link}
                      href="/signup"
                      className="text-text-secondary hover:bg-background-secondary block rounded-md px-3 py-2 text-base font-medium"
                    >
                      Sign up
                    </DisclosureButton>
                  </>
                )}
              </div>
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}
