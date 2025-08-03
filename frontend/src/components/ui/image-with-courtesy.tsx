
import Image from "next/image";

type ImageWithCourtesyProps = {
  src: string;
  alt: string;
  courtesy?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
};

export function ImageWithCourtesy({
  src,
  alt,
  courtesy,
  className,
  fill = false,
  width,
  height,
}: ImageWithCourtesyProps) {
  const imageProps = fill ? { fill } : { width, height };

  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        className={className}
        {...imageProps}
      />
      {courtesy && (
        <div className="absolute bottom-0 right-0 bg-black/60 text-white px-2 py-1 rounded-tl-lg">
          <p className="text-xs font-sans">Courtesy of: {courtesy}</p>
        </div>
      )}
    </div>
  );
}
