
import Image from "next/image";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

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
}: ImageWithCourtesyProps) {
  const imageProps = fill ? { fill } : { width, height };
  
  // Auto-detect variant based on size if variant is "auto"
  const effectiveVariant = variant === "auto" 
    ? (width && width <= 150) || (height && height <= 150) 
      ? "icon" 
      : "large"
    : variant;

  // Helper function to extract className for circular images
  const isCircular = className?.includes("rounded-full");
  const cleanClassName = isCircular 
    ? className.replace("rounded-full", "").trim()
    : className;

  // Icon positioning classes
  const iconPositionClasses = {
    "bottom-right": "bottom-1 right-1",
    "top-right": "top-1 right-1",
    "bottom-left": "bottom-1 left-1"
  };

  if (effectiveVariant === "icon") {
    // For icon variant: minimal visual impact with hover tooltip
    return (
      <div className="relative group">
        <div 
          className={`relative overflow-hidden bg-background-secondary ${isCircular ? "rounded-full" : ""}`}
          style={{ width: width || 112, height: height || 112 }}
        >
          <Image
            src={src}
            alt={alt}
            className={cleanClassName}
            {...imageProps}
          />
        </div>
        {courtesy && (
          <>
            {/* Info icon indicator */}
            <div className={`absolute ${iconPositionClasses[iconPosition]} w-5 h-5 bg-background-primary/90 rounded-full flex items-center justify-center shadow-sm`}>
              <InformationCircleIcon className="w-3 h-3 text-text-secondary" />
            </div>
            
            {/* Tooltip on hover */}
            {showTooltip && (
              <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-background-tertiary/95 text-text-primary text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap backdrop-blur-sm z-10 pointer-events-none">
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
          className={`relative flex-shrink-0 overflow-hidden bg-background-secondary ${isCircular ? "rounded-full" : ""}`}
          style={{ width: width || 112, height: height || 112 }}
        >
          <Image
            src={src}
            alt={alt}
            className={cleanClassName}
            {...imageProps}
          />
        </div>
        {courtesy && (
          <div className="mt-2 text-center max-w-[120px]">
            <p className="text-xs text-text-secondary font-sans leading-tight">
              Courtesy of: {courtesy}
            </p>
          </div>
        )}
      </div>
    );
  }

  // For large images: use design system colors for dark mode support
  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        className={className}
        {...imageProps}
      />
      {courtesy && (
        <div className="absolute bottom-0 right-0 bg-background-tertiary/90 text-text-primary px-2 py-1 rounded-tl-lg backdrop-blur-sm">
          <p className="text-xs font-sans">Courtesy of: {courtesy}</p>
        </div>
      )}
    </div>
  );
}
