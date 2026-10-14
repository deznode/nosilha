"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { HelpCircle } from "lucide-react";
import { PhotoIdentificationForm } from "@/components/gallery/photo-identification-form";

interface IdentifyPhotoButtonProps {
  mediaId: string;
  photoTitle: string;
  pageUrl: string;
}

export function IdentifyPhotoButton({
  mediaId,
  photoTitle,
  pageUrl,
}: IdentifyPhotoButtonProps) {
  const t = useTranslations("photographs.gallery");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
      >
        <HelpCircle size={16} />
        {t("identifyButton")}
      </button>

      {isOpen && (
        <PhotoIdentificationForm
          mediaId={mediaId}
          photoTitle={photoTitle}
          pageUrl={pageUrl}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
