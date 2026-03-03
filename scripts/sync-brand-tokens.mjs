/**
 * Nos Ilha Brand Sync Script
 * ----------------------------------------
 * Reads /brand/assets/palette.json and updates
 * the "Brand Color Palette" section inside:
 *   /frontend/src/app/globals.css
 *
 * Supports nested structure:
 * {
 *   "brand": {...},
 *   "accents": {...}
 * }
 *
 * Usage (from frontend/):
 *   node ../scripts/sync-brand-tokens.mjs
 */

import fs from "fs";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

/**
 * Utility: Safe file read
 */
function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:\n${error.message}`);
    process.exit(1);
  }
}

/**
 * Utility: Safe file write
 */
function writeFileSafe(filePath, data) {
  try {
    fs.writeFileSync(filePath, data, "utf8");
    console.log(`✅ Updated ${filePath}`);
  } catch (error) {
    console.error(`❌ Error writing ${filePath}:\n${error.message}`);
    process.exit(1);
  }
}

/**
 * Resolve absolute paths
 */
const palettePath = path.resolve(__dirname, "../brand/assets/palette.json");
const cssPath = path.resolve(__dirname, "../frontend/src/app/globals.css");

/**
 * Ensure both files exist
 */
if (!fs.existsSync(palettePath)) {
  console.error(`❌ Palette not found at: ${palettePath}`);
  process.exit(1);
}
if (!fs.existsSync(cssPath)) {
  console.error(`❌ globals.css not found at: ${cssPath}`);
  process.exit(1);
}

/**
 * Parse palette.json
 */
let palette;
try {
  palette = JSON.parse(readFileSafe(palettePath));
} catch (error) {
  console.error("❌ Invalid JSON in palette.json:", error.message);
  process.exit(1);
}

/**
 * Merge brand + accents into flat list
 */
const allTokens = {
  ...(palette.brand || {}),
  ...(palette.accents || {}),
};

/**
 * Generate CSS variable lines
 * Converts camelCase keys → kebab-case CSS vars
 */
const generated = Object.entries(allTokens)
  .map(([key, value]) => {
    const kebab = key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
    const prefix =
      key in (palette.brand || {}) ? "--color-" : "--color-accent-";
    return `  ${prefix}${kebab}: ${value};`;
  })
  .join("\n");

/**
 * Read globals.css and locate section
 */
let css = readFileSafe(cssPath);

const pattern =
  /(\/\* Brand Color Palette \*\/)([\s\S]*?)(\/\* Accent Colors for UI States \*\/)/;
if (!pattern.test(css)) {
  console.error(
    "❌ globals.css does not contain the expected section markers:\n" +
      "/* Brand Color Palette */ ... /* Accent Colors for UI States */"
  );
  process.exit(1);
}

/**
 * Inject new color tokens between markers
 */
const updated = css.replace(pattern, `$1\n${generated}\n\n$3`);

/**
 * Add generated header comment
 */
const version = palette.version || "unknown";
const source = palette.meta?.source || "brand/assets/palette.json";
const commentHeader = `/* 
  AUTO-GENERATED FILE SECTION
  Source: ${source}
  Palette Version: ${version}
  Generated on: ${new Date().toISOString()}
*/\n\n`;

const finalOutput = css.replace(
  /(\/\* Brand Color Palette \*\/)/,
  `$1\n${commentHeader}`
);

/**
 * Write back to globals.css
 */
writeFileSafe(cssPath, updated);

console.log("✨ Brand color tokens synced successfully!");
