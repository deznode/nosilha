"use client";

import clsx from "clsx";
import { Menu } from "lucide-react";
import { useUiStore } from "@/stores/uiStore";
import { useUser } from "@/stores/authStore";
import { SystemStatusBadges } from "@/components/admin/system-status-badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar } from "@/components/ui/avatar";

export function AdminTopBar() {
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const user = useUser();

  const initials = user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header
      className={clsx(
        "border-hairline bg-surface flex h-14 shrink-0 items-center justify-between border-b px-4"
      )}
    >
      {/* Left: Hamburger (mobile only) */}
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="rounded-button text-muted hover:bg-surface-alt hover:text-body flex items-center justify-center p-2 transition-colors lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right: Status, Theme, User */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex">
          <SystemStatusBadges />
        </div>
        <ThemeToggle showContainer />
        <Avatar size="sm" initials={initials} alt={user?.email ?? "User"} />
      </div>
    </header>
  );
}
