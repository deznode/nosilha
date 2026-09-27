"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { clsx } from "clsx";
import { useReducedMotion } from "framer-motion";

import { usePointerFine } from "@/hooks/use-pointer-fine";
import {
  photoCaption,
  photoHeading,
  type ArchivePhoto,
} from "@/lib/archive-photographs";

import { preloadImages, stageImageProps, useCrossfade } from "./use-crossfade";
import { ZOOM_SCALE, useStageGestures } from "./use-stage-gestures";

const CURVE = "var(--ease-archive)";
const CHROME_IDLE_MS = 2800;

/**
 * The viewing room's stage. Spec 038 FR-021, FR-023, FR-025.
 *
 * Owns what happens on the photograph: the crossfade, drag, zoom, in-page full screen
 * and the keyboard. The page around it owns which photograph is current.
 */
export function ViewerStage({
  photo,
  neighbours,
  position,
  total,
  placeLabel,
  panelOpen,
  onTogglePanel,
  onStep,
  onBack,
  onFullScreenChange,
  keysDisabled,
}: {
  photo: ArchivePhoto;
  /** The previous and next photographs, preloaded after each change. */
  neighbours: readonly ArchivePhoto[];
  /** 1-based position within the current place filter. */
  position: number;
  total: number;
  /** The place filter's name; empty under All. */
  placeLabel: string;
  panelOpen: boolean;
  onTogglePanel: () => void;
  onStep: (dir: 1 | -1) => void;
  onBack: () => void;
  /** Lets the page make everything behind full screen inert. */
  onFullScreenChange?: (fullScreen: boolean) => void;
  /** True while the identify sheet is open: keys belong to it. */
  keysDisabled: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const pointerFine = usePointerFine();
  const [fullScreen, setFullScreen] = useState(false);
  const [chromeAwake, setChromeAwake] = useState(true);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { layers, front, shownId } = useCrossfade(photo);

  const clearIdle = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = null;
  };

  /** Shows the chrome and, in full screen, restarts its fade-out. */
  const showChrome = (fading: boolean) => {
    clearIdle();
    setChromeAwake(true);
    if (fading) {
      idleTimer.current = setTimeout(
        () => setChromeAwake(false),
        CHROME_IDLE_MS
      );
    }
  };

  /** Pointer movement brings full-screen chrome back and restarts its fade-out. */
  const wake = () => {
    if (fullScreen) showChrome(true);
  };

  // With nowhere to step, a released swipe snaps back instead.
  const stepOrSnap = (dir: 1 | -1) =>
    total > 1 ? onStep(dir) : gestures.resetGestures();
  const gestures = useStageGestures({ onStep: stepOrSnap, onActivity: wake });
  const { zoomed, resetGestures, setZoomed, toggleZoom } = gestures;

  const toggleFullScreen = useCallback(() => {
    setFullScreen((fs) => !fs);
  }, []);

  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    onFullScreenChange?.(fullScreen);
    if (fullScreen) closeRef.current?.focus();
  }, [fullScreen, onFullScreenChange]);

  // Entering full screen starts the idle fade; leaving it shows the chrome for good.
  useEffect(() => {
    showChrome(fullScreen);
    return clearIdle;
    // Runs on the full-screen change only; the helpers read nothing else.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullScreen]);

  // A new photograph on screen: back to fit, no drag, and warm the neighbours.
  useEffect(() => {
    resetGestures();
    preloadImages(neighbours);
    // Neighbours follow the shown photograph; their identity changes every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shownId, resetGestures]);

  // Keyboard (FR-024). An effect event reads the latest props and state, so the
  // listener is attached once, re-attached on every Activity restore, removed on hide.
  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (keysDisabled) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest?.("input, textarea, select, [contenteditable]")) {
      return;
    }
    wake();
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        onStep(1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        onStep(-1);
        break;
      case "Escape":
        if (fullScreen) setFullScreen(false);
        else if (zoomed) setZoomed(false);
        else onBack();
        break;
      case "f":
      case "F":
        toggleFullScreen();
        break;
      case "i":
      case "I":
        onTogglePanel();
        break;
    }
  });
  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const chromeVisible = !fullScreen || chromeAwake;
  const counter = [
    `${position} of ${total}`,
    placeLabel || null,
    pointerFine ? "← → to move · Esc to go back" : "swipe to move",
  ]
    .filter(Boolean)
    .join(" · ");
  const heading = photoHeading(photo);
  const caption = photoCaption(photo);
  const transition = reduceMotion
    ? "none"
    : gestures.dragging
      ? `opacity .34s ${CURVE}`
      : `opacity .34s ${CURVE}, transform .3s ${CURVE}`;

  return (
    <div
      role="region"
      aria-label="Photograph"
      className={clsx(
        "touch-none overflow-hidden select-none",
        fullScreen
          ? "fixed inset-0 z-[200] bg-[#050404]"
          : "bg-stage relative h-[calc((100dvh-var(--chrome-top-bar-height))*0.64)] md:h-full md:min-w-0 md:flex-1",
        zoomed
          ? "cursor-zoom-out"
          : gestures.dragging
            ? "cursor-grabbing"
            : "cursor-grab"
      )}
      {...gestures.handlers}
    >
      <div
        className={clsx(
          "absolute",
          fullScreen
            ? "inset-0"
            : "inset-0 md:top-7 md:right-20 md:bottom-[60px] md:left-20"
        )}
      >
        {layers.map((layer, i) => {
          const isFront = i === front;
          // The first layer holds the photograph the page was opened on: the LCP.
          const props = layer ? stageImageProps(layer, i === 0) : null;
          return (
            <div
              key={i}
              aria-hidden={!isFront}
              className="absolute inset-0"
              style={{
                opacity: isFront ? 1 : 0,
                transform: isFront
                  ? zoomed
                    ? `scale(${ZOOM_SCALE})`
                    : `translateX(${gestures.dragX}px)`
                  : "none",
                transformOrigin: gestures.origin,
                transition,
              }}
            >
              {props && (
                // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- getImageProps supplies alt and srcset
                <img
                  {...props}
                  draggable={false}
                  className="pointer-events-none object-contain"
                />
              )}
            </div>
          );
        })}
      </div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: chromeVisible ? 1 : 0,
          transition: reduceMotion ? "none" : `opacity .26s ${CURVE}`,
        }}
      >
        {fullScreen && (
          <button
            ref={closeRef}
            type="button"
            onClick={() => setFullScreen(false)}
            className="dark-pill pointer-events-auto absolute top-3.5 left-3.5 inline-flex !px-3.5"
          >
            ✕ Close
          </button>
        )}

        <div className="pointer-events-auto absolute top-3.5 right-3.5 flex gap-1.5">
          {!fullScreen && (
            <button
              type="button"
              onClick={onTogglePanel}
              aria-pressed={panelOpen}
              className="dark-pill hidden md:inline-flex"
            >
              {panelOpen ? "Hide details" : "Details"}
            </button>
          )}
          <button
            type="button"
            onClick={toggleZoom}
            aria-pressed={zoomed}
            className="dark-pill inline-flex"
          >
            {zoomed ? "Fit" : "Zoom"}
          </button>
          <button
            type="button"
            onClick={toggleFullScreen}
            aria-pressed={fullScreen}
            className="dark-pill inline-flex"
          >
            {fullScreen ? "Exit full screen" : "Full screen"}
          </button>
        </div>

        {total > 1 && (
          <>
            <StepArrow
              side="left"
              label="Previous photograph"
              onClick={() => onStep(-1)}
            >
              ←
            </StepArrow>
            <StepArrow
              side="right"
              label="Next photograph"
              onClick={() => onStep(1)}
            >
              →
            </StepArrow>
          </>
        )}

        <div className="absolute inset-x-0 bottom-4 flex justify-center px-4">
          <span
            aria-live="polite"
            className="text-stage-fg-2 rounded-full px-3 py-[5px] text-center text-xs"
            style={{
              background: "color-mix(in srgb, var(--stage) 72%, transparent)",
            }}
          >
            {counter}
          </span>
        </div>

        {!panelOpen && !fullScreen && (
          <div
            className="absolute bottom-[54px] left-5 hidden max-w-[460px] flex-col gap-1 rounded-xl px-4 py-3 text-[#F6F1E9] backdrop-blur-[10px] md:flex"
            style={{ background: "rgba(12,10,8,.55)" }}
          >
            <span className="font-serif text-xl leading-[1.2]">{heading}</span>
            {caption && (
              <span className="text-[13px] leading-normal opacity-[.88]">
                {caption}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StepArrow({
  side,
  label,
  onClick,
  children,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={clsx(
        "pointer-events-auto absolute top-1/2 hidden h-[46px] w-[46px] -translate-y-1/2 items-center justify-center rounded-full border text-[17px] text-[#F6F1E9] backdrop-blur-[8px] transition-colors md:flex",
        "border-white/16 bg-[rgba(12,10,8,.45)] hover:bg-[rgba(12,10,8,.7)]",
        side === "left" ? "left-4" : "right-4"
      )}
    >
      {children}
    </button>
  );
}
