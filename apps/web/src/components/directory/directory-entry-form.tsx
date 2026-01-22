"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Tag,
  ImageIcon,
  Sparkles,
  Send,
  Utensils,
  Hotel,
  Umbrella,
  Castle,
  TreePine,
  Check,
  History,
  Info,
  AlertCircle,
  PlusCircle,
  LayoutGrid,
  ChevronDown,
  Save,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { InlineAuthPrompt } from "@/components/ui/inline-auth-prompt";
import {
  generateDirectoryContentAction,
  checkGeminiAvailableAction,
} from "@/app/actions/gemini-actions";
import { submitDirectoryEntry, updateDirectoryEntry } from "@/lib/api";
import { ImageUploader } from "@/components/ui/image-uploader";
import type { DirectorySubmissionRequest } from "@/lib/api-contracts";
import type { DirectorySubmission } from "@/types/admin";

type DirectoryCategory =
  | "Restaurant"
  | "Hotel"
  | "Beach"
  | "Heritage"
  | "Nature";

interface CategoryOption {
  id: DirectoryCategory;
  label: string;
  icon: React.ReactNode;
  selectedBorderClass: string;
  selectedBgClass: string;
  selectedRingClass: string;
  iconBgClass: string;
  description: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: "Restaurant",
    label: "Dining",
    icon: <Utensils size={24} />,
    selectedBorderClass: "border-bougainvillea-pink",
    selectedBgClass: "bg-bougainvillea-pink/5",
    selectedRingClass: "ring-bougainvillea-pink/10",
    iconBgClass: "bg-bougainvillea-pink",
    description: "Local eateries & cafes",
  },
  {
    id: "Hotel",
    label: "Lodging",
    icon: <Hotel size={24} />,
    selectedBorderClass: "border-ocean-blue",
    selectedBgClass: "bg-ocean-blue/5",
    selectedRingClass: "ring-ocean-blue/10",
    iconBgClass: "bg-ocean-blue",
    description: "Hotels & guesthouses",
  },
  {
    id: "Beach",
    label: "Beach",
    icon: <Umbrella size={24} />,
    selectedBorderClass: "border-sobrado-ochre",
    selectedBgClass: "bg-sobrado-ochre/5",
    selectedRingClass: "ring-sobrado-ochre/10",
    iconBgClass: "bg-sobrado-ochre",
    description: "Coastal destinations",
  },
  {
    id: "Heritage",
    label: "Heritage",
    icon: <Castle size={24} />,
    selectedBorderClass: "border-valley-green",
    selectedBgClass: "bg-valley-green/5",
    selectedRingClass: "ring-valley-green/10",
    iconBgClass: "bg-valley-green",
    description: "Historical sites & monuments",
  },
  {
    id: "Nature",
    label: "Nature",
    icon: <TreePine size={24} />,
    selectedBorderClass: "border-valley-green",
    selectedBgClass: "bg-valley-green/5",
    selectedRingClass: "ring-valley-green/10",
    iconBgClass: "bg-valley-green",
    description: "Hiking trails & natural pools",
  },
];

const PRESET_TOWNS = [
  "Nova Sintra",
  "Furna",
  "Fajã d'Água",
  "Nossa Senhora do Monte",
  "Cova Joana",
  "Santa Bárbara",
];

interface FormData {
  name: string;
  town: string;
  customTown: string;
  category: DirectoryCategory;
  description: string;
  tags: string;
  latitude: string;
  longitude: string;
  imageUrl: string;
  priceLevel: "$" | "$$" | "$$$";
}

export interface DirectoryEntryFormProps {
  /** Form mode: 'create' for new entries, 'edit' for existing entries */
  mode?: "create" | "edit";
  /** Initial data for edit mode (entry to edit) */
  initialData?: DirectorySubmission;
  /** Layout variant: 'full-page' for contribute page, 'modal' for admin dashboard */
  variant?: "full-page" | "modal";
  /** Callback when form submission succeeds (especially for modal variant) */
  onSuccess?: () => void;
}

/**
 * Unified directory entry form for both create and edit operations.
 *
 * - mode='create' + variant='full-page': Public contribution page
 * - mode='edit' + variant='modal': Admin edit modal in dashboard
 */
export function DirectoryEntryForm({
  mode = "create",
  initialData,
  variant = "full-page",
  onSuccess,
}: DirectoryEntryFormProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useCustomTown, setUseCustomTown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [geminiAvailable, setGeminiAvailable] = useState(false);

  // Only require auth for create mode (edit mode is already admin-only)
  const requiresAuth = mode === "create" && !authLoading && !user;

  // Check Gemini availability on mount
  useEffect(() => {
    checkGeminiAvailableAction().then(setGeminiAvailable);
  }, []);

  // Initialize form data from initialData for edit mode
  const getInitialFormData = (): FormData => {
    if (mode === "edit" && initialData) {
      // Check if town is a preset or custom
      const isPresetTown = PRESET_TOWNS.includes(initialData.town);
      return {
        name: initialData.name,
        town: isPresetTown ? initialData.town : PRESET_TOWNS[0],
        customTown: isPresetTown ? "" : initialData.town,
        category: initialData.category as DirectoryCategory,
        description: initialData.description,
        tags: initialData.tags?.join(", ") || "",
        latitude: initialData.latitude?.toString() || "",
        longitude: initialData.longitude?.toString() || "",
        imageUrl: initialData.imageUrl || "",
        priceLevel: (initialData.priceLevel as "$" | "$$" | "$$$") || "$$",
      };
    }
    return {
      name: "",
      town: PRESET_TOWNS[0],
      customTown: "",
      category: "Restaurant",
      description: "",
      tags: "",
      latitude: "",
      longitude: "",
      imageUrl: "",
      priceLevel: "$$",
    };
  };

  const [formData, setFormData] = useState<FormData>(getInitialFormData);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Set custom town mode if initial data has a non-preset town
  useEffect(() => {
    if (mode === "edit" && initialData) {
      const isPresetTown = PRESET_TOWNS.includes(initialData.town);
      setUseCustomTown(!isPresetTown);
    }
  }, [mode, initialData]);

  const handleAIAutoFill = async () => {
    if (!formData.name || !geminiAvailable) return;
    setIsGenerating(true);
    try {
      const result = await generateDirectoryContentAction(
        formData.name,
        formData.category
      );
      if (result) {
        setFormData((prev) => ({
          ...prev,
          description: result.description,
          tags: result.tags.join(", "),
        }));
      }
    } catch (e) {
      console.error("AI generation failed:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Build the API request with uppercase category
      const categoryMap: Record<
        DirectoryCategory,
        DirectorySubmissionRequest["category"]
      > = {
        Restaurant: "RESTAURANT",
        Hotel: "HOTEL",
        Beach: "BEACH",
        Heritage: "HERITAGE",
        Nature: "NATURE",
      };

      const requestData = {
        name: formData.name,
        category: categoryMap[formData.category],
        town: useCustomTown ? formData.customTown : formData.town,
        customTown: useCustomTown ? formData.customTown : undefined,
        description: formData.description,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        imageUrl: formData.imageUrl || undefined,
        priceLevel:
          formData.category === "Restaurant" ? formData.priceLevel : undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude
          ? parseFloat(formData.longitude)
          : undefined,
      };

      if (mode === "edit" && initialData) {
        // Update existing entry
        await updateDirectoryEntry(initialData.id, requestData);
        // Call success callback for modal to close
        onSuccess?.();
      } else {
        // Create new entry
        await submitDirectoryEntry(requestData as DirectorySubmissionRequest);
        // Show success screen for full-page variant
        if (variant === "full-page") {
          setStep(3);
        } else {
          onSuccess?.();
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/directory");
  };

  // Success screen (only for full-page create mode)
  if (step === 3 && variant === "full-page") {
    return (
      <div className="bg-canvas flex min-h-screen items-center justify-center p-6">
        <div className="border-hairline bg-surface w-full max-w-md rounded-[2rem] border p-12 text-center shadow-2xl">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-[var(--color-valley-green)]/10 shadow-inner">
            <Check className="h-12 w-12 text-[var(--color-valley-green)]" />
          </div>
          <h2 className="text-body mb-4 font-serif text-3xl font-bold">
            Entry Submitted
          </h2>
          <p className="text-muted mb-10 leading-relaxed">
            Thank you for helping us document Brava. Our team will review{" "}
            <strong className="text-body">{formData.name}</strong> to ensure all
            information is accurate.
          </p>
          <button
            onClick={handleBack}
            className="w-full rounded-2xl bg-[var(--color-ocean-blue)] py-4 font-bold text-white shadow-xl transition hover:bg-blue-800 active:scale-[0.98]"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  // Modal variant: simplified layout
  if (variant === "modal") {
    return (
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {/* Simple header for modal */}
        <div className="border-hairline border-b pb-4">
          <h2 className="text-body font-serif text-xl font-bold">
            {mode === "edit" ? `Edit: ${initialData?.name}` : "Add New Entry"}
          </h2>
        </div>

        {/* Compact form fields */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-body mb-2 block text-sm font-bold">
              Location Name
            </label>
            <div className="relative">
              <input
                required
                type="text"
                className="border-hairline bg-surface text-body w-full rounded-xl border px-4 py-3 transition-all outline-none focus:border-[var(--color-ocean-blue)] focus:ring-2 focus:ring-[var(--color-ocean-blue)]/10"
                placeholder="e.g., Pensão Sodade"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {formData.name && geminiAvailable && (
                <button
                  type="button"
                  onClick={handleAIAutoFill}
                  disabled={isGenerating}
                  className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-[var(--color-bougainvillea-pink)] px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-pink-700 active:scale-95 disabled:opacity-50"
                >
                  <Sparkles
                    size={12}
                    className={isGenerating ? "animate-spin" : ""}
                  />
                  {isGenerating ? "..." : "AI"}
                </button>
              )}
            </div>
          </div>

          {/* Category - Compact grid */}
          <div>
            <label className="text-body mb-2 block text-sm font-bold">
              Category
            </label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition-all ${
                    formData.category === cat.id
                      ? `${cat.selectedBorderClass} ${cat.selectedBgClass} ring-2 ${cat.selectedRingClass}`
                      : "border-hairline text-muted hover:border-edge"
                  }`}
                >
                  <div
                    className={`rounded-lg p-1.5 ${
                      formData.category === cat.id
                        ? `${cat.iconBgClass} text-white`
                        : "bg-surface-alt text-muted"
                    }`}
                  >
                    {cat.icon}
                  </div>
                  <span className="text-[10px] font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Town */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-body text-sm font-bold">Town</label>
              <button
                type="button"
                onClick={() => setUseCustomTown(!useCustomTown)}
                className="flex items-center gap-1 text-xs font-bold text-[var(--color-ocean-blue)] hover:underline"
              >
                {useCustomTown ? (
                  <LayoutGrid size={10} />
                ) : (
                  <PlusCircle size={10} />
                )}
                {useCustomTown ? "List" : "Custom"}
              </button>
            </div>

            {useCustomTown ? (
              <div className="relative">
                <input
                  required
                  type="text"
                  className="border-hairline bg-surface text-body w-full rounded-xl border py-3 pr-4 pl-9 transition-all outline-none focus:ring-2 focus:ring-[var(--color-ocean-blue)]/10"
                  placeholder="Enter town name..."
                  value={formData.customTown}
                  onChange={(e) =>
                    setFormData({ ...formData, customTown: e.target.value })
                  }
                />
                <MapPin
                  size={16}
                  className="absolute top-3.5 left-3 text-[var(--color-ocean-blue)]"
                />
              </div>
            ) : (
              <div className="relative">
                <select
                  className="border-hairline bg-surface text-body w-full cursor-pointer appearance-none rounded-xl border px-4 py-3 transition-all outline-none focus:ring-2 focus:ring-[var(--color-ocean-blue)]/10"
                  value={formData.town}
                  onChange={(e) =>
                    setFormData({ ...formData, town: e.target.value })
                  }
                >
                  {PRESET_TOWNS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown className="text-muted pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-body mb-2 block text-sm font-bold">
              Description
            </label>
            <textarea
              required
              rows={3}
              className="border-hairline bg-surface text-body w-full rounded-xl border px-4 py-3 leading-relaxed transition-all outline-none focus:ring-2 focus:ring-[var(--color-ocean-blue)]/10"
              placeholder="Describe the location..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Tags & Price (side by side) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-body mb-2 block text-sm font-bold">
                Tags
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="border-hairline bg-surface text-body w-full rounded-xl border py-3 pr-4 pl-9 text-sm transition-all outline-none focus:ring-2 focus:ring-[var(--color-ocean-blue)]/10"
                  placeholder="ocean-view, historical"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                />
                <Tag size={14} className="text-muted absolute top-3.5 left-3" />
              </div>
            </div>

            {formData.category === "Restaurant" && (
              <div>
                <label className="text-body mb-2 block text-sm font-bold">
                  Price
                </label>
                <div className="flex gap-1">
                  {(["$", "$$", "$$$"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, priceLevel: p })
                      }
                      className={`flex-1 rounded-lg border py-3 text-xs font-bold transition-all ${
                        formData.priceLevel === p
                          ? "border-[var(--color-valley-green)] bg-[var(--color-valley-green)] text-white"
                          : "border-hairline bg-surface text-muted"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-body mb-2 block text-sm font-bold">
              Photo
            </label>
            <ImageUploader
              onUploadComplete={(url) =>
                setFormData((prev) => ({ ...prev, imageUrl: url }))
              }
              category="directory"
              description={formData.name || "Directory entry photo"}
              autoUpload={true}
              initialUrl={formData.imageUrl}
            />
          </div>

          {/* Coordinates (collapsed) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-muted mb-1 block text-[10px] font-bold tracking-widest uppercase">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                className="border-hairline bg-surface text-body w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ocean-blue)]/10"
                placeholder="14.8687"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-muted mb-1 block text-[10px] font-bold tracking-widest uppercase">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                className="border-hairline bg-surface text-body w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ocean-blue)]/10"
                placeholder="-24.7011"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {submitError && (
          <div className="border-accent-error/20 bg-accent-error/10 flex items-start gap-3 rounded-xl border p-3">
            <AlertCircle className="text-accent-error shrink-0" size={18} />
            <p className="text-accent-error text-sm">{submitError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="border-hairline flex justify-end gap-3 border-t pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-ocean-blue hover:bg-ocean-blue/90 flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <Save size={16} />
            {isSubmitting
              ? "Saving..."
              : mode === "edit"
                ? "Save Changes"
                : "Submit Entry"}
          </button>
        </div>
      </form>
    );
  }

  // Full-page variant (default)
  return (
    <div className="bg-canvas min-h-screen px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={handleBack}
          className="group text-muted hover:text-body mb-10 flex items-center font-medium transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />{" "}
          Cancel & Return
        </button>

        <div className="border-hairline bg-surface overflow-hidden rounded-[2.5rem] border shadow-2xl">
          {/* Header Branding */}
          <div className="relative overflow-hidden bg-[var(--color-ocean-blue)] px-12 py-12 text-white">
            <div className="absolute top-0 right-0 -mt-40 -mr-40 h-80 w-80 rounded-full bg-white/5 blur-3xl"></div>
            <div className="relative z-10">
              <span className="mb-4 inline-block rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold tracking-widest uppercase backdrop-blur-md">
                Contribution Portal
              </span>
              <h1 className="font-serif text-3xl font-bold md:text-4xl">
                Documenting Brava&apos;s Landscape
              </h1>
              <p className="text-mist-200/80 mt-3 max-w-lg text-sm">
                Every cafe, fountain, and historical house tells a story of our
                island&apos;s growth and resilience.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12 p-12">
            {/* Auth Prompt - shown when user is not authenticated */}
            {requiresAuth && (
              <InlineAuthPrompt
                title="Sign in to Add a Location"
                description="Directory submissions require an account to ensure proper attribution and quality control."
                returnUrl="/contribute/directory"
              />
            )}

            {/* Identity Section */}
            <div className="space-y-8">
              <div className="border-hairline flex items-center gap-3 border-b pb-3 text-xs font-bold tracking-[0.2em] text-[var(--color-ocean-blue)] uppercase">
                <Info size={16} /> 1. Essential Details
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-body mb-2 block text-sm font-bold">
                    Location Name
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      className="border-hairline bg-surface text-body w-full rounded-2xl border px-5 py-4 text-lg font-medium transition-all outline-none focus:border-[var(--color-ocean-blue)] focus:ring-4 focus:ring-[var(--color-ocean-blue)]/10"
                      placeholder="e.g., Pensão Sodade"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                    {formData.name && geminiAvailable && (
                      <button
                        type="button"
                        onClick={handleAIAutoFill}
                        disabled={isGenerating}
                        className="absolute top-3 right-3 flex items-center gap-2 rounded-xl bg-[var(--color-bougainvillea-pink)] px-5 py-2 text-xs font-bold text-white shadow-lg transition-all hover:bg-pink-700 active:scale-95 disabled:opacity-50"
                      >
                        <Sparkles
                          size={14}
                          className={isGenerating ? "animate-spin" : ""}
                        />
                        {isGenerating ? "Mapping..." : "AI Assist"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-body mb-4 block text-sm font-bold">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, category: cat.id })
                        }
                        className={`flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all ${
                          formData.category === cat.id
                            ? `${cat.selectedBorderClass} ${cat.selectedBgClass} ring-4 ${cat.selectedRingClass} scale-[1.02] shadow-lg`
                            : "border-hairline text-muted hover:border-edge hover:bg-surface-alt"
                        }`}
                      >
                        <div
                          className={`rounded-2xl p-3 transition-all ${
                            formData.category === cat.id
                              ? `${cat.iconBgClass} text-white`
                              : "bg-surface-alt text-muted"
                          }`}
                        >
                          {cat.icon}
                        </div>
                        <div className="text-center">
                          <span className="block text-xs font-bold">
                            {cat.label}
                          </span>
                          <span className="mt-1 block text-[9px] leading-tight opacity-60">
                            {cat.description}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-body text-sm font-bold">
                    Town / Village
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseCustomTown(!useCustomTown)}
                    className="flex items-center gap-1 text-xs font-bold text-[var(--color-ocean-blue)] hover:underline"
                  >
                    {useCustomTown ? (
                      <LayoutGrid size={12} />
                    ) : (
                      <PlusCircle size={12} />
                    )}
                    {useCustomTown ? "Pick from List" : "Add New Village"}
                  </button>
                </div>

                {useCustomTown ? (
                  <div className="animate-in slide-in-from-top-2 relative duration-300">
                    <input
                      required
                      type="text"
                      className="border-hairline bg-surface text-body w-full rounded-2xl border py-4 pr-4 pl-10 transition-all outline-none focus:ring-4 focus:ring-[var(--color-ocean-blue)]/10"
                      placeholder="Enter town name..."
                      value={formData.customTown}
                      onChange={(e) =>
                        setFormData({ ...formData, customTown: e.target.value })
                      }
                    />
                    <MapPin
                      size={18}
                      className="absolute top-4 left-4 text-[var(--color-ocean-blue)]"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      className="border-hairline bg-surface text-body w-full cursor-pointer appearance-none rounded-2xl border px-5 py-4 transition-all outline-none focus:ring-4 focus:ring-[var(--color-ocean-blue)]/10"
                      value={formData.town}
                      onChange={(e) =>
                        setFormData({ ...formData, town: e.target.value })
                      }
                    >
                      {PRESET_TOWNS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <div className="text-muted pointer-events-none absolute top-1/2 right-5 -translate-y-1/2">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cultural Context */}
            <div className="space-y-8">
              <div className="border-hairline flex items-center gap-3 border-b pb-3 text-xs font-bold tracking-[0.2em] text-[var(--color-ocean-blue)] uppercase">
                <History size={16} /> 2. Context & Story
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-body mb-2 block text-sm font-bold">
                    Description
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="border-hairline bg-surface text-body w-full rounded-2xl border px-5 py-4 leading-relaxed transition-all outline-none focus:ring-4 focus:ring-[var(--color-ocean-blue)]/10"
                    placeholder="Describe the atmosphere, significance, or history of this location..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div>
                    <label className="text-body mb-2 block text-sm font-bold">
                      Discovery Tags
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="border-hairline bg-surface text-body w-full rounded-2xl border py-3 pr-4 pl-10 text-sm transition-all outline-none focus:ring-4 focus:ring-[var(--color-ocean-blue)]/10"
                        placeholder="ocean-view, historical, hidden-gem"
                        value={formData.tags}
                        onChange={(e) =>
                          setFormData({ ...formData, tags: e.target.value })
                        }
                      />
                      <Tag
                        size={16}
                        className="text-muted absolute top-3.5 left-3.5"
                      />
                    </div>
                  </div>

                  {formData.category === "Restaurant" && (
                    <div className="border-hairline bg-surface flex items-center gap-4 rounded-2xl border p-4">
                      <span className="text-muted text-xs font-bold">
                        Price:
                      </span>
                      <div className="flex gap-1">
                        {(["$", "$$", "$$$"] as const).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, priceLevel: p })
                            }
                            className={`w-10 rounded-lg border py-1.5 text-xs font-bold transition-all ${
                              formData.priceLevel === p
                                ? "border-[var(--color-valley-green)] bg-[var(--color-valley-green)] text-white"
                                : "border-hairline bg-surface text-muted"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Media & Coordinates */}
            <div className="space-y-8">
              <div className="border-hairline flex items-center gap-3 border-b pb-3 text-xs font-bold tracking-[0.2em] text-[var(--color-ocean-blue)] uppercase">
                <ImageIcon size={16} /> 3. Visuals & Location
              </div>

              <div>
                <label className="text-body mb-2 block text-sm font-bold">
                  Primary Photo
                </label>
                <ImageUploader
                  onUploadComplete={(url) =>
                    setFormData((prev) => ({ ...prev, imageUrl: url }))
                  }
                  category="directory"
                  description={formData.name || "Directory entry photo"}
                  autoUpload={true}
                  initialUrl={formData.imageUrl}
                />
                {formData.imageUrl && (
                  <p className="mt-2 text-sm text-[var(--color-valley-green)]">
                    Photo uploaded successfully
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-muted mb-2 block text-[10px] font-bold tracking-widest uppercase">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="border-hairline bg-surface text-body w-full rounded-2xl border px-4 py-3 text-sm transition-all outline-none focus:ring-4 focus:ring-[var(--color-ocean-blue)]/10"
                    placeholder="14.8687"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-muted mb-2 block text-[10px] font-bold tracking-widest uppercase">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="border-hairline bg-surface text-body w-full rounded-2xl border px-4 py-3 text-sm transition-all outline-none focus:ring-4 focus:ring-[var(--color-ocean-blue)]/10"
                    placeholder="-24.7011"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Error Display */}
            {submitError && (
              <div className="border-accent-error/20 bg-accent-error/10 flex items-start gap-4 rounded-2xl border p-4">
                <AlertCircle className="text-accent-error shrink-0" size={20} />
                <p className="text-accent-error text-sm">{submitError}</p>
              </div>
            )}

            {/* Submission Actions */}
            <div className="border-hairline flex flex-col items-center justify-between gap-6 border-t pt-10 md:flex-row">
              <div className="flex max-w-md items-start gap-4 rounded-2xl border border-[var(--color-sobrado-ochre)]/20 bg-[var(--color-sobrado-ochre)]/10 p-4">
                <AlertCircle
                  className="shrink-0 text-[var(--color-sobrado-ochre)]"
                  size={20}
                />
                <p className="text-muted text-[10px] leading-relaxed">
                  <strong>Contributor Note:</strong> Your submission will be
                  reviewed by our team before being published. This ensures all
                  information is accurate.
                </p>
              </div>
              <div className="flex w-full gap-4 md:w-auto">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-muted hover:text-body flex-1 px-10 py-4 text-sm font-bold transition-colors md:flex-none"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || requiresAuth}
                  className="bg-ocean-blue hover:bg-ocean-blue/90 flex flex-1 items-center justify-center gap-3 rounded-2xl px-12 py-4 font-bold text-white shadow-xl transition-all active:scale-95 disabled:opacity-50 md:flex-none"
                >
                  <Send size={18} />{" "}
                  {isSubmitting
                    ? "Submitting..."
                    : requiresAuth
                      ? "Sign in to Submit"
                      : "Submit Entry"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Re-export for backwards compatibility
export { DirectoryEntryForm as AddDirectoryEntryForm };
