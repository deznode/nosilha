/**
 * Nos Ilha Brand Sync Script (v2.1)
 * ----------------------------------------
 * Reads: /brand/assets/palette.json
 * Updates: /frontend/src/app/globals.css
 *
 * It targets the specific section between:
 *  === BRAND PALETTE (The Brava Tones) ===
 * and
 * === SEMANTIC LAYER (Light Mode) ===
 *
 * Usage:
 * node scripts/sync-brand-tokens.mjs
 */

import fs from "fs";
import path from "path";
import url from "url";

// === CONFIGURATION ===
// Paths are relative to THIS script file
const PALETTE_PATH = "../brand/assets/palette.json";
const CSS_PATH = "../frontend/src/app/globals.css";

// Exact markers found in globals.css
const START_MARKER = "/* === BRAND PALETTE (The Brava Tones) === */";
const END_MARKER = "/* === SEMANTIC LAYER (Light Mode) === */";

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
 * Helper to escape Regex characters
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// === MAIN EXECUTION ===
const palettePath = path.resolve(__dirname, PALETTE_PATH);
const cssPath = path.resolve(__dirname, CSS_PATH);

console.log(`📂 Reading palette from: ${palettePath}`);
console.log(`🎨 Updating CSS at: ${cssPath}`);

// 1. Verify Files Exist
if (!fs.existsSync(palettePath)) {
  console.error(`❌ Palette file missing!`);
  process.exit(1);
}
if (!fs.existsSync(cssPath)) {
  console.error(`❌ Globals CSS missing!`);
  process.exit(1);
}

// 2. Parse Palette JSON
let palette;
try {
  palette = JSON.parse(readFileSafe(palettePath));
} catch (error) {
  console.error("❌ Invalid JSON in palette.json:", error.message);
  process.exit(1);
}

// 3. Define Token Groups
// This maps the JSON keys to comment headers in CSS
const groups = [
  { name: "Primary Brand", tokens: palette.brand || {} },
  { name: "Mist & Basalt (Neutrals)", tokens: palette.neutrals || {} },
  { name: "Functional Status", tokens: palette.status || {} },
];

// 4. Generate CSS Content
let cssVariables = "";

groups.forEach((group) => {
  // Add section header
  cssVariables += `\n  /* -- ${group.name} -- */\n`;

  // Convert tokens
  Object.entries(group.tokens).forEach(([key, value]) => {
    // CamelCase to kebab-case (e.g., oceanBlue -> --color-ocean-blue)
    // Also handles numbers (e.g., mist50 -> mist-50)
    const kebab = key
      .replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())
      .replace(/(\D)(\d)/g, "$1-$2");
    cssVariables += `  --color-${kebab}: ${value};\n`;
  });
});

// Add metadata header
const metaHeader = `  /* * AUTO-GENERATED from Nos Ilha Design System
   * Version: ${palette.meta?.version || "1.0.0"} (${
  palette.meta?.codename || "Ilha das Flores"
})
   * Updated: ${new Date().toISOString().split("T")[0]}
   */\n`;

// 5. Inject into globals.css
let cssContent = readFileSafe(cssPath);

// Regex Explanation:
// 1. Match START_MARKER literally
// 2. ([\s\S]*?) Match any character (including newlines) non-greedily until...
// 3. Match END_MARKER literally
const regexPattern = new RegExp(
  `(${escapeRegExp(START_MARKER)})([\\s\\S]*?)(${escapeRegExp(END_MARKER)})`
);

if (!regexPattern.test(cssContent)) {
  console.error(
    `❌ Could not find injection markers in globals.css.\n` +
      `Ensure the file contains:\n"${START_MARKER}"\n...and...\n"${END_MARKER}"`
  );
  process.exit(1);
}

// Perform replacement
// $1 = START_MARKER
// $3 = END_MARKER
// We replace the middle part ($2) with our new variables
const updatedCss = cssContent.replace(
  regexPattern,
  `$1\n${metaHeader}${cssVariables}\n  $3`
);

// 6. Save
writeFileSafe(cssPath, updatedCss);
console.log("✨ Brava tokens synced successfully!");
