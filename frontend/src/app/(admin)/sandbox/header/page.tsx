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
  Globe,
  UserCircle,
  Plus,
  ChevronDown,
  Check,
  Moon,
} from "lucide-react";
import clsx from "clsx";

/* !!! IMPORTANT FOR PRODUCTION !!!
  Uncomment the following lines when using in your actual Next.js app.
  I have commented them out to make this preview work without errors.
*/
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { NosilhaLogo } from "./logo";
// import { useAuth } from "@/components/providers/auth-provider";
// import { supabase } from "@/lib/supabase-client";
// import { ThemeToggle } from "./theme-toggle";

/* --- START: TEMPORARY MOCKS FOR PREVIEW (DELETE IN PRODUCTION) --- */
const Link = ({ href, children, className, ...props }: any) => (
  <a href={href} className={className} {...props}>
    {children}
  </a>
);
const usePathname = () => "/"; // Simulating Home Page
const useRouter = () => ({ push: (_url: string) => Promise.resolve(true), refresh: () => {} });
const useAuth = () => ({
  session: { user: { email: "demo@example.com" } },
  user: { role: "ADMIN" },
});
const supabase = { auth: { signOut: async () => {} } };

const NosilhaLogo = ({ showSubtitle }: { showSubtitle?: boolean }) => (
  <div className="flex flex-col">
    {/* Added stronger drop shadow to Logo to stand out against the sky */}
    <span className="font-serif text-2xl font-bold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
      Nos<span className="text-amber-400">Ilha</span>
    </span>
    {showSubtitle && (
      <span className="text-[0.6rem] font-medium tracking-[0.2em] text-white/90 uppercase drop-shadow-md">
        Ilha das Flores
      </span>
    )}
  </div>
);

const ThemeToggle = () => (
  <button className="rounded-full p-2 text-white drop-shadow-md transition-colors hover:bg-white/10">
    <Moon size={20} />
  </button>
);
/* --- END: TEMPORARY MOCKS --- */

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

  // Scroll detection - trigger solid background earlier for better contrast
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
  // We also add a text shadow and a gradient background (scrim) to ensure readability.
  const isTransparent = pathname === "/" && !scrolled;

  // REFACTORED: Text color logic for better contrast
  // Added `drop-shadow-md` to ensure text pops against white clouds/waves
  const textColorClass = isTransparent
    ? "text-white drop-shadow-md hover:text-white/80"
    : "text-text-secondary hover:text-ocean-blue";

  // REFACTORED: Border logic
  const activeLinkClass = isTransparent
    ? "border-white text-white drop-shadow-md"
    : "border-ocean-blue text-ocean-blue";

  // REFACTORED: Icon logic
  const iconClass = isTransparent
    ? "text-white drop-shadow-md hover:text-white hover:bg-white/10"
    : "text-text-secondary hover:text-ocean-blue hover:bg-background-secondary";

  return (
    <Disclosure
      as="nav"
      className={clsx(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ease-in-out",
        scrolled
          ? "border-border-primary/50 bg-background-primary/95 dark:bg-background-primary/90 py-0 shadow-sm backdrop-blur-md dark:border-white/10" // Solid background when scrolled
          : "border-transparent bg-gradient-to-b from-black/60 to-transparent py-4", // "Scrim": 60% black at top, fading to clear. Preserves image visibility.
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
                    {/* Render the Logo */}
                    {/* Note: I removed the dark background blur behind the logo to keep the sky/image cleaner */}
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
                          "inline-flex min-h-[44px] items-center border-b-2 px-2 text-sm font-semibold transition-colors duration-200",
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
                                "group inline-flex min-h-[44px] items-center border-b-2 px-2 text-sm font-semibold transition-colors duration-200 outline-none",
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
                                    ? "text-white/90 drop-shadow-md"
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
                              {/* DROPDOWNS: Always solid background for readability */}
                              <PopoverPanel className="absolute left-1/2 z-10 mt-3 w-screen max-w-xs -translate-x-1/2 transform px-2 sm:px-0">
                                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
                                  <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8 dark:bg-stone-900">
                                    {item.items?.map((subItem) => (
                                      <Link
                                        key={subItem.name}
                                        href={subItem.href}
                                        className="-m-3 flex items-start rounded-lg p-3 transition duration-150 ease-in-out hover:bg-stone-100 dark:hover:bg-stone-800"
                                      >
                                        <subItem.icon
                                          className="text-ocean-blue h-6 w-6 shrink-0"
                                          aria-hidden="true"
                                        />
                                        <div className="ml-4">
                                          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                                            {subItem.name}
                                          </p>
                                          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
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

              {/* Right Section: Utilities (Language, Actions, Auth) */}
              <div className="flex items-center space-x-2 md:space-x-4">
                <div className="hidden items-center space-x-3 md:flex">
                  {/* Language Selector (Desktop) */}
                  <Menu as="div" className="relative">
                    <MenuButton
                      className={clsx(
                        "flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-full text-sm font-semibold transition-colors",
                        iconClass
                      )}
                    >
                      <Globe className="h-5 w-5" />
                      <span className="hidden lg:inline">
                        {currentLang.code}
                      </span>
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
                      <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-stone-900">
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
                                    ? "cursor-not-allowed text-stone-400 opacity-50"
                                    : active
                                      ? "text-ocean-blue bg-stone-100 dark:bg-stone-800"
                                      : "text-stone-900 dark:text-stone-100",
                                  "group flex w-full items-center justify-between px-4 py-2 text-sm"
                                )}
                              >
                                <span className="flex items-center gap-2">
                                  <span>{lang.flag}</span>
                                  {lang.label}
                                  {lang.disabled && (
                                    <span className="ml-1 text-xs text-stone-400 italic">
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

                  {/* REFACTORED: Divider visibility */}
                  <div
                    className={clsx(
                      "mx-1 h-6 w-px",
                      isTransparent
                        ? "bg-white/50"
                        : "bg-stone-300 dark:bg-stone-700"
                    )}
                  />

                  <Link
                    href="/contribute"
                    className="bg-ocean-blue hover:bg-ocean-blue-light inline-flex items-center gap-x-1.5 rounded-full px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Contribute</span>
                  </Link>
                  {user?.role === "ADMIN" && (
                    <Link
                      href="/add-entry"
                      className="inline-flex items-center gap-x-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-500 transition-all hover:bg-red-50"
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
                            : "hover:text-ocean-blue hover:ring-ocean-blue/20 bg-stone-100 text-stone-500 dark:bg-stone-800"
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
                        <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-stone-200 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none dark:divide-stone-700 dark:bg-stone-900">
                          <div className="px-4 py-3">
                            <p className="text-xs text-stone-500">
                              Signed in as
                            </p>
                            <p className="mt-0.5 truncate text-sm font-bold text-stone-900 dark:text-stone-100">
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
                                      ? "text-ocean-blue bg-stone-100 dark:bg-stone-800"
                                      : "text-stone-900 dark:text-stone-100",
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
                                      ? "text-ocean-blue bg-stone-100 dark:bg-stone-800"
                                      : "text-stone-900 dark:text-stone-100",
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
                                      ? "bg-stone-100 text-red-600 dark:bg-stone-800"
                                      : "text-stone-500",
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
                    <div className="flex items-center gap-1 pl-2">
                      <Link
                        href="/login"
                        className={clsx(
                          "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors",
                          textColorClass
                        )}
                      >
                        Log in
                      </Link>
                      <Link
                        href="/signup"
                        className={clsx(
                          "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors",
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

          {/* Mobile Menu Panel */}
          <Transition
            as={Fragment}
            enter="transition duration-200 ease-out"
            enterFrom="opacity-0 -translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition duration-150 ease-in"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-2"
          >
            <DisclosurePanel className="max-h-[85vh] overflow-y-auto border-t border-stone-200 bg-white md:hidden dark:border-stone-800 dark:bg-stone-900">
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
                          : "border-transparent text-stone-500 hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900"
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
                            className="animate-slide-up group flex w-full items-center justify-between border-l-4 border-transparent py-2 pr-4 pl-3 text-base font-medium text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            {item.name}
                            <ChevronDown
                              className={clsx(
                                "h-5 w-5 flex-none text-stone-400",
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
                                className="animate-slide-up group hover:text-ocean-blue flex w-full items-center border-l-4 border-transparent py-2 pr-4 pl-10 text-sm font-medium text-stone-500 hover:bg-stone-50"
                                style={{
                                  animationDelay: `${(index + subIndex + 1) * 50}ms`,
                                }}
                              >
                                <subItem.icon className="group-hover:text-ocean-blue mr-3 h-5 w-5 flex-shrink-0 text-stone-400" />
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
            </DisclosurePanel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
}

// !!! IMPORTANT: Add default export for the previewer to work
export default Header;
