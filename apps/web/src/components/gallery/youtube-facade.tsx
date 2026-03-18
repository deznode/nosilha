"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { MediaItem } from "@/types/media";

/** Ref type for the "currently playing" deactivation callback. */
export type DeactivateRef = React.MutableRefObject<(() => void) | null>;

interface YouTubeFacadeProps {
  video: MediaItem;
  /** When true, starts in activated (iframe) state immediately */
  autoPlay?: boolean;
  /** Shared ref for single-video-at-a-time enforcement (scoped to parent) */
  deactivateRef?: DeactivateRef;
}

export function YouTubeFacade({
  video,
  autoPlay,
  deactivateRef,
}: YouTubeFacadeProps) {
  const [activated, setActivated] = useState(!!autoPlay);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // One-shot guard: prevents Strict Mode's simulated unmount from
  // resetting activated state when autoPlay initialized it.
  // Only skips the iframe pause — deactivateRef cleanup still runs.
  const autoPlayGuardRef = useRef(!!autoPlay);

  const deactivate = useCallback(() => setActivated(false), []);

  const handlePlay = useCallback(() => {
    deactivateRef?.current?.();
    if (deactivateRef) deactivateRef.current = deactivate;
    setActivated(true);
  }, [deactivateRef, deactivate]);

  const thumbnailUrl = video.thumbnailUrl || "/images/video-placeholder.jpg";
  const iframeSrc = video.url
    ? video.url +
      (video.url.includes("?") ? "&" : "?") +
      "autoplay=1&enablejsapi=1"
    : "";

  useLayoutEffect(() => {
    if (!activated) return;
    // Register as the currently playing facade
    if (deactivateRef) deactivateRef.current = deactivate;
    const iframe = iframeRef.current;
    return () => {
      // Clear our registration if we still own the ref
      if (deactivateRef?.current === deactivate) {
        deactivateRef.current = null;
      }
      // Skip iframe pause on first unmount when autoPlay was the source
      // (Strict Mode double-mount). Subsequent cleanups proceed normally.
      if (autoPlayGuardRef.current) {
        autoPlayGuardRef.current = false;
        return;
      }
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo", args: "" }),
          "https://www.youtube.com"
        );
      }
      setActivated(false);
    };
  }, [activated, deactivate, deactivateRef]);

  if (activated) {
    return (
      <div className="relative bg-black pb-[56.25%]">
        <iframe
          ref={iframeRef}
          className="absolute top-0 left-0 h-full w-full"
          src={iframeSrc}
          title={video.title || "Video player"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="group/facade relative overflow-hidden bg-black pb-[56.25%]">
      <Image
        src={thumbnailUrl}
        alt={video.title || "Video thumbnail"}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-500 group-hover/facade:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover/facade:bg-black/40" />
      <button
        onClick={handlePlay}
        aria-label={`Play ${video.title || "video"}`}
        className="absolute inset-0 flex cursor-pointer items-center justify-center focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
      >
        <span className="shadow-elevated bg-bougainvillea-pink flex h-16 w-16 items-center justify-center rounded-full text-white transition-transform duration-300 group-hover/facade:scale-110">
          <Play size={28} className="ml-1" />
        </span>
      </button>
    </div>
  );
}
