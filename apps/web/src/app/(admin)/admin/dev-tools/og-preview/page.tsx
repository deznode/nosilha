"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check } from "lucide-react";

import {
  FacebookCard,
  TwitterCard,
  LinkedInCard,
  WhatsAppCard,
  IMessageCard,
} from "./_components/platform-mockups";

type OgVariant = "static" | "default" | "directory" | "article" | "gallery";

const VARIANT_OPTIONS: { value: OgVariant; label: string }[] = [
  { value: "static", label: "Static (og-image.jpg)" },
  { value: "default", label: "Dynamic — Default" },
  { value: "directory", label: "Dynamic — Directory" },
  { value: "article", label: "Dynamic — Article" },
  { value: "gallery", label: "Dynamic — Gallery" },
];

const PRESETS: {
  label: string;
  variant: OgVariant;
  title: string;
  category?: string;
  subtitle?: string;
}[] = [
  {
    label: "Homepage",
    variant: "static",
    title: "Nos Ilha - Your Guide to Brava, Cape Verde",
  },
  {
    label: "About Page",
    variant: "default",
    title: "About Nos Ilha",
    subtitle: "Cultural heritage platform for Brava Island",
  },
  {
    label: "History Page",
    variant: "article",
    title: "History of Brava Island",
    subtitle: "From settlement to modern day",
  },
  {
    label: "Gallery Page",
    variant: "gallery",
    title: "Photo Gallery",
    subtitle: "Brava Island through the lens",
  },
  {
    label: "Directory — Restaurant",
    variant: "directory",
    title: "Restaurante Par a Par",
    category: "Restaurant",
  },
  {
    label: "Directory — Heritage",
    variant: "directory",
    title: "Nossa Senhora do Monte",
    category: "Heritage",
  },
  {
    label: "Directory — Beach",
    variant: "directory",
    title: "Praia de Fajã d'Água",
    category: "Beach",
  },
];

export default function OgPreviewPage() {
  const [variant, setVariant] = useState<OgVariant>("static");
  const [title, setTitle] = useState(
    "Nos Ilha - Your Guide to Brava, Cape Verde"
  );
  const [category, setCategory] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [copied, setCopied] = useState(false);

  // Debounce: only update the image URL after 300ms of no typing
  const [debouncedTitle, setDebouncedTitle] = useState(title);
  const [debouncedCategory, setDebouncedCategory] = useState(category);
  const [debouncedSubtitle, setDebouncedSubtitle] = useState(subtitle);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedTitle(title);
      setDebouncedCategory(category);
      setDebouncedSubtitle(subtitle);
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [title, category, subtitle]);

  const ogImageUrl = useMemo(() => {
    if (variant === "static") return "/images/og-image.jpg";

    const params = new URLSearchParams();
    params.set("type", variant);
    params.set("title", debouncedTitle);
    if (variant === "directory" && debouncedCategory) {
      params.set("category", debouncedCategory);
    }
    if (debouncedSubtitle) {
      params.set("subtitle", debouncedSubtitle);
    }
    return `/api/og?${params.toString()}`;
  }, [variant, debouncedTitle, debouncedCategory, debouncedSubtitle]);

  const displayUrl = useMemo(() => {
    if (variant === "static") return "/images/og-image.jpg";
    const params = new URLSearchParams();
    params.set("type", variant);
    params.set("title", debouncedTitle);
    if (variant === "directory" && debouncedCategory) {
      params.set("category", debouncedCategory);
    }
    if (debouncedSubtitle) {
      params.set("subtitle", debouncedSubtitle);
    }
    return `/api/og?${params.toString()}`;
  }, [variant, debouncedTitle, debouncedCategory, debouncedSubtitle]);

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setVariant(preset.variant);
    setTitle(preset.title);
    setCategory(preset.category ?? "");
    setSubtitle(preset.subtitle ?? "");
    // Immediately update debounced values for presets
    setDebouncedTitle(preset.title);
    setDebouncedCategory(preset.category ?? "");
    setDebouncedSubtitle(preset.subtitle ?? "");
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(
      `${window.location.origin}${displayUrl}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <Link
        href="/admin/dev-tools"
        className="text-muted hover:text-body mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dev Tools
      </Link>
      <h1 className="text-body mb-1 text-xl font-bold">OG Image Preview</h1>
      <p className="text-muted mb-6">
        Preview how OG images appear when shared on social media platforms.
      </p>

      {/* Config Section */}
      <section className="bg-surface border-hairline rounded-card mb-8 border p-4">
        <h2 className="text-body mb-3 text-sm font-semibold">Configuration</h2>

        {/* Presets */}
        <div className="mb-4">
          <label className="text-muted mb-1.5 block text-xs font-medium">
            Quick Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className="text-muted hover:text-body hover:bg-surface-alt rounded-button border-hairline border px-3 py-1 text-xs transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Variant selector */}
        <div className="mb-3">
          <label
            htmlFor="og-variant"
            className="text-muted mb-1.5 block text-xs font-medium"
          >
            OG Type
          </label>
          <select
            id="og-variant"
            value={variant}
            onChange={(e) => setVariant(e.target.value as OgVariant)}
            className="bg-surface border-hairline text-body rounded-button focus-ring w-full border px-3 py-2 text-sm sm:w-auto"
          >
            {VARIANT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        {variant !== "static" && (
          <div className="mb-3">
            <label
              htmlFor="og-title"
              className="text-muted mb-1.5 block text-xs font-medium"
            >
              Title
            </label>
            <input
              id="og-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-surface border-hairline text-body rounded-button focus-ring w-full border px-3 py-2 text-sm"
              placeholder="Page title"
            />
          </div>
        )}

        {/* Category (directory only) */}
        {variant === "directory" && (
          <div className="mb-3">
            <label
              htmlFor="og-category"
              className="text-muted mb-1.5 block text-xs font-medium"
            >
              Category
            </label>
            <input
              id="og-category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-surface border-hairline text-body rounded-button focus-ring w-full border px-3 py-2 text-sm"
              placeholder="e.g. Restaurant, Heritage, Beach"
            />
          </div>
        )}

        {/* Subtitle */}
        {variant !== "static" && (
          <div className="mb-3">
            <label
              htmlFor="og-subtitle"
              className="text-muted mb-1.5 block text-xs font-medium"
            >
              Subtitle (optional)
            </label>
            <input
              id="og-subtitle"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="bg-surface border-hairline text-body rounded-button focus-ring w-full border px-3 py-2 text-sm"
              placeholder="Optional subtitle"
            />
          </div>
        )}

        {/* URL display */}
        <div>
          <label className="text-muted mb-1.5 block text-xs font-medium">
            OG Image URL
          </label>
          <div className="border-hairline bg-canvas rounded-button flex items-center gap-2 border px-3 py-2">
            <code className="text-muted min-w-0 flex-1 truncate text-xs">
              {displayUrl}
            </code>
            <button
              onClick={copyUrl}
              className="text-muted hover:text-body flex-shrink-0 transition-colors"
              title="Copy full URL"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Raw OG Preview */}
      <section className="mb-8">
        <h2 className="text-body mb-3 text-sm font-semibold">
          Raw OG Image (1200 x 630)
        </h2>
        <div className="border-hairline rounded-card overflow-hidden border">
          <img
            key={ogImageUrl}
            src={ogImageUrl}
            alt="OG Image Preview"
            className="block w-full"
            style={{ aspectRatio: "1200/630", objectFit: "contain" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      </section>

      {/* Platform Mockups */}
      <section>
        <h2 className="text-body mb-4 text-sm font-semibold">
          Platform Previews
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <FacebookCard
            ogImageUrl={ogImageUrl}
            title={
              variant === "static"
                ? "Nos Ilha - Your Guide to Brava, Cape Verde"
                : debouncedTitle
            }
            subtitle={
              variant === "static"
                ? "The definitive cultural heritage hub for Brava Island, Cape Verde."
                : debouncedSubtitle || undefined
            }
          />
          <TwitterCard
            ogImageUrl={ogImageUrl}
            title={
              variant === "static"
                ? "Nos Ilha - Your Guide to Brava, Cape Verde"
                : debouncedTitle
            }
          />
          <LinkedInCard
            ogImageUrl={ogImageUrl}
            title={
              variant === "static"
                ? "Nos Ilha - Your Guide to Brava, Cape Verde"
                : debouncedTitle
            }
            subtitle={
              variant === "static"
                ? "The definitive cultural heritage hub for Brava Island, Cape Verde."
                : debouncedSubtitle || undefined
            }
          />
          <WhatsAppCard
            ogImageUrl={ogImageUrl}
            title={
              variant === "static"
                ? "Nos Ilha - Your Guide to Brava, Cape Verde"
                : debouncedTitle
            }
          />
          <IMessageCard
            ogImageUrl={ogImageUrl}
            title={
              variant === "static"
                ? "Nos Ilha - Your Guide to Brava, Cape Verde"
                : debouncedTitle
            }
          />
        </div>
      </section>
    </div>
  );
}
