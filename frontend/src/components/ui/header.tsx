"use client";

import { useState, useEffect, Fragment } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverPanel,
  PopoverGroup,
  Transition,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from "@headlessui/react";
import {
  Menu as MenuIcon,
  X,
  Users,
  BookOpen,
  Map,
  Store,
  Sun,
  Search,
  Globe,
  UserCircle,
  Plus,
  ChevronDown,
  Check,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

// Keep your existing imports
import { NosilhaLogo } from "./logo";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase-client";
import { ThemeToggle } from "./theme-toggle";

// --- Configuration ---

const navigation = [
  { name: "Home", href: "/", type: "link" },
  {
    name: "Explore",
    type: "dropdown",
    items: [
      {
        name: "Restaurants",
        href: "/directory/restaurant",
        icon: Store,
        description: "Local flavors and dining",
      },
      {
        name: "Landmarks",
        href: "/directory/landmark",
        icon: Map,
        description: "Must-see heritage sites",
      },
      {
        name: "Beaches",
        href: "/directory/beach",
        icon: Sun,
        description: "Sun, sand, and sea",
      },
    ],
  },
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
  { name: "Map", href: "/map", type: "link" },
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
  const [scrolled, setScrolled] = useState(false);
  const [currentLang, setCurrentLang] = useState(languages[0]); // Default EN

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // --- CONTRAST LOGIC ---
  // If we are on the Home page AND haven't scrolled yet, we are sitting on top
  // of the dark atmospheric hero. We need White text.
  // Otherwise, we use the standard dark/brand colors.
  const isTransparent = pathname === "/" && !scrolled;

  const textColorClass = isTransparent
    ? "text-white/90 hover:text-white"
    : "text-text-secondary hover:text-ocean-blue";

  const activeLinkClass = isTransparent
    ? "border-white text-white"
    : "border-ocean-blue text-ocean-blue";

  const iconClass = isTransparent
    ? "text-white/80 hover:text-white hover:bg-white/10"
    : "text-text-secondary hover:text-ocean-blue hover:bg-background-secondary";

  return (
    <Disclosure
      as="nav"
      className={clsx(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ease-in-out",
        scrolled
          ? "glass-panel border-b border-white/10 py-0" // Standard height when scrolled
          : "border-transparent bg-transparent py-2", // Little extra padding when transparent for "breathing room"
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
                  <DisclosureButton
                    className={clsx(
                      "group relative inline-flex items-center justify-center rounded-md p-2 transition-colors focus:ring-2 focus:outline-none focus:ring-inset",
                      iconClass
                    )}
                  >
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
                    {/* ARTISTIC BACKLIGHT (The "Mist Halo"):
                       Instead of changing the logo color, we place a soft, radiant "dawn light" 
                       behind it. This ensures the dark "Nos Ilha" text is readable against the 
                       dark mountains, while keeping the brand colors vibrant.
                    */}
                    <div
                      className={clsx(
                        "absolute top-1/2 left-1/2 -z-10 h-[180%] w-[160%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl transition-opacity duration-700",
                        isTransparent ? "opacity-100" : "opacity-0"
                      )}
                      style={{
                        background:
                          "radial-gradient(closest-side, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 40%, transparent 100%)",
                      }}
                    />

                    {/* Render the Logo in its original, vibrant colors */}
                    <NosilhaLogo showSubtitle={true} />
                  </Link>
                </div>

                {/* Desktop Navigation */}
                <PopoverGroup className="hidden md:ml-8 md:flex md:space-x-6">
                  {navigation.map((item) => {
                    // Calculate if this item (or its children) is currently active
                    const isCurrent = item.href
                      ? pathname === item.href
                      : item.items?.some((sub) =>
                          pathname.startsWith(sub.href)
                        );

                    return item.type === "link" ? (
                      <Link
                        key={item.name}
                        href={item.href || "#"}
                        className={clsx(
                          "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-semibold transition-colors duration-200",
                          isCurrent
                            ? activeLinkClass
                            : `border-transparent ${textColorClass}`
                        )}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <Popover key={item.name} className="relative">
                        {({ open }) => (
                          <>
                            <PopoverButton
                              className={clsx(
                                "group inline-flex items-center border-b-2 px-1 pt-1 text-sm font-semibold transition-colors duration-200 outline-none",
                                open || isCurrent
                                  ? activeLinkClass
                                  : `border-transparent ${textColorClass}`
                              )}
                            >
                              <span>{item.name}</span>
                              <ChevronDown
                                className={clsx(
                                  "ml-1 h-4 w-4 transition duration-200",
                                  open && "rotate-180",
                                  isTransparent
                                    ? "text-white/70"
                                    : "text-text-tertiary"
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
                              {/* DROPDOWNS: These ALWAYS need a solid background (White or Dark Mode Grey).
                                  We do NOT want these to be transparent.
                              */}
                              <PopoverPanel className="absolute left-1/2 z-10 mt-3 w-screen max-w-xs -translate-x-1/2 transform px-2 sm:px-0">
                                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
                                  <div className="bg-background-primary relative grid gap-6 px-5 py-6 sm:gap-8 sm:p-8">
                                    {item.items?.map((subItem) => (
                                      <Link
                                        key={subItem.name}
                                        href={subItem.href}
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
                  })}
                </PopoverGroup>
              </div>

              {/* Right Section: Utilities (Search, Language, Actions, Auth) */}
              <div className="flex items-center space-x-2 md:space-x-4">
                {/* Search Trigger */}
                <button
                  className={clsx(
                    "rounded-full p-2 transition-colors",
                    iconClass
                  )}
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>

                <div className="hidden items-center space-x-3 md:flex">
                  {/* Language Selector (Desktop) */}
                  <Menu as="div" className="relative">
                    <MenuButton
                      className={clsx(
                        "flex items-center gap-1 rounded-full p-2 text-sm font-semibold transition-colors",
                        iconClass
                      )}
                    >
                      <Globe className="h-5 w-5" />
                      <span className="hidden lg:inline">
                        {currentLang.code}
                      </span>
                    </MenuButton>
                    {/* Dropdowns remain standard solid colors */}
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <MenuItems className="bg-background-primary absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                        {languages.map((lang) => (
                          <MenuItem key={lang.code} disabled={lang.disabled}>
                            {({ active }) => (
                              <button
                                onClick={() =>
                                  !lang.disabled && setCurrentLang(lang)
                                }
                                disabled={lang.disabled}
                                title={
                                  lang.disabled ? "Coming soon" : undefined
                                }
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
                    </Transition>
                  </Menu>
                  <div
                    className={clsx(
                      "mx-1 h-6 w-px",
                      isTransparent ? "bg-white/30" : "bg-border-primary"
                    )}
                  />{" "}
                  {/* Divider */}
                  <Link
                    href="/contribute"
                    className="bg-ocean-blue hover:bg-ocean-blue/90 inline-flex items-center gap-x-1.5 rounded-full px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Contribute</span>
                  </Link>
                  {user?.role === "ADMIN" && (
                    <Link
                      href="/add-entry"
                      className="text-accent-error hover:bg-accent-error/10 border-accent-error/30 inline-flex items-center gap-x-1.5 rounded-full border px-4 py-2 text-sm font-bold transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Entry</span>
                    </Link>
                  )}
                  <ThemeToggle />
                  {/* Auth / Profile Section */}
                  {session ? (
                    <Menu as="div" className="relative ml-2">
                      <MenuButton
                        className={clsx(
                          "flex h-8 w-8 items-center justify-center rounded-full transition-all focus:outline-none",
                          isTransparent
                            ? "bg-white/20 text-white ring-white/30 hover:bg-white/30"
                            : "bg-background-secondary text-text-secondary hover:text-ocean-blue hover:ring-ocean-blue/20"
                        )}
                      >
                        <span className="sr-only">Open user menu</span>
                        <UserCircle className="h-6 w-6" aria-hidden="true" />
                      </MenuButton>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <MenuItems className="bg-background-primary divide-border-secondary absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y rounded-md py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                          <div className="px-4 py-3">
                            <p className="text-text-secondary text-xs">
                              Signed in as
                            </p>
                            <p className="text-text-primary mt-0.5 truncate text-sm font-bold">
                              {session.user.email}
                            </p>
                          </div>
                          {/* ... Keep existing menu items ... */}
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
                      </Transition>
                    </Menu>
                  ) : (
                    <div className="flex items-center gap-3 pl-2">
                      <Link
                        href="/login"
                        className={clsx(
                          "text-sm font-semibold transition-colors",
                          textColorClass
                        )}
                      >
                        Log in
                      </Link>
                      <Link
                        href="/signup"
                        className={clsx(
                          "text-sm font-semibold transition-colors",
                          textColorClass
                        )}
                      >
                        Sign up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Panel - Standard background (not transparent) so links are readable */}
          <DisclosurePanel className="bg-background-primary border-border-primary max-h-[85vh] overflow-y-auto border-t md:hidden">
            <div className="space-y-1 pt-2 pb-3">
              {navigation.map((item, index) =>
                item.type === "link" ? (
                  <DisclosureButton
                    key={item.name}
                    as={Link}
                    href={item.href || "#"}
                    className={clsx(
                      "animate-slide-up block border-l-4 py-2 pr-4 pl-3 text-base font-medium",
                      pathname === item.href
                        ? "border-ocean-blue bg-ocean-blue/5 text-ocean-blue"
                        : "text-text-secondary hover:border-border-primary hover:bg-background-secondary hover:text-text-primary border-transparent"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {item.name}
                  </DisclosureButton>
                ) : (
                  <Disclosure key={item.name} as="div" className="space-y-1">
                    {({ open }) => (
                      <>
                        <DisclosureButton
                          className="animate-slide-up group text-text-secondary hover:bg-background-secondary hover:text-text-primary flex w-full items-center justify-between border-l-4 border-transparent py-2 pr-4 pl-3 text-base font-medium"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {item.name}
                          <ChevronDown
                            className={clsx(
                              "text-text-tertiary h-5 w-5 flex-none",
                              open && "rotate-180"
                            )}
                            aria-hidden="true"
                          />
                        </DisclosureButton>
                        <DisclosurePanel className="space-y-1">
                          {item.items?.map((subItem, subIndex) => (
                            <DisclosureButton
                              key={subItem.name}
                              as={Link}
                              href={subItem.href}
                              className="animate-slide-up group text-text-secondary hover:text-ocean-blue hover:bg-background-secondary flex w-full items-center border-l-4 border-transparent py-2 pr-4 pl-10 text-sm font-medium"
                              style={{
                                animationDelay: `${(index + subIndex + 1) * 50}ms`,
                              }}
                            >
                              <subItem.icon className="group-hover:text-ocean-blue text-text-tertiary mr-3 h-5 w-5 flex-shrink-0" />
                              {subItem.name}
                            </DisclosureButton>
                          ))}
                        </DisclosurePanel>
                      </>
                    )}
                  </Disclosure>
                )
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
                            ? "bg-ocean-blue border-ocean-blue text-white"
                            : "text-text-secondary border-border-primary hover:border-ocean-blue bg-transparent"
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
                  href="/contribute"
                  className="text-ocean-blue hover:bg-ocean-blue/10 block rounded-md px-3 py-2 text-base font-medium"
                >
                  + Contribute to Archive
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
