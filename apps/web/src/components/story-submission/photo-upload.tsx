"use client";

import { useRef } from "react";
import { Upload, Edit2 } from "lucide-react";
import Image from "next/image";

interface PhotoUploadProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
}

export function PhotoUpload({ imageUrl, onImageChange }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange("");
  };

  return (
    <div className="mb-6">
      <label className="text-body mb-2 block text-sm font-medium">
        Upload Photo
      </label>
      <div
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          imageUrl
            ? "border-[var(--color-valley-green)] bg-green-50 dark:bg-green-900/20"
            : "border-hairline hover:bg-surface hover:border-[var(--color-ocean-blue)]"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        {imageUrl ? (
          <div className="relative w-full">
            <Image
              src={imageUrl}
              alt="Preview"
              width={400}
              height={256}
              className="mx-auto max-h-64 rounded-md object-contain shadow-sm"
              unoptimized // For data URLs
            />
            <button
              type="button"
              className="text-body absolute top-2 right-2 rounded-full bg-white/80 p-1.5 shadow-sm hover:bg-white dark:bg-basalt-800/80 dark:hover:bg-basalt-700"
              onClick={handleClear}
            >
              <Edit2 size={16} />
            </button>
          </div>
        ) : (
          <div className="cursor-pointer py-8">
            <div className="bg-surface mb-3 inline-flex rounded-full p-3">
              <Upload className="text-muted h-6 w-6" />
            </div>
            <p className="text-body text-sm font-medium">
              Click to upload image
            </p>
            <p className="text-muted mt-1 text-xs">JPG, PNG up to 5MB</p>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
      </div>
    </div>
  );
}
