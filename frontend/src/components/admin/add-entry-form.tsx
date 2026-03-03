"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Button } from "@/components/catalyst-ui/button";
import { Input } from "@/components/catalyst-ui/input";
import { Textarea } from "@/components/catalyst-ui/textarea";
import { Select } from "@/components/catalyst-ui/select";
import { Field, Label } from "@/components/catalyst-ui/fieldset";
import { ImageUploader } from "@/components/ui/image-uploader";
import { createDirectoryEntry } from "@/lib/api";
import type { DirectoryEntry } from "@/types/directory";
import {
  Alert,
  AlertActions,
  AlertBody,
  AlertDescription,
  AlertTitle,
} from "@/components/catalyst-ui/alert";

// ... (Types and initial state are unchanged and omitted for brevity)
type FormStatus = "idle" | "submitting" | "success" | "error";
type FormData = Omit<
  DirectoryEntry,
  | "id"
  | "slug"
  | "rating"
  | "reviewCount"
  | "imageUrl"
  | "details"
  | "category"
  | "createdAt"
  | "updatedAt"
> & {
  category: DirectoryEntry["category"] | "";
  details: {
    phoneNumber?: string;
    openingHours?: string;
    cuisine?: string;
    amenities?: string;
  };
};
const initialFormData: FormData = {
  name: "",
  description: "",
  town: "",
  category: "",
  latitude: 0,
  longitude: 0,
  details: {},
};
const categories: Exclude<DirectoryEntry["category"], "">[] = [
  "Restaurant",
  "Hotel",
  "Beach",
  "Landmark",
];

export function AddEntryForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // ... (Handler functions are unchanged and omitted for brevity)
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetailsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      details: { ...prev.details, [name]: value },
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.category === "") {
      setMessage("Please select a category before submitting.");
      setStatus("error");
      setIsAlertOpen(true);
      return;
    }
    setStatus("submitting");
    // Create payload matching backend CreateEntryRequestDto structure
    const payload: Omit<
      DirectoryEntry,
      "id" | "slug" | "rating" | "reviewCount" | "createdAt" | "updatedAt"
    > = {
      name: formData.name,
      description: formData.description,
      town: formData.town,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      imageUrl: "",
      category: formData.category,
      details: null, // Will be set below based on category
    };

    // Create category-specific details matching backend DTOs
    if (payload.category === "Restaurant") {
      payload.details = {
        phoneNumber: formData.details.phoneNumber || "",
        openingHours: formData.details.openingHours || "",
        cuisine:
          formData.details.cuisine?.split(",").map((item) => item.trim()) || [],
      };
    } else if (payload.category === "Hotel") {
      payload.details = {
        phoneNumber: formData.details.phoneNumber || "",
        amenities:
          formData.details.amenities?.split(",").map((item) => item.trim()) ||
          [],
      };
    }
    // Beach and Landmark categories don't need details (details: null)

    try {
      await createDirectoryEntry(payload);
      setStatus("success");
      setMessage("The new directory entry has been created successfully!");
      setIsAlertOpen(true);
      setFormData(initialFormData);
    } catch (err: unknown) {
      setStatus("error");

      // Handle backend validation errors with field-specific details
      if (err instanceof Error && err.message.includes("Validation failed")) {
        setMessage(
          "Please check the form fields and correct any validation errors."
        );
      } else if (err instanceof Error && err.message.includes("403")) {
        setMessage(
          "You don't have permission to create directory entries. Please contact an administrator."
        );
      } else if (err instanceof Error && err.message.includes("401")) {
        setMessage("Your session has expired. Please log in again.");
      } else {
        setMessage(
          (err instanceof Error ? err.message : "Unknown error") ||
            "An unexpected error occurred while creating the entry. Please try again."
        );
      }

      setIsAlertOpen(true);
    }
  };

  const isSubmitting = status === "submitting";

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="space-y-12">
          {/* Section 1: Directory Entry Details */}
          <div className="border-border-primary border-b pb-12">
            <h2 className="text-text-primary text-base leading-7 font-semibold">
              Directory Entry Details
            </h2>
            <p className="text-text-secondary mt-1 text-sm leading-6">
              This information will be publicly displayed for the new location.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <Field>
                  <Label>Name</Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </Field>
              </div>
              <div className="sm:col-span-3">
                <Field>
                  <Label>Town</Label>
                  <Input
                    name="town"
                    value={formData.town}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </Field>
              </div>
              <div className="sm:col-span-3">
                <Field>
                  <Label>Category</Label>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="col-span-full">
                <Field>
                  <Label>Description</Label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    rows={4}
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Section 2: Category-Specific Information */}
          <div className="border-border-primary border-b pb-12">
            <h2 className="text-text-primary text-base leading-7 font-semibold">
              Category-Specific Information
            </h2>
            <p className="text-text-secondary mt-1 text-sm leading-6">
              Provide details relevant to the selected category.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              {formData.category === "Restaurant" && (
                <>
                  <div className="sm:col-span-3">
                    <Field>
                      <Label>Phone Number</Label>
                      <Input
                        name="phoneNumber"
                        value={formData.details.phoneNumber || ""}
                        onChange={handleDetailsChange}
                        disabled={isSubmitting}
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-3">
                    <Field>
                      <Label>Opening Hours</Label>
                      <Input
                        name="openingHours"
                        value={formData.details.openingHours || ""}
                        onChange={handleDetailsChange}
                        disabled={isSubmitting}
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-full">
                    <Field>
                      <Label>Cuisine (comma-separated)</Label>
                      <Input
                        name="cuisine"
                        value={formData.details.cuisine || ""}
                        onChange={handleDetailsChange}
                        disabled={isSubmitting}
                      />
                    </Field>
                  </div>
                </>
              )}
              {formData.category === "Hotel" && (
                <>
                  <div className="sm:col-span-3">
                    <Field>
                      <Label>Phone Number</Label>
                      <Input
                        name="phoneNumber"
                        value={formData.details.phoneNumber || ""}
                        onChange={handleDetailsChange}
                        disabled={isSubmitting}
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-full">
                    <Field>
                      <Label>Amenities (comma-separated)</Label>
                      <Input
                        name="amenities"
                        value={formData.details.amenities || ""}
                        onChange={handleDetailsChange}
                        disabled={isSubmitting}
                      />
                    </Field>
                  </div>
                </>
              )}
              {(formData.category === "Beach" ||
                formData.category === "Landmark" ||
                formData.category === "") && (
                <div className="sm:col-span-full">
                  <p className="text-text-tertiary text-sm">
                    No specific details required for this category.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Location & Media */}
          <div className="pb-12">
            <h2 className="text-text-primary text-base leading-7 font-semibold">
              Location & Media
            </h2>
            <p className="text-text-secondary mt-1 text-sm leading-6">
              Set the geographic coordinates and upload an image for this entry.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <Field>
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </Field>
              </div>
              <div className="sm:col-span-3">
                <Field>
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </Field>
              </div>
              <Field className="col-span-full">
                <Label>Primary Image</Label>
                <div className="mt-2">
                  <ImageUploader onFileSelect={() => {}} />
                </div>
              </Field>
            </div>
          </div>
        </div>

        {/* Final Actions with Themed Button */}
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button
            type="button"
            plain
            onClick={() => setFormData(initialFormData)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-ocean-blue hover:bg-ocean-blue/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Entry"}
          </Button>
        </div>
      </form>

      <Alert open={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
        <AlertTitle>{status === "success" ? "Success" : "Error"}</AlertTitle>
        <AlertBody>
          <AlertDescription>{message}</AlertDescription>
        </AlertBody>
        <AlertActions>
          <Button plain onClick={() => setIsAlertOpen(false)}>
            Close
          </Button>
        </AlertActions>
      </Alert>
    </>
  );
}
