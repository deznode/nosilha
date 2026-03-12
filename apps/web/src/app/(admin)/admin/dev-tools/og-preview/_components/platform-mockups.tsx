"use client";

import type { CSSProperties } from "react";

import { StaticHibiscus } from "@/components/ui/logo";

/* eslint-disable @next/next/no-img-element */

interface PlatformMockupProps {
  ogImageUrl: string;
  title: string;
  subtitle?: string;
  siteUrl?: string;
}

function OgImage({
  src,
  alt,
  className,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={(e) => {
        const target = e.currentTarget;
        target.style.display = "none";
        const fallback = target.nextElementSibling as HTMLElement | null;
        if (fallback) fallback.style.display = "flex";
      }}
    />
  );
}

function ImageFallback({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{ display: "none", background: "#e5e7eb", ...style }}
    >
      <span style={{ color: "#9ca3af", fontSize: 14 }}>
        Failed to load OG image
      </span>
    </div>
  );
}

function PlatformLabel({ label }: { label: string }) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: "#9ca3af",
        marginBottom: 6,
      }}
    >
      {label}
    </p>
  );
}

const IMAGE_STYLE: CSSProperties = { aspectRatio: "1200/630" };
const IMAGE_STYLE_TWITTER: CSSProperties = { aspectRatio: "2/1" };

export function FacebookCard({
  ogImageUrl,
  title,
  subtitle,
  siteUrl = "nosilha.com",
}: PlatformMockupProps) {
  return (
    <div>
      <PlatformLabel label="Facebook" />
      <div
        style={{
          background: "#ffffff",
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid #dadde1",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        {/* Post header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 12px 8px",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#ffffff",
              border: "1px solid #dadde1",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <StaticHibiscus className="h-9 w-9" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#050505" }}>
              Nos Ilha
            </div>
            <div style={{ fontSize: 12, color: "#65676b" }}>Just now</div>
          </div>
        </div>

        {/* Link preview card */}
        <div style={{ border: "1px solid #dadde1", margin: "0 12px 12px" }}>
          <OgImage
            src={ogImageUrl}
            alt={title}
            className="block w-full object-cover"
            style={IMAGE_STYLE}
          />
          <ImageFallback
            className="flex w-full items-center justify-center"
            style={IMAGE_STYLE}
          />
          <div style={{ background: "#f0f2f5", padding: "10px 12px" }}>
            <div
              style={{
                fontSize: 12,
                color: "#65676b",
                textTransform: "uppercase",
              }}
            >
              {siteUrl}
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#050505",
                lineHeight: 1.3,
                marginTop: 2,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div
                style={{
                  fontSize: 14,
                  color: "#65676b",
                  marginTop: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {/* Action bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            padding: "4px 12px 8px",
            borderTop: "1px solid #dadde1",
            margin: "0 12px",
            fontSize: 13,
            fontWeight: 600,
            color: "#65676b",
          }}
        >
          <span>Like</span>
          <span>Comment</span>
          <span>Share</span>
        </div>
      </div>
    </div>
  );
}

export function TwitterCard({
  ogImageUrl,
  title,
  siteUrl = "nosilha.com",
}: PlatformMockupProps) {
  return (
    <div>
      <PlatformLabel label="Twitter / X" />
      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid #cfd9de",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <OgImage
          src={ogImageUrl}
          alt={title}
          className="block w-full object-cover"
          style={IMAGE_STYLE_TWITTER}
        />
        <ImageFallback
          className="flex w-full items-center justify-center"
          style={IMAGE_STYLE_TWITTER}
        />
        <div style={{ padding: "10px 12px" }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#0f1419",
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 13, color: "#536471", marginTop: 2 }}>
            From {siteUrl}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LinkedInCard({
  ogImageUrl,
  title,
  subtitle,
  siteUrl = "nosilha.com",
}: PlatformMockupProps) {
  return (
    <div>
      <PlatformLabel label="LinkedIn" />
      <div
        style={{
          background: "#ffffff",
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid #e0e0e0",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        {/* Post header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px 8px",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#ffffff",
              border: "1px solid #e0e0e0",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <StaticHibiscus className="h-10 w-10" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#000000e6" }}>
              Nos Ilha
            </div>
            <div style={{ fontSize: 12, color: "#00000099" }}>Just now</div>
          </div>
        </div>

        {/* Link preview */}
        <OgImage
          src={ogImageUrl}
          alt={title}
          className="block w-full object-cover"
          style={IMAGE_STYLE}
        />
        <ImageFallback
          className="flex w-full items-center justify-center"
          style={IMAGE_STYLE}
        />
        <div style={{ background: "#f3f6f8", padding: "10px 16px 12px" }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#000000e6",
              lineHeight: 1.3,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 12,
                color: "#00000099",
                marginTop: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {subtitle}
            </div>
          )}
          <div style={{ fontSize: 12, color: "#00000099", marginTop: 4 }}>
            {siteUrl}
          </div>
        </div>

        {/* Reaction bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            padding: "8px 16px",
            borderTop: "1px solid #e0e0e0",
            fontSize: 12,
            fontWeight: 600,
            color: "#00000099",
          }}
        >
          <span>Like</span>
          <span>Comment</span>
          <span>Repost</span>
          <span>Send</span>
        </div>
      </div>
    </div>
  );
}

export function WhatsAppCard({
  ogImageUrl,
  title,
  siteUrl = "nosilha.com",
}: PlatformMockupProps) {
  return (
    <div>
      <PlatformLabel label="WhatsApp" />
      <div
        style={{
          background: "#e7dfc6",
          borderRadius: 12,
          padding: 8,
          maxWidth: 340,
        }}
      >
        <div
          style={{
            background: "#dcf8c6",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <OgImage
            src={ogImageUrl}
            alt={title}
            className="block w-full object-cover"
            style={IMAGE_STYLE}
          />
          <ImageFallback
            className="flex w-full items-center justify-center"
            style={IMAGE_STYLE}
          />
          <div style={{ padding: "6px 8px" }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#111b21",
                lineHeight: 1.3,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#667781",
                marginTop: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{siteUrl}</span>
              <span style={{ fontSize: 10, color: "#667781" }}>12:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IMessageCard({
  ogImageUrl,
  title,
  siteUrl = "nosilha.com",
}: PlatformMockupProps) {
  return (
    <div>
      <PlatformLabel label="iMessage" />
      <div
        style={{
          background: "#e5e5ea",
          borderRadius: 18,
          overflow: "hidden",
          maxWidth: 340,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
        }}
      >
        <div style={{ position: "relative" }}>
          <OgImage
            src={ogImageUrl}
            alt={title}
            className="block w-full object-cover"
            style={IMAGE_STYLE}
          />
          <ImageFallback
            className="flex w-full items-center justify-center"
            style={IMAGE_STYLE}
          />
          {/* Title overlay at bottom of image */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
              padding: "24px 12px 10px",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#ffffff",
                lineHeight: 1.3,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.7)",
                marginTop: 2,
              }}
            >
              {siteUrl}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
