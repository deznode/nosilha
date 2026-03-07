import type { ReactElement } from "react";

// Hex equivalents of OKLCH design tokens (Satori limitation — no OKLCH support)
const colors = {
  oceanBlue: "#0e4c75",
  oceanBlueLight: "#1a6a9e",
  bougainvilleaPink: "#c4366a",
  sunnyYellow: "#e8c740",
  basalt: "#28282f",
  basaltLight: "#3d3d47",
  white: "#ffffff",
} as const;

const gradients: Record<string, string> = {
  default: `linear-gradient(135deg, ${colors.oceanBlue} 0%, ${colors.oceanBlueLight} 50%, ${colors.bougainvilleaPink} 100%)`,
  article: `linear-gradient(135deg, ${colors.basalt} 0%, ${colors.oceanBlue} 60%, ${colors.oceanBlueLight} 100%)`,
  gallery: `linear-gradient(135deg, ${colors.basalt} 0%, ${colors.basaltLight} 40%, ${colors.bougainvilleaPink} 100%)`,
  directory: `linear-gradient(135deg, ${colors.oceanBlue} 0%, ${colors.oceanBlueLight} 100%)`,
};

// Simple logo mark — Satori has limited SVG support so we use CSS shapes
function LogoMark({ size = 48 }: { size?: number }): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background: colors.bougainvilleaPink,
      }}
    >
      <div
        style={{
          display: "flex",
          width: Math.round(size * 0.35),
          height: Math.round(size * 0.35),
          borderRadius: "50%",
          background: colors.sunnyYellow,
        }}
      />
    </div>
  );
}

interface OgTemplateProps {
  type: "default" | "directory" | "article" | "gallery";
  title: string;
  subtitle?: string;
  category?: string;
  imageUrl?: string;
}

export function OgTemplate({
  type,
  title,
  subtitle,
  category,
  imageUrl,
}: OgTemplateProps): ReactElement {
  const hasBackgroundImage = type === "directory" && imageUrl;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: 1200,
        height: 630,
        padding: "48px 56px",
        fontFamily: "Outfit",
        color: colors.white,
        background: gradients[type] || gradients.default,
      }}
    >
      {/* Top: Logo + Category */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LogoMark size={48} />
          <span
            style={{
              fontFamily: "Fraunces",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            Nos Ilha
          </span>
        </div>

        {category && (
          <div
            style={{
              display: "flex",
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 20,
              padding: "6px 18px",
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            {category}
          </div>
        )}
      </div>

      {/* Center: Title */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxWidth: hasBackgroundImage ? 650 : 900,
        }}
      >
        <span
          style={{
            fontFamily: "Fraunces",
            fontSize: title.length > 50 ? 42 : 52,
            fontWeight: 700,
            lineHeight: 1.15,
            textShadow: "0 2px 12px rgba(0,0,0,0.3)",
          }}
        >
          {title}
        </span>
        {subtitle && (
          <span
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </span>
        )}
      </div>

      {/* Bottom: URL */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: 0.5,
          }}
        >
          nosilha.com
        </span>
      </div>
    </div>
  );
}
