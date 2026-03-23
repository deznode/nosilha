"use client";

import { useState, Fragment } from "react";
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
  PopoverGroup,
  Transition,
} from "@headlessui/react";
import {
  Menu as MenuIcon,
  X,
  Globe,
  UserCircle,
  Plus,
  Check,
  ChevronDown,
  BookOpen,
  Users,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

import { NosilhaLogo } from "@/components/ui/logo";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase-client";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// --- Navigation Config ---
import type { LucideIcon } from "lucide-react";

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
        "border-edge bg-canvas shadow-subtle sticky top-0 z-50 border-b",
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
                                  isChildActive || open
                                    ? "border-ocean-blue text-ocean-blue"
                                    : "text-text-secondary hover:border-border-primary hover:text-ocean-blue border-transparent"
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

                              <Transition
                                as={Fragment}
                                enter="transition ease-out duration-200"
                                enterFrom="opacity-0 translate-y-1"
                                enterTo="opacity-100 translate-y-0"
                                leave="transition ease-in duration-150"
                                leaveFrom="opacity-100 translate-y-0"
                                leaveTo="opacity-0 translate-y-1"
                              >
                                <PopoverPanel className="absolute left-1/2 z-10 mt-3 w-screen max-w-xs -translate-x-1/2 transform px-2 sm:px-0">
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
                              </Transition>
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
                </PopoverGroup>

                {/* Admin Link - Only visible to admins */}
                {user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className={clsx(
                      "hidden h-16 items-center gap-1.5 border-b-2 px-3 text-sm font-medium transition-colors md:inline-flex",
                      pathname.startsWith("/admin")
                        ? "border-ocean-blue text-ocean-blue"
                        : "text-text-secondary hover:border-border-primary hover:text-ocean-blue border-transparent"
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
                    <MenuButton className="text-text-secondary hover:text-ocean-blue focus-visible:ring-ocean-blue flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2">
                      <div className="border-border-primary bg-background-secondary text-ocean-blue hover:bg-background-tertiary flex h-8 w-8 items-center justify-center rounded-full border transition-colors">
                        <Globe className="h-4 w-4" />
                      </div>
                      <span className="hidden lg:inline">
                        {currentLang.code}
                      </span>
                    </MenuButton>
                    <MenuItems className="bg-canvas shadow-elevated absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md py-1 ring-1 ring-black/5 focus:outline-none">
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
                      <MenuItems className="divide-hairline bg-canvas shadow-elevated absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y rounded-md py-1 ring-1 ring-black/5 focus:outline-none">
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

              {/* Admin Link - Only visible to admins */}
              {user?.role === "ADMIN" && (
                <DisclosureButton
                  as={Link}
                  href="/admin"
                  className={clsx(
                    "flex items-center gap-2 border-l-4 py-2 pr-4 pl-3 text-base font-medium",
                    pathname.startsWith("/admin")
                      ? "border-ocean-blue bg-ocean-blue/5 text-ocean-blue"
                      : "text-text-secondary hover:border-border-primary hover:bg-background-secondary hover:text-text-primary border-transparent"
                  )}
                >
                  <Shield className="h-5 w-5" />
                  Admin
                </DisclosureButton>
              )}
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
