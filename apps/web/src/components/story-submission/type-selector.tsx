"use client";

import { Clock, Book, FileText } from "lucide-react";
import { StoryType } from "@/types/story";

interface TypeSelectorProps {
  onSelect: (type: StoryType) => void;
}

const STORY_TYPES = [
  {
    type: StoryType.QUICK,
    title: "Quick Memory",
    duration: "~5 minutes",
    description:
      "Share a fleeting moment, a specific event, or a simple thought about the island.",
    icon: Clock,
    iconBgClass: "bg-blue-50 dark:bg-blue-900/30",
    iconClass: "text-ocean-blue",
    hoverBorderClass: "hover:border-ocean-blue",
  },
  {
    type: StoryType.FULL,
    title: "Full Story",
    duration: "~20 minutes",
    description:
      "Write a detailed narrative. We provide templates for recipes, migration stories, and more.",
    icon: Book,
    iconBgClass: "bg-pink-50 dark:bg-pink-900/30",
    iconClass: "text-bougainvillea-pink",
    hoverBorderClass: "hover:border-bougainvillea-pink",
  },
  {
    type: StoryType.GUIDED,
    title: "Guided Template",
    duration: "~15 minutes",
    description:
      "Choose from structured templates like Family History, Diaspora Journey, or Food & Recipes.",
    icon: FileText,
    iconBgClass: "bg-purple-50 dark:bg-purple-900/30",
    iconClass: "text-purple-600 dark:text-purple-400",
    hoverBorderClass: "hover:border-purple-600",
  },
];

export function TypeSelector({ onSelect }: TypeSelectorProps) {
  return (
    <div className="min-h-[60vh] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-body mb-4 font-serif text-3xl font-bold">
            Share Your Story
          </h2>
          <p className="text-muted text-lg">
            Every memory matters. Choose how you want to contribute to Brava's
            history.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STORY_TYPES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                onClick={() => onSelect(item.type)}
                className={`bg-canvas rounded-xl border-2 border-transparent p-8 shadow-sm ${item.hoverBorderClass} group flex flex-col items-center text-center text-left transition-all hover:shadow-md md:items-start md:text-left`}
              >
                <div
                  className={`${item.iconBgClass} mb-6 flex h-14 w-14 items-center justify-center rounded-full transition-transform group-hover:scale-110`}
                >
                  <Icon className={`${item.iconClass} h-7 w-7`} />
                </div>
                <h3 className="text-body mb-2 text-xl font-bold">
                  {item.title}
                </h3>
                <p className="bg-surface text-muted mb-4 inline-block rounded px-2 py-1 text-sm font-medium">
                  {item.duration}
                </p>
                <p className="text-muted">{item.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
