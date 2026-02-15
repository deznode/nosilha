import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Mail,
  MapPin,
  Image,
  Sparkles,
  HardDrive,
  Languages,
  Wrench,
} from "lucide-react";

export type NavSection = "main" | "content" | "tools" | "dev";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  section: NavSection;
  disabled?: boolean;
  exact?: boolean;
}

export interface AdminNavSectionConfig {
  id: NavSection;
  label: string;
}

export const adminNavSections: AdminNavSectionConfig[] = [
  { id: "main", label: "" },
  { id: "content", label: "Content" },
  { id: "tools", label: "Tools" },
  { id: "dev", label: "Development" },
];

export const adminNavItems: AdminNavItem[] = [
  // Main
  {
    label: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    section: "main",
    exact: true,
  },

  // Content (disabled until Phase 2)
  {
    label: "Suggestions",
    href: "/admin/suggestions",
    icon: MessageSquare,
    section: "content",
    disabled: true,
  },
  {
    label: "Stories",
    href: "/admin/stories",
    icon: FileText,
    section: "content",
    disabled: true,
  },
  {
    label: "Inquiries",
    href: "/admin/inquiries",
    icon: Mail,
    section: "content",
    disabled: true,
  },
  {
    label: "Directory Queue",
    href: "/admin/directory-queue",
    icon: MapPin,
    section: "content",
    disabled: true,
  },
  {
    label: "Gallery Queue",
    href: "/admin/gallery-queue",
    icon: Image,
    section: "content",
    disabled: true,
  },
  {
    label: "AI Review",
    href: "/admin/ai-review",
    icon: Sparkles,
    section: "content",
    disabled: true,
  },

  // Tools
  {
    label: "Storage",
    href: "/admin/storage",
    icon: HardDrive,
    section: "tools",
  },
  {
    label: "Translations",
    href: "/admin/translations",
    icon: Languages,
    section: "tools",
  },

  // Development
  {
    label: "Dev Tools",
    href: "/admin/dev-tools",
    icon: Wrench,
    section: "dev",
  },
];
