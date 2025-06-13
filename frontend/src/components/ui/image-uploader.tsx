"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Button } from "@/components/catalyst-ui/button";
import { Input } from "@/components/catalyst-ui/input";
import {
  ArrowUpOnSquareIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/20/solid";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export function ImageUploader() {
  // State for the selected file
  const [file, setFile] = useState<File | null>(null);
  // State to track the upload process
  const [status, setStatus] = useState<UploadStatus>("idle");
  // State for storing the URL from a successful response
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  // State for storing any error messages
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus("idle"); // Reset status when a new file is selected
      setError(null);
      setUploadedUrl(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setStatus("uploading");
    setError(null);
    setUploadedUrl(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/media/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // If response is not OK, use the error message from the API, or a default one
        throw new Error(result.message || "Upload failed. Please try again.");
      }

      setStatus("success");
      setUploadedUrl(result.url);
    } catch (err: any) {
      setStatus("error");
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Select Image
          </label>
          <Input
            id="file-upload"
            name="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-2"
          />
        </div>

        <Button
          type="submit"
          disabled={!file || status === "uploading"}
          className="w-full"
        >
          <ArrowUpOnSquareIcon className="h-5 w-5" />
          <span>
            {status === "uploading" ? "Uploading..." : "Upload Image"}
          </span>
        </Button>
      </form>

      {/* User Feedback Section */}
      <div className="mt-4 text-center">
        {status === "success" && uploadedUrl && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
            <div className="flex items-center justify-center gap-x-2">
              <CheckCircleIcon className="h-5 w-5" />
              <p>
                <strong>Success!</strong> Image uploaded.
              </p>
            </div>
            <p className="mt-2 break-all text-xs">
              URL:{" "}
              <a
                href={uploadedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono underline"
              >
                {uploadedUrl}
              </a>
            </p>
          </div>
        )}
        {status === "error" && error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-center justify-center gap-x-2">
              <ExclamationCircleIcon className="h-5 w-5" />
              <p>
                <strong>Error:</strong> {error}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
