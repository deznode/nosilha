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
        "flex h-14 shrink-0 items-center justify-between border-b border-hairline bg-surface px-4"
      )}
    >
      {/* Left: Hamburger (mobile only) */}
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center rounded-button p-2 text-muted transition-colors hover:bg-surface-alt hover:text-body lg:hidden"
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
        <Avatar
          size="sm"
          initials={initials}
          alt={user?.email ?? "User"}
        />
      </div>
    </header>
  );
}
