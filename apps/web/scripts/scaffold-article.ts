#!/usr/bin/env npx tsx

/**
 * Article Scaffolding CLI Script
 *
 * Creates new MDX articles from templates with pre-filled frontmatter.
 *
 * Usage:
 *   pnpm run scaffold:article
 *   pnpm run scaffold:article -- --title "My Article" --category music
 */

import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

// Constants
const CONTENT_DIR = path.join(process.cwd(), "content");
const TEMPLATES_DIR = path.join(CONTENT_DIR, "templates");
const ARTICLES_DIR = path.join(CONTENT_DIR, "articles");

const VALID_CATEGORIES = ["music", "history", "traditions", "places", "people"];
const TEMPLATES = ["default", "heritage"];

// Parse command line arguments
function parseArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const value =
        argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : "";
      args[key] = value;
      if (value) i++;
    }
  }

  return args;
}

// Generate URL-safe slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove consecutive hyphens
    .slice(0, 50); // Limit length
}

// Create readline interface for prompts
function createPrompt(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

// Prompt user for input
async function prompt(
  rl: readline.Interface,
  question: string,
  defaultValue?: string
): Promise<string> {
  return new Promise((resolve) => {
    const displayQuestion = defaultValue
      ? `${question} [${defaultValue}]: `
      : `${question}: `;
    rl.question(displayQuestion, (answer) => {
      resolve(answer.trim() || defaultValue || "");
    });
  });
}

// Select from options
async function selectOption(
  rl: readline.Interface,
  question: string,
  options: string[],
  defaultOption?: string
): Promise<string> {
  console.log(`\n${question}`);
  options.forEach((opt, i) => {
    const marker = opt === defaultOption ? " (default)" : "";
    console.log(`  ${i + 1}. ${opt}${marker}`);
  });

  const answer = await prompt(
    rl,
    "Select option",
    defaultOption ? String(options.indexOf(defaultOption) + 1) : "1"
  );
  const index = parseInt(answer, 10) - 1;

  if (index >= 0 && index < options.length) {
    return options[index];
  }

  // Try to match by name
  const match = options.find(
    (opt) => opt.toLowerCase() === answer.toLowerCase()
  );
  return match || options[0];
}

// Load and process template
function loadTemplate(templateName: string): string {
  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.mdx`);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template "${templateName}" not found at ${templatePath}`);
  }

  return fs.readFileSync(templatePath, "utf-8");
}

// Replace template placeholders
function processTemplate(
  template: string,
  data: Record<string, string>
): string {
  let result = template;

  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, "g"), value);
  }

  return result;
}

// Main scaffolding function
async function scaffoldArticle(): Promise<void> {
  console.log("📝 Article Scaffolding Tool\n");

  const args = parseArgs();
  const rl = createPrompt();

  try {
    // Get template selection
    const template =
      args.template ||
      (await selectOption(rl, "Select template:", TEMPLATES, "default"));

    // Get article details
    const title = args.title || (await prompt(rl, "Article title"));
    if (!title) {
      throw new Error("Title is required");
    }

    const slug = args.slug || generateSlug(title);
    const suggestedSlug = await prompt(rl, "Slug", slug);
    const finalSlug = suggestedSlug || slug;

    const description =
      args.description ||
      (await prompt(rl, "Short description (max 200 chars)"));

    const category =
      args.category ||
      (await selectOption(rl, "Select category:", VALID_CATEGORIES, "history"));

    const author = args.author || (await prompt(rl, "Author", "cultural-team"));

    const tag1 = args.tag || (await prompt(rl, "Primary tag", category));

    // Get current date in YYYY-MM-DD format
    const date = new Date().toISOString().split("T")[0];

    // Load and process template
    const templateContent = loadTemplate(template);
    const processedContent = processTemplate(templateContent, {
      title,
      description: description || `Discover ${title.toLowerCase()}`,
      slug: finalSlug,
      category,
      author,
      tag1,
      date,
    });

    // Create article directory
    const articleDir = path.join(ARTICLES_DIR, finalSlug);
    if (fs.existsSync(articleDir)) {
      const overwrite = await prompt(
        rl,
        `Directory "${finalSlug}" already exists. Overwrite? (y/n)`,
        "n"
      );
      if (overwrite.toLowerCase() !== "y") {
        console.log("Aborted.");
        rl.close();
        return;
      }
    } else {
      fs.mkdirSync(articleDir, { recursive: true });
    }

    // Write the article file
    const articlePath = path.join(articleDir, "en.mdx");
    fs.writeFileSync(articlePath, processedContent);

    // Create _meta.yaml for shared metadata
    const metaContent = `# Shared metadata for ${title}
# This file can contain metadata shared across all language versions

images: []
videos: []
`;
    const metaPath = path.join(articleDir, "_meta.yaml");
    fs.writeFileSync(metaPath, metaContent);

    console.log(`\n✅ Article scaffolded successfully!`);
    console.log(`   Location: ${articleDir}`);
    console.log(`   Files created:`);
    console.log(`     - en.mdx`);
    console.log(`     - _meta.yaml`);
    console.log(`\n📖 Next steps:`);
    console.log(`   1. Edit ${articlePath}`);
    console.log(`   2. Run: pnpm run build:content`);
    console.log(`   3. View at: /${category}/${finalSlug}`);
  } catch (error) {
    console.error(`\n❌ Error: ${(error as Error).message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run scaffolding
scaffoldArticle();
