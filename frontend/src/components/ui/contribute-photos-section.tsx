"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageUploader } from "./image-uploader";
import { uploadImage } from "@/lib/api";
import { CheckCircle, AlertCircle } from "lucide-react";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export function ContributePhotosSection() {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      // Reset state when file is removed
      setUploadStatus("idle");
      setUploadedUrl(null);
      setErrorMessage("");
      return;
    }

    setUploadStatus("uploading");
    setErrorMessage("");

    try {
      const publicUrl = await uploadImage(file);
      setUploadedUrl(publicUrl);
      setUploadStatus("success");
    } catch (error) {
      console.error("Failed to upload image:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to upload image"
      );
      setUploadStatus("error");
    }
  };

  const handleUploadAnother = () => {
    setUploadStatus("idle");
    setUploadedUrl(null);
    setErrorMessage("");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-text-primary text-center font-serif text-3xl font-bold">
        Contribute Photos
      </h2>
      <p className="text-text-secondary mt-2 text-center text-lg leading-8">
        Have a photo of this location? Share it with the community!
      </p>

      <div className="mt-8 flex justify-center">
        {uploadStatus === "success" && uploadedUrl ? (
          <div className="space-y-6 text-center">
            <div className="text-valley-green flex items-center justify-center space-x-2">
              <CheckCircle className="h-6 w-6" />
              <span className="font-medium">Photo uploaded successfully!</span>
            </div>

            {/* Display the uploaded image */}
            <div className="relative mx-auto h-48 w-64 overflow-hidden rounded-lg shadow-md">
              <Image
                src={uploadedUrl}
                alt="Successfully uploaded photo"
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-2">
              <p className="text-text-secondary text-sm">
                Thank you for contributing to our community.
              </p>
              <button
                onClick={handleUploadAnother}
                className="text-ocean-blue hover:text-ocean-blue/80 font-medium underline"
              >
                Upload another photo
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-4">
            <ImageUploader onFileSelect={handleFileSelect} />

            {uploadStatus === "uploading" && (
              <div className="text-center">
                <div className="text-ocean-blue inline-flex items-center space-x-2">
                  <div className="border-ocean-blue h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                  <span>Uploading your photo...</span>
                </div>
              </div>
            )}

            {uploadStatus === "error" && (
              <div className="space-y-2 text-center">
                <div className="text-accent-error flex items-center justify-center space-x-2">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Upload failed</span>
                </div>
                <p className="text-accent-error text-sm">{errorMessage}</p>
                <p className="text-text-secondary text-xs">
                  Please try again or check if you&apos;re logged in.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
