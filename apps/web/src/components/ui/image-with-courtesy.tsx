"use client";

import Image from "next/image";
import { Info } from "lucide-react";
import { useState } from "react";

// Extracted outside component to prevent state reset on re-render
function ImagePlaceholder({
  width,
  height,
  isCircular,
}: {
  width?: number | string;
  height?: number | string;
  isCircular?: boolean;
}) {
  return (
    <div
      className={`bg-surface flex items-center justify-center ${isCircular ? "rounded-full" : "rounded-button"}`}
      style={{ width: width || "100%", height: height || "100%" }}
    >
      <div className="p-4 text-center">
        <Info className="text-muted mx-auto mb-2 h-8 w-8" />
        <p className="text-muted text-xs">Image not available</p>
      </div>
    </div>
  );
}

type ImageWithCourtesyProps = {
  src: string;
  alt: string;
  courtesy?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  variant?: "large" | "small" | "icon" | "auto";
  showTooltip?: boolean;
  iconPosition?: "bottom-right" | "top-right" | "bottom-left";
  tooltipPosition?:
    | "auto"
    | "top-left"
    | "top-right"
    | "top-center"
    | "bottom-left"
    | "bottom-right"
    | "left"
    | "right";
  tooltipAlignment?: "start" | "center" | "end";
  sizes?: string;
  priority?: boolean;
};

export function ImageWithCourtesy({
  src,
  alt,
  courtesy,
  className,
  fill = false,
  width,
  height,
  variant = "large",
  showTooltip = true,
  iconPosition = "bottom-right",
  tooltipPosition = "auto",
  tooltipAlignment: _tooltipAlignment = "center",
  sizes,
  priority = false,
}: ImageWithCourtesyProps) {
  const [imageError, setImageError] = useState(false);
  const imageProps = fill
    ? { fill, sizes, priority }
    : { width, height, sizes };

  // Auto-detect variant based on size if variant is "auto"
  const effectiveVariant =
    variant === "auto"
      ? (width && width <= 150) || (height && height <= 150)
        ? "icon"
        : "large"
      : variant;

  // Helper function to extract className for circular images
  const isCircular = className?.includes("rounded-full");
  const cleanClassName = isCircular
    ? className?.replace("rounded-full", "").trim()
    : className;

  // Icon positioning classes
  const iconPositionClasses = {
    "bottom-right": "bottom-1 right-1",
    "top-right": "top-1 right-1",
    "bottom-left": "bottom-1 left-1",
  };

  // Smart tooltip positioning logic
  const getTooltipPositionClasses = (position: string, iconPos: string) => {
    const baseClasses =
      "absolute px-2 py-1 bg-surface-alt/95 text-body text-xs rounded-button opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap backdrop-blur-sm z-10 pointer-events-none";

    // Auto-detect optimal position based on icon placement and context
    if (position === "auto") {
      // For left-side images (common in people page), show tooltip to the right
      // For centered images, show above
      switch (iconPos) {
        case "bottom-right":
          return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`; // Right side
        case "top-right":
          return `${baseClasses} bottom-full right-0 mb-2`; // Above, right-aligned
        case "bottom-left":
          return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`; // Left side
        default:
          return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`; // Above, centered
      }
    }

    // Explicit positioning
    const positionClasses: Record<string, string> = {
      "top-left": "bottom-full left-0 mb-2",
      "top-right": "bottom-full right-0 mb-2",
      "top-center": "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
      "bottom-left": "top-full left-0 mt-2",
      "bottom-right": "top-full right-0 mt-2",
      left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
      right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
    };

    return `${baseClasses} ${positionClasses[position] || positionClasses["top-right"]}`;
  };

  if (effectiveVariant === "icon") {
    // For icon variant: minimal visual impact with hover tooltip
    return (
      <div className="group relative">
        <div
          className={`bg-surface relative overflow-hidden ${isCircular ? "rounded-full" : ""}`}
          style={{ width: width || 112, height: height || 112 }}
        >
          {imageError ? (
            <ImagePlaceholder
              width={width || 112}
              height={height || 112}
              isCircular={isCircular}
            />
          ) : (
            <Image
              src={src}
              alt={alt}
              className={cleanClassName}
              onError={() => setImageError(true)}
              {...imageProps}
            />
          )}
        </div>
        {courtesy && (
          <>
            {/* Info icon indicator */}
            <div
              className={`absolute ${iconPositionClasses[iconPosition]} bg-canvas/90 shadow-subtle flex h-5 w-5 items-center justify-center rounded-full`}
            >
              <Info className="text-muted h-3 w-3" />
            </div>

            {/* Tooltip on hover */}
            {showTooltip && (
              <div
                className={getTooltipPositionClasses(
                  tooltipPosition,
                  iconPosition
                )}
              >
                Courtesy of: {courtesy}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  if (effectiveVariant === "small") {
    // For small images: proper container to maintain circular shape
    return (
      <div className="flex flex-col items-center">
        <div
          className={`bg-surface relative flex-shrink-0 overflow-hidden ${isCircular ? "rounded-full" : ""}`}
          style={{ width: width || 112, height: height || 112 }}
        >
          {imageError ? (
            <ImagePlaceholder
              width={width || 112}
              height={height || 112}
              isCircular={isCircular}
            />
          ) : (
            <Image
              src={src}
              alt={alt}
              className={cleanClassName}
              onError={() => setImageError(true)}
              {...imageProps}
            />
          )}
        </div>
        {courtesy && (
          <div className="mt-2 max-w-[120px] text-center">
            <p className="text-muted font-sans text-xs leading-tight">
              Courtesy of: {courtesy}
            </p>
          </div>
        )}
      </div>
    );
  }

  // For large images: use design system colors for dark mode support
  return (
    <div className="relative h-full w-full">
      {imageError ? (
        <ImagePlaceholder isCircular={isCircular} />
      ) : (
        <Image
          src={src}
          alt={alt}
          className={className}
          onError={() => setImageError(true)}
          {...imageProps}
        />
      )}
      {courtesy && (
        <div className="bg-surface-alt/90 text-body rounded-tl-button absolute right-0 bottom-0 px-2 py-1 backdrop-blur-sm">
          <p className="font-sans text-xs">Courtesy of: {courtesy}</p>
        </div>
      )}
    </div>
  );
}
