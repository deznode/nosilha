"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { AnimatedButton } from "@/components/ui/animated-button";
import { useAuth } from "@/components/providers/auth-provider";
import { InlineAuthPrompt } from "@/components/ui/inline-auth-prompt";
import {
  generateDirectoryContentAction,
  checkGeminiAvailableAction,
} from "@/app/actions/gemini-actions";
import { submitDirectoryEntry, updateDirectoryEntry } from "@/lib/api";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/catalyst-ui/input";
import { Field, Label, ErrorMessage } from "@/components/catalyst-ui/fieldset";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  directorySubmissionSchema,
  type DirectorySubmissionInput,
} from "@/schemas/directorySubmissionSchema";
import type { DirectorySubmissionRequest } from "@/lib/api-contracts";
import type { DirectorySubmission } from "@/types/admin";
import { useToast } from "@/hooks/use-toast";

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

const townOptions = PRESET_TOWNS.map((town) => ({ value: town, label: town }));

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
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useCustomTown, setUseCustomTown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [geminiAvailable, setGeminiAvailable] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Only require auth for create mode (edit mode is already admin-only)
  const requiresAuth = mode === "create" && !authLoading && !user;

  // Check Gemini availability on mount
  useEffect(() => {
    checkGeminiAvailableAction().then(setGeminiAvailable);
  }, []);

  // Initialize form data from initialData for edit mode
  const getInitialFormData = (): DirectorySubmissionInput => {
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
        priceLevel: (initialData.priceLevel as "$" | "$$" | "$$$") || undefined,
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

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<DirectorySubmissionInput>({
    resolver: zodResolver(directorySubmissionSchema),
    defaultValues: getInitialFormData(),
  });

  const formData = watch();

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
        setValue("description", result.description);
        setValue("tags", result.tags.join(", "));
      }
    } catch (e) {
      console.error("AI generation failed:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: DirectorySubmissionInput) => {
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
        name: data.name,
        category: categoryMap[data.category],
        town: useCustomTown ? data.customTown || "" : data.town,
        customTown: useCustomTown ? data.customTown : undefined,
        description: data.description,
        tags: data.tags
          ? data.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        imageUrl: data.imageUrl || undefined,
        priceLevel:
          data.category === "Restaurant" ? data.priceLevel : undefined,
        latitude:
          data.latitude !== "" && data.latitude !== undefined
            ? typeof data.latitude === "number"
              ? data.latitude
              : parseFloat(data.latitude)
            : undefined,
        longitude:
          data.longitude !== "" && data.longitude !== undefined
            ? typeof data.longitude === "number"
              ? data.longitude
              : parseFloat(data.longitude)
            : undefined,
      };

      if (mode === "edit" && initialData) {
        // Update existing entry
        await updateDirectoryEntry(initialData.id, requestData);
        toast.success("Entry updated successfully").show();
        // Call success callback for modal to close
        onSuccess?.();
      } else {
        // Create new entry
        await submitDirectoryEntry(requestData as DirectorySubmissionRequest);
        toast.success("Location submitted for review").show();
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
      toast.error(message).show();
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
        <div className="border-hairline bg-surface rounded-container w-full max-w-md border p-12 text-center shadow-2xl">
          <div className="bg-valley-green/10 mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white shadow-inner">
            <Check className="text-valley-green h-12 w-12" />
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
            className="bg-ocean-blue hover:bg-ocean-blue/90 w-full rounded-2xl py-4 font-bold text-white shadow-xl transition active:scale-[0.98]"
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
        {/* Simple header for modal */}
        <div className="border-hairline border-b pb-4">
          <h2 className="text-body font-serif text-xl font-bold">
            {mode === "edit" ? `Edit: ${initialData?.name}` : "Add New Entry"}
          </h2>
        </div>

        {/* Compact form fields */}
        <div className="space-y-4">
          {/* Name */}
          <Field>
            <Label className="text-body text-sm font-bold">Location Name</Label>
            <div className="relative">
              <Input
                {...register("name")}
                type="text"
                placeholder="e.g., Pensão Sodade"
                data-invalid={errors.name ? "" : undefined}
              />
              {formData.name && geminiAvailable && (
                <button
                  type="button"
                  onClick={handleAIAutoFill}
                  disabled={isGenerating}
                  className="bg-bougainvillea-pink hover:bg-bougainvillea-pink/90 absolute top-2 right-2 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50"
                >
                  <Sparkles
                    size={12}
                    className={isGenerating ? "animate-spin" : ""}
                  />
                  {isGenerating ? "..." : "AI"}
                </button>
              )}
            </div>
            {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
          </Field>

          {/* Category - Compact grid (keep custom UI) */}
          <div>
            <label className="text-body mb-2 block text-sm font-bold">
              Category
            </label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-5 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => field.onChange(cat.id)}
                      className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition-all ${
                        field.value === cat.id
                          ? `${cat.selectedBorderClass} ${cat.selectedBgClass} ring-2 ${cat.selectedRingClass}`
                          : "border-hairline text-muted hover:border-edge"
                      }`}
                    >
                      <div
                        className={`rounded-lg p-1.5 ${
                          field.value === cat.id
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
              )}
            />
            {errors.category && (
              <ErrorMessage>{errors.category.message}</ErrorMessage>
            )}
          </div>

          {/* Town */}
          <Field>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-body text-sm font-bold">Town</Label>
              <button
                type="button"
                onClick={() => setUseCustomTown(!useCustomTown)}
                className="text-ocean-blue flex items-center gap-1 text-xs font-bold hover:underline"
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
                <Input
                  {...register("customTown")}
                  type="text"
                  placeholder="Enter town name..."
                  className="pl-9"
                  data-invalid={errors.customTown ? "" : undefined}
                />
                <MapPin
                  size={16}
                  className="text-ocean-blue absolute top-3.5 left-3"
                />
              </div>
            ) : (
              <Controller
                name="town"
                control={control}
                render={({ field }) => (
                  <Select
                    options={townOptions}
                    value={field.value}
                    onChange={field.onChange}
                    invalid={!!errors.town}
                  />
                )}
              />
            )}
            {errors.town && <ErrorMessage>{errors.town.message}</ErrorMessage>}
            {errors.customTown && (
              <ErrorMessage>{errors.customTown.message}</ErrorMessage>
            )}
          </Field>

          {/* Description */}
          <Field>
            <Label className="text-body text-sm font-bold">Description</Label>
            <Textarea
              {...register("description")}
              rows={3}
              placeholder="Describe the location..."
              data-invalid={errors.description ? "" : undefined}
            />
            {errors.description && (
              <ErrorMessage>{errors.description.message}</ErrorMessage>
            )}
          </Field>

          {/* Tags & Price (side by side) */}
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label className="text-body text-sm font-bold">Tags</Label>
              <div className="relative">
                <Input
                  {...register("tags")}
                  type="text"
                  placeholder="ocean-view, historical"
                  className="pl-9 text-sm"
                />
                <Tag size={14} className="text-muted absolute top-3.5 left-3" />
              </div>
            </Field>

            {formData.category === "Restaurant" && (
              <div>
                <label className="text-body mb-2 block text-sm font-bold">
                  Price
                </label>
                <Controller
                  name="priceLevel"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-1">
                      {(["$", "$$", "$$$"] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => field.onChange(p)}
                          className={`flex-1 rounded-lg border py-3 text-xs font-bold transition-all ${
                            field.value === p
                              ? "border-valley-green bg-valley-green text-white"
                              : "border-hairline bg-surface text-muted"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-body mb-2 block text-sm font-bold">
              Photo
            </label>
            <ImageUploader
              onUploadComplete={(url) => setValue("imageUrl", url)}
              category="directory"
              description={formData.name || "Directory entry photo"}
              autoUpload={true}
              initialUrl={formData.imageUrl}
            />
          </div>

          {/* Coordinates (collapsed) */}
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label className="text-muted text-[10px] font-bold tracking-widest uppercase">
                Latitude
              </Label>
              <Input
                {...register("latitude")}
                type="number"
                step="any"
                placeholder="14.8687"
                className="text-sm"
              />
            </Field>
            <Field>
              <Label className="text-muted text-[10px] font-bold tracking-widest uppercase">
                Longitude
              </Label>
              <Input
                {...register("longitude")}
                type="number"
                step="any"
                placeholder="-24.7011"
                className="text-sm"
              />
            </Field>
          </div>
        </div>

        {/* Error Display */}
        {submitError && (
          <div className="border-status-error/20 bg-status-error/10 flex items-start gap-3 rounded-xl border p-3">
            <AlertCircle className="text-status-error shrink-0" size={18} />
            <p className="text-status-error text-sm">{submitError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="border-hairline flex justify-end gap-3 border-t pt-4">
          <AnimatedButton
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            icon={<Save size={16} />}
          >
            {isSubmitting
              ? "Saving..."
              : mode === "edit"
                ? "Save Changes"
                : "Submit Entry"}
          </AnimatedButton>
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

        <div className="border-hairline bg-surface rounded-container overflow-hidden border shadow-2xl">
          {/* Header Branding */}
          <div className="bg-ocean-blue relative overflow-hidden px-12 py-12 text-white">
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 p-12">
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
              <div className="border-hairline text-ocean-blue flex items-center gap-3 border-b pb-3 text-xs font-bold tracking-[0.2em] uppercase">
                <Info size={16} /> 1. Essential Details
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field>
                    <Label className="text-body text-sm font-bold">
                      Location Name
                    </Label>
                    <div className="relative">
                      <Input
                        {...register("name")}
                        type="text"
                        placeholder="e.g., Pensão Sodade"
                        className="text-lg font-medium"
                        data-invalid={errors.name ? "" : undefined}
                      />
                      {formData.name && geminiAvailable && (
                        <button
                          type="button"
                          onClick={handleAIAutoFill}
                          disabled={isGenerating}
                          className="bg-bougainvillea-pink hover:bg-bougainvillea-pink/90 absolute top-3 right-3 flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
                        >
                          <Sparkles
                            size={14}
                            className={isGenerating ? "animate-spin" : ""}
                          />
                          {isGenerating ? "Mapping..." : "AI Assist"}
                        </button>
                      )}
                    </div>
                    {errors.name && (
                      <ErrorMessage>{errors.name.message}</ErrorMessage>
                    )}
                  </Field>
                </div>

                <div className="md:col-span-2">
                  <label className="text-body mb-4 block text-sm font-bold">
                    Category
                  </label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => field.onChange(cat.id)}
                            className={`flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all ${
                              field.value === cat.id
                                ? `${cat.selectedBorderClass} ${cat.selectedBgClass} ring-4 ${cat.selectedRingClass} scale-[1.02] shadow-lg`
                                : "border-hairline text-muted hover:border-edge hover:bg-surface-alt"
                            }`}
                          >
                            <div
                              className={`rounded-2xl p-3 transition-all ${
                                field.value === cat.id
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
                    )}
                  />
                  {errors.category && (
                    <ErrorMessage>{errors.category.message}</ErrorMessage>
                  )}
                </div>
              </div>

              <Field>
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-body text-sm font-bold">
                    Town / Village
                  </Label>
                  <button
                    type="button"
                    onClick={() => setUseCustomTown(!useCustomTown)}
                    className="text-ocean-blue flex items-center gap-1 text-xs font-bold hover:underline"
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
                    <Input
                      {...register("customTown")}
                      type="text"
                      placeholder="Enter town name..."
                      className="pl-10"
                      data-invalid={errors.customTown ? "" : undefined}
                    />
                    <MapPin
                      size={18}
                      className="text-ocean-blue absolute top-4 left-4"
                    />
                  </div>
                ) : (
                  <Controller
                    name="town"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={townOptions}
                        value={field.value}
                        onChange={field.onChange}
                        invalid={!!errors.town}
                      />
                    )}
                  />
                )}
                {errors.town && (
                  <ErrorMessage>{errors.town.message}</ErrorMessage>
                )}
                {errors.customTown && (
                  <ErrorMessage>{errors.customTown.message}</ErrorMessage>
                )}
              </Field>
            </div>

            {/* Cultural Context */}
            <div className="space-y-8">
              <div className="border-hairline text-ocean-blue flex items-center gap-3 border-b pb-3 text-xs font-bold tracking-[0.2em] uppercase">
                <History size={16} /> 2. Context & Story
              </div>

              <div className="space-y-6">
                <Field>
                  <Label className="text-body text-sm font-bold">
                    Description
                  </Label>
                  <Textarea
                    {...register("description")}
                    rows={5}
                    placeholder="Describe the atmosphere, significance, or history of this location..."
                    data-invalid={errors.description ? "" : undefined}
                  />
                  {errors.description && (
                    <ErrorMessage>{errors.description.message}</ErrorMessage>
                  )}
                </Field>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <Field>
                    <Label className="text-body text-sm font-bold">
                      Discovery Tags
                    </Label>
                    <div className="relative">
                      <Input
                        {...register("tags")}
                        type="text"
                        placeholder="ocean-view, historical, hidden-gem"
                        className="pl-10 text-sm"
                      />
                      <Tag
                        size={16}
                        className="text-muted absolute top-3.5 left-3.5"
                      />
                    </div>
                  </Field>

                  {formData.category === "Restaurant" && (
                    <div className="border-hairline bg-surface flex items-center gap-4 rounded-2xl border p-4">
                      <span className="text-muted text-xs font-bold">
                        Price:
                      </span>
                      <Controller
                        name="priceLevel"
                        control={control}
                        render={({ field }) => (
                          <div className="flex gap-1">
                            {(["$", "$$", "$$$"] as const).map((p) => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => field.onChange(p)}
                                className={`w-10 rounded-lg border py-1.5 text-xs font-bold transition-all ${
                                  field.value === p
                                    ? "border-valley-green bg-valley-green text-white"
                                    : "border-hairline bg-surface text-muted"
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Media & Coordinates */}
            <div className="space-y-8">
              <div className="border-hairline text-ocean-blue flex items-center gap-3 border-b pb-3 text-xs font-bold tracking-[0.2em] uppercase">
                <ImageIcon size={16} /> 3. Visuals & Location
              </div>

              <div>
                <label className="text-body mb-2 block text-sm font-bold">
                  Primary Photo
                </label>
                <ImageUploader
                  onUploadComplete={(url) => setValue("imageUrl", url)}
                  category="directory"
                  description={formData.name || "Directory entry photo"}
                  autoUpload={true}
                  initialUrl={formData.imageUrl}
                />
                {formData.imageUrl && (
                  <p className="text-valley-green mt-2 text-sm">
                    Photo uploaded successfully
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-8">
                <Field>
                  <Label className="text-muted text-[10px] font-bold tracking-widest uppercase">
                    Latitude
                  </Label>
                  <Input
                    {...register("latitude")}
                    type="number"
                    step="any"
                    placeholder="14.8687"
                    className="text-sm"
                  />
                </Field>
                <Field>
                  <Label className="text-muted text-[10px] font-bold tracking-widest uppercase">
                    Longitude
                  </Label>
                  <Input
                    {...register("longitude")}
                    type="number"
                    step="any"
                    placeholder="-24.7011"
                    className="text-sm"
                  />
                </Field>
              </div>
            </div>

            {/* Error Display */}
            {submitError && (
              <div className="border-status-error/20 bg-status-error/10 flex items-start gap-4 rounded-2xl border p-4">
                <AlertCircle className="text-status-error shrink-0" size={20} />
                <p className="text-status-error text-sm">{submitError}</p>
              </div>
            )}

            {/* Submission Actions */}
            <div className="border-hairline flex flex-col items-center justify-between gap-6 border-t pt-10 md:flex-row">
              <div className="border-sobrado-ochre/20 bg-sobrado-ochre/10 flex max-w-md items-start gap-4 rounded-2xl border p-4">
                <AlertCircle
                  className="text-sobrado-ochre shrink-0"
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
