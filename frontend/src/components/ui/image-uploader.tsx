"use client";

import { useState, useCallback, DragEvent, ChangeEvent } from "react";
import { PhotoIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { Button } from "@/components/catalyst-ui/button";
import clsx from "clsx";

interface ImageUploaderProps {
  onFileSelect: (file: File | null) => void;
}

export function ImageUploader({ onFileSelect }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeDrag, setActiveDrag] = useState(false);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (file && file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        onFileSelect(file);
      } else {
        // Handle non-image file selection if necessary
        onFileSelect(null);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDrag(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDrag(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDrag(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onFileSelect(null);
  };

  return (
    <div className="w-full">
      {previewUrl ? (
        // Image Preview State
        <div className="relative rounded-lg border border-border-primary">
          <div className="aspect-video relative">
            <Image
              src={previewUrl}
              alt="Selected image preview"
              fill
              className="object-contain rounded-lg"
            />
          </div>
          <div className="p-2 border-t border-border-secondary text-center">
            <Button type="button" plain onClick={handleRemoveImage}>
              Remove / Change File
            </Button>
          </div>
        </div>
      ) : (
        // Drag and Drop State
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={clsx(
            "flex justify-center rounded-lg border border-dashed px-6 py-10 transition-colors duration-200",
            activeDrag ? "border-ocean-blue bg-ocean-blue/10" : "border-border-primary"
          )}
        >
          <div className="text-center">
            <PhotoIcon
              aria-hidden="true"
              className="mx-auto h-12 w-12 text-text-tertiary"
            />
            <div className="mt-4 flex text-sm leading-6 text-text-secondary">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-white font-semibold text-ocean-blue focus-within:outline-none focus-within:ring-2 focus-within:ring-ocean-blue focus-within:ring-offset-2 hover:text-ocean-blue/80"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-text-secondary">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
