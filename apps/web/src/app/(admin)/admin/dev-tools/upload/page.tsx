"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ImageUploader } from "@/components/ui/image-uploader";
import { ContributePhotosSection } from "@/components/ui/contribute-photos-section";
import { GalleryPicker } from "@/components/ui/gallery-picker";
import { Button } from "@/components/catalyst-ui/button";

export default function UploadDevPage() {
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);
  const [pickedImage, setPickedImage] = useState<{
    url: string;
    id: string;
  } | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/admin/dev-tools"
        className="text-muted hover:text-body mb-6 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dev Tools
      </Link>
      <h1 className="text-body mb-2 text-2xl font-bold">Image Upload</h1>
      <p className="text-muted mb-8">
        ImageUploader, ContributePhotosSection, and GalleryPicker for media
        uploads.
      </p>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <section>
          <h2 className="text-body mb-4 text-lg font-semibold">
            ImageUploader
          </h2>
          <ImageUploader
            onUploadComplete={(url) => setUploadedUrl(url)}
            onFileSelect={(file) => setSelectedFile(file)}
            entryId="demo-entry-123"
            category="Heritage"
            description="Upload a photo of a heritage site"
            autoUpload={false}
          />
          {uploadedUrl && (
            <p className="text-muted mt-2 text-sm">
              Uploaded:{" "}
              <code className="bg-surface-alt rounded px-1">{uploadedUrl}</code>
            </p>
          )}
          {selectedFile && (
            <p className="text-muted mt-2 text-sm">
              Selected: {selectedFile.name} (
              {(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </section>

        <section>
          <h2 className="text-body mb-4 text-lg font-semibold">
            GalleryPicker
          </h2>
          <Button onClick={() => setGalleryPickerOpen(true)}>
            Open Gallery Picker
          </Button>
          {pickedImage && (
            <p className="text-muted mt-2 text-sm">
              Selected: {pickedImage.id}
            </p>
          )}
          <GalleryPicker
            isOpen={galleryPickerOpen}
            onClose={() => setGalleryPickerOpen(false)}
            onSelect={(url, id) => {
              setPickedImage({ url, id });
              setGalleryPickerOpen(false);
            }}
          />
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-body mb-4 text-lg font-semibold">
          ContributePhotosSection
        </h2>
        <ContributePhotosSection entryId="demo-entry-123" />
      </section>
    </div>
  );
}
