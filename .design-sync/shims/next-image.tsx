// design-sync shim for `next/image`.
//
// The real next/image needs the Next.js image optimizer route (/_next/image)
// and an app-router runtime, neither of which exists in a preview card. This
// renders a plain <img> with equivalent layout semantics so cards show the
// real composition (and, importantly for the palette work, the real EMPTY
// image well when src is absent).
//
// Wired via compilerOptions.paths in .design-sync/tsconfig.sync.json.

import React from "react";

type StaticImport = { src: string; width?: number; height?: number };

export interface ImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> {
  src: string | StaticImport;
  alt: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  loading?: "eager" | "lazy";
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  unoptimized?: boolean;
  overrideSrc?: string;
}

const resolveSrc = (src: ImageProps["src"]): string =>
  typeof src === "string" ? src : (src?.src ?? "");

export default function Image({
  src,
  alt,
  width,
  height,
  fill,
  sizes: _sizes,
  quality: _quality,
  priority: _priority,
  placeholder: _placeholder,
  blurDataURL: _blurDataURL,
  unoptimized: _unoptimized,
  overrideSrc,
  style,
  ...rest
}: ImageProps) {
  const fillStyle: React.CSSProperties = fill
    ? {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }
    : {};

  return (
    <img
      src={overrideSrc ?? resolveSrc(src)}
      alt={alt}
      width={fill ? undefined : (width as number | undefined)}
      height={fill ? undefined : (height as number | undefined)}
      style={{ ...fillStyle, ...style }}
      {...rest}
    />
  );
}

export { Image };
export const getImageProps = (props: ImageProps) => ({
  props: { ...props, src: resolveSrc(props.src) },
});
