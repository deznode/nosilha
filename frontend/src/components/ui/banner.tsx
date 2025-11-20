"use client";

import { XMarkIcon } from "@heroicons/react/20/solid";
import { useState } from "react";

export interface BannerProps {
  title: string;
  message: string;
  linkUrl?: string;
  onDismiss?: () => void;
  showDismissButton?: boolean;
  tone?: "default" | "high-contrast";
}

export default function Banner({
  title,
  message,
  linkUrl,
  onDismiss,
  showDismissButton = true,
  tone = "default",
}: BannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) {
    return null;
  }

  const content = (
    <>
      <span aria-hidden="true">🇨🇻 ⚽</span>{" "}
      <strong className="font-semibold">{title}</strong>
      <svg
        viewBox="0 0 2 2"
        aria-hidden="true"
        className="mx-2 inline size-0.5 fill-current"
      >
        <circle r={1} cx={1} cy={1} />
      </svg>
      {message}&nbsp;
      {linkUrl && <span aria-hidden="true">&rarr;</span>}{" "}
      <span aria-hidden="true">✨</span>
    </>
  );

  const baseClasses =
    tone === "high-contrast"
      ? "bg-black text-white"
      : "bg-gray-50 text-gray-900 dark:bg-gray-800/50 dark:text-gray-100";

  const linkClasses =
    tone === "high-contrast"
      ? "text-white underline-offset-2 hover:text-valley-green focus-visible:outline-white focus-visible:outline-2 focus-visible:outline-offset-2"
      : "hover:text-gray-600 dark:hover:text-white";

  const dismissIconClasses =
    tone === "high-contrast"
      ? "text-white hover:text-valley-green"
      : "text-gray-900 dark:text-gray-400 dark:hover:text-gray-300";

  return (
    <div
      className={`relative isolate flex items-center gap-x-4 overflow-hidden px-3.5 py-2 sm:px-4 sm:py-2.5 sm:before:flex-1 lg:px-6 lg:py-3 ${baseClasses}`}
    >
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-[max(-7rem,calc(50%-52rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl"
      >
        <div
          style={{
            clipPath:
              "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
          }}
          className={`aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#D90368] to-[#005A8D] ${
            tone === "high-contrast"
              ? "opacity-80"
              : "opacity-50 dark:opacity-60"
          }`}
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-[max(45rem,calc(50%+8rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl"
      >
        <div
          style={{
            clipPath:
              "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
          }}
          className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#D90368] to-[#005A8D] opacity-50 dark:opacity-60"
        />
      </div>
      <p className="text-xs/5 sm:text-sm/6">
        {linkUrl ? (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClasses}
          >
            {content}
          </a>
        ) : (
          content
        )}
      </p>
      {showDismissButton && (
        <div className="flex flex-1 justify-end">
          <button
            type="button"
            onClick={handleDismiss}
            className="-m-3 p-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
            aria-label="Dismiss banner"
          >
            <span className="sr-only">Dismiss</span>
            <XMarkIcon
              aria-hidden="true"
              className={`size-5 ${dismissIconClasses}`}
            />
          </button>
        </div>
      )}
    </div>
  );
}
