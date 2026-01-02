"use client";

import Link from "next/link";
import { Clock, Camera, Book } from "lucide-react";
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
    iconClass: "text-[var(--color-ocean-blue)]",
    hoverBorderClass: "hover:border-[var(--color-ocean-blue)]",
  },
  {
    type: StoryType.FULL,
    title: "Full Story",
    duration: "~20 minutes",
    description:
      "Write a detailed narrative. We provide templates for recipes, migration stories, and more.",
    icon: Book,
    iconBgClass: "bg-pink-50 dark:bg-pink-900/30",
    iconClass: "text-[var(--color-bougainvillea)]",
    hoverBorderClass: "hover:border-[var(--color-bougainvillea)]",
  },
];

// Photo option links to directory page (separate upload flow)
const PHOTO_OPTION = {
  title: "Photo Moment",
  duration: "~2 minutes",
  description:
    "Upload a photo of a restaurant, landmark, or view. Add a caption to give it context.",
  icon: Camera,
  iconBgClass: "bg-green-50 dark:bg-green-900/30",
  iconClass: "text-[var(--color-valley-green)]",
  hoverBorderClass: "hover:border-[var(--color-valley-green)]",
  href: "/contribute/directory",
};

export function TypeSelector({ onSelect }: TypeSelectorProps) {
  const PhotoIcon = PHOTO_OPTION.icon;

  return (
    <div className="min-h-[60vh] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-slate-900 dark:text-white">
            Share Your Story
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400">
            Every memory matters. Choose how you want to contribute to Brava's
            history.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STORY_TYPES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                onClick={() => onSelect(item.type)}
                className={`rounded-xl border-2 border-transparent bg-white p-8 shadow-sm dark:bg-slate-800 ${item.hoverBorderClass} group flex flex-col items-center text-center text-left transition-all hover:shadow-md md:items-start md:text-left`}
              >
                <div
                  className={`${item.iconBgClass} mb-6 flex h-14 w-14 items-center justify-center rounded-full transition-transform group-hover:scale-110`}
                >
                  <Icon className={`${item.iconClass} h-7 w-7`} />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mb-4 inline-block rounded bg-slate-100 px-2 py-1 text-sm font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                  {item.duration}
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  {item.description}
                </p>
              </button>
            );
          })}

          {/* Photo option links to directory page */}
          <Link
            href={PHOTO_OPTION.href}
            className={`rounded-xl border-2 border-transparent bg-white p-8 shadow-sm dark:bg-slate-800 ${PHOTO_OPTION.hoverBorderClass} group flex flex-col items-center text-center text-left transition-all hover:shadow-md md:items-start md:text-left`}
          >
            <div
              className={`${PHOTO_OPTION.iconBgClass} mb-6 flex h-14 w-14 items-center justify-center rounded-full transition-transform group-hover:scale-110`}
            >
              <PhotoIcon className={`${PHOTO_OPTION.iconClass} h-7 w-7`} />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
              {PHOTO_OPTION.title}
            </h3>
            <p className="mb-4 inline-block rounded bg-slate-100 px-2 py-1 text-sm font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
              {PHOTO_OPTION.duration}
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              {PHOTO_OPTION.description}
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
