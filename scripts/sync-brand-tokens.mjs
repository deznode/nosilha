#!/usr/bin/env node
/**
 * Nos Ilha Brand Sync Script (v2.0)
 * ----------------------------------------
 * Reads: /brand/assets/palette.json (OKLCH format)
 * Updates: /apps/web/src/app/globals.css
 *
 * Generates CSS custom properties for:
 * - Light mode (:root) - all brand tokens
 * - Dark mode (.dark) - brand tokens with dark overrides
 *
 * Usage:
 *   node scripts/sync-brand-tokens.mjs           # Apply changes
 *   node scripts/sync-brand-tokens.mjs --dry-run # Preview changes
 *   node scripts/sync-brand-tokens.mjs --verbose # Detailed output
 *   node scripts/sync-brand-tokens.mjs --help    # Show help
 */

import fs from "fs";
import path from "path";
import url from "url";

// === CONFIGURATION ===
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const CONFIG = {
  palettePath: path.resolve(__dirname, "../brand/assets/palette.json"),
  cssPath: path.resolve(__dirname, "../apps/web/src/app/globals.css"),
  markers: {
    light: {
      start: "  /* @brand-tokens:start */",
      end: "  /* @brand-tokens:end */",
    },
    dark: {
      start: "  /* @brand-tokens-dark:start */",
      end: "  /* @brand-tokens-dark:end */",
    },
  },
  prefixes: {
    brand: "--brand-",
    neutrals: "--neutral-",
    status: "--status-",
  },
};

// === CLI ARGS ===
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const verbose = args.includes("--verbose");
const showHelp = args.includes("--help") || args.includes("-h");

if (showHelp) {
  console.log(`
Brand Token Sync Script v2.0

Syncs OKLCH color tokens from palette.json to globals.css

Usage:
  node scripts/sync-brand-tokens.mjs [options]

Options:
  --dry-run   Preview changes without writing to file
  --verbose   Show detailed output
  --help, -h  Show this help message

Files:
  Source: brand/assets/palette.json
  Target: apps/web/src/app/globals.css
`);
  process.exit(0);
}

// === UTILITY FUNCTIONS ===

function log(message) {
  console.log(message);
}

function logVerbose(message) {
  if (verbose) console.log(`  ${message}`);
}

function logError(message) {
  console.error(`[ERROR] ${message}`);
}

/**
 * Convert camelCase to kebab-case
 * Examples: oceanBlue -> ocean-blue, mist50 -> mist-50
 */
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2") // camelCase -> camel-Case
    .replace(/([a-zA-Z])(\d)/g, "$1-$2") // mist50 -> mist-50
    .toLowerCase();
}

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Validate OKLCH color format
 * Format: oklch(L C H) where L is 0-1, C is 0-0.5, H is 0-360
 */
function validateOklch(value, tokenName) {
  if (value === null) return true; // null is valid (no dark override)

  const pattern = /^oklch\(\s*(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s*\)$/;
  const match = value.match(pattern);

  if (!match) {
    throw new Error(`Invalid OKLCH format for ${tokenName}: "${value}"`);
  }

  const [, L, C, H] = match.map(Number);

  if (L < 0 || L > 1) {
    throw new Error(`Lightness out of range (0-1) for ${tokenName}: ${L}`);
  }
  if (C < 0 || C > 0.5) {
    throw new Error(`Chroma out of range (0-0.5) for ${tokenName}: ${C}`);
  }
  if (H < 0 || H > 360) {
    throw new Error(`Hue out of range (0-360) for ${tokenName}: ${H}`);
  }

  return true;
}

/**
 * Read and parse palette.json
 */
function loadPalette() {
  if (!fs.existsSync(CONFIG.palettePath)) {
    throw new Error(`Palette file not found: ${CONFIG.palettePath}`);
  }

  const content = fs.readFileSync(CONFIG.palettePath, "utf8");
  let palette;

  try {
    palette = JSON.parse(content);
  } catch (error) {
    throw new Error(`Invalid JSON in palette.json: ${error.message}`);
  }

  // Validate required fields
  if (!palette.meta?.version) {
    throw new Error("Missing required field: meta.version");
  }
  if (!palette.brand) {
    throw new Error("Missing required field: brand");
  }
  if (!palette.neutrals) {
    throw new Error("Missing required field: neutrals");
  }
  if (!palette.status) {
    throw new Error("Missing required field: status");
  }

  // Validate OKLCH values
  for (const [category, tokens] of Object.entries({
    brand: palette.brand,
    neutrals: palette.neutrals,
    status: palette.status,
  })) {
    for (const [key, value] of Object.entries(tokens)) {
      if (typeof value === "object" && value !== null) {
        validateOklch(value.light, `${category}.${key}.light`);
        validateOklch(value.dark, `${category}.${key}.dark`);
      }
    }
  }

  return palette;
}

/**
 * Generate CSS variables for light mode
 */
function generateLightBlock(palette) {
  const lines = [
    CONFIG.markers.light.start,
    `  /* AUTO-GENERATED from palette.json v${palette.meta.version} */`,
    `  /* Updated: ${new Date().toISOString().split("T")[0]} */`,
    "",
    "  /* === BRAND PALETTE (The Brava Tones) in OKLCH === */",
    "  /* Primary Brand */",
  ];

  // Brand colors
  for (const [key, value] of Object.entries(palette.brand)) {
    const varName = `${CONFIG.prefixes.brand}${toKebabCase(key)}`;
    lines.push(`  ${varName}: ${value.light};`);
  }

  // Neutrals
  lines.push("");
  lines.push("  /* Mist & Basalt (Neutrals) in OKLCH */");
  for (const [key, value] of Object.entries(palette.neutrals)) {
    const varName = `${CONFIG.prefixes.neutrals}${toKebabCase(key)}`;
    // Add WCAG comment for basalt-600
    const comment = key === "basalt600" ? " /* WCAG AA compliant for muted text */" : "";
    lines.push(`  ${varName}: ${value.light};${comment}`);
  }

  // Status
  lines.push("");
  lines.push("  /* Status Colors in OKLCH */");
  for (const [key, value] of Object.entries(palette.status)) {
    const varName = `${CONFIG.prefixes.status}${toKebabCase(key)}`;
    lines.push(`  ${varName}: ${value.light};`);
  }

  lines.push(CONFIG.markers.light.end);

  return lines.join("\n");
}

/**
 * Generate CSS variables for dark mode (only overrides)
 */
function generateDarkBlock(palette) {
  const darkOverrides = [];

  // Collect all dark overrides
  for (const [category, tokens] of Object.entries({
    brand: palette.brand,
    neutrals: palette.neutrals,
    status: palette.status,
  })) {
    for (const [key, value] of Object.entries(tokens)) {
      if (value.dark !== null) {
        const prefix = CONFIG.prefixes[category];
        const varName = `${prefix}${toKebabCase(key)}`;
        darkOverrides.push({ varName, value: value.dark, category });
      }
    }
  }

  if (darkOverrides.length === 0) {
    // No dark overrides
    return [
      CONFIG.markers.dark.start,
      "  /* No dark mode overrides defined */",
      CONFIG.markers.dark.end,
    ].join("\n");
  }

  const lines = [
    CONFIG.markers.dark.start,
    "  /* Brand Adjustments for Dark Mode (Lighter for contrast) */",
  ];

  for (const override of darkOverrides) {
    lines.push(`  ${override.varName}: ${override.value};`);
  }

  lines.push(CONFIG.markers.dark.end);

  return lines.join("\n");
}

/**
 * Replace content between markers in CSS
 */
function replaceSection(css, startMarker, endMarker, newContent) {
  const startPattern = escapeRegExp(startMarker);
  const endPattern = escapeRegExp(endMarker);

  const regex = new RegExp(`${startPattern}[\\s\\S]*?${endPattern}`, "g");

  if (!regex.test(css)) {
    throw new Error(
      `Markers not found in globals.css:\n` +
        `  Expected: ${startMarker} ... ${endMarker}\n\n` +
        `  Please add these markers to the appropriate section.`
    );
  }

  // Reset regex lastIndex after test
  regex.lastIndex = 0;

  return css.replace(regex, newContent);
}

// === MAIN EXECUTION ===

log("Brand Token Sync v2.0");
log("━".repeat(50));
log("");

try {
  // 1. Load and validate palette
  log(`Reading palette: ${CONFIG.palettePath}`);
  const palette = loadPalette();
  log(`  Version: ${palette.meta.version} (${palette.meta.codename})`);
  log(`  Format: ${palette.meta.colorFormat}`);
  logVerbose(`Brand colors: ${Object.keys(palette.brand).length}`);
  logVerbose(`Neutrals: ${Object.keys(palette.neutrals).length}`);
  logVerbose(`Status colors: ${Object.keys(palette.status).length}`);
  log("");

  // 2. Read CSS file
  log(`Reading CSS: ${CONFIG.cssPath}`);
  if (!fs.existsSync(CONFIG.cssPath)) {
    throw new Error(`CSS file not found: ${CONFIG.cssPath}`);
  }
  let cssContent = fs.readFileSync(CONFIG.cssPath, "utf8");

  // Check markers exist
  const hasLightMarkers =
    cssContent.includes(CONFIG.markers.light.start) &&
    cssContent.includes(CONFIG.markers.light.end);
  const hasDarkMarkers =
    cssContent.includes(CONFIG.markers.dark.start) &&
    cssContent.includes(CONFIG.markers.dark.end);

  log(`  Light markers: ${hasLightMarkers ? "Found" : "Missing"}`);
  log(`  Dark markers: ${hasDarkMarkers ? "Found" : "Missing"}`);

  if (!hasLightMarkers || !hasDarkMarkers) {
    throw new Error(
      `Missing markers in globals.css.\n\n` +
        `Please ensure the file contains:\n` +
        `  ${CONFIG.markers.light.start} ... ${CONFIG.markers.light.end}\n` +
        `  ${CONFIG.markers.dark.start} ... ${CONFIG.markers.dark.end}`
    );
  }
  log("");

  // 3. Generate new content
  log("Generating tokens:");
  const lightBlock = generateLightBlock(palette);
  const darkBlock = generateDarkBlock(palette);

  const lightCount =
    Object.keys(palette.brand).length +
    Object.keys(palette.neutrals).length +
    Object.keys(palette.status).length;

  let darkCount = 0;
  for (const tokens of [palette.brand, palette.neutrals, palette.status]) {
    for (const value of Object.values(tokens)) {
      if (value.dark !== null) darkCount++;
    }
  }

  log(`  Light mode: ${lightCount} variables`);
  log(`  Dark mode: ${darkCount} overrides`);
  log("");

  // 4. Replace sections
  let updatedCss = replaceSection(
    cssContent,
    CONFIG.markers.light.start,
    CONFIG.markers.light.end,
    lightBlock
  );

  updatedCss = replaceSection(
    updatedCss,
    CONFIG.markers.dark.start,
    CONFIG.markers.dark.end,
    darkBlock
  );

  // 5. Write or preview
  if (dryRun) {
    log("[DRY RUN] Changes would be:");
    log("");
    log("=== Light Mode Block ===");
    log(lightBlock);
    log("");
    log("=== Dark Mode Block ===");
    log(darkBlock);
    log("");
    log("[DRY RUN] No files were modified.");
  } else {
    fs.writeFileSync(CONFIG.cssPath, updatedCss, "utf8");
    log(`Updated: ${CONFIG.cssPath}`);
  }

  log("");
  log("Summary:");
  log(`  Brand colors: ${Object.keys(palette.brand).length} (${darkCount} with dark overrides)`);
  log(`  Neutrals: ${Object.keys(palette.neutrals).length}`);
  log(`  Status: ${Object.keys(palette.status).length}`);
  log("");
  log("Done! Brand tokens synced successfully.");
} catch (error) {
  logError(error.message);
  process.exit(1);
}
