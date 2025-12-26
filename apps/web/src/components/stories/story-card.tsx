"use client";

import { MapPin, User, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { StorySubmission } from "@/types/story";

interface StoryCardProps {
  story: StorySubmission;
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <div className="group flex flex-col rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <div className="flex-grow p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold tracking-wider text-slate-500 uppercase dark:bg-slate-700 dark:text-slate-400">
            {story.type}
          </span>
          {story.location && (
            <span className="flex items-center text-xs text-slate-400 dark:text-slate-500">
              <MapPin size={12} className="mr-1" /> {story.location}
            </span>
          )}
        </div>

        <h3 className="mb-3 font-serif text-xl font-bold text-slate-900 transition-colors group-hover:text-[var(--color-ocean-blue)] dark:text-white">
          {story.title}
        </h3>

        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {story.content}
        </p>

        <div className="mt-auto flex items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
          <span className="flex items-center">
            <User size={12} className="mr-1" /> {story.author}
          </span>
          <span className="flex items-center">
            <Calendar size={12} className="mr-1" /> {story.submittedAt}
          </span>
        </div>
      </div>
      <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-700 dark:bg-slate-700/50">
        <Link
          href={`/stories/${story.slug}`}
          className="flex items-center text-sm font-medium text-[var(--color-ocean-blue)] transition-colors hover:text-blue-800"
        >
          Read Story <ArrowRight size={14} className="ml-1" />
        </Link>
      </div>
    </div>
  );
}
