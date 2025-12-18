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
      <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
        Upload Photo
      </label>
      <div
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          imageUrl
            ? "border-[var(--color-valley-green)] bg-green-50 dark:bg-green-900/20"
            : "border-slate-300 hover:border-[var(--color-ocean-blue)] hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
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
              className="absolute top-2 right-2 rounded-full bg-white/80 p-1.5 text-slate-900 shadow-sm hover:bg-white dark:bg-slate-800/80 dark:text-white dark:hover:bg-slate-700"
              onClick={handleClear}
            >
              <Edit2 size={16} />
            </button>
          </div>
        ) : (
          <div className="cursor-pointer py-8">
            <div className="mb-3 inline-flex rounded-full bg-slate-100 p-3 dark:bg-slate-700">
              <Upload className="h-6 w-6 text-slate-500 dark:text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Click to upload image
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              JPG, PNG up to 5MB
            </p>
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
