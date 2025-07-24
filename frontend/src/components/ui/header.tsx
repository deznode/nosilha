"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

import { NosilhaLogo } from "./logo";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/catalyst-ui/button";
import { ThemeToggle } from "./theme-toggle";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Restaurants", href: "/directory/restaurant" },
  { name: "Landmarks", href: "/directory/landmark" },
  { name: "Beaches", href: "/directory/beach" },
  { name: "Map", href: "/map" },
];

export function Header() {
  const { session, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <Disclosure
      as="nav"
      className="sticky top-0 z-50 border-b border-border-primary bg-background-primary/80 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="mr-2 flex items-center md:hidden">
              <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-text-secondary hover:bg-background-secondary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ocean-blue">
                <span className="sr-only">Open main menu</span>
                <Bars3Icon className="block h-6 w-6 group-data-open:hidden" />
                <XMarkIcon className="hidden h-6 w-6 group-data-open:block" />
              </DisclosureButton>
            </div>
            <div className="flex shrink-0 items-center">
              <Link href="/">
                <NosilhaLogo />
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium",
                    pathname === item.href
                      ? "border-ocean-blue text-text-primary"
                      : "border-transparent text-text-secondary hover:border-border-primary hover:text-text-primary"
                  )}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden items-center md:flex">
            <div className="shrink-0">
              <Link
                href="/contribute"
                className="relative inline-flex items-center gap-x-1.5 rounded-md bg-ocean-blue px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-ocean-blue/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-blue"
              >
                <PlusIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                Contribute
              </Link>
            </div>
            {/* Admin-only Add Entry button */}
            {user?.role === 'ADMIN' && (
              <div className="ml-2 shrink-0">
                <Link
                  href="/add-entry"
                  className="relative inline-flex items-center gap-x-1.5 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                  <PlusIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                  Add Entry
                </Link>
              </div>
            )}
            <div className="ml-4 flex items-center gap-x-4">
              <ThemeToggle />
              {session ? (
                <>
                  <span className="text-sm text-text-secondary">
                    {session.user.email}
                  </span>
                  <Button onClick={handleLogout} plain>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-text-primary hover:text-ocean-blue"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="text-sm font-semibold text-text-primary hover:text-ocean-blue"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center md:hidden">
            {/* This is a placeholder for the mobile menu button, which is now on the left */}
          </div>
        </div>
      </div>

      <DisclosurePanel className="md:hidden bg-background-primary">
        <div className="space-y-1 pb-3 pt-2">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              className={clsx(
                "block border-l-4 py-2 pl-3 pr-4 text-base font-medium",
                pathname === item.href
                  ? "border-ocean-blue bg-blue-50 dark:bg-blue-900/50 text-ocean-blue dark:text-blue-300"
                  : "border-transparent text-text-secondary hover:border-border-primary hover:bg-background-secondary"
              )}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
        <div className="border-t border-border-primary pb-3 pt-4">
          <div className="px-2 space-y-1">
            {session ? (
              <>
                <div className="px-3 py-2">
                  <p className="text-base font-medium text-text-primary">
                    Signed in as
                  </p>
                  <p className="font-medium text-text-secondary">
                    {session.user.email}
                  </p>
                </div>
                <DisclosureButton
                  as="button"
                  onClick={handleLogout}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-text-secondary hover:bg-background-secondary"
                >
                  Logout
                </DisclosureButton>
              </>
            ) : (
              <>
                <DisclosureButton
                  as="a"
                  href="/login"
                  className="block rounded-md px-3 py-2 text-base font-medium text-text-secondary hover:bg-background-secondary"
                >
                  Log in
                </DisclosureButton>
                <DisclosureButton
                  as="a"
                  href="/signup"
                  className="block rounded-md px-3 py-2 text-base font-medium text-text-secondary hover:bg-background-secondary"
                >
                  Sign up
                </DisclosureButton>
              </>
            )}
          </div>
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}
