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
  User,
  Mail,
} from "lucide-react";
import {
  generateDirectoryContentAction,
  checkGeminiAvailableAction,
} from "@/app/actions/gemini-actions";
import { submitDirectoryEntry } from "@/lib/api";
import { ImageUploader } from "@/components/ui/image-uploader";
import type { DirectorySubmissionRequest } from "@/lib/api-contracts";

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
  colorClass: string;
  description: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: "Restaurant",
    label: "Dining",
    icon: <Utensils size={24} />,
    colorClass: "bougainvillea",
    description: "Local eateries & cafes",
  },
  {
    id: "Hotel",
    label: "Lodging",
    icon: <Hotel size={24} />,
    colorClass: "ocean-blue",
    description: "Hotels & guesthouses",
  },
  {
    id: "Beach",
    label: "Beach",
    icon: <Umbrella size={24} />,
    colorClass: "sunny-yellow",
    description: "Coastal destinations",
  },
  {
    id: "Heritage",
    label: "Heritage",
    icon: <Castle size={24} />,
    colorClass: "valley-green",
    description: "Historical sites & monuments",
  },
  {
    id: "Nature",
    label: "Nature",
    icon: <TreePine size={24} />,
    colorClass: "valley-green",
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
  submitterName: string;
  submitterEmail: string;
}

export function AddDirectoryEntryForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useCustomTown, setUseCustomTown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [geminiAvailable, setGeminiAvailable] = useState(false);

  // Check Gemini availability on mount
  useEffect(() => {
    checkGeminiAvailableAction().then(setGeminiAvailable);
  }, []);

  const [formData, setFormData] = useState<FormData>({
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
    submitterName: "",
    submitterEmail: "",
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

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

      const request: DirectorySubmissionRequest = {
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

      // Submit to API
      await submitDirectoryEntry(
        request,
        formData.submitterName,
        formData.submitterEmail || undefined
      );

      setStep(3); // Success
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

  if (step === 3) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-900">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-2xl dark:border-slate-700 dark:bg-slate-800">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-[var(--color-valley-green)]/10 shadow-inner">
            <Check className="h-12 w-12 text-[var(--color-valley-green)]" />
          </div>
          <h2 className="mb-4 font-serif text-3xl font-bold text-slate-900 dark:text-white">
            Entry Submitted
          </h2>
          <p className="mb-10 leading-relaxed text-slate-500 dark:text-slate-400">
            Thank you for helping us document Brava. Our team will review{" "}
            <strong className="text-slate-900 dark:text-white">
              {formData.name}
            </strong>{" "}
            to ensure all information is accurate.
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

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={handleBack}
          className="group mb-10 flex items-center font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />{" "}
          Cancel & Return
        </button>

        <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
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
              <p className="mt-3 max-w-lg text-sm text-slate-200/80">
                Every cafe, fountain, and historical house tells a story of our
                island&apos;s growth and resilience.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12 p-12">
            {/* Identity Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3 text-xs font-bold tracking-[0.2em] text-[var(--color-ocean-blue)] uppercase dark:border-slate-700">
                <Info size={16} /> 1. Essential Details
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
                    Location Name
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-lg font-medium transition-all outline-none focus:border-[var(--color-ocean-blue)] focus:ring-4 focus:ring-[var(--color-ocean-blue)]/10 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
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
                        className="absolute top-3 right-3 flex items-center gap-2 rounded-xl bg-[var(--color-bougainvillea)] px-5 py-2 text-xs font-bold text-white shadow-lg transition-all hover:bg-pink-700 active:scale-95 disabled:opacity-50"
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
                  <label className="mb-4 block text-sm font-bold text-slate-900 dark:text-white">
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
                            ? `border-[var(--color-${cat.colorClass})] bg-[var(--color-${cat.colorClass})]/5 ring-4 ring-[var(--color-${cat.colorClass})]/10 scale-[1.02] shadow-lg`
                            : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50/50 dark:border-slate-600 dark:hover:border-slate-500"
                        }`}
                      >
                        <div
                          className={`rounded-2xl p-3 transition-all ${
                            formData.category === cat.id
                              ? `bg-[var(--color-${cat.colorClass})] text-white`
                              : "bg-slate-100 text-slate-400 dark:bg-slate-700"
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
                  <label className="text-sm font-bold text-slate-900 dark:text-white">
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
                      className="w-full rounded-2xl border border-slate-200 py-4 pr-4 pl-10 transition-all outline-none focus:ring-4 focus:ring-[var(--color-ocean-blue)]/10 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
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
                      className="w-full cursor-pointer appearance-none rounded-2xl border border-slate-200 bg-white px-5 py-4 transition-all outline-none focus:ring-4 focus:ring-[var(--color-ocean-blue)]/10 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
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
                    <div className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-slate-400">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cultural Context */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3 text-xs font-bold tracking-[0.2em] text-[var(--color-ocean-blue)] uppercase dark:border-slate-700">
                <History size={16} /> 2. Context & Story
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
                    Description
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="w-full rounded-2xl border border-slate-200 px-5 py-4 leading-relaxed transition-all outline-none focus:ring-4 focus:ring-[var(--color-ocean-blue)]/10 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    placeholder="Describe the atmosphere, significance, or history of this location..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
                      Discovery Tags
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full rounded-2xl border border-slate-200 py-3 pr-4 pl-10 text-sm transition-all outline-none focus:ring-4 focus:ring-[var(--color-ocean-blue)]/10 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        placeholder="ocean-view, historical, hidden-gem"
                        value={formData.tags}
                        onChange={(e) =>
                          setFormData({ ...formData, tags: e.target.value })
                        }
                      />
                      <Tag
                        size={16}
                        className="absolute top-3.5 left-3.5 text-slate-300"
                      />
                    </div>
                  </div>

                  {formData.category === "Restaurant" && (
                    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700/50">
                      <span className="text-xs font-bold text-slate-400">
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
                                : "border-slate-200 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-600"
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
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3 text-xs font-bold tracking-[0.2em] text-[var(--color-ocean-blue)] uppercase dark:border-slate-700">
                <ImageIcon size={16} /> 3. Visuals & Location
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
                  Primary Photo
                </label>
                <ImageUploader
                  onUploadComplete={(url) =>
                    setFormData((prev) => ({ ...prev, imageUrl: url }))
                  }
                  category="directory"
                  description={formData.name || "Directory entry photo"}
                  autoUpload={true}
                />
                {formData.imageUrl && (
                  <p className="mt-2 text-sm text-[var(--color-valley-green)]">
                    Photo uploaded successfully
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="mb-2 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition-all outline-none focus:ring-4 focus:ring-[var(--color-ocean-blue)]/10 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    placeholder="14.8687"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition-all outline-none focus:ring-4 focus:ring-[var(--color-ocean-blue)]/10 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    placeholder="-24.7011"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Submitter Information */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3 text-xs font-bold tracking-[0.2em] text-[var(--color-ocean-blue)] uppercase dark:border-slate-700">
                <User size={16} /> 4. Your Information
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      className="w-full rounded-2xl border border-slate-200 py-3 pr-4 pl-10 transition-all outline-none focus:border-[var(--color-ocean-blue)] focus:ring-4 focus:ring-[var(--color-ocean-blue)]/10 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      placeholder="Enter your name"
                      value={formData.submitterName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          submitterName: e.target.value,
                        })
                      }
                    />
                    <User
                      size={18}
                      className="absolute top-3.5 left-3.5 text-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
                    Your Email{" "}
                    <span className="text-slate-400">(optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      className="w-full rounded-2xl border border-slate-200 py-3 pr-4 pl-10 transition-all outline-none focus:border-[var(--color-ocean-blue)] focus:ring-4 focus:ring-[var(--color-ocean-blue)]/10 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      placeholder="your@email.com"
                      value={formData.submitterEmail}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          submitterEmail: e.target.value,
                        })
                      }
                    />
                    <Mail
                      size={18}
                      className="absolute top-3.5 left-3.5 text-slate-300"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    We may contact you if we have questions about your
                    submission.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {submitError && (
              <div className="flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
                <AlertCircle className="shrink-0 text-red-500" size={20} />
                <p className="text-sm text-red-700 dark:text-red-400">
                  {submitError}
                </p>
              </div>
            )}

            {/* Submission Actions */}
            <div className="flex flex-col items-center justify-between gap-6 border-t border-slate-100 pt-10 md:flex-row dark:border-slate-700">
              <div className="flex max-w-md items-start gap-4 rounded-2xl border border-[var(--color-sunny-yellow)]/20 bg-[var(--color-sunny-yellow)]/10 p-4">
                <AlertCircle
                  className="shrink-0 text-[var(--color-sunny-yellow)]"
                  size={20}
                />
                <p className="text-[10px] leading-relaxed text-slate-600 dark:text-slate-300">
                  <strong>Contributor Note:</strong> Your submission will be
                  reviewed by our team before being published. This ensures all
                  information is accurate.
                </p>
              </div>
              <div className="flex w-full gap-4 md:w-auto">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 px-10 py-4 text-sm font-bold text-slate-500 transition-colors hover:text-slate-900 md:flex-none dark:text-slate-400 dark:hover:text-white"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-slate-900 px-12 py-4 font-bold text-white shadow-xl transition-all hover:bg-[var(--color-ocean-blue)] hover:shadow-[var(--color-ocean-blue)]/20 active:scale-95 disabled:opacity-50 md:flex-none dark:bg-slate-700"
                >
                  <Send size={18} />{" "}
                  {isSubmitting ? "Submitting..." : "Submit Entry"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
