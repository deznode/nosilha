"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ImageUploader } from "./image-uploader";
import { InlineAuthPrompt } from "./inline-auth-prompt";
import { useAuth } from "@/components/providers/auth-provider";

interface ContributePhotosSectionProps {
  entryId?: string;
}

export function ContributePhotosSection({
  entryId,
}: ContributePhotosSectionProps) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();

  // Check if user needs to authenticate
  const requiresAuth = !authLoading && !user;

  const [uploadComplete, setUploadComplete] = useState(false);

  const handleUploadComplete = () => {
    setUploadComplete(true);
  };

  const handleUploadAnother = () => {
    setUploadComplete(false);
  };

  function renderContent(): React.ReactNode {
    if (requiresAuth) {
      return (
        <InlineAuthPrompt
          title="Sign in to Contribute Photos"
          description="Photo contributions require an account to ensure proper attribution and moderation."
          returnUrl={pathname}
        />
      );
    }

    if (uploadComplete) {
      return (
        <div className="space-y-4 text-center">
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
      );
    }

    return (
      <div className="w-full space-y-4">
        <ImageUploader
          entryId={entryId}
          onUploadComplete={handleUploadComplete}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-text-primary text-center font-serif text-3xl font-bold">
        Contribute Photos
      </h2>
      <p className="text-text-secondary mt-2 text-center text-lg leading-8">
        Have a photo of this location? Share it with the community!
      </p>
      <div className="mt-8 flex justify-center">{renderContent()}</div>
    </div>
  );
}
