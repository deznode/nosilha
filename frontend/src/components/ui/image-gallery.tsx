import Image from "next/image";

interface ImageGalleryProps {
  imageUrls: string[];
}

export function ImageGallery({ imageUrls }: ImageGalleryProps) {
  // 2. Handle the empty state if no images are provided.
  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-border-primary bg-background-secondary">
        <p className="text-center text-sm text-text-tertiary">
          No images have been uploaded for this location yet.
        </p>
      </div>
    );
  }

  // 3. Render the responsive grid if images are present.
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {imageUrls.map((url, index) => (
        <div key={index} className="relative aspect-square w-full">
          {/* 4. Use the optimized next/image component */}
          <Image
            src={url}
            alt={`Image gallery item ${index + 1}`}
            width={400}
            height={400}
            className="h-full w-full rounded-lg object-cover shadow-md" // 5. Style the image
          />
        </div>
      ))}
    </div>
  );
}
