"use client";

import { MapPin, User, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { StorySubmission } from "@/types/story";

interface StoryCardProps {
  story: StorySubmission;
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <div className="group border-hairline bg-surface rounded-card shadow-subtle ease-calm hover:shadow-lift flex flex-col transition-all duration-200 hover:-translate-y-1">
      <div className="flex-grow p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="bg-surface-alt text-muted rounded-badge px-2 py-1 text-xs font-bold tracking-wider uppercase">
            {story.type}
          </span>
          {story.location && (
            <span className="text-muted flex items-center text-xs">
              <MapPin size={12} className="mr-1" /> {story.location}
            </span>
          )}
        </div>

        <h3 className="text-body group-hover:text-ocean-blue mb-3 font-serif text-xl font-bold transition-colors">
          {story.title}
        </h3>

        <p className="text-muted mb-4 line-clamp-3 text-sm leading-relaxed">
          {story.content}
        </p>

        <div className="border-hairline text-muted mt-auto flex items-center gap-4 border-t pt-4 text-xs">
          <span className="flex items-center">
            <User size={12} className="mr-1" /> {story.author}
          </span>
          <span className="flex items-center">
            <Calendar size={12} className="mr-1" /> {story.submittedAt}
          </span>
        </div>
      </div>
      <div className="border-hairline bg-surface-alt flex justify-end border-t px-6 py-3">
        <Link
          href={`/stories/${story.slug}`}
          className="text-ocean-blue hover:text-ocean-blue-deep flex items-center text-sm font-medium transition-colors"
        >
          Read Story <ArrowRight size={14} className="ml-1" />
        </Link>
      </div>
    </div>
  );
}
