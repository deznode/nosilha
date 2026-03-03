"use client";

import { FileText, Bookmark, Settings } from "lucide-react";

export type ProfileTabType = "activity" | "saved" | "settings";

interface ProfileTabsProps {
  activeTab: ProfileTabType;
  onTabChange: (tab: ProfileTabType) => void;
}

const TABS: { id: ProfileTabType; label: string; icon: React.ReactNode }[] = [
  { id: "activity", label: "My Activity", icon: <FileText size={16} /> },
  { id: "saved", label: "Saved Places", icon: <Bookmark size={16} /> },
  { id: "settings", label: "Settings", icon: <Settings size={16} /> },
];

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <nav className="-mb-px flex">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-1 py-4 text-center text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-[var(--color-ocean-blue)] text-[var(--color-ocean-blue)]"
                : "border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
