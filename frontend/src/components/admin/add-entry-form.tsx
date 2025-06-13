"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Button } from "@/components/catalyst-ui/button";
import { Input } from "@/components/catalyst-ui/input";
import { Textarea } from "@/components/catalyst-ui/textarea";
import { Select } from "@/components/catalyst-ui/select";
import {
  Field,
  FieldGroup,
  Fieldset,
  Label,
} from "@/components/catalyst-ui/fieldset";
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

type FormStatus = "idle" | "submitting" | "success" | "error";

type FormData = Omit<
  DirectoryEntry,
  "id" | "slug" | "rating" | "reviewCount" | "imageUrl" | "details" | "category"
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
  const [currentStep, setCurrentStep] = useState(1);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);

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

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.category === "") {
      setMessage("Please select a category before submitting.");
      setStatus("error");
      setIsAlertOpen(true);
      return;
    }

    setStatus("submitting");
    setMessage("");

    const payload: Omit<
      DirectoryEntry,
      "id" | "slug" | "rating" | "reviewCount"
    > = {
      name: formData.name,
      description: formData.description,
      town: formData.town,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      imageUrl: "",
      category: formData.category,
      details: null,
    };

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

    try {
      await createDirectoryEntry(payload);
      setStatus("success");
      setMessage(
        "Entry data submitted successfully! You can now upload an image."
      );
      setIsAlertOpen(true);
      nextStep(); // Automatically proceed to the image upload step
    } catch (err: unknown) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
      setIsAlertOpen(true);
    }
  };

  const isSubmitting = status === "submitting";

  return (
    <>
      <div className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold font-serif text-center mb-2">
          Add New Directory Entry
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Step {currentStep} of 4
        </p>

        {/* The <form> tag now only wraps steps 1-3 */}
        <form onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <Fieldset>
              <FieldGroup>
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
                <Field>
                  <Label>Description</Label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </Field>
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
              </FieldGroup>
            </Fieldset>
          )}

          {currentStep === 2 && (
            <Fieldset>
              <legend className="text-lg font-medium text-gray-900 mb-4">
                Category Details
              </legend>
              <FieldGroup>
                {/* Conditional fields... */}
                {formData.category === "Restaurant" && (
                  <>
                    <Field>
                      <Label>Phone Number</Label>
                      <Input
                        name="phoneNumber"
                        value={formData.details.phoneNumber || ""}
                        onChange={handleDetailsChange}
                        disabled={isSubmitting}
                      />
                    </Field>
                    <Field>
                      <Label>Opening Hours</Label>
                      <Input
                        name="openingHours"
                        value={formData.details.openingHours || ""}
                        onChange={handleDetailsChange}
                        disabled={isSubmitting}
                      />
                    </Field>
                    <Field>
                      <Label>Cuisine (comma-separated)</Label>
                      <Input
                        name="cuisine"
                        value={formData.details.cuisine || ""}
                        onChange={handleDetailsChange}
                        disabled={isSubmitting}
                      />
                    </Field>
                  </>
                )}
                {formData.category === "Hotel" && (
                  <>
                    <Field>
                      <Label>Phone Number</Label>
                      <Input
                        name="phoneNumber"
                        value={formData.details.phoneNumber || ""}
                        onChange={handleDetailsChange}
                        disabled={isSubmitting}
                      />
                    </Field>
                    <Field>
                      <Label>Amenities (comma-separated)</Label>
                      <Input
                        name="amenities"
                        value={formData.details.amenities || ""}
                        onChange={handleDetailsChange}
                        disabled={isSubmitting}
                      />
                    </Field>
                  </>
                )}
                {(formData.category === "Beach" ||
                  formData.category === "Landmark" ||
                  formData.category === "") && (
                  <p className="text-gray-500">
                    No specific details required for this category.
                  </p>
                )}
              </FieldGroup>
            </Fieldset>
          )}

          {currentStep === 3 && (
            <Fieldset>
              <legend className="text-lg font-medium text-gray-900 mb-4">
                Location Coordinates
              </legend>
              <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-8">
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
              </FieldGroup>
            </Fieldset>
          )}

          {/* Navigation Buttons for the main form */}
          <div className="mt-8 flex justify-between">
            <Button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
              plain
            >
              Back
            </Button>

            {currentStep < 3 ? (
              <Button type="button" onClick={nextStep} disabled={isSubmitting}>
                Next
              </Button>
            ) : (
              // This is the submit button for the main form (steps 1-3)
              <Button type="submit" color="blue" disabled={isSubmitting}>
                {isSubmitting ? "Submitting Data..." : "Submit Data & Proceed"}
              </Button>
            )}
          </div>
        </form>

        {currentStep === 4 && (
          <div>
            <div className="my-8 border-t border-gray-200"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Step 4: Upload Main Image
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              The directory entry has been saved. You can now upload the primary
              image for this location.
            </p>
            <ImageUploader />
            <div className="mt-8 flex justify-between">
              <Button type="button" onClick={prevStep} plain>
                Back
              </Button>
              {/* A new button to complete the whole process */}
              <Button
                onClick={() => {
                  setFormData(initialFormData);
                  setCurrentStep(1);
                }}
                color="green"
              >
                Add Another Entry
              </Button>
            </div>
          </div>
        )}
      </div>

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
