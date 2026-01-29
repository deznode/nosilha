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
    <div className="border-hairline border-b">
      <nav className="-mb-px flex">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-1 py-4 text-center text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-ocean-blue text-ocean-blue"
                : "text-muted hover:text-body hover:border-surface-alt border-transparent"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
