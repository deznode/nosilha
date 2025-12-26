"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { BookmarkButton } from "./bookmark-button";
import type { DirectoryEntry } from "@/types/directory";

interface ListViewCardProps {
  entry: DirectoryEntry;
  /** Whether to show the bookmark button (default: true) */
  showBookmark?: boolean;
}

export function ListViewCard({
  entry,
  showBookmark = true,
}: ListViewCardProps) {
  return (
    <Link href={`/directory/entry/${entry.slug}`} className="group block">
      <div className="flex h-48 flex-row overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
        {/* Image */}
        <div className="relative w-1/3 overflow-hidden">
          {entry.imageUrl ? (
            <Image
              src={entry.imageUrl}
              alt={entry.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-200 dark:bg-slate-700">
              <span className="text-slate-400 dark:text-slate-500">
                No image
              </span>
            </div>
          )}
          {showBookmark && (
            <div className="absolute top-2 right-2">
              <BookmarkButton entryId={entry.id} />
            </div>
          )}
          <div className="absolute top-2 left-2">
            <span className="rounded bg-slate-900/80 px-2 py-1 text-xs text-white backdrop-blur-sm">
              {entry.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex w-2/3 flex-col justify-between p-5">
          <div>
            <div className="mb-1 flex items-start justify-between">
              <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-[var(--color-ocean-blue)] dark:text-white">
                {entry.name}
              </h3>
              <div className="flex items-center rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs font-medium text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                <Star
                  size={12}
                  className="mr-1 fill-current text-[var(--color-sunny)]"
                />
                {entry.rating}
              </div>
            </div>

            <div className="mb-3 flex items-center text-sm text-slate-500 dark:text-slate-400">
              <MapPin size={14} className="mr-1" />
              {entry.town}
            </div>

            <p className="line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {entry.description}
            </p>
          </div>

          {entry.tags && entry.tags.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-2">
              {entry.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
