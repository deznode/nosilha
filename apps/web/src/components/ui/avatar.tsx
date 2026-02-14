import clsx from "clsx";
import Image from "next/image";
import React, { forwardRef } from "react";
import { TouchTarget } from "../catalyst-ui/button";

const sizes = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-lg",
};

const statusSizes = {
  xs: "size-2 border",
  sm: "size-2.5 border",
  md: "size-3 border-2",
  lg: "size-3.5 border-2",
  xl: "size-4 border-2",
};

const statusColors = {
  online: "bg-valley-green",
  offline: "bg-basalt-400 dark:bg-basalt-500",
  away: "bg-sobrado-ochre",
  busy: "bg-red-500",
};

type AvatarProps = {
  src?: string | null;
  alt?: string;
  initials?: string;
  size?: keyof typeof sizes;
  status?: keyof typeof statusColors;
  className?: string;
  square?: boolean;
};

/**
 * Avatar component for user profile images.
 * Supports image source, initials fallback, size variants, and status indicators.
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, alt = "", initials, size = "md", status, className, square = false },
  ref
) {
  return (
    <span
      ref={ref}
      className={clsx(
        className,
        sizes[size],
        "relative inline-flex shrink-0 items-center justify-center",
        square ? "rounded-lg" : "rounded-full"
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          className={clsx(
            "object-cover",
            square ? "rounded-lg" : "rounded-full"
          )}
        />
      ) : initials ? (
        <span
          className={clsx(
            "flex size-full items-center justify-center font-medium",
            "bg-ocean-blue/10 text-ocean-blue dark:bg-ocean-blue/20 dark:text-ocean-blue-light",
            square ? "rounded-lg" : "rounded-full"
          )}
        >
          {initials.slice(0, 2).toUpperCase()}
        </span>
      ) : (
        <span
          className={clsx(
            "flex size-full items-center justify-center",
            "bg-basalt-200 dark:bg-basalt-700",
            square ? "rounded-lg" : "rounded-full"
          )}
        >
          <svg
            className="text-basalt-400 dark:text-basalt-500 size-[60%]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </span>
      )}
      {status && (
        <span
          className={clsx(
            "dark:border-basalt-900 absolute right-0 bottom-0 block border-white",
            statusSizes[size],
            statusColors[status],
            square ? "rounded-sm" : "rounded-full"
          )}
        />
      )}
    </span>
  );
});

type AvatarGroupProps = {
  children: React.ReactNode;
  max?: number;
  size?: keyof typeof sizes;
  className?: string;
};

/**
 * AvatarGroup displays multiple avatars with overlap and overflow indicator.
 */
export function AvatarGroup({
  children,
  max = 4,
  size = "md",
  className,
}: AvatarGroupProps) {
  const avatars = React.Children.toArray(children);
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;

  // Overlap offset based on size
  const overlap = {
    xs: "-space-x-2",
    sm: "-space-x-2.5",
    md: "-space-x-3",
    lg: "-space-x-4",
    xl: "-space-x-5",
  };

  return (
    <div className={clsx("flex items-center", overlap[size], className)}>
      {visible.map((avatar, index) => (
        <span
          key={index}
          className="dark:ring-basalt-900 rounded-full ring-2 ring-white"
        >
          {React.isValidElement(avatar)
            ? React.cloneElement(avatar as React.ReactElement<AvatarProps>, {
                size,
              })
            : avatar}
        </span>
      ))}
      {overflow > 0 && (
        <span
          className={clsx(
            sizes[size],
            "inline-flex items-center justify-center rounded-full font-medium",
            "bg-basalt-100 text-basalt-600 dark:bg-basalt-800 dark:text-basalt-300",
            "dark:ring-basalt-900 ring-2 ring-white"
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

type AvatarButtonProps = AvatarProps & {
  onClick?: () => void;
};

/**
 * AvatarButton wraps Avatar with button behavior and expanded touch target.
 */
export const AvatarButton = forwardRef<HTMLButtonElement, AvatarButtonProps>(
  function AvatarButton({ onClick, className, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={clsx(
          "focus-visible:ring-ocean-blue relative inline-flex rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          className
        )}
      >
        <TouchTarget>
          <Avatar {...props} />
        </TouchTarget>
      </button>
    );
  }
);
